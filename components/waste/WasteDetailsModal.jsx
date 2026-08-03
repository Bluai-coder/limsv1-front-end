// 'use client';

// import React, { useState } from 'react';
// import { 
//     X, Calendar, User, FileText, Package, Truck, 
//     CheckCircle, Clock, AlertTriangle, Info, 
//     Droplet, Scissors, Syringe, FlaskConical,
//     Printer, Download
// } from 'lucide-react';
// import { useTreatWaste, useDisposeWaste } from '@/hooks/use-waste';
// import WasteStatusBadge from './WasteStatusBadge';
// import WasteTypeBadge from './WasteTypeBadge';
// import { formatDate } from '@/lib/utils';

// export default function WasteDetailsModal({ waste, onClose }) {
//     const [showActions, setShowActions] = useState(false);
//     const [treatmentMethod, setTreatmentMethod] = useState('');
//     const [disposalMethod, setDisposalMethod] = useState('');
//     const [manifestNumber, setManifestNumber] = useState('');
//     const [notes, setNotes] = useState('');
//     const [activeTab, setActiveTab] = useState('details');

//     const treatMutation = useTreatWaste();
//     const disposeMutation = useDisposeWaste();

//     const handleTreat = () => {
//         treatMutation.mutate({
//             id: waste.id,
//             data: {
//                 treatment_method: treatmentMethod,
//                 treatment_notes: notes,
//             }
//         });
//     };

//     const handleDispose = () => {
//         disposeMutation.mutate({
//             id: waste.id,
//             data: {
//                 disposal_method: disposalMethod,
//                 manifest_number: manifestNumber,
//                 notes: notes,
//             }
//         });
//     };

//     const tabs = [
//         { id: 'details', label: 'Details', icon: Info },
//         { id: 'timeline', label: 'Timeline', icon: Clock },
//         { id: 'actions', label: 'Actions', icon: CheckCircle },
//     ];

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                 {/* Header */}
//                 <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <div className="flex items-center gap-3">
//                                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//                                     Waste Details
//                                 </h2>
//                                 <WasteStatusBadge status={waste.status} />
//                             </div>
//                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                                 {waste.waste_barcode}
//                             </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
//                                 <Printer className="w-4 h-4 text-gray-500 dark:text-gray-400" />
//                             </button>
//                             <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
//                                 <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
//                             </button>
//                             <button 
//                                 onClick={onClose} 
//                                 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
//                             >
//                                 <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Tabs */}
//                 <div className="border-b border-gray-200 dark:border-gray-700 px-6">
//                     <div className="flex gap-1">
//                         {tabs.map((tab) => {
//                             const Icon = tab.icon;
//                             return (
//                                 <button
//                                     key={tab.id}
//                                     onClick={() => setActiveTab(tab.id)}
//                                     className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
//                                         activeTab === tab.id
//                                             ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                                             : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                                     }`}
//                                 >
//                                     <Icon className="w-4 h-4" />
//                                     {tab.label}
//                                 </button>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* Tab Content */}
//                 <div className="p-6">
//                     {activeTab === 'details' && (
//                         <div className="space-y-6">
//                             {/* Quick Info Cards */}
//                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                                 <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
//                                     <div className="mt-1 flex justify-center">
//                                         <WasteTypeBadge type={waste.waste_type} />
//                                     </div>
//                                 </div>
//                                 <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
//                                     <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
//                                         {waste.volume_ml ? `${waste.volume_ml} ml` : 'N/A'}
//                                     </p>
//                                 </div>
//                                 <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
//                                     <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
//                                         {waste.weight_kg ? `${waste.weight_kg} kg` : 'N/A'}
//                                     </p>
//                                 </div>
//                                 <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Biohazard Level</p>
//                                     <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
//                                         {waste.biohazard_level || 'N/A'}
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* Detailed Info */}
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div>
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Patient Name</p>
//                                     <p className="text-sm text-gray-900 dark:text-white mt-1">
//                                         {waste.patient_name || 'N/A'}
//                                     </p>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Specimen Barcode</p>
//                                     <p className="text-sm text-gray-900 dark:text-white mt-1">
//                                         {waste.specimen_barcode || 'N/A'}
//                                     </p>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
//                                     <p className="text-sm text-gray-900 dark:text-white mt-1">
//                                         {waste.order_number || 'N/A'}
//                                     </p>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Container Type</p>
//                                     <p className="text-sm text-gray-900 dark:text-white mt-1">
//                                         {waste.container_type || 'N/A'}
//                                     </p>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Color Code</p>
//                                     <div className="mt-1">
//                                         <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-${waste.color_code?.toLowerCase()}-100 text-${waste.color_code?.toLowerCase()}-800`}>
//                                             {waste.color_code || 'N/A'}
//                                         </span>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Is Hazardous</p>
//                                     <p className="text-sm font-medium mt-1">
//                                         {waste.is_hazardous ? (
//                                             <span className="text-red-600 dark:text-red-400">⚠️ Yes</span>
//                                         ) : (
//                                             <span className="text-green-600 dark:text-green-400">No</span>
//                                         )}
//                                     </p>
//                                 </div>
//                             </div>

//                             {waste.notes && (
//                                 <div>
//                                     <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
//                                     <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{waste.notes}</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {activeTab === 'timeline' && (
//                         <div className="space-y-4">
//                             <div className="flex items-center gap-3 text-sm">
//                                 <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//                                     <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                                 </div>
//                                 <div>
//                                     <p className="font-medium text-gray-900 dark:text-white">Generated</p>
//                                     <p className="text-gray-500 dark:text-gray-400">{formatDate(waste.generated_at)}</p>
//                                 </div>
//                             </div>

//                             {waste.treated_at && (
//                                 <div className="flex items-center gap-3 text-sm">
//                                     <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
//                                         <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                                     </div>
//                                     <div>
//                                         <p className="font-medium text-gray-900 dark:text-white">Treated</p>
//                                         <p className="text-gray-500 dark:text-gray-400">{formatDate(waste.treated_at)}</p>
//                                         {waste.treatment_method && (
//                                             <p className="text-xs text-gray-400">Method: {waste.treatment_method}</p>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}

//                             {waste.disposed_at && (
//                                 <div className="flex items-center gap-3 text-sm">
//                                     <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//                                         <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
//                                     </div>
//                                     <div>
//                                         <p className="font-medium text-gray-900 dark:text-white">Disposed</p>
//                                         <p className="text-gray-500 dark:text-gray-400">{formatDate(waste.disposed_at)}</p>
//                                         {waste.disposal_method && (
//                                             <p className="text-xs text-gray-400">Method: {waste.disposal_method}</p>
//                                         )}
//                                         {waste.manifest_number && (
//                                             <p className="text-xs text-gray-400">Manifest: {waste.manifest_number}</p>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}

//                             {!waste.treated_at && !waste.disposed_at && (
//                                 <div className="text-center py-8">
//                                     <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
//                                     <p className="text-gray-500 dark:text-gray-400">No timeline events yet</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {activeTab === 'actions' && (
//                         <div className="space-y-6">
//                             {waste.status !== 'disposed' && waste.status !== 'rejected' && (
//                                 <>
//                                     {waste.status === 'segregated' && (
//                                         <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
//                                             <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Treat Waste</h4>
//                                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//                                                 <select
//                                                     value={treatmentMethod}
//                                                     onChange={(e) => setTreatmentMethod(e.target.value)}
//                                                     className="w-full sm:flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
//                                                 >
//                                                     <option value="">Select Method</option>
//                                                     <option value="autoclave">Autoclave</option>
//                                                     <option value="chemical">Chemical</option>
//                                                     <option value="incineration">Incineration</option>
//                                                 </select>
//                                                 <button
//                                                     onClick={handleTreat}
//                                                     disabled={treatMutation.isPending || !treatmentMethod}
//                                                     className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50"
//                                                 >
//                                                     {treatMutation.isPending ? 'Processing...' : 'Treat Waste'}
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {(waste.status === 'treated' || waste.status === 'packaged') && (
//                                         <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
//                                             <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Dispose Waste</h4>
//                                             <div className="space-y-3">
//                                                 <select
//                                                     value={disposalMethod}
//                                                     onChange={(e) => setDisposalMethod(e.target.value)}
//                                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
//                                                 >
//                                                     <option value="">Select Method</option>
//                                                     <option value="landfill">Landfill</option>
//                                                     <option value="incineration">Incineration</option>
//                                                     <option value="recycling">Recycling</option>
//                                                 </select>
//                                                 <input
//                                                     type="text"
//                                                     placeholder="Manifest Number"
//                                                     value={manifestNumber}
//                                                     onChange={(e) => setManifestNumber(e.target.value)}
//                                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500"
//                                                 />
//                                                 <button
//                                                     onClick={handleDispose}
//                                                     disabled={disposeMutation.isPending || !disposalMethod || !manifestNumber}
//                                                     className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
//                                                 >
//                                                     {disposeMutation.isPending ? 'Processing...' : 'Dispose Waste'}
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}

//                                     <div>
//                                         <textarea
//                                             placeholder="Add notes..."
//                                             value={notes}
//                                             onChange={(e) => setNotes(e.target.value)}
//                                             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
//                                             rows="2"
//                                         />
//                                     </div>
//                                 </>
//                             )}

//                             {waste.status === 'disposed' && (
//                                 <div className="text-center py-8">
//                                     <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//                                     <p className="text-gray-700 dark:text-gray-300 font-medium">This waste has been disposed</p>
//                                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                                         {formatDate(waste.disposed_at)} • Manifest: {waste.manifest_number || 'N/A'}
//                                     </p>
//                                 </div>
//                             )}

//                             {waste.status === 'rejected' && (
//                                 <div className="text-center py-8">
//                                     <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//                                     <p className="text-gray-700 dark:text-gray-300 font-medium">This waste has been rejected</p>
//                                     {waste.rejection_reason && (
//                                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                                             Reason: {waste.rejection_reason}
//                                         </p>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }






'use client';

import React, { useState, useEffect } from 'react';
import { 
    X, Calendar, User, FileText, Package, Truck, 
    CheckCircle, Clock, AlertTriangle, Info, 
    Droplet, Scissors, Syringe, FlaskConical,
    Printer, Download, Edit, Save, XCircle,
    Barcode, QrCode, RefreshCw, Loader2
} from 'lucide-react';
import { 
    useTreatWaste, 
    useDisposeWaste, 
    useUpdateWasteStatus,
    useGenerateBarcode,
    useGenerateQR,
    useGenerateLabel
} from '@/hooks/use-waste';
import WasteStatusBadge from './WasteStatusBadge';
import WasteTypeBadge from './WasteTypeBadge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import LabelPrintModal from '@/components/labels/LabelPrintModal';

export default function WasteDetailsModal({ waste: initialWaste, onClose, onUpdate }) {
    const [waste, setWaste] = useState(initialWaste);
    const [showActions, setShowActions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [isGenerating, setIsGenerating] = useState(false);
    const [barcodeData, setBarcodeData] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    
    // Form state for editing
    const [editData, setEditData] = useState({
        waste_type: '',
        waste_sub_type: '',
        volume_ml: '',
        weight_kg: '',
        quantity: '',
        container_type: '',
        color_code: '',
        patient_name: '',
        specimen_barcode: '',
        order_number: '',
        biohazard_level: '',
        is_hazardous: false,
        notes: '',
    });

    // Action states
    const [treatmentMethod, setTreatmentMethod] = useState('');
    const [disposalMethod, setDisposalMethod] = useState('');
    const [manifestNumber, setManifestNumber] = useState('');
    const [actionNotes, setActionNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    // Mutations
    const treatMutation = useTreatWaste();
    const disposeMutation = useDisposeWaste();
    const updateStatusMutation = useUpdateWasteStatus();
    const generateBarcodeMutation = useGenerateBarcode();
    const generateQRMutation = useGenerateQR();
    const generateLabelMutation = useGenerateLabel();

    // Populate edit form when waste changes
    useEffect(() => {
        if (waste) {
            setEditData({
                waste_type: waste.waste_type || '',
                waste_sub_type: waste.waste_sub_type || '',
                volume_ml: waste.volume_ml || '',
                weight_kg: waste.weight_kg || '',
                quantity: waste.quantity || '',
                container_type: waste.container_type || '',
                color_code: waste.color_code || 'RED',
                patient_name: waste.patient_name || '',
                specimen_barcode: waste.specimen_barcode || '',
                order_number: waste.order_number || '',
                biohazard_level: waste.biohazard_level || 'BSL-2',
                is_hazardous: waste.is_hazardous || false,
                notes: waste.notes || '',
            });
        }
    }, [waste]);

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditData({
            ...editData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSaveEdit = async () => {
        try {
            const cleanedData = Object.keys(editData).reduce((acc, key) => {
                const value = editData[key];
                if (value === '') {
                    acc[key] = null;
                } else if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
                    const numericFields = ['volume_ml', 'weight_kg', 'quantity'];
                    if (numericFields.includes(key)) {
                        acc[key] = parseFloat(value);
                    } else {
                        acc[key] = value;
                    }
                } else {
                    acc[key] = value;
                }
                return acc;
            }, {});

            await updateStatusMutation.mutateAsync({
                id: waste.id,
                data: cleanedData
            });

            setWaste({ ...waste, ...cleanedData });
            setIsEditing(false);
            toast.success('Waste record updated successfully');
            onUpdate?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update waste record');
        }
    };

    const handleTreat = async () => {
        if (!treatmentMethod) {
            toast.warning('Please select a treatment method');
            return;
        }
        try {
            await treatMutation.mutateAsync({
                id: waste.id,
                data: {
                    treatment_method: treatmentMethod,
                    treatment_notes: actionNotes,
                }
            });
            setWaste({ ...waste, status: 'treated', treatment_method: treatmentMethod, treated_at: new Date() });
            setShowActions(false);
            toast.success('Waste treated successfully');
            onUpdate?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to treat waste');
        }
    };

    const handleDispose = async () => {
        if (!disposalMethod || !manifestNumber) {
            toast.warning('Please fill all disposal fields');
            return;
        }
        try {
            await disposeMutation.mutateAsync({
                id: waste.id,
                data: {
                    disposal_method: disposalMethod,
                    disposal_facility: document.querySelector('[name="disposal_facility"]')?.value || '',
                    manifest_number: manifestNumber,
                    notes: actionNotes,
                }
            });
            setWaste({ 
                ...waste, 
                status: 'disposed', 
                disposal_method: disposalMethod, 
                manifest_number: manifestNumber,
                disposed_at: new Date() 
            });
            setShowActions(false);
            toast.success('Waste disposed successfully');
            onUpdate?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to dispose waste');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) {
            toast.warning('Please provide a rejection reason');
            return;
        }
        try {
            await updateStatusMutation.mutateAsync({
                id: waste.id,
                data: {
                    status: 'rejected',
                    rejection_reason: rejectionReason,
                    notes: actionNotes,
                }
            });
            setWaste({ ...waste, status: 'rejected', rejection_reason: rejectionReason });
            setShowActions(false);
            toast.success('Waste rejected');
            onUpdate?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to reject waste');
        }
    };

    const handleGenerateBarcode = async () => {
        if (!waste) return;
        setIsGenerating(true);
        try {
            const result = await generateBarcodeMutation.mutateAsync(waste.id);
            setBarcodeData(result.data);
            setWaste({ ...waste, waste_barcode: result.data.barcode, barcode_image_url: result.data.barcode_image_url });
            toast.success('Barcode generated successfully!');
        } catch (error) {
            toast.error('Failed to generate barcode');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateQR = async () => {
        if (!waste) return;
        setIsGenerating(true);
        try {
            await generateQRMutation.mutateAsync(waste.id);
            toast.success('QR code generated successfully!');
        } catch (error) {
            toast.error('Failed to generate QR code');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateLabel = async () => {
        if (!waste) return;
        setIsGenerating(true);
        try {
            const result = await generateLabelMutation.mutateAsync(waste.id);
            setBarcodeData(result.data);
            toast.success('Label generated successfully!');
        } catch (error) {
            toast.error('Failed to generate label');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrintLabel = () => {
        setShowPrintModal(true);
    };

    const handleDownloadLabel = () => {
        const imageUrl = barcodeData?.label_image || waste?.barcode_image_url;
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `waste-label-${waste?.waste_barcode || 'unknown'}.png`;
        link.click();
    };

    const tabs = [
        { id: 'details', label: 'Details', icon: Info },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'barcode', label: 'Barcode', icon: Barcode },
        { id: 'actions', label: 'Actions', icon: CheckCircle },
    ];

    const wasteTypes = [
        { value: 'liquid', label: 'Liquid', icon: Droplet },
        { value: 'solid', label: 'Solid', icon: Package },
        { value: 'sharps', label: 'Sharps', icon: Scissors },
        { value: 'pathological', label: 'Pathological', icon: Syringe },
    ];

    if (!waste) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Waste Details
                            </h2>
                            <WasteStatusBadge status={waste.status} />
                            {waste.waste_barcode && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                    {waste.waste_barcode}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Edit Toggle */}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                title={isEditing ? 'Cancel Edit' : 'Edit'}
                            >
                                {isEditing ? (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                    <Edit className="w-4 h-4 text-blue-500" />
                                )}
                            </button>
                            {/* Close */}
                            <button 
                                onClick={onClose} 
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* ============================================================ */}
                    {/* DETAILS TAB */}
                    {/* ============================================================ */}
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {isEditing ? (
                                // Edit Mode
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Waste Type *
                                            </label>
                                            <select
                                                name="waste_type"
                                                value={editData.waste_type}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="">Select...</option>
                                                {wasteTypes.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Sub Type
                                            </label>
                                            <input
                                                type="text"
                                                name="waste_sub_type"
                                                value={editData.waste_sub_type}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Volume (ml)
                                            </label>
                                            <input
                                                type="number"
                                                name="volume_ml"
                                                value={editData.volume_ml}
                                                onChange={handleEditChange}
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Weight (kg)
                                            </label>
                                            <input
                                                type="number"
                                                name="weight_kg"
                                                value={editData.weight_kg}
                                                onChange={handleEditChange}
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Patient Name
                                            </label>
                                            <input
                                                type="text"
                                                name="patient_name"
                                                value={editData.patient_name}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Specimen Barcode
                                            </label>
                                            <input
                                                type="text"
                                                name="specimen_barcode"
                                                value={editData.specimen_barcode}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Container Type
                                            </label>
                                            <select
                                                name="container_type"
                                                value={editData.container_type}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="">Select...</option>
                                                <option value="tube">Tube</option>
                                                <option value="biohazard_bag">Biohazard Bag</option>
                                                <option value="sharps_container">Sharps Container</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Color Code
                                            </label>
                                            <select
                                                name="color_code"
                                                value={editData.color_code}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="RED">🔴 RED</option>
                                                <option value="YELLOW">🟡 YELLOW</option>
                                                <option value="BLUE">🔵 BLUE</option>
                                                <option value="WHITE">⚪ WHITE</option>
                                                <option value="BLACK">⚫ BLACK</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Biohazard Level
                                            </label>
                                            <select
                                                name="biohazard_level"
                                                value={editData.biohazard_level}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="BSL-1">BSL-1</option>
                                                <option value="BSL-2">BSL-2</option>
                                                <option value="BSL-3">BSL-3</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Notes
                                            </label>
                                            <textarea
                                                name="notes"
                                                value={editData.notes}
                                                onChange={handleEditChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_hazardous"
                                            checked={editData.is_hazardous}
                                            onChange={handleEditChange}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                        />
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            This waste is hazardous
                                        </label>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={updateStatusMutation.isPending}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {updateStatusMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    {/* Quick Info Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                                            <div className="mt-1 flex justify-center">
                                                <WasteTypeBadge type={waste.waste_type} />
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {waste.volume_ml ? `${waste.volume_ml} ml` : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {waste.weight_kg ? `${waste.weight_kg} kg` : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Biohazard Level</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {waste.biohazard_level || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detailed Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Patient Name</p>
                                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                {waste.patient_name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Specimen Barcode</p>
                                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                {waste.specimen_barcode || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
                                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                {waste.order_number || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Container Type</p>
                                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                {waste.container_type || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Color Code</p>
                                            <div className="mt-1">
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-${waste.color_code?.toLowerCase()}-100 text-${waste.color_code?.toLowerCase()}-800`}>
                                                    {waste.color_code || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Is Hazardous</p>
                                            <p className="text-sm font-medium mt-1">
                                                {waste.is_hazardous ? (
                                                    <span className="text-red-600 dark:text-red-400">⚠️ Yes</span>
                                                ) : (
                                                    <span className="text-green-600 dark:text-green-400">No</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {waste.notes && (
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{waste.notes}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* TIMELINE TAB */}
                    {/* ============================================================ */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Generated</p>
                                    <p className="text-gray-500 dark:text-gray-400">{formatDate(waste.generated_at)}</p>
                                </div>
                            </div>

                            {waste.treated_at && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Treated</p>
                                        <p className="text-gray-500 dark:text-gray-400">{formatDate(waste.treated_at)}</p>
                                        {waste.treatment_method && (
                                            <p className="text-xs text-gray-400">Method: {waste.treatment_method}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {waste.disposed_at && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Disposed</p>
                                        <p className="text-gray-500 dark:text-gray-400">{formatDate(waste.disposed_at)}</p>
                                        {waste.disposal_method && (
                                            <p className="text-xs text-gray-400">Method: {waste.disposal_method}</p>
                                        )}
                                        {waste.manifest_number && (
                                            <p className="text-xs text-gray-400">Manifest: {waste.manifest_number}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {waste.rejected_at && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Rejected</p>
                                        <p className="text-gray-500 dark:text-gray-400">{formatDate(waste.rejected_at)}</p>
                                        {waste.rejection_reason && (
                                            <p className="text-xs text-gray-400">Reason: {waste.rejection_reason}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!waste.treated_at && !waste.disposed_at && !waste.rejected_at && (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No timeline events yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* BARCODE TAB */}
                    {/* ============================================================ */}
                    {activeTab === 'barcode' && (
                        <div className="space-y-4">
                            {/* Barcode */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Barcode</h4>
                                {!waste.waste_barcode ? (
                                    <button
                                        onClick={handleGenerateBarcode}
                                        disabled={isGenerating}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Barcode className="w-5 h-5" />
                                        )}
                                        {isGenerating ? 'Generating...' : 'Generate Barcode'}
                                    </button>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                                            <CheckCircle className="inline w-4 h-4 mr-1" />
                                            Barcode: {waste.waste_barcode}
                                        </p>
                                        {waste.barcode_image_url && (
                                            <img 
                                                src={waste.barcode_image_url} 
                                                alt="Barcode" 
                                                className="mx-auto max-w-full h-auto"
                                            />
                                        )}
                                        <button
                                            onClick={handleGenerateBarcode}
                                            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            <RefreshCw className="inline w-4 h-4 mr-1" />
                                            Regenerate
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* QR Code */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">QR Code</h4>
                                <button
                                    onClick={handleGenerateQR}
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <QrCode className="w-5 h-5" />
                                    )}
                                    {isGenerating ? 'Generating...' : 'Generate QR Code'}
                                </button>
                            </div>

                            {/* Full Label */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Full Label</h4>
                                <button
                                    onClick={handleGenerateLabel}
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Printer className="w-5 h-5" />
                                    )}
                                    {isGenerating ? 'Generating...' : 'Generate Full Label'}
                                </button>

                                {(barcodeData?.label_image || waste?.barcode_image_url) && (
                                    <div className="mt-3">
                                        <img 
                                            src={barcodeData?.label_image || waste?.barcode_image_url} 
                                            alt="Label" 
                                            className="w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
                                        />
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={handlePrintLabel}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                                            >
                                                <Printer className="w-4 h-4" />
                                                Print
                                            </button>
                                            <button
                                                onClick={handleDownloadLabel}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* ACTIONS TAB */}
                    {/* ============================================================ */}
                    {activeTab === 'actions' && (
                        <div className="space-y-6">
                            {waste.status !== 'disposed' && waste.status !== 'rejected' && (
                                <>
                                    {/* Treat Action */}
                                    {waste.status === 'segregated' && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Treat Waste</h4>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                <select
                                                    value={treatmentMethod}
                                                    onChange={(e) => setTreatmentMethod(e.target.value)}
                                                    className="w-full sm:flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="">Select Method</option>
                                                    <option value="autoclave">Autoclave</option>
                                                    <option value="chemical">Chemical</option>
                                                    <option value="incineration">Incineration</option>
                                                    <option value="microwave">Microwave</option>
                                                    <option value="irradiation">Irradiation</option>
                                                </select>
                                                <button
                                                    onClick={handleTreat}
                                                    disabled={treatMutation.isPending || !treatmentMethod}
                                                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                                >
                                                    {treatMutation.isPending ? 'Processing...' : 'Treat Waste'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dispose Action */}
                                    {(waste.status === 'treated' || waste.status === 'packaged') && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Dispose Waste</h4>
                                            <div className="space-y-3">
                                                <select
                                                    value={disposalMethod}
                                                    onChange={(e) => setDisposalMethod(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="">Select Method</option>
                                                    <option value="landfill">Landfill</option>
                                                    <option value="incineration">Incineration</option>
                                                    <option value="recycling">Recycling</option>
                                                    <option value="chemical_treatment">Chemical Treatment</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    name="disposal_facility"
                                                    placeholder="Disposal Facility"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Manifest Number *"
                                                    value={manifestNumber}
                                                    onChange={(e) => setManifestNumber(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                                />
                                                <button
                                                    onClick={handleDispose}
                                                    disabled={disposeMutation.isPending || !disposalMethod || !manifestNumber}
                                                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                                >
                                                    {disposeMutation.isPending ? 'Processing...' : 'Dispose Waste'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reject Action */}
                                    {waste.status !== 'rejected' && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Reject Waste</h4>
                                            <div className="space-y-3">
                                                <textarea
                                                    placeholder="Rejection Reason *"
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                                                    rows="2"
                                                />
                                                <button
                                                    onClick={handleReject}
                                                    disabled={updateStatusMutation.isPending || !rejectionReason}
                                                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                                >
                                                    {updateStatusMutation.isPending ? 'Processing...' : 'Reject Waste'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    <div>
                                        <textarea
                                            placeholder="Add notes for this action..."
                                            value={actionNotes}
                                            onChange={(e) => setActionNotes(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            rows="2"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Completed States */}
                            {waste.status === 'disposed' && (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-gray-700 dark:text-gray-300 font-medium">This waste has been disposed</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {formatDate(waste.disposed_at)} • Manifest: {waste.manifest_number || 'N/A'}
                                    </p>
                                </div>
                            )}

                            {waste.status === 'rejected' && (
                                <div className="text-center py-8">
                                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                    <p className="text-gray-700 dark:text-gray-300 font-medium">This waste has been rejected</p>
                                    {waste.rejection_reason && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Reason: {waste.rejection_reason}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <LabelPrintModal
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                labelType="waste"
                labelData={{
                    wasteBarcode: waste?.waste_barcode,
                    wasteType: waste?.waste_type,
                    containerType: waste?.container_type,
                    collectionDate: waste?.collection_date ? formatDate(waste.collection_date) : null,
                    technicianName: waste?.created_by?.name || waste?.collected_by?.name || 'N/A',
                    disposalDeadline: waste?.disposal_deadline ? formatDate(waste.disposal_deadline) : null,
                    qrCodeUrl: waste?.qr_code_url || barcodeData?.qr_code
                }}
            />
        </div>
    );
}