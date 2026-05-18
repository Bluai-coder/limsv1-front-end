// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useCreatePatient, usePatient, useUpdatePatient } from '@/hooks/use-patients';
// import { toast } from 'sonner';
// import { ArrowLeft, Save, Loader2 } from 'lucide-react';
// import Link from 'next/link';
// import { useAuthStore } from '@/lib/auth-store';
// import { useEffect } from 'react';
// import { usePermissions } from '@/hooks/permissions/usePermissions';
// import { PermissionDenied } from '@/components/PermissionGuard';

// const schema = z.object({
//   firstName: z.string().min(1, 'First name is required'),
//   middleName: z.string().optional(),
//   lastName: z.string().min(1, 'Last name is required'),
//   dateOfBirth: z.string().min(1, 'Date of birth is required'),
//   gender: z.enum(['male', 'female', 'other', 'unknown'], { required_error: 'Gender is required' }),
//   bloodGroup: z.string().optional(),
//   phonePrimary: z.string().min(1, 'Primary phone is required'),
//   phoneSecondary: z.string().optional(),
//   email: z.string().email('Invalid email').optional().or(z.literal('')),
//   addressLine1: z.string().optional(),
//   addressLine2: z.string().optional(),
//   city: z.string().optional(),
//   state: z.string().optional(),
//   postalCode: z.string().optional(),
//   country: z.string().default('India'),
//   aadhaar: z.string().optional(),
//   abhaId: z.string().optional(),
//   emergencyName: z.string().optional(),
//   emergencyRelation: z.string().optional(),
//   emergencyPhone: z.string().optional(),
//   isVip: z.boolean().optional(),
// });


// export default function EditPatientPage() {

//       // Use permission hook
//       const { 
//         canCreate, 
//         canRead, 
//         canUpdate, 
//         canDelete, 
//         isAdmin 
//       } = usePermissions();
    
//       // Check if user has read access to Patients
//       if (!canUpdate('Patients')) {
//         return <PermissionDenied resource="Patients" action="update" />;
//       }
//   const searchParams = useSearchParams();
//   const id = searchParams.get("id");
//   const router = useRouter();
//   const updatePatient = useUpdatePatient();
//   const { tenant } = useAuthStore();

//   const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       country: 'India',
//       gender: undefined,
//       isVip: false,
//     },
//   });

//   // Fetch patient data for editing
//   const { data: patientData } = usePatient(id);

//   // Populate form when patient data is loaded
//   useEffect(() => {
//     if (!patientData?.data) return;

//     const p = patientData.data;

//     reset({
//       firstName: p.firstName || "",
//       middleName: p.middleName || "",
//       lastName: p.lastName || "",
//       dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : "",
//       gender: p.gender || "",
//       bloodGroup: p.bloodGroup || "",
//       phonePrimary: p.phonePrimary || "",
//       phoneSecondary: p.phoneSecondary || "",
//       email: p.email || "",
//       addressLine1: p.addressLine1 || "",
//       addressLine2: p.addressLine2 || "",
//       city: p.city || "",
//       state: p.state || "",
//       postalCode: p.postalCode || "",
//       country: p.country || "India",
//       aadhaar: p.identifiers?.aadhaar || "",
//       abhaId: p.identifiers?.abhaId || "",
//       emergencyName: p.emergencyContact?.name || "",
//       emergencyRelation: p.emergencyContact?.relation || "",
//       emergencyPhone: p.emergencyContact?.phone || "",
//       isVip: p.isVip || false,
//     });
//   }, [patientData, reset]);

//   const onSubmit = async (data) => {
//     if (!id) {
//       toast.error("Patient ID is missing");
//       return;
//     }

//     try {
//       const payload = {
//         tenantId: tenant?.id,

//         firstName: data.firstName,
//         middleName: data.middleName || null,
//         lastName: data.lastName,
//         dateOfBirth: data.dateOfBirth,
//         gender: data.gender,
//         bloodGroup: data.bloodGroup || null,

//         phonePrimary: data.phonePrimary,
//         phoneSecondary: data.phoneSecondary || null,
//         email: data.email || null,

//         addressLine1: data.addressLine1 || null,
//         addressLine2: data.addressLine2 || null,
//         city: data.city || null,
//         state: data.state || null,
//         postalCode: data.postalCode || null,
//         country: data.country || 'India',

//         // Identifiers
//         ...(data.aadhaar || data.abhaId ? {
//           identifiers: {
//             ...(data.aadhaar && { aadhaar: data.aadhaar }),
//             ...(data.abhaId && { abhaId: data.abhaId }),
//           }
//         } : {}),

//         // Emergency Contact
//         ...(data.emergencyName ? {
//           emergencyContact: {
//             name: data.emergencyName,
//             relation: data.emergencyRelation || null,
//             phone: data.emergencyPhone || null,
//           }
//         } : {}),

//         isVip: data.isVip || false,
//       };

//       await updatePatient.mutateAsync({ id, data: payload });
//       toast.success("Patient updated successfully!");
//       router.push('/dashboard/patients');
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to update patient');
//     }
//   };

//   const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent text-sm bg-white";
//   const errorClass = "text-red-500 text-xs mt-1";

//   return (
//     <div className="max-w-4xl mx-auto py-6">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-8">
//         <Link href="/dashboard/patients" className="p-2 rounded-xl hover:bg-gray-100 transition">
//           <ArrowLeft className="w-5 h-5 text-gray-500" />
//         </Link>
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Edit Patient</h1>
//           <p className="text-sm text-gray-500">Update patient information</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

//         {/* Personal Information */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
//               <input {...register('firstName')} className={inputClass} placeholder="First name" />
//               {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
//               <input {...register('middleName')} className={inputClass} placeholder="Middle name (optional)" />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
//               <input {...register('lastName')} className={inputClass} placeholder="Last name" />
//               {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
//               <input type="date" {...register('dateOfBirth')} className={inputClass} />
//               {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
//               <select {...register('gender')} className={inputClass}>
//                 <option value="">Select Gender</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//                 <option value="unknown">Unknown</option>
//               </select>
//               {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
//               <select {...register('bloodGroup')} className={inputClass}>
//                 <option value="">Select Blood Group</option>
//                 {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
//                   <option key={bg} value={bg}>{bg}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Contact Information */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone <span className="text-red-500">*</span></label>
//               <input type="tel" {...register('phonePrimary')} className={inputClass} placeholder="+91 98765 43210" />
//               {errors.phonePrimary && <p className={errorClass}>{errors.phonePrimary.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
//               <input type="tel" {...register('phoneSecondary')} className={inputClass} placeholder="+91 98765 43211" />
//             </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//               <input type="email" {...register('email')} className={inputClass} placeholder="patient@example.com" />
//               {errors.email && <p className={errorClass}>{errors.email.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
//               <input {...register('aadhaar')} className={inputClass} placeholder="1234 5678 9012" />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">ABHA ID</label>
//               <input {...register('abhaId')} className={inputClass} placeholder="ABHA123456789" />
//             </div>
//           </div>
//         </div>

//         {/* Address */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Address</h2>

//           <div className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
//               <input {...register('addressLine1')} className={inputClass} placeholder="House no, Street" />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
//               <input {...register('addressLine2')} className={inputClass} placeholder="Apartment, Landmark (optional)" />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
//                 <input {...register('city')} className={inputClass} placeholder="City" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
//                 <input {...register('state')} className={inputClass} placeholder="State" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
//                 <input {...register('postalCode')} className={inputClass} placeholder="PIN Code" />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
//               <input {...register('country')} className={inputClass} defaultValue="India" />
//             </div>
//           </div>
//         </div>

//         {/* Emergency Contact */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contact</h2>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
//               <input {...register('emergencyName')} className={inputClass} placeholder="Full name" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
//               <input {...register('emergencyRelation')} className={inputClass} placeholder="Father / Mother / Spouse" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
//               <input type="tel" {...register('emergencyPhone')} className={inputClass} placeholder="+91 98765 43210" />
//             </div>
//           </div>
//         </div>

//         {/* Additional Info */}
//         <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
//           <label className="flex items-center gap-3 text-gray-700 cursor-pointer">
//             <input type="checkbox" {...register('isVip')} className="w-5 h-5 accent-[#1b4dff]" />
//             <span className="text-sm font-medium">Mark as VIP Patient</span>
//           </label>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-between  sm:flex-row gap-4 pt-4">
//           <Link
//             href="/dashboard/patients"
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
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Updating Patient...
//               </>
//             ) : (
//               <>
//                 <Save className="w-5 h-5" />
//                 Update Patient
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }






'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatient, usePatient, useUpdatePatient } from '@/hooks/use-patients';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { useEffect } from 'react';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'unknown'], { required_error: 'Gender is required' }),
  bloodGroup: z.string().optional(),
  phonePrimary: z.string().min(1, 'Primary phone is required'),
  phoneSecondary: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('India'),
  aadhaar: z.string().optional(),
  abhaId: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  emergencyPhone: z.string().optional(),
  isVip: z.boolean().optional(),
});

export default function EditPatientPage() {
  // Use permission hook
  const { 
    canCreate, 
    canRead, 
    canUpdate, 
    canDelete, 
    isAdmin 
  } = usePermissions();

  // Check if user has read access to Patients
  if (!canUpdate('Patients')) {
    return <PermissionDenied resource="Patients" action="update" />;
  }
  
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const updatePatient = useUpdatePatient();
  const { tenant } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      country: 'India',
      gender: undefined,
      isVip: false,
    },
  });

  // Fetch patient data for editing
  const { data: patientData } = usePatient(id);

  // Populate form when patient data is loaded
  useEffect(() => {
    if (!patientData?.data) return;

    const p = patientData.data;

    reset({
      firstName: p.firstName || "",
      middleName: p.middleName || "",
      lastName: p.lastName || "",
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : "",
      gender: p.gender || "",
      bloodGroup: p.bloodGroup || "",
      phonePrimary: p.phonePrimary || "",
      phoneSecondary: p.phoneSecondary || "",
      email: p.email || "",
      addressLine1: p.addressLine1 || "",
      addressLine2: p.addressLine2 || "",
      city: p.city || "",
      state: p.state || "",
      postalCode: p.postalCode || "",
      country: p.country || "India",
      aadhaar: p.identifiers?.aadhaar || "",
      abhaId: p.identifiers?.abhaId || "",
      emergencyName: p.emergencyContact?.name || "",
      emergencyRelation: p.emergencyContact?.relation || "",
      emergencyPhone: p.emergencyContact?.phone || "",
      isVip: p.isVip || false,
    });
  }, [patientData, reset]);

  const onSubmit = async (data) => {
    if (!id) {
      toast.error("Patient ID is missing");
      return;
    }

    try {
      const payload = {
        tenantId: tenant?.id,

        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup || null,

        phonePrimary: data.phonePrimary,
        phoneSecondary: data.phoneSecondary || null,
        email: data.email || null,

        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || 'India',

        // Identifiers
        ...(data.aadhaar || data.abhaId ? {
          identifiers: {
            ...(data.aadhaar && { aadhaar: data.aadhaar }),
            ...(data.abhaId && { abhaId: data.abhaId }),
          }
        } : {}),

        // Emergency Contact
        ...(data.emergencyName ? {
          emergencyContact: {
            name: data.emergencyName,
            relation: data.emergencyRelation || null,
            phone: data.emergencyPhone || null,
          }
        } : {}),

        isVip: data.isVip || false,
      };

      await updatePatient.mutateAsync({ id, data: payload });
      toast.success("Patient updated successfully!");
      router.push('/dashboard/patients');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update patient');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200";
  const errorClass = "text-red-500 dark:text-red-400 text-xs mt-1";
  const cardClass = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/patients" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Patient</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update patient information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input {...register('firstName')} className={inputClass} placeholder="First name" />
                  {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Middle Name</label>
                  <input {...register('middleName')} className={inputClass} placeholder="Middle name (optional)" />
                </div>

                <div>
                  <label className={labelClass}>
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input {...register('lastName')} className={inputClass} placeholder="Last name" />
                  {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input type="date" {...register('dateOfBirth')} className={inputClass} />
                  {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select {...register('gender')} className={inputClass}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                  {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Blood Group</label>
                  <select {...register('bloodGroup')} className={inputClass}>
                    <option value="">Select Blood Group</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Contact Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    Primary Phone <span className="text-red-500">*</span>
                  </label>
                  <input type="tel" {...register('phonePrimary')} className={inputClass} placeholder="+91 98765 43210" />
                  {errors.phonePrimary && <p className={errorClass}>{errors.phonePrimary.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Secondary Phone</label>
                  <input type="tel" {...register('phoneSecondary')} className={inputClass} placeholder="+91 98765 43211" />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Email</label>
                  <input type="email" {...register('email')} className={inputClass} placeholder="patient@example.com" />
                  {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Aadhaar Number</label>
                  <input {...register('aadhaar')} className={inputClass} placeholder="1234 5678 9012" />
                </div>

                <div>
                  <label className={labelClass}>ABHA ID</label>
                  <input {...register('abhaId')} className={inputClass} placeholder="ABHA123456789" />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Address</h2>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Address Line 1</label>
                  <input {...register('addressLine1')} className={inputClass} placeholder="House no, Street" />
                </div>

                <div>
                  <label className={labelClass}>Address Line 2</label>
                  <input {...register('addressLine2')} className={inputClass} placeholder="Apartment, Landmark (optional)" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>City</label>
                    <input {...register('city')} className={inputClass} placeholder="City" />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input {...register('state')} className={inputClass} placeholder="State" />
                  </div>
                  <div>
                    <label className={labelClass}>Postal Code</label>
                    <input {...register('postalCode')} className={inputClass} placeholder="PIN Code" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Country</label>
                  <input {...register('country')} className={inputClass} defaultValue="India" />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Emergency Contact</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input {...register('emergencyName')} className={inputClass} placeholder="Full name" />
                </div>
                <div>
                  <label className={labelClass}>Relation</label>
                  <input {...register('emergencyRelation')} className={inputClass} placeholder="Father / Mother / Spouse" />
                </div>
                <div>
                  <label className={labelClass}>Emergency Phone</label>
                  <input type="tel" {...register('emergencyPhone')} className={inputClass} placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('isVip')} 
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-[#1b4dff] focus:ring-[#1b4dff] dark:bg-gray-900" 
                />
                <span className="text-sm font-medium">Mark as VIP Patient</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/dashboard/patients"
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
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Patient...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Patient
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}