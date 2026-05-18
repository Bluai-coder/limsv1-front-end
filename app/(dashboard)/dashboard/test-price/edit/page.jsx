



// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
// import Link from 'next/link';
// import { useAuthStore } from '@/lib/auth-store';
// import { useTestCatalogById, useUpdateTestCatalog } from '@/hooks/use-test-catalog';
// import { usePermissions } from '@/hooks/permissions/usePermissions';
// import { PermissionDenied } from '@/components/PermissionGuard';


// export default function UpdateTestPage() {
//       // Use permission hook
//   const {
//     canCreate,
//     canRead,
//     canUpdate,
//     canDelete,
//     isAdmin
//   } = usePermissions();

//   // Check if user has read access to Tests & Prices
//   if (!canUpdate('Tests & Prices')) {
//     return <PermissionDenied resource="Tests & Prices" action="update" />;
//   }
//   const searchParams = useSearchParams();
//   const id = searchParams.get('id');
//   const router = useRouter();
//   const { tenant } = useAuthStore();
//   const updateTestCatalog = useUpdateTestCatalog();

//   const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
//   const [analytes, setAnalytes] = useState([
//     { code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' }
//   ]);
  
//   // ✅ Fetch test data
//   const { data, isLoading } = useTestCatalogById(id, tenant?.id);

//   // ✅ Populate form when data loads
//   useEffect(() => {
//     if (!data?.data) return;
//     const testData = data.data;

//     // Reset form fields
//     reset({
//       code: testData.code || '',
//       name: testData.name || '',
//       display_name: testData.display_name || '',
//       department: testData.department || '',
//       sub_department: testData.sub_department || '',
//       specimen_type: testData.specimen_type || '',
//       specimen_volume_ml: testData.specimen_volume_ml || '',
//       container_type: testData.container_type || '',
//       method: testData.method || '',
//       tat_hours: testData.tat_hours || '',
//       result_type: testData.result_type || 'numeric',
//       price: testData.price || '',
//       sort_order: testData.sort_order || '',
//       is_orderable: testData.is_orderable ?? true,
//       is_active: testData.is_active ?? true,
//       requires_fasting: testData.requires_fasting ?? false,
//     });

//     // ✅ Populate analytes
//     let analytesData = testData.analytes || testData.testAnalytes || [];
    
//     if (analytesData.length === 0) {
//       setAnalytes([{ code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' }]);
//     } else {
//       setAnalytes(analytesData.map((a) => ({
//         code: a.analyte_code || a.code || '',
//         name: a.analyte_name || a.name || '',
//         unit: a.unit || '',
//         ref_low: a.ref_low?.toString() || '',
//         ref_high: a.ref_high?.toString() || '',
//         critical_low: a.critical_low?.toString() || '',
//         critical_high: a.critical_high?.toString() || '',
//       })));
//     }
//   }, [data, reset]);

//   // ✅ Submit handler
//   const onSubmit = async (formData) => {
//     try {
//       // Filter and clean analytes
//       const cleanAnalytes = analytes
//         .filter(a => a.code && a.name)
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

//       // ✅ Payload with snake_case
//       const payload = {
//         tenant_id: tenant?.id,
//         code: formData.code,
//         name: formData.name,
//         display_name: formData.display_name || formData.name,
//         department: formData.department,
//         sub_department: formData.sub_department,
//         specimen_type: formData.specimen_type,
//         specimen_volume_ml: Number(formData.specimen_volume_ml) || 0,
//         container_type: formData.container_type,
//         method: formData.method,
//         tat_hours: Number(formData.tat_hours) || 0,
//         result_type: formData.result_type || 'numeric',
//         price: Number(formData.price) || 0,
//         sort_order: Number(formData.sort_order) || 0,
//         is_orderable: formData.is_orderable === true || formData.is_orderable === 'true',
//         is_active: formData.is_active === true || formData.is_active === 'true',
//         requires_fasting: formData.requires_fasting === true || formData.requires_fasting === 'true',
//         analytes: cleanAnalytes,
//         instructions: {},
//       };

//       console.log('Updating test with payload:', payload);

//       await updateTestCatalog.mutateAsync({ 
//         id, 
//         tenantId: tenant?.id, 
//         data: payload 
//       });
      
//       toast.success('Test updated successfully');
//       router.push('/dashboard/test-price');
//     } catch (err) {
//       console.error('Update error:', err);
//       toast.error(err?.response?.data?.message || 'Failed to update test');
//     }
//   };

//   // Analyte handlers
//   const addAnalyte = () => {
//     setAnalytes([...analytes, { code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' }]);
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

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-96">
//         <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto py-6">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-8">
//         <Link href="/dashboard/test-price" className="p-2 rounded-xl hover:bg-gray-100 transition">
//           <ArrowLeft className="w-5 h-5 text-gray-500" />
//         </Link>
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Update Test</h1>
//           <p className="text-sm text-gray-500">Edit test details, reference ranges, and critical values</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         {/* Test Information */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Test Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Test Code</label>
//               <input {...register('code')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
//               <input {...register('name')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//               <input {...register('display_name')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
//               <input {...register('department')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Sub Department</label>
//               <input {...register('sub_department')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//           </div>
//         </div>

//         {/* Specimen Information */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Specimen Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Specimen Type</label>
//               <input {...register('specimen_type')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
//               <input type="number" step="0.1" {...register('specimen_volume_ml')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Container Type</label>
//               <input {...register('container_type')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//           </div>
//         </div>

//         {/* Processing Details */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Processing Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
//               <input {...register('method')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">TAT (hours)</label>
//               <input type="number" {...register('tat_hours')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
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
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-lg font-semibold text-gray-900">Analytes</h2>
//             <button type="button" onClick={addAnalyte} className="flex items-center gap-2 text-sm text-[#1b4dff] hover:text-blue-700 font-medium">
//               <Plus className="w-4 h-4" /> Add Analyte
//             </button>
//           </div>

//           {analytes.map((analyte, idx) => (
//             <div key={idx} className="border border-gray-200 rounded-2xl p-4 mb-4 bg-gray-50">
//               <div className="flex justify-between items-center mb-3">
//                 <span className="text-sm font-medium text-gray-600">Analyte {idx + 1}</span>
//                 {analytes.length > 1 && (
//                   <button type="button" onClick={() => removeAnalyte(idx)} className="text-red-500 hover:text-red-600">
//                     <X className="w-4 h-4" />
//                   </button>
//                 )}
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-xs text-gray-500 block mb-1">Code *</label>
//                     <input 
//                       value={analyte.code} 
//                       onChange={(e) => updateAnalyte(idx, 'code', e.target.value)} 
//                       placeholder="HGB" 
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 block mb-1">Name *</label>
//                     <input 
//                       value={analyte.name} 
//                       onChange={(e) => updateAnalyte(idx, 'name', e.target.value)} 
//                       placeholder="Hemoglobin" 
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 block mb-1">Unit</label>
//                     <input 
//                       value={analyte.unit} 
//                       onChange={(e) => updateAnalyte(idx, 'unit', e.target.value)} 
//                       placeholder="g/dL" 
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-xs text-gray-500 block mb-1">Ref Low</label>
//                     <input 
//                       value={analyte.ref_low} 
//                       onChange={(e) => updateAnalyte(idx, 'ref_low', e.target.value)} 
//                       placeholder="12.0" 
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 block mb-1">Ref High</label>
//                     <input 
//                       value={analyte.ref_high} 
//                       onChange={(e) => updateAnalyte(idx, 'ref_high', e.target.value)} 
//                       placeholder="16.0" 
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 block mb-1">Critical Low</label>
//                     <input 
//                       value={analyte.critical_low} 
//                       onChange={(e) => updateAnalyte(idx, 'critical_low', e.target.value)} 
//                       placeholder="7.0" 
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 block mb-1">Critical High</label>
//                     <input 
//                       value={analyte.critical_high} 
//                       onChange={(e) => updateAnalyte(idx, 'critical_high', e.target.value)} 
//                       placeholder="20.0" 
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b4dff]" 
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Pricing & Settings */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Settings</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
//               <input type="number" {...register('price')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
//               <input type="number" {...register('sort_order')} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff]" />
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-6 mt-6">
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input type="checkbox" {...register('is_active')} /> <span className="text-sm">Active</span>
//             </label>
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input type="checkbox" {...register('is_orderable')} /> <span className="text-sm">Orderable</span>
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
//             {isSubmitting ? 'Updating Test...' : 'Update Test'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }




'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { useTestCatalogById, useUpdateTestCatalog } from '@/hooks/use-test-catalog';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

export default function UpdateTestPage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Tests & Prices
  if (!canUpdate('Tests & Prices')) {
    return <PermissionDenied resource="Tests & Prices" action="update" />;
  }
  
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const { tenant } = useAuthStore();
  const updateTestCatalog = useUpdateTestCatalog();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [analytes, setAnalytes] = useState([
    { code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' }
  ]);
  
  // ✅ Fetch test data
  const { data, isLoading } = useTestCatalogById(id, tenant?.id);

  // ✅ Populate form when data loads
  useEffect(() => {
    if (!data?.data) return;
    const testData = data.data;

    // Reset form fields
    reset({
      code: testData.code || '',
      name: testData.name || '',
      display_name: testData.display_name || '',
      department: testData.department || '',
      sub_department: testData.sub_department || '',
      specimen_type: testData.specimen_type || '',
      specimen_volume_ml: testData.specimen_volume_ml || '',
      container_type: testData.container_type || '',
      method: testData.method || '',
      tat_hours: testData.tat_hours || '',
      result_type: testData.result_type || 'numeric',
      price: testData.price || '',
      sort_order: testData.sort_order || '',
      is_orderable: testData.is_orderable ?? true,
      is_active: testData.is_active ?? true,
      requires_fasting: testData.requires_fasting ?? false,
    });

    // ✅ Populate analytes
    let analytesData = testData.analytes || testData.testAnalytes || [];
    
    if (analytesData.length === 0) {
      setAnalytes([{ code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' }]);
    } else {
      setAnalytes(analytesData.map((a) => ({
        code: a.analyte_code || a.code || '',
        name: a.analyte_name || a.name || '',
        unit: a.unit || '',
        ref_low: a.ref_low?.toString() || '',
        ref_high: a.ref_high?.toString() || '',
        critical_low: a.critical_low?.toString() || '',
        critical_high: a.critical_high?.toString() || '',
      })));
    }
  }, [data, reset]);

  // ✅ Submit handler
  const onSubmit = async (formData) => {
    try {
      // Filter and clean analytes
      const cleanAnalytes = analytes
        .filter(a => a.code && a.name)
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

      // ✅ Payload with snake_case
      const payload = {
        tenant_id: tenant?.id,
        code: formData.code,
        name: formData.name,
        display_name: formData.display_name || formData.name,
        department: formData.department,
        sub_department: formData.sub_department,
        specimen_type: formData.specimen_type,
        specimen_volume_ml: Number(formData.specimen_volume_ml) || 0,
        container_type: formData.container_type,
        method: formData.method,
        tat_hours: Number(formData.tat_hours) || 0,
        result_type: formData.result_type || 'numeric',
        price: Number(formData.price) || 0,
        sort_order: Number(formData.sort_order) || 0,
        is_orderable: formData.is_orderable === true || formData.is_orderable === 'true',
        is_active: formData.is_active === true || formData.is_active === 'true',
        requires_fasting: formData.requires_fasting === true || formData.requires_fasting === 'true',
        analytes: cleanAnalytes,
        instructions: {},
      };

      console.log('Updating test with payload:', payload);

      await updateTestCatalog.mutateAsync({ 
        id, 
        tenantId: tenant?.id, 
        data: payload 
      });
      
      toast.success('Test updated successfully');
      router.push('/dashboard/test-price');
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update test');
    }
  };

  // Analyte handlers
  const addAnalyte = () => {
    setAnalytes([...analytes, { code: '', name: '', unit: '', ref_low: '', ref_high: '', critical_low: '', critical_high: '' }]);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1b4dff] dark:text-[#1b4dff]" />
      </div>
    );
  }

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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Update Test</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Edit test details, reference ranges, and critical values</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Test Information */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Test Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Test Code</label>
                  <input {...register('code')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Test Name</label>
                  <input {...register('name')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Display Name</label>
                  <input {...register('display_name')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <input {...register('department')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sub Department</label>
                  <input {...register('sub_department')} className={inputClass} />
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
                  <input {...register('specimen_type')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Volume (ml)</label>
                  <input type="number" step="0.1" {...register('specimen_volume_ml')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Container Type</label>
                  <input {...register('container_type')} className={inputClass} />
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
                  <input {...register('method')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>TAT (hours)</label>
                  <input type="number" {...register('tat_hours')} className={inputClass} />
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analytes</h2>
                <button type="button" onClick={addAnalyte} className="flex items-center gap-2 text-sm text-[#1b4dff] dark:text-[#1b4dff] hover:text-blue-700 dark:hover:text-blue-400 font-medium transition">
                  <Plus className="w-4 h-4" /> Add Analyte
                </button>
              </div>

              {analytes.map((analyte, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-4 bg-gray-50 dark:bg-gray-800/50 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Analyte {idx + 1}</span>
                    {analytes.length > 1 && (
                      <button type="button" onClick={() => removeAnalyte(idx)} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition">
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
                          onChange={(e) => updateAnalyte(idx, 'code', e.target.value)} 
                          placeholder="HGB" 
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className={labelSmallClass}>Name *</label>
                        <input 
                          value={analyte.name} 
                          onChange={(e) => updateAnalyte(idx, 'name', e.target.value)} 
                          placeholder="Hemoglobin" 
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className={labelSmallClass}>Unit</label>
                        <input 
                          value={analyte.unit} 
                          onChange={(e) => updateAnalyte(idx, 'unit', e.target.value)} 
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
                          onChange={(e) => updateAnalyte(idx, 'ref_low', e.target.value)} 
                          placeholder="12.0" 
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className={labelSmallClass}>Ref High</label>
                        <input 
                          value={analyte.ref_high} 
                          onChange={(e) => updateAnalyte(idx, 'ref_high', e.target.value)} 
                          placeholder="16.0" 
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className={labelSmallClass}>Critical Low</label>
                        <input 
                          value={analyte.critical_low} 
                          onChange={(e) => updateAnalyte(idx, 'critical_low', e.target.value)} 
                          placeholder="7.0" 
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className={labelSmallClass}>Critical High</label>
                        <input 
                          value={analyte.critical_high} 
                          onChange={(e) => updateAnalyte(idx, 'critical_high', e.target.value)} 
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

          {/* Pricing & Settings */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pricing & Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Price (₹)</label>
                  <input type="number" {...register('price')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sort Order</label>
                  <input type="number" {...register('sort_order')} className={inputClass} />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 mt-6">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input type="checkbox" {...register('is_active')} className="rounded border-gray-300 dark:border-gray-600 text-[#1b4dff] focus:ring-[#1b4dff] dark:bg-gray-900" /> 
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input type="checkbox" {...register('is_orderable')} className="rounded border-gray-300 dark:border-gray-600 text-[#1b4dff] focus:ring-[#1b4dff] dark:bg-gray-900" /> 
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
              {isSubmitting ? 'Updating Test...' : 'Update Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}