
// app/dashboard/tests/new/page.tsx

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useCreateTestCatalog } from '@/hooks/use-test-catalog';
// import { useAuthStore } from '@/lib/auth-store';
// import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
// import { toast } from 'sonner';
// import { useForm } from 'react-hook-form';
// import { usePermissions } from '@/hooks/permissions/usePermissions';
// import { PermissionDenied } from '@/components/PermissionGuard';




// export default function NewTestPage() {
//     // Use permission hook
//   const {
//     canCreate,
//     canRead,
//     canUpdate,
//     canDelete,
//     isAdmin
//   } = usePermissions();

//   // Check if user has read access to Tests & Prices
//   if (!canCreate('Tests & Prices')) {
//     return <PermissionDenied resource="Tests & Prices" action="create" />;
//   }

//   const router = useRouter();
//   const createTestCatalog = useCreateTestCatalog();
//   const { tenant } = useAuthStore();

//   const [analytes, setAnalytes] = useState([
//     { code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' }
//   ]);

//   const {
//     register,
//     handleSubmit,
//     formState: { isSubmitting },
//   } = useForm();

//   const onSubmit = async (data) => {
//     try {
//       // Format analytes with reference ranges and critical values
//       const cleanAnalytes = analytes
//         .filter((a) => a.code && a.name)
//         .map((a, i) => ({
//           code: a.code.trim().toUpperCase(),
//           name: a.name.trim(),
//           unit: a.unit || null,
//           ref_low: a.ref_low ? Number(a.ref_low) : null,
//           ref_high: a.ref_high ? Number(a.ref_high) : null,
//           critical_low: a.critical_low ? Number(a.critical_low) : null,
//           critical_high: a.critical_high ? Number(a.critical_high) : null,
//           display_order: i + 1,
//           data_type: 'numeric',
//         }));

//       if (!cleanAnalytes.length) {
//         toast.error('Add at least one analyte');
//         return;
//       }

//       const payload = {
//         tenant_id: tenant?.id,
//         code: data.code,
//         name: data.name,
//         display_name: data.display_name || data.name,
//         department: data.department,
//         sub_department: data.sub_department,
//         specimen_type: data.specimen_type,
//         specimen_volume_ml: Number(data.specimen_volume_ml) || 0,
//         container_type: data.container_type,
//         method: data.method,
//         tat_hours: Number(data.tat_hours) || 0,
//         result_type: data.result_type || 'numeric',
//         analytes: cleanAnalytes,
//         price: Number(data.price) || 0,
//         is_orderable: data.is_orderable === true || data.is_orderable === 'true',
//         is_active: data.is_active === true || data.is_active === 'true',
//         requires_fasting: data.requires_fasting === true || data.requires_fasting === 'true',
//         sort_order: Number(data.sort_order) || 0,
//         instructions: {},
//       };

//       await createTestCatalog.mutateAsync(payload);
//       toast.success('Test created successfully');
//       router.push('/dashboard/test-price');
//     } catch (err) {
//       console.error('Create test error:', err);
//       toast.error(err?.response?.data?.message || 'Failed to create test');
//     }
//   };

//   const addAnalyte = () => {
//     setAnalytes([
//       ...analytes,
//       { code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' },
//     ]);
//   };

//   const removeAnalyte = (index) => {
//     if (analytes.length === 1) return;
//     setAnalytes(analytes.filter((_, i) => i !== index));
//   };

//   const updateAnalyte = (index, field, value) => {
//     const updated = [...analytes];
//     updated[index] = { ...updated[index], [field]: value };
//     setAnalytes(updated);
//   };

//   return (
//     <div className="max-w-5xl mx-auto py-6">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-8">
//         <Link href="/dashboard/test-price" className="p-2 rounded-xl hover:bg-gray-100 transition">
//           <ArrowLeft className="w-5 h-5 text-gray-500" />
//         </Link>
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Create New Test</h1>
//           <p className="text-sm text-gray-500">Add a new laboratory test with analytes, reference ranges, and critical values</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         {/* Test Information */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Test Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Test Code <span className="text-red-500">*</span></label>
//               <input {...register('code', { required: true })} placeholder="e.g., CBC, LFT" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Test Name <span className="text-red-500">*</span></label>
//               <input {...register('name', { required: true })} placeholder="Complete Blood Count" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//               <input {...register('display_name')} placeholder="CBC (Complete Blood Count)" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
//               <input {...register('department')} placeholder="Hematology" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Sub Department</label>
//               <input {...register('sub_department')} placeholder="Routine" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//           </div>
//         </div>

//         {/* Specimen Information */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Specimen Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Specimen Type</label>
//               <input {...register('specimen_type')} placeholder="Blood, Urine, Serum" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
//               <input type="number" step="0.1" {...register('specimen_volume_ml')} placeholder="2.0" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Container Type</label>
//               <input {...register('container_type')} placeholder="EDTA, Plain, Fluoride" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//           </div>
//         </div>

//         {/* Processing Details */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Processing Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
//               <input {...register('method')} placeholder="Automated / Manual" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">TAT (hours)</label>
//               <input type="number" {...register('tat_hours')} placeholder="4" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Result Type</label>
//               <select {...register('result_type')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]">
//                 <option value="numeric">Numeric</option>
//                 <option value="text">Text</option>
//                 <option value="boolean">Boolean</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Analytes Section with Reference Ranges and Critical Values */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-semibold text-gray-900">Analytes</h2>
//             <button type="button" onClick={addAnalyte} className="flex items-center gap-2 text-sm text-[#1b4dff] hover:text-blue-700 font-medium">
//               <Plus className="w-4 h-4" /> Add Analyte
//             </button>
//           </div>

//           <div className="space-y-4">
//             {analytes.map((analyte, index) => (
//               <div key={index} className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-medium text-gray-600">Analyte {index + 1}</span>
//                   {analytes.length > 1 && (
//                     <button type="button" onClick={() => removeAnalyte(index)} className="text-red-500 hover:text-red-600">
//                       <X className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="text-xs text-gray-500 block mb-1">Code *</label>
//                       <input 
//                         value={analyte.code} 
//                         onChange={(e) => updateAnalyte(index, 'code', e.target.value)} 
//                         placeholder="HGB" 
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs text-gray-500 block mb-1">Name *</label>
//                       <input 
//                         value={analyte.name} 
//                         onChange={(e) => updateAnalyte(index, 'name', e.target.value)} 
//                         placeholder="Hemoglobin" 
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs text-gray-500 block mb-1">Unit</label>
//                       <input 
//                         value={analyte.unit} 
//                         onChange={(e) => updateAnalyte(index, 'unit', e.target.value)} 
//                         placeholder="g/dL" 
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                       />
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="text-xs text-gray-500 block mb-1">Ref Low</label>
//                       <input 
//                         value={analyte.ref_low} 
//                         onChange={(e) => updateAnalyte(index, 'ref_low', e.target.value)} 
//                         placeholder="12.0" 
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs text-gray-500 block mb-1">Ref High</label>
//                       <input 
//                         value={analyte.ref_high} 
//                         onChange={(e) => updateAnalyte(index, 'ref_high', e.target.value)} 
//                         placeholder="16.0" 
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs text-gray-500 block mb-1">Critical Low</label>
//                       <input 
//                         value={analyte.critical_low} 
//                         onChange={(e) => updateAnalyte(index, 'critical_low', e.target.value)} 
//                         placeholder="7.0" 
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs text-gray-500 block mb-1">Critical High</label>
//                       <input 
//                         value={analyte.critical_high} 
//                         onChange={(e) => updateAnalyte(index, 'critical_high', e.target.value)} 
//                         placeholder="20.0" 
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Pricing & Settings */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Settings</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
//               <input type="number" {...register('price', { required: true })} placeholder="250" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
//               <input type="number" {...register('sort_order')} placeholder="1" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-6 mt-6">
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input type="checkbox" {...register('is_active')} defaultChecked /> <span className="text-sm">Active</span>
//             </label>
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input type="checkbox" {...register('is_orderable')} defaultChecked /> <span className="text-sm">Orderable</span>
//             </label>
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input type="checkbox" {...register('requires_fasting')} /> <span className="text-sm">Requires Fasting</span>
//             </label>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-between gap-4 pt-4">
//           <Link href="/dashboard/test-price" className="flex-1 sm:flex-none px-6 py-3 text-center border border-gray-300 rounded-2xl font-medium text-gray-700 hover:bg-gray-50 transition">
//             Cancel
//           </Link>
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="flex-1 sm:flex-none px-8 py-3 bg-[#1b4dff] hover:bg-[#1a40e0] text-white rounded-2xl font-medium flex items-center justify-center gap-2 transition disabled:opacity-70"
//           >
//             {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
//             {isSubmitting ? 'Creating Test...' : 'Create Test'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }













// app/dashboard/tests/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateTestCatalog } from '@/hooks/use-test-catalog';
import { useAuthStore } from '@/lib/auth-store';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

export default function NewTestPage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Tests & Prices
  if (!canCreate('Tests & Prices')) {
    return <PermissionDenied resource="Tests & Prices" action="create" />;
  }

  const router = useRouter();
  const createTestCatalog = useCreateTestCatalog();
  const { tenant } = useAuthStore();

  const [analytes, setAnalytes] = useState([
    { code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' }
  ]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Format analytes with reference ranges and critical values
      const cleanAnalytes = analytes
        .filter((a) => a.code && a.name)
        .map((a, i) => ({
          code: a.code.trim().toUpperCase(),
          name: a.name.trim(),
          unit: a.unit || null,
          ref_low: a.ref_low ? Number(a.ref_low) : null,
          ref_high: a.ref_high ? Number(a.ref_high) : null,
          critical_low: a.critical_low ? Number(a.critical_low) : null,
          critical_high: a.critical_high ? Number(a.critical_high) : null,
          display_order: i + 1,
          data_type: 'numeric',
        }));

      if (!cleanAnalytes.length) {
        toast.error('Add at least one analyte');
        return;
      }

      const payload = {
        tenant_id: tenant?.id,
        code: data.code,
        name: data.name,
        display_name: data.display_name || data.name,
        department: data.department,
        sub_department: data.sub_department,
        specimen_type: data.specimen_type,
        specimen_volume_ml: Number(data.specimen_volume_ml) || 0,
        container_type: data.container_type,
        method: data.method,
        tat_hours: Number(data.tat_hours) || 0,
        result_type: data.result_type || 'numeric',
        analytes: cleanAnalytes,
        price: Number(data.price) || 0,
        is_orderable: data.is_orderable === true || data.is_orderable === 'true',
        is_active: data.is_active === true || data.is_active === 'true',
        requires_fasting: data.requires_fasting === true || data.requires_fasting === 'true',
        sort_order: Number(data.sort_order) || 0,
        instructions: {},
      };

      await createTestCatalog.mutateAsync(payload);
      toast.success('Test created successfully');
      router.push('/dashboard/test-price');
    } catch (err) {
      console.error('Create test error:', err);
      toast.error(err?.response?.data?.message || 'Failed to create test');
    }
  };

  const addAnalyte = () => {
    setAnalytes([
      ...analytes,
      { code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' },
    ]);
  };

  const removeAnalyte = (index) => {
    if (analytes.length === 1) return;
    setAnalytes(analytes.filter((_, i) => i !== index));
  };

  const updateAnalyte = (index, field, value) => {
    const updated = [...analytes];
    updated[index] = { ...updated[index], [field]: value };
    setAnalytes(updated);
  };

  const inputClass = "w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200";
  const cardClass = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const labelSmallClass = "text-xs text-gray-500 dark:text-gray-400 block mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/test-price" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Test</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add a new laboratory test with analytes, reference ranges, and critical values</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Test Information */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Test Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Test Code <span className="text-red-500">*</span></label>
                  <input {...register('code', { required: true })} placeholder="e.g., CBC, LFT" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Test Name <span className="text-red-500">*</span></label>
                  <input {...register('name', { required: true })} placeholder="Complete Blood Count" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Display Name</label>
                  <input {...register('display_name')} placeholder="CBC (Complete Blood Count)" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <input {...register('department')} placeholder="Hematology" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sub Department</label>
                  <input {...register('sub_department')} placeholder="Routine" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Specimen Information */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Specimen Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Specimen Type</label>
                  <input {...register('specimen_type')} placeholder="Blood, Urine, Serum" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Volume (ml)</label>
                  <input type="number" step="0.1" {...register('specimen_volume_ml')} placeholder="2.0" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Container Type</label>
                  <input {...register('container_type')} placeholder="EDTA, Plain, Fluoride" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Processing Details */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Processing Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Method</label>
                  <input {...register('method')} placeholder="Automated / Manual" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>TAT (hours)</label>
                  <input type="number" {...register('tat_hours')} placeholder="4" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Result Type</label>
                  <select {...register('result_type')} className={inputClass}>
                    <option value="numeric">Numeric</option>
                    <option value="text">Text</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Analytes Section with Reference Ranges and Critical Values */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analytes</h2>
                <button type="button" onClick={addAnalyte} className="flex items-center gap-2 text-sm text-[#1b4dff] dark:text-[#1b4dff] hover:text-blue-700 dark:hover:text-blue-400 font-medium transition">
                  <Plus className="w-4 h-4" /> Add Analyte
                </button>
              </div>

              <div className="space-y-4">
                {analytes.map((analyte, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-gray-50 dark:bg-gray-800/50 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Analyte {index + 1}</span>
                      {analytes.length > 1 && (
                        <button type="button" onClick={() => removeAnalyte(index)} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelSmallClass}>Code *</label>
                          <input 
                            value={analyte.code} 
                            onChange={(e) => updateAnalyte(index, 'code', e.target.value)} 
                            placeholder="HGB" 
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className={labelSmallClass}>Name *</label>
                          <input 
                            value={analyte.name} 
                            onChange={(e) => updateAnalyte(index, 'name', e.target.value)} 
                            placeholder="Hemoglobin" 
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className={labelSmallClass}>Unit</label>
                          <input 
                            value={analyte.unit} 
                            onChange={(e) => updateAnalyte(index, 'unit', e.target.value)} 
                            placeholder="g/dL" 
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelSmallClass}>Ref Low</label>
                          <input 
                            value={analyte.ref_low} 
                            onChange={(e) => updateAnalyte(index, 'ref_low', e.target.value)} 
                            placeholder="12.0" 
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className={labelSmallClass}>Ref High</label>
                          <input 
                            value={analyte.ref_high} 
                            onChange={(e) => updateAnalyte(index, 'ref_high', e.target.value)} 
                            placeholder="16.0" 
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className={labelSmallClass}>Critical Low</label>
                          <input 
                            value={analyte.critical_low} 
                            onChange={(e) => updateAnalyte(index, 'critical_low', e.target.value)} 
                            placeholder="7.0" 
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className={labelSmallClass}>Critical High</label>
                          <input 
                            value={analyte.critical_high} 
                            onChange={(e) => updateAnalyte(index, 'critical_high', e.target.value)} 
                            placeholder="20.0" 
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Settings */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pricing & Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Price (₹) *</label>
                  <input type="number" {...register('price', { required: true })} placeholder="250" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sort Order</label>
                  <input type="number" {...register('sort_order')} placeholder="1" className={inputClass} />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 mt-6">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input type="checkbox" {...register('is_active')} defaultChecked className="rounded border-gray-300 dark:border-gray-600 text-[#1b4dff] focus:ring-[#1b4dff] dark:bg-gray-900" /> 
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input type="checkbox" {...register('is_orderable')} defaultChecked className="rounded border-gray-300 dark:border-gray-600 text-[#1b4dff] focus:ring-[#1b4dff] dark:bg-gray-900" /> 
                  <span className="text-sm">Orderable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input type="checkbox" {...register('requires_fasting')} className="rounded border-gray-300 dark:border-gray-600 text-[#1b4dff] focus:ring-[#1b4dff] dark:bg-gray-900" /> 
                  <span className="text-sm">Requires Fasting</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <Link
              href="/dashboard/test-price"
              className="flex-1 sm:flex-none px-6 py-3 text-center border border-gray-300 dark:border-gray-600 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-8 py-3 bg-[#1b4dff] hover:bg-[#1a40e0] dark:bg-[#1b4dff] dark:hover:bg-[#1a40e0] text-white rounded-2xl font-medium flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSubmitting ? 'Creating Test...' : 'Create Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
