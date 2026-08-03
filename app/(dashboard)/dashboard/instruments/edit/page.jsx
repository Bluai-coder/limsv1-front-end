// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useEffect } from "react";
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import { ArrowLeft, Save, Loader2 } from 'lucide-react';
// import Link from 'next/link';
// import { useInstrument, useUpdateInstrument } from "@/hooks/use-instruments";
// import { PermissionDenied } from '@/components/PermissionGuard';
// import { usePermissions } from '@/hooks/permissions/usePermissions';


// export default function UpdateInstrumentPage() {
//      // Use permission hook
//   const {
//     canCreate,
//     canRead,
//     canUpdate,
//     canDelete,
//     isAdmin
//   } = usePermissions();

//   // Check if user has read access to Instruments
//   if (!canUpdate('Instruments')) {
//     return <PermissionDenied resource="Instruments" action="update" />;
//   }
//   const searchParams = useSearchParams();
//   const id = searchParams.get("id");
//   const router = useRouter();
//   const updateInstrument = useUpdateInstrument();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { isSubmitting }
//   } = useForm();

//   // Fetch Instrument Data
//   const { data, isLoading } = useInstrument(id);

//   // Populate form when data loads
//   useEffect(() => {
//     if (!data?.data) return;

//     const instrument = data.data;

//     reset({
//       name: instrument.name || "",
//       model: instrument.model || "",
//       manufacturer: instrument.manufacturer || "",
//       serial_number: instrument.serial_number || "",
//       instrument_type: instrument.instrument_type || "",
//       department: instrument.department || "",
//       location: instrument.location || "",
//       status: instrument.status || "active",
//       installation_date: instrument.installation_date ? instrument.installation_date.split('T')[0] : "",

//       // Interface fields
//       ip: instrument.interfaces?.[0]?.connection_config?.ip || "",
//       port: instrument.interfaces?.[0]?.connection_config?.port || "",
//     });
//   }, [data, reset]);

//   const onSubmit = async (formData) => {
//     if (!id) {
//       toast.error("Instrument ID is missing");
//       return;
//     }

//     try {
//       const payload = {
//         name: formData.name,
//         model: formData.model,
//         manufacturer: formData.manufacturer,
//         serial_number: formData.serial_number,
//         instrument_type: formData.instrument_type,
//         department: formData.department,
//         location: formData.location,
//         status: formData.status,
//         installation_date: formData.installation_date,

//         interfaces: [
//           {
//             protocol: "HL7",
//             direction: "inbound",
//             connection_config: {
//               ip: formData.ip,
//               port: Number(formData.port),
//             },
//             auto_download: true,
//             auto_upload: false,
//           },
//         ],
//       };

//       await updateInstrument.mutateAsync({ id, data: payload });

//       toast.success("Instrument updated successfully");
//       router.push("/dashboard/instruments");

//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to update instrument");
//     }
//   };

//   if (!id) return null;

//   if (isLoading) {
//     return (
//       <div className="flex justify-center py-20">
//         <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto py-6">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-8">
//         <Link href="/dashboard/instruments" className="p-2 rounded-xl hover:bg-gray-100 transition">
//           <ArrowLeft className="w-5 h-5 text-gray-500" />
//         </Link>
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Update Instrument</h1>
//           <p className="text-sm text-gray-500">Edit instrument details</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

//         {/* Instrument Details */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Instrument Details</h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Instrument Name</label>
//               <input
//                 {...register("name")}
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
//               <input
//                 {...register("model")}
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
//               <input
//                 {...register("manufacturer")}
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
//               <input
//                 {...register("serial_number")}
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Instrument Type</label>
//               <input
//                 {...register("instrument_type")}
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
//               <input
//                 {...register("department")}
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
//               <input
//                 {...register("location")}
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 {...register("status")}
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               >
//                 <option value="active">Active</option>
//                 <option value="maintenance">Under Maintenance</option>
//                 <option value="calibration">Calibration</option>
//                 <option value="decommissioned">Decommissioned</option>
//                 <option value="offline">Offline</option>
//               </select>
//             </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Installation Date</label>
//               <input
//                 type="date"
//                 {...register("installation_date")}
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Interface Configuration */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Interface Configuration (HL7)</h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
//               <input
//                 {...register("ip")}
//                 placeholder="192.168.1.100"
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
//               <input
//                 type="number"
//                 {...register("port")}
//                 placeholder="5000"
//                 className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex  justify-between sm:flex-row gap-4 pt-4">
//           <Link
//             href="/dashboard/instruments"
//             className="flex-1 sm:flex-none px-6 py-3 text-center border border-gray-300 rounded-2xl font-medium text-gray-700 hover:bg-gray-50 transition"
//           >
//             Cancel
//           </Link>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="flex-1 sm:flex-none px-8 py-3 bg-[#1b4dff] hover:bg-[#1a40e0] text-white rounded-2xl font-medium flex items-center justify-center gap-2 transition disabled:opacity-70"
//           >
//             {isSubmitting ? (
//               <Loader2 className="w-5 h-5 animate-spin" />
//             ) : (
//               <Save className="w-5 h-5" />
//             )}
//             {isSubmitting ? "Updating Instrument..." : "Update Instrument"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }







'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from "react";
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useInstrument, useUpdateInstrument } from "@/hooks/use-instruments";
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

export default function UpdateInstrumentPage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Instruments
  if (!canUpdate('Instruments')) {
    return <PermissionDenied resource="Instruments" action="update" />;
  }
  
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const updateInstrument = useUpdateInstrument();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm();

  // Fetch Instrument Data
  const { data, isLoading } = useInstrument(id);

  // Populate form when data loads
  useEffect(() => {
    if (!data?.data) return;

    const instrument = data.data;

    reset({
      name: instrument.name || "",
      model: instrument.model || "",
      manufacturer: instrument.manufacturer || "",
      serial_number: instrument.serial_number || "",
      instrument_type: instrument.instrument_type || "",
      department: instrument.department || "",
      location: instrument.location || "",
      status: instrument.status || "active",
      installation_date: instrument.installation_date ? instrument.installation_date.split('T')[0] : "",

      // Interface fields
      ip: instrument.interfaces?.[0]?.connection_config?.ip || "",
      port: instrument.interfaces?.[0]?.connection_config?.port || "",
    });
  }, [data, reset]);

  const onSubmit = async (formData) => {
    if (!id) {
      toast.error("Instrument ID is missing");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        model: formData.model,
        manufacturer: formData.manufacturer,
        serial_number: formData.serial_number,
        instrument_type: formData.instrument_type,
        department: formData.department,
        location: formData.location,
        status: formData.status,
        installation_date: formData.installation_date,

        interfaces: [
          {
            protocol: "HL7",
            direction: "inbound",
            connection_config: {
              ip: formData.ip,
              port: Number(formData.port),
            },
            auto_download: true,
            auto_upload: false,
          },
        ],
      };

      await updateInstrument.mutateAsync({ id, data: payload });

      toast.success("Instrument updated successfully");
      router.push("/dashboard/instruments");

    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update instrument");
    }
  };

  if (!id) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1b4dff] dark:text-[#1b4dff]" />
      </div>
    );
  }

  const inputClass = "w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200";
  const cardClass = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const selectClass = "w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/instruments" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Update Instrument</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Edit instrument details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Instrument Details */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Instrument Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Instrument Name</label>
                  <input
                    {...register("name")}
                    className={inputClass}
                    placeholder="e.g. Hematology Analyzer"
                  />
                </div>

                <div>
                  <label className={labelClass}>Model</label>
                  <input
                    {...register("model")}
                    className={inputClass}
                    placeholder="e.g. Sysmex XN-550"
                  />
                </div>

                <div>
                  <label className={labelClass}>Manufacturer</label>
                  <input
                    {...register("manufacturer")}
                    className={inputClass}
                    placeholder="e.g. Sysmex, Beckman Coulter"
                  />
                </div>

                <div>
                  <label className={labelClass}>Serial Number</label>
                  <input
                    {...register("serial_number")}
                    className={inputClass}
                    placeholder="SN-123456789"
                  />
                </div>

                <div>
                  <label className={labelClass}>Instrument Type</label>
                  <input
                    {...register("instrument_type")}
                    className={inputClass}
                    placeholder="e.g. Analyzer, Centrifuge"
                  />
                </div>

                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    {...register("department")}
                    className={inputClass}
                    placeholder="Hematology, Biochemistry..."
                  />
                </div>

                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    {...register("location")}
                    className={inputClass}
                    placeholder="Lab Room A-12"
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    {...register("status")}
                    className={selectClass}
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="calibration">Calibration</option>
                    <option value="decommissioned">Decommissioned</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Installation Date</label>
                  <input
                    type="date"
                    {...register("installation_date")}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interface Configuration */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Interface Configuration (HL7)</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>IP Address</label>
                  <input
                    {...register("ip")}
                    placeholder="192.168.1.100"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Port</label>
                  <input
                    type="number"
                    {...register("port")}
                    placeholder="5000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/dashboard/instruments"
              className="flex-1 sm:flex-none px-6 py-3 text-center border border-gray-300 dark:border-gray-600 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-8 py-3 bg-[#1b4dff] hover:bg-[#1a40e0] dark:bg-[#1b4dff] dark:hover:bg-[#1a40e0] text-white rounded-2xl font-medium flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSubmitting ? "Updating Instrument..." : "Update Instrument"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
