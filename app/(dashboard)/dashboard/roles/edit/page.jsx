// ============================================================
// app/(dashboard)/dashboard/roles/edit/page.tsx
// ============================================================

// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useEffect } from "react";
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import { ArrowLeft, Save, Loader2 } from 'lucide-react';
// import Link from 'next/link';

// import { useCreateRole, useRoleById, useUpdateRole } from "@/hooks/use-roles";
// import { useAuthStore } from '@/lib/auth-store';
// import { usePermissions } from '@/hooks/permissions/usePermissions';
// import { PermissionDenied } from '@/components/PermissionGuard';

// export default function UpdateRolePage() {
//    // Use permission hook
//             const {
//               canCreate,
//               canRead,
//               canUpdate,
//               canDelete,
//               isAdmin
//             } = usePermissions();
          
//             // Check if user has read access to Physicians
//             if (!canUpdate('Roles')) {
//               return <PermissionDenied resource="Roles" action="update" />;
//             }

//   const id = useSearchParams().get("id") || null;
//   const router = useRouter();

//   const updateRole = useUpdateRole();
//   const { tenant } = useAuthStore();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting }
//   } = useForm({
//     defaultValues: {
//       name: "",
//       displayName: "",
//       description: ""
//     }
//   });

//   // ================================
//   // Fetch Role By ID
//   // ================================
//   const { data: roleById, isLoading } = useRoleById(id, tenant?.id);



//   console.log("roleByIdroleByIdroleById",roleById)
// useEffect(() => {
//   if (!roleById) return;

//   reset({
//     name: roleById.name || "",
//     displayName: roleById.displayName || "",
//     description: roleById.description || ""
//   });

// }, [roleById, reset]);



//   // ================================
//   // Submit
//   // ================================
//   const onSubmit = async (data) => {

//     try {

//       const payload = {
//         // tenantId: tenant?.id,
//         name: data.name,
//         displayName: data.displayName,
//         description: data.description
//       };

//       // const role = await createRole.mutateAsync(payload);
//       const role = await updateRole.mutateAsync({
//         id,
//         tenantId: tenant?.id,
//         data: payload,
//       });


//       toast.success(`Role updated: ${role.id}`);

//       router.push('/dashboard/roles');

//     } catch (err) {

//       toast.error(
//         err?.response?.data?.message || "Failed to update role"
//       );

//     }

//   };



//   // ================================
//   // Field Component
//   // ================================
//   const Field = ({ label, name, error, required, ...props }) => (

//     <div>

//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>

//       <input
//         {...register(name)}
//         {...props}
//         className={error ? "input-lab-error" : "input-lab"}
//       />

//       {error && (
//         <p className="text-xs text-red-500 mt-1">
//           {error.message}
//         </p>
//       )}

//     </div>

//   );



//   // ================================
//   // Loading State
//   // ================================
//   if (isLoading) {

//     return (
//       <div className="flex justify-center py-20">
//         <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
//       </div>
//     );

//   }



//   return (

//     <div className="max-w-4xl mx-auto animate-in">

//       {/* Header */}

//       <div className="flex items-center gap-3 mb-6">

//         <Link
//           href="/dashboard/roles"
//           className="p-1.5 rounded-lg hover:bg-gray-100"
//         >
//           <ArrowLeft className="w-5 h-5 text-gray-500" />
//         </Link>

//         <div>

//           <h1 className="text-xl font-bold text-gray-900">
//             Update Role
//           </h1>

//           <p className="text-sm text-gray-500">
//             Modify role details
//           </p>

//         </div>

//       </div>



//       {/* Form */}

//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="space-y-6"
//       >

//         {/* Role Information */}

//         <div className="card p-6">

//           <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
//             Role Information
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//             <Field
//               label="Role Name"
//               name="name"
//               error={errors.name}
//               required
//               placeholder="billing_staff"
//               autoFocus
//             />

//             <Field
//               label="Display Name"
//               name="displayName"
//               error={errors.displayName}
//               required
//               placeholder="Billing Staff"
//             />

//           </div>


//           <div className="mt-4">

//             <Field
//               label="Description"
//               name="description"
//               error={errors.description}
//               placeholder="Handles billing and invoices"
//             />

//           </div>

//         </div>



//         {/* Hidden Tenant Field */}

//         <input
//           type="hidden"
//           value={tenant?.id || ""}
//           {...register("tenantId")}
//         />



//         {/* Actions */}

//         <div className="flex items-center justify-end gap-3 pb-8">

//           <Link
//             href="/dashboard/roles"
//             className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
//           >
//             Cancel
//           </Link>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="flex items-center gap-2 px-6 py-2 bg-[#1b4dff] text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
//           >

//             {isSubmitting ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Save className="w-4 h-4" />
//             )}

//             {isSubmitting ? "Update..." : "Update Role"}

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

import { useCreateRole, useRoleById, useUpdateRole } from "@/hooks/use-roles";
import { useAuthStore } from '@/lib/auth-store';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

export default function UpdateRolePage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Roles
  if (!canUpdate('Roles')) {
    return <PermissionDenied resource="Roles" action="update" />;
  }

  const id = useSearchParams().get("id") || null;
  const router = useRouter();

  const updateRole = useUpdateRole();
  const { tenant } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      displayName: "",
      description: ""
    }
  });

  // ================================
  // Fetch Role By ID
  // ================================
  const { data: roleById, isLoading } = useRoleById(id, tenant?.id);

  console.log("roleByIdroleByIdroleById", roleById)
  
  useEffect(() => {
    if (!roleById) return;

    reset({
      name: roleById.name || "",
      displayName: roleById.displayName || "",
      description: roleById.description || ""
    });
  }, [roleById, reset]);

  // ================================
  // Submit
  // ================================
  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        displayName: data.displayName,
        description: data.description
      };

      const role = await updateRole.mutateAsync({
        id,
        tenantId: tenant?.id,
        data: payload,
      });

      toast.success(`Role updated: ${role.id}`);
      router.push('/dashboard/roles');
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    }
  };

  // ================================
  // Field Component
  // ================================
  const Field = ({ label, name, error, required, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      <input
        {...register(name)}
        {...props}
        className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200 ${
          error 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
      />
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );

  // ================================
  // Loading State
  // ================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#1b4dff] dark:text-[#1b4dff]" />
      </div>
    );
  }

  const cardClass = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto animate-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard/roles"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Update Role</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Modify role details</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Information */}
          <div className={cardClass}>
            <div className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Role Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Role Name"
                  name="name"
                  error={errors.name}
                  required
                  placeholder="billing_staff"
                  autoFocus
                />

                <Field
                  label="Display Name"
                  name="displayName"
                  error={errors.displayName}
                  required
                  placeholder="Billing Staff"
                />
              </div>

              <div className="mt-4">
                <Field
                  label="Description"
                  name="description"
                  error={errors.description}
                  placeholder="Handles billing and invoices"
                />
              </div>
            </div>
          </div>

          {/* Hidden Tenant Field */}
          <input
            type="hidden"
            value={tenant?.id || ""}
            {...register("tenantId")}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <Link
              href="/dashboard/roles"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#1b4dff] hover:bg-[#1a40e0] dark:bg-[#1b4dff] dark:hover:bg-[#1a40e0] text-white rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}