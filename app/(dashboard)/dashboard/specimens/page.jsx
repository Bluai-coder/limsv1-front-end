
'use client';

import { useMemo, useState } from 'react';
import {
  useSpecimens,
  useReceiveSpecimen,
  useScanSpecimen,
  useScanAliquot
} from '@/hooks/use-specimens';

import { toast } from 'sonner';
import {
  ScanBarcode,
  ChevronLeft,
  ChevronRight,
  TestTubes,
  Plus,
  ListRestartIcon,
  QrCode,
  Barcode,
  Loader2,
  Printer,
  Camera,
  Scan,
  AlertCircle
} from 'lucide-react';

import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import SpecimenDetailsPopup from '@/components/detail-popup/SpecimenDetailsPopup';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import QueryError from '@/components/common/QueryError';
import { PermissionDenied } from '@/components/PermissionGuard';
import { Scanner } from '@yudiel/react-qr-scanner';

// ================= HELPERS =================
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "collected": return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    case "received": return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
    case "processing": return "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
    case "completed": return "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800";
    case "rejected": return "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
  }
};

const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case "serum": return "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800";
    case "urine": return "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800";
    case "blood": return "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
    case "whole blood": return "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
  }
};

const CONDITIONS = [
  { value: 'acceptable', label: 'Acceptable', color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { value: 'hemolyzed', label: 'Hemolyzed', color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { value: 'lipemic', label: 'Lipemic', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  { value: 'clotted', label: 'Clotted', color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { value: 'icteric', label: 'Icteric', color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  { value: 'insufficient', label: 'Insufficient', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
];

// ================= HOOK FOR BATCH FETCHING ALIQUOT COUNTS =================
function useAliquotsCounts(specimenIds) {
  return useQuery({
    queryKey: ["aliquots-counts", specimenIds],
    queryFn: async () => {
      const promises = specimenIds.map(id =>
        api.get(`/specimens/${id}/aliquots`).then(r => ({
          id,
          count: r.data.data?.length || 0
        })).catch(() => ({ id, count: 0 }))
      );
      const results = await Promise.all(promises);
      return results.reduce((acc, { id, count }) => {
        acc[id] = count;
        return acc;
      }, {});
    },
    enabled: specimenIds.length > 0,
    staleTime: 30000,
  });
}

export default function SpecimensPage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Orders
  if (!canRead('Specimens')) {
    return <PermissionDenied resource="Specimens" action="read" />;
  }

  const searchParams = useSearchParams();
  const mrnParam = searchParams.get("id"); // e.g., "123"


  const [barcodeScan, setBarcodeScan] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [receiveModal, setReceiveModal] = useState(null);
  const [aliquotModal, setAliquotModal] = useState(null);
  const [aliquotViewModal, setAliquotViewModal] = useState(null);

  const [receiveCondition, setReceiveCondition] = useState('acceptable');
  const [rejectionReason, setRejectionReason] = useState('');

  const [aliquotInputs, setAliquotInputs] = useState([
    { volume_ml: 2, container_type: "EDTA" },
    { volume_ml: 1, container_type: "Plain" },
  ]);

  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [isSpecimenPopupOpen, setIsSpecimenPopupOpen] = useState(false);

  const handleSpecimenClick = (specimen) => {
    setSelectedSpecimen(specimen);
    setIsSpecimenPopupOpen(true);
  };

  const router = useRouter();
  const queryClient = useQueryClient();

  queryClient.invalidateQueries({
    queryKey: ["aliquots"],
  });

  const { data, isLoading, isError, error, refetch } = useSpecimens({
    status: statusFilter || undefined,
    page,
    limit
  });

  const receiveSpecimen = useReceiveSpecimen();
  const { mutate: scanSpecimen } = useScanSpecimen();
  const { mutate: scanAliquot } = useScanAliquot();

  const allSpecimens = data?.data?.data || [];
  const pagination = data?.data?.pagination;



  // 2. ✅ CORRECT: Filter using useMemo (happens before render, no flickering)
  const specimens = useMemo(() => {
    // If there is a URL parameter, filter the orders
    if (mrnParam) {
      // Ensure strict comparison (Number vs String if needed)
      return allSpecimens.filter((item) => String(item?.order?.order_number) == String(mrnParam));
    }
    // Otherwise return all orders
    return allSpecimens;
  }, [allSpecimens, mrnParam]); // Re-run only when data or URL changes

  // 3. ✅ CORRECT: Reset handler
  const handleResetData = () => {
    router.replace("/dashboard/specimens");
  };






  // Get aliquot counts for all specimens
  const specimenIds = specimens.map((sp) => sp.id);
  const { data: aliquotCounts } = useAliquotsCounts(specimenIds);

  // ================= SCAN HANDLER =================
  const handleBarcodeScan = (e) => {
    if (e.key !== 'Enter') return;
    const barcode = barcodeScan.trim();
    if (!barcode) return;

    if (barcode.includes('-A')) {
      scanAliquot(barcode);
    } else {
      scanSpecimen(barcode, {
        onSuccess: () => toast.success(`Specimen ${barcode} scanned`),
        onError: () => toast.error(`Failed to scan ${barcode}`),
      });
    }
    setBarcodeScan('');
  };

  // ================= RECEIVE SPECIMEN =================
  const handleReceive = async () => {
    if (!receiveModal) return;
    try {
      await receiveSpecimen.mutateAsync({
        id: receiveModal.id,
        data: {
          status: "received",
          condition: receiveCondition,
          rejectionReason: receiveCondition !== "acceptable" ? rejectionReason : undefined,
        },
      });

      toast.success(
        receiveCondition === 'acceptable'
          ? `Specimen ${receiveModal.barcode} received successfully`
          : `Specimen ${receiveModal.barcode} rejected`
      );

      setReceiveModal(null);
      setReceiveCondition('acceptable');
      setRejectionReason('');
      queryClient.invalidateQueries(["specimens"]);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to receive specimen');
    }
  };

  // ================= CREATE ALIQUOTS =================
  const createAliquots = async () => {
    if (!aliquotModal) return;
    try {
      await api.post(`/specimens/${aliquotModal.id}/aliquots`, { aliquots: aliquotInputs });
      toast.success("Aliquots created successfully");
      setAliquotModal(null);
      queryClient.invalidateQueries(["aliquots", aliquotModal.id]);
      queryClient.invalidateQueries(["aliquots-counts"]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create aliquots");
    }
  };


  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');



  const [qrError, setQrError] = useState(null);


  const handleManualSearch = () => {
    if (manualBarcode.trim()) {
      // handleClose();
    }
  };

  const handlePrintQR = (specimen) => {

  };





  // const handleGenerateQR = async (specimen) => {
  //   if (!specimen.qr_code?.can_generate) return;
  //   setIsGeneratingQr(true);
  //   setQrError(null);

  //   try {
  //     const response = await api.post(`/specimens/${specimen.id}/generate-qr`);

  //     if (response.data.success && response.data.data.qr_code_url) {
  //       setQrCodeUrl(response.data.data.qr_code_url);
  //       if (specimen.qr_code) {
  //         specimen.qr_code.has_qr = true;
  //         specimen.qr_code.url = response.data.data.qr_code_url;
  //       }
  //       // handlePrintQR(specimen)


  //       // PrintQR
  //       if (!qrCodeUrl) return;

  //       // New better print layout that centers and resizes the label to a real page
  //       const printWindow = window.open('', '_blank');
  //       printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Specimen Label - ${specimen?.barcode}</title>
  //         <style>
  //           body {
  //             display: flex;
  //             justify-content: center;
  //             align-items: center;
  //             height: 100vh;
  //             margin: 0;
  //             font-family: Arial, sans-serif;
  //             background: #fff;
  //           }
  //           .container {
  //             text-align: center;
  //             max-width: 100%;
  //           }
  //           img {
  //             max-width: 90vw;
  //             max-height: 90vh;
  //             object-fit: contain;
  //             box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  //           }
  //           @media print {
  //             body { margin: 0; padding: 0; }
  //             img { max-width: 100%; max-height: 100%; box-shadow: none; }
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="container">
  //           <img src="${qrCodeUrl}" alt="Specimen Label" />
  //         </div>
  //       </body>
  //     </html>
  //   `);
  //       printWindow.document.close();

  //       // Wait for image to load before triggering print
  //       printWindow.onload = () => {
  //         printWindow.print();
  //         // printWindow.close(); // Optional: close after printing
  //       };







  //     } else {
  //       throw new Error('Invalid response from server');
  //     }
  //   } catch (error) {
  //     console.error('Error generating QR code:', error);
  //     setQrError(error.response?.data?.message || error.message);
  //   } finally {
  //     setIsGeneratingQr(false);
  //   }
  // };

  const handleGenerateQR = async (specimen) => {
    if (!specimen.qr_code?.can_generate) return;

    setIsGeneratingQr(true);
    setQrError(null);

    try {
      const response = await api.post(`/specimens/${specimen.id}/generate-qr`);

      if (response.data.success && response.data.data.qr_code_url) {
        const qrCodeUrl = response.data.data.qr_code_url;
        setQrCodeUrl(qrCodeUrl);

        // Update specimen object with new QR data
        if (specimen.qr_code) {
          specimen.qr_code.has_qr = true;
          specimen.qr_code.url = qrCodeUrl;
        }

        // Print QR label (Professional 2x1 inch thermal layout)
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
        <html>
          <head>
            <title>Specimen Label - ${specimen?.barcode}</title>
            <style>
              /* Force printer to 2x1 inch format with zero margins */
              @page {
                size: 2in 1in;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #fff;
                width: 2in;
                height: 1in;
                overflow: hidden;
              }
              img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                /* Optional rotation if printer feeds sideways: transform: rotate(90deg); */
              }
            </style>
          </head>
          <body>
            <img src="${qrCodeUrl}" alt="Specimen Label" />
          </body>
        </html>
      `);
        printWindow.document.close();

        // Wait for image to load before triggering print
        printWindow.onload = () => {
          printWindow.print();
          // printWindow.close(); // Optional: close after printing
        };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrError(error.response?.data?.message || error.message);
    } finally {
      setIsGeneratingQr(false);
    }
  };





  /**
   * Plays a short, high-pitched beep using the Web Audio API.
   * Provides immediate auditory feedback for successful scans.
   */
  const playSuccessBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio feedback not supported", e);
    }
  };

  const handleScanSuccess = async (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedData = detectedCodes[0].rawValue;
      console.log("Scanned:", scannedData);

      try {
        let qrData;
        try {
          qrData = JSON.parse(scannedData);
        } catch {
          qrData = { barcode: scannedData };
        }

        const barcode = qrData.barcode || scannedData;
        const specimenId = qrData.id;

        try {
          const response = await api.post('/specimens/scan', { barcode });

          if (response?.data?.data) {
            const newStatus = response.data.data.orderStatus;
            toast.success(`Specimen ${barcode} status updated to ${newStatus}`);

            if (window.navigator?.vibrate) {
              window.navigator.vibrate(200);
            }
            playSuccessBeep();
            handleClose();
            refetch();
          }
        } catch (error) {
          console.error("Scan API error:", error);
          const errorMsg = error.response?.data?.message || 'Failed to scan specimen';
          toast.error(errorMsg);
          setCameraError(errorMsg);
          setTimeout(() => setCameraError(null), 3000);
        }

      } catch (error) {
        console.error("Error parsing QR:", error);
        setCameraError("Invalid QR code format");
        setTimeout(() => setCameraError(null), 3000);
      }
    }
  };

  const handleScanError = (error) => {
    console.error("Scanner error:", error);
    setCameraError("Could not access camera. Please check permissions.");  
    setTimeout(() => setCameraError(null), 5000);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Specimen Tracking</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Scan and manage specimens lifecycle</p>
        </div>
        <div className="p-2 cursor-pointer text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ListRestartIcon onClick={handleResetData} />

        </div>

      </div>

      {/* Barcode Scanner */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl dark:border-gray-700/60 shadow-sm ">
        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-green-100 dark:border-green-800">
          <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
            <Scan className="w-4 h-4" />
            Scan QR/Bar Code
          </h3>

          {!isScanning ? (
            <div className="text-center">
              <button
                onClick={() => setIsScanning(true)}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Camera className="w-4 h-4" />
                Start Scanning
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Position QR code within the frame to scan
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Make sure you have granted camera permissions
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-[500px]">
                {/* Safe rendering for scanner - avoids Next.js hydration/camera crashes */}
                {typeof window !== 'undefined' && (
                  <Scanner
                    onScan={handleScanSuccess}
                    onError={handleScanError}
                    constraints={{ facingMode: "environment" }}
                    scanDelay={300}
                    style={{ width: '100%', borderRadius: '0.75rem', height: '300px', objectFit: 'cover' }}
                  />
                )}
                
                {/* Hardware-style Scanner Overlay */}
                <div className="absolute inset-0 pointer-events-none border-4 border-black/10 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-green-500/50 w-3/4 h-3/4 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)]"></div>
                  </div>
                  {/* Laser Animation */}
                  <style>{`
                    @keyframes laserScan {
                      0% { top: 10%; opacity: 0; }
                      10% { opacity: 1; }
                      90% { opacity: 1; }
                      100% { top: 90%; opacity: 0; }
                    }
                    .scanner-laser {
                      position: absolute;
                      left: 10%;
                      width: 80%;
                      height: 2px;
                      background-color: #ef4444;
                      box-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444;
                      animation: laserScan 2s infinite ease-in-out;
                      z-index: 20;
                    }
                  `}</style>
                  <div className="scanner-laser"></div>
                </div>
              </div>
              <button
                onClick={() => setIsScanning(false)}
                className="mt-1.5 px-2.5 py-0.5 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Stop
              </button>
            </div>
          )}

          {cameraError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {cameraError}
              </p>
            </div>
          )}

          {/* Manual Barcode Input */}
          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
              Or enter barcode manually:
            </p>
            <div className="flex gap-2">
              <input
                value={barcodeScan}
                onChange={(e) => setBarcodeScan(e.target.value)}
                onKeyDown={handleBarcodeScan}
                placeholder="Scan or type barcode and press Enter..."
                className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-lg font-mono transition-colors duration-200"
                autoFocus
              />
              {/* <button
                onClick={handleManualSearch}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Search
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'collected', 'received', 'processing', 'completed'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${statusFilter === s
              ? "bg-[#1b4dff] text-white shadow-lg dark:shadow-blue-900/30"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
          </button>
        ))}
      </div>

      {/* Main Table */}
      {isError && <QueryError error={error} onRetry={refetch} className="mb-4" />}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Barcode</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Order #</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Patient</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Type</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Collected</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Label Print</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Action</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Aliquots</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : specimens?.length > 0 ? (
                specimens?.map((sp) => (
                  <tr key={sp?.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSpecimenClick(sp)}
                        className="text-[#1b4dff] dark:text-[#1b4dff] font-semibold hover:underline cursor-pointer"
                      >
                        {sp.barcode}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {sp?.order?.order_number || '—'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {sp?.patient?.name || `${sp?.patient?.firstName || ''} ${sp?.patient?.lastName || ''}`.trim() || '—'}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{sp?.patient?.mrn}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getTypeColor(sp.specimen_type)}`}>
                        {sp.specimen_type || '—'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(sp.status)}`}>
                        {sp.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-400 dark:text-gray-500">
                      {sp.collection_time ? new Date(sp.collection_time).toLocaleDateString('en-IN') : '—'}
                    </td>

                    <td className="px-6 py-4">
                      {console.log("spspsp", sp.status)}
                      <span className={`px-3 py-1 text-xs  font-medium ${sp.status !== "collected" ? 'color-green' : ''}`}>
                        {/* Barcode and QrCode */}
                        {isGeneratingQr ?
                          <Loader2 className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-spin" /> :

                          <Printer
                            className={` ${sp.status == "completed" ? 'text-green-600' : 'text-gray-600'} dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors`}
                            onClick={() => handleGenerateQR(sp)}
                            disabled={isGeneratingQr}
                          />
                        }

                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {/* RBAC Guard: Only users with Update permission can receive specimens */}
                      {(canUpdate('Specimens') || isAdmin()) && sp.status === "collected" && (
                        <button
                          onClick={() => setReceiveModal(sp)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          Receive
                        </button>
                      )}
                      
                      {/* RBAC Guard: Only users with Update permission can add aliquots */}
                      {(canUpdate('Specimens') || isAdmin()) && aliquotCounts?.[sp.id] == 0 && sp.status === "received" && (
                        <button
                          onClick={() => setAliquotModal(sp)}
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add Aliquot
                        </button>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => setAliquotViewModal(sp)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        View Aliquots
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {aliquotCounts?.[sp.id] !== undefined ? aliquotCounts[sp.id] : '...'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <TestTubes className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No specimens found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 10 && (
          <div className="flex justify-between items-center px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} specimens
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-700 dark:text-gray-300"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-700 dark:text-gray-300"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Receive Modal */}
      {receiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Receive Specimen</h2>
            <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mb-6">{receiveModal.barcode}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Specimen Condition</label>
              <div className="grid grid-cols-2 gap-3">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setReceiveCondition(c.value)}
                    className={`px-4 py-3 rounded-2xl text-sm font-medium border transition-all ${receiveCondition === c.value
                      ? `${c.color} border-current ring-2 ring-offset-2 dark:ring-offset-gray-800`
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {receiveCondition !== 'acceptable' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-24 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl resize-y bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent outline-none transition-colors"
                  placeholder="Describe the issue..."
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReceiveModal(null);
                  setReceiveCondition('acceptable');
                  setRejectionReason('');
                }}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReceive}
                disabled={receiveSpecimen.isPending}
                className={`flex-1 py-3 rounded-2xl font-medium text-white transition-colors ${receiveCondition === 'acceptable'
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
                  }`}
              >
                {receiveCondition === 'acceptable' ? 'Accept & Receive' : 'Reject Specimen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Aliquot Modal */}
      {aliquotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Create Aliquots</h2>
            <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mb-6">{aliquotModal.barcode}</p>

            <div className="space-y-4">
              {aliquotInputs.map((input, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Volume (ml)</label>
                    <input
                      type="number"
                      value={input.volume_ml}
                      onChange={(e) => {
                        const updated = [...aliquotInputs];
                        updated[i].volume_ml = Number(e.target.value);
                        setAliquotInputs(updated);
                      }}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent outline-none transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Container</label>
                    <select
                      value={input.container_type}
                      onChange={(e) => {
                        const updated = [...aliquotInputs];
                        updated[i].container_type = e.target.value;
                        setAliquotInputs(updated);
                      }}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent outline-none transition-colors"
                    >
                      <option value="EDTA">EDTA</option>
                      <option value="Plain">Plain</option>
                      <option value="Fluoride">Fluoride</option>
                    </select>
                  </div>
                  {aliquotInputs.length > 1 && (
                    <button
                      onClick={() => setAliquotInputs(aliquotInputs.filter((_, idx) => idx !== i))}
                      className="self-end text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 mb-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setAliquotInputs([...aliquotInputs, { volume_ml: 1, container_type: "Plain" }])}
              className="mt-4 text-sm text-[#1b4dff] dark:text-[#1b4dff] hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors"
            >
              + Add another aliquot
            </button>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setAliquotModal(null)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createAliquots}
                className="flex-1 py-3 bg-[#1b4dff] text-white rounded-2xl font-medium hover:bg-[#1a40e0] transition-colors"
              >
                Create Aliquots
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Aliquots Modal */}
      {aliquotViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Aliquots</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{aliquotViewModal.barcode}</p>
              </div>
              <button
                onClick={() => {
                  setAliquotViewModal(null);
                  queryClient.invalidateQueries(["aliquots-counts"]);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <AliquotList specimenId={aliquotViewModal.id} />
            </div>
          </div>
        </div>
      )}

      {/* Specimen Details Popup */}
      <SpecimenDetailsPopup
        specimen={selectedSpecimen}
        isOpen={isSpecimenPopupOpen}
        refetch={refetch}
        onClose={() => {
          setIsSpecimenPopupOpen(false);
          setSelectedSpecimen(null);
        }}
        onViewOrder={(orderId) => {
          // router.push(`/orders?orderId=${orderId}`);
        }}
        onViewPatient={(patientId) => {
          // router.push(`/patients?patientId=${patientId}`);
        }}
      />
    </div>
  );
}

// ================= ALIQUOT LIST COMPONENT =================
function AliquotList({ specimenId }) {
  const { data, isLoading } = useQuery({
    queryKey: ["aliquots", specimenId],
    queryFn: () => api.get(`/specimens/${specimenId}/aliquots`).then(r => r.data.data),
  });



  if (isLoading) return <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">Loading aliquots...</p>;
  if (!data?.length) return <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No aliquots found</p>;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-900/50 px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
        <div>Barcode</div>
        <div>Container</div>
        <div>Status</div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {data.map((a) => (
          <div key={a.id} className="grid grid-cols-3 px-5 py-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
            <div className="font-mono text-xs text-gray-900 dark:text-gray-100">{a.barcode}</div>
            <div className="text-gray-600 dark:text-gray-400">{a.container_type}</div>
            <div>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${a.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                a.status === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}>
                {a.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}