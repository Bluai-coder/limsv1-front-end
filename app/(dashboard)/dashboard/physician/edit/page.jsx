// 'use client';

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import {
//   ArrowLeft,
//   Save,
//   Loader2,
//   Info,
//   User,
//   Phone,
//   Mail,
//   Building,
//   Stethoscope,
//   GraduationCap,
//   CreditCard,
//   MapPin,
//   Send,
//   CheckCircle,
//   AlertCircle,
//   Briefcase,
//   FileText,
//   Globe
// } from "lucide-react";
// import Link from "next/link";

// import { useReferringPhysician } from "@/hooks/useReferringPhysician";
// import { useAuthStore } from "@/lib/auth-store";
// import { PermissionDenied } from '@/components/PermissionGuard';
// import { usePermissions } from '@/hooks/permissions/usePermissions';

// export default function EditDoctor() {
//       // Use permission hook
//   const {
//     canCreate,
//     canRead,
//     canUpdate,
//     canDelete,
//     isAdmin
//   } = usePermissions();

//   // Check if user has read access to Physicians
//   if (!canRead('Physicians')) {
//     return <PermissionDenied resource="Physicians" action="create" />;
//   }
//   const id = useSearchParams().get("id") || null;

//   const { tenant } = useAuthStore();
//   const router = useRouter();
//   const { createPhysician, updatePhysician, getPhysicianById, loading } = useReferringPhysician();

//   const [isEditMode, setIsEditMode] = useState(false);
//   const [doctorId, setDoctorId] = useState(null);

//   const {
//     register,
//     setValue,
//     watch,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     reset,
//   } = useForm({
//     defaultValues: {
//       full_name: "",
//       specialty: "",
//       qualification: "",
//       registration_number: "",
//       facility_name: "",
//       facility_address: "",
//       phone: "",
//       email: "",
//       fax: "",
//       preferred_delivery: "EMAIL",
//       npi_number: "",
//     },
//   });

//   const preferredDelivery = watch("preferred_delivery");
//   const fullName = watch("full_name");
//   const phone = watch("phone");

//   // Check if editing (ID in URL)
//   useEffect(() => {

//     if (id) {
//       setDoctorId(id);
//       setIsEditMode(true);
//       loadDoctorData(id);
//     }
//   }, []);

//   const loadDoctorData = async (id) => {
//     try {
//       const data = await getPhysicianById(id);
//       if (data) {
//         reset({
//           full_name: data.full_name || "",
//           specialty: data.specialty || "",
//           qualification: data.qualification || "",
//           registration_number: data.registration_number || "",
//           facility_name: data.facility_name || "",
//           facility_address: data.facility_address || "",
//           phone: data.phone || "",
//           email: data.email || "",
//           fax: data.fax || "",
//           preferred_delivery: data.preferred_delivery || "EMAIL",
//           npi_number: data.npi_number || "",
//         });
//       }
//     } catch (error) {
//       console.error("Error loading doctor:", error);
//       toast.error("Failed to load doctor details");
//       // router.push("/dashboard/doctors");
//     }
//   };

//   const validateForm = (data) => {
//     if (!data.full_name?.trim()) {
//       toast.error("Doctor name is required");
//       return false;
//     }
//     if (!data.phone?.trim()) {
//       toast.error("Phone number is required");
//       return false;
//     }
//     if (!/^[0-9+\-\s()]{10,15}$/.test(data.phone)) {
//       toast.error("Enter a valid phone number (10-15 digits)");
//       return false;
//     }
//     if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
//       toast.error("Enter a valid email address");
//       return false;
//     }
//     return true;
//   };

//   const onSubmit = async (data) => {
//     // if (!validateForm(data)) {
//     //   return;
//     // }

//     try {
//       if (isEditMode && doctorId) {
//         await updatePhysician(doctorId, data);
//         toast.success("Doctor updated successfully");
//       } else {
//         await createPhysician(data);
//         toast.success("Doctor added successfully");
//       }
//       router.push("/dashboard/physician");
//     } catch (err) {
//       console.error("Submit error:", err);
//       toast.error(err?.response?.data?.message || (isEditMode ? "Failed to update doctor" : "Failed to add doctor"));
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto py-6">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-8">
//         <Link href="/dashboard/physician" className="p-2 rounded-xl hover:bg-gray-100 transition">
//           <ArrowLeft className="w-5 h-5 text-gray-500" />
//         </Link>
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             {isEditMode ? "Edit Physician" : "Add New Physician"}
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             {isEditMode
//               ? "Update referring physician details in the system"
//               : "Register a referring physician who sends patients to your lab"}
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Personal Information Card */}
//         <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
//           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <User className="w-5 h-5 text-indigo-600" />
//               Personal Information
//             </h2>
//             <p className="text-sm text-gray-500 mt-0.5">Basic details about the doctor</p>
//           </div>

//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     {...register("full_name", { required: "Full name is required" })}
//                     placeholder="e.g., Dr. Rajesh Kumar Sharma"
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
//                 {errors.full_name && (
//                   <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                     <AlertCircle className="w-3 h-3" /> {errors.full_name.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Specialty
//                 </label>
//                 <div className="relative">
//                   <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     {...register("specialty")}
//                     placeholder="e.g., Cardiologist, Pediatrician, Physician"
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">Medical specialization of the doctor</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Qualification
//                 </label>
//                 <div className="relative">
//                   <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     {...register("qualification")}
//                     placeholder="e.g., MBBS, MD, DM Cardiology"
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Registration Number
//                 </label>
//                 <div className="relative">
//                   <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     {...register("registration_number")}
//                     placeholder="Medical Council Registration Number"
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">State Medical Council registration number</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   NPI Number
//                 </label>
//                 <div className="relative">
//                   <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     {...register("npi_number")}
//                     placeholder="National Provider Identifier"
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">Optional - For US healthcare providers</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Contact Information Card */}
//         <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
//           <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Phone className="w-5 h-5 text-emerald-600" />
//               Contact Information
//             </h2>
//             <p className="text-sm text-gray-500 mt-0.5">How to reach the doctor</p>
//           </div>

//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     {...register("phone", { required: "Phone number is required" })}
//                     placeholder="e.g., +91-9876543210"
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                   />
//                 </div>
//                 {errors.phone && (
//                   <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                     <AlertCircle className="w-3 h-3" /> {errors.phone.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     {...register("email", {
//                       pattern: {
//                         value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                         message: "Enter a valid email address",
//                       },
//                     })}
//                     placeholder="doctor@hospital.com"
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                   />
//                 </div>
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Fax Number
//                 </label>
//                 <div className="relative">
//                   <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     {...register("fax")}
//                     placeholder="Fax number (if available)"
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Preferred Delivery Method
//                 </label>
//                 <select
//                   {...register("preferred_delivery")}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
//                 >
//                   <option value="EMAIL">📧 Email</option>
//                   <option value="WHATSAPP">💬 WhatsApp</option>
//                   <option value="SMS">📱 SMS</option>
//                   <option value="FAX">📠 Fax</option>
//                   <option value="PICKUP">📦 Pickup</option>
//                 </select>
//                 <p className="text-xs text-gray-400 mt-1">How the doctor prefers to receive reports</p>
//               </div>
//             </div>

//             {/* Delivery Method Info Box */}
//             {preferredDelivery === "EMAIL" && (
//               <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
//                 <Info className="w-4 h-4 text-blue-500 mt-0.5" />
//                 <p className="text-sm text-blue-700">
//                   Reports will be sent to <strong>{watch("email") || "the email address provided above"}</strong>
//                 </p>
//               </div>
//             )}
//             {preferredDelivery === "WHATSAPP" && (
//               <div className="mt-4 p-3 bg-green-50 rounded-xl flex items-start gap-2">
//                 <Info className="w-4 h-4 text-green-500 mt-0.5" />
//                 <p className="text-sm text-green-700">
//                   Reports will be sent via WhatsApp to <strong>{watch("phone") || "the phone number provided above"}</strong>
//                 </p>
//               </div>
//             )}
//             {preferredDelivery === "SMS" && (
//               <div className="mt-4 p-3 bg-yellow-50 rounded-xl flex items-start gap-2">
//                 <Info className="w-4 h-4 text-yellow-500 mt-0.5" />
//                 <p className="text-sm text-yellow-700">
//                   SMS alerts will be sent to <strong>{watch("phone") || "the phone number provided above"}</strong>
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Facility Information Card */}
//         <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
//           <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Building className="w-5 h-5 text-blue-600" />
//               Facility Information
//             </h2>
//             <p className="text-sm text-gray-500 mt-0.5">Where the doctor practices</p>
//           </div>

//           <div className="p-6">
//             <div className="grid grid-cols-1 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Facility/Hospital Name
//                 </label>
//                 <div className="relative">
//                   <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     {...register("facility_name")}
//                     placeholder="e.g., City Hospital, Sharma Heart Institute"
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Facility Address
//                 </label>
//                 <div className="relative">
//                   <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
//                   <textarea
//                     {...register("facility_address")}
//                     rows={3}
//                     placeholder="Complete address of the hospital/clinic..."
//                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">Full address including city, state, pin code</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Summary Card - Shows when data is entered */}
//         {(fullName || phone) && (
//           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
//             <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
//               <CheckCircle className="w-4 h-4" />
//               Summary
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="text-gray-500 w-24">Doctor:</span>
//                 <span className="font-medium text-gray-800">{fullName || "—"}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-gray-500 w-24">Specialty:</span>
//                 <span className="text-gray-600">{watch("specialty") || "—"}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-gray-500 w-24">Phone:</span>
//                 <span className="text-gray-600">{phone || "—"}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-gray-500 w-24">Email:</span>
//                 <span className="text-gray-600">{watch("email") || "—"}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-gray-500 w-24">Delivery:</span>
//                 <span className="text-gray-600">{watch("preferred_delivery") || "—"}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-gray-500 w-24">Facility:</span>
//                 <span className="text-gray-600 truncate">{watch("facility_name") || "—"}</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Form Actions */}
//         <div className="flex justify-end gap-4 pt-4 pb-8">
//           <Link
//             href="/dashboard/doctors"
//             className="px-6 py-3 text-center border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
//           >
//             Cancel
//           </Link>

//           <button
//             type="submit"
//             disabled={isSubmitting || loading}
//             className="px-8 py-3 bg-[#1b4dff] hover:bg-[#1a40e0] text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//           >
//             {isSubmitting || loading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Updating...
//               </>
//             ) : (
//               <>
//                 <Save className="w-5 h-5" />
//                 Update Physician
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }








'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Info,
  User,
  Phone,
  Mail,
  Building,
  Stethoscope,
  GraduationCap,
  CreditCard,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Briefcase,
  FileText,
  Globe
} from "lucide-react";
import Link from "next/link";

import { useReferringPhysician } from "@/hooks/useReferringPhysician";
import { useAuthStore } from "@/lib/auth-store";
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

export default function EditDoctor() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Physicians
  if (!canRead('Physicians')) {
    return <PermissionDenied resource="Physicians" action="update" />;
  }
  
  const id = useSearchParams().get("id") || null;
  const { tenant } = useAuthStore();
  const router = useRouter();
  const { createPhysician, updatePhysician, getPhysicianById, loading } = useReferringPhysician();

  const [isEditMode, setIsEditMode] = useState(false);
  const [doctorId, setDoctorId] = useState(null);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      full_name: "",
      specialty: "",
      qualification: "",
      registration_number: "",
      facility_name: "",
      facility_address: "",
      phone: "",
      email: "",
      fax: "",
      preferred_delivery: "EMAIL",
      npi_number: "",
    },
  });

  const preferredDelivery = watch("preferred_delivery");
  const fullName = watch("full_name");
  const phone = watch("phone");

  // Check if editing (ID in URL)
  useEffect(() => {
    if (id) {
      setDoctorId(id);
      setIsEditMode(true);
      loadDoctorData(id);
    }
  }, []);

  const loadDoctorData = async (id) => {
    try {
      const data = await getPhysicianById(id);
      if (data) {
        reset({
          full_name: data.full_name || "",
          specialty: data.specialty || "",
          qualification: data.qualification || "",
          registration_number: data.registration_number || "",
          facility_name: data.facility_name || "",
          facility_address: data.facility_address || "",
          phone: data.phone || "",
          email: data.email || "",
          fax: data.fax || "",
          preferred_delivery: data.preferred_delivery || "EMAIL",
          npi_number: data.npi_number || "",
        });
      }
    } catch (error) {
      console.error("Error loading doctor:", error);
      toast.error("Failed to load doctor details");
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEditMode && doctorId) {
        await updatePhysician(doctorId, data);
        toast.success("Doctor updated successfully");
      } else {
        await createPhysician(data);
        toast.success("Doctor added successfully");
      }
      router.push("/dashboard/physician");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err?.response?.data?.message || (isEditMode ? "Failed to update doctor" : "Failed to add doctor"));
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200";
  const textareaClass = "w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none transition-colors duration-200";
  const selectClass = "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
  const cardClass = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-2xl overflow-hidden shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/physician" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Physician" : "Add New Physician"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditMode
                ? "Update referring physician details in the system"
                : "Register a referring physician who sends patients to your lab"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Card */}
          <div className={cardClass}>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Personal Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Basic details about the doctor</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register("full_name", { required: "Full name is required" })}
                      placeholder="e.g., Dr. Rajesh Kumar Sharma"
                      className={`${inputClass} border-gray-200 dark:border-gray-700 focus:ring-indigo-500`}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Specialty</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register("specialty")}
                      placeholder="e.g., Cardiologist, Pediatrician, Physician"
                      className={`${inputClass} border-gray-200 dark:border-gray-700 focus:ring-indigo-500`}
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Medical specialization of the doctor</p>
                </div>

                <div>
                  <label className={labelClass}>Qualification</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register("qualification")}
                      placeholder="e.g., MBBS, MD, DM Cardiology"
                      className={`${inputClass} border-gray-200 dark:border-gray-700 focus:ring-indigo-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Registration Number</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register("registration_number")}
                      placeholder="Medical Council Registration Number"
                      className={`${inputClass} border-gray-200 dark:border-gray-700 focus:ring-indigo-500`}
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">State Medical Council registration number</p>
                </div>

                <div>
                  <label className={labelClass}>NPI Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register("npi_number")}
                      placeholder="National Provider Identifier"
                      className={`${inputClass} border-gray-200 dark:border-gray-700 focus:ring-indigo-500`}
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Optional - For US healthcare providers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className={cardClass}>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Contact Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">How to reach the doctor</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register("phone", { required: "Phone number is required" })}
                      placeholder="e.g., +91-9876543210"
                      className={`${inputClass} border-gray-200 dark:border-gray-700 focus:ring-emerald-500`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register("email", {
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      })}
                      placeholder="doctor@hospital.com"
                      className={`${inputClass} border-gray-200 dark:border-gray-700 focus:ring-emerald-500`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Fax Number</label>
                  <div className="relative">
                    <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register("fax")}
                      placeholder="Fax number (if available)"
                      className={`${inputClass} border-gray-200 dark:border-gray-700 focus:ring-emerald-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Preferred Delivery Method</label>
                  <select
                    {...register("preferred_delivery")}
                    className={`${selectClass} border-gray-200 dark:border-gray-700 focus:ring-emerald-500`}
                  >
                    <option value="EMAIL">📧 Email</option>
                    <option value="WHATSAPP">💬 WhatsApp</option>
                    <option value="SMS">📱 SMS</option>
                    <option value="FAX">📠 Fax</option>
                    <option value="PICKUP">📦 Pickup</option>
                  </select>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">How the doctor prefers to receive reports</p>
                </div>
              </div>

              {/* Delivery Method Info Box */}
              {preferredDelivery === "EMAIL" && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Reports will be sent to <strong>{watch("email") || "the email address provided above"}</strong>
                  </p>
                </div>
              )}
              {preferredDelivery === "WHATSAPP" && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-start gap-2">
                  <Info className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Reports will be sent via WhatsApp to <strong>{watch("phone") || "the phone number provided above"}</strong>
                  </p>
                </div>
              )}
              {preferredDelivery === "SMS" && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    SMS alerts will be sent to <strong>{watch("phone") || "the phone number provided above"}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Facility Information Card */}
          <div className={cardClass}>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Facility Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Where the doctor practices</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={labelClass}>Facility/Hospital Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register("facility_name")}
                      placeholder="e.g., City Hospital, Sharma Heart Institute"
                      className={`${inputClass} border-gray-200 dark:border-gray-700 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Facility Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <textarea
                      {...register("facility_address")}
                      rows={3}
                      placeholder="Complete address of the hospital/clinic..."
                      className={`${textareaClass} border-gray-200 dark:border-gray-700 focus:ring-blue-500`}
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Full address including city, state, pin code</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card - Shows when data is entered */}
          {(fullName || phone) && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800">
              <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-24">Doctor:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{fullName || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-24">Specialty:</span>
                  <span className="text-gray-600 dark:text-gray-400">{watch("specialty") || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-24">Phone:</span>
                  <span className="text-gray-600 dark:text-gray-400">{phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-24">Email:</span>
                  <span className="text-gray-600 dark:text-gray-400">{watch("email") || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-24">Delivery:</span>
                  <span className="text-gray-600 dark:text-gray-400">{watch("preferred_delivery") || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-24">Facility:</span>
                  <span className="text-gray-600 dark:text-gray-400 truncate">{watch("facility_name") || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 pb-8">
            <Link
              href="/dashboard/physician"
              className="px-6 py-3 text-center border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-8 py-3 bg-[#1b4dff] hover:bg-[#1a40e0] dark:bg-[#1b4dff] dark:hover:bg-[#1a40e0] text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Physician
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}