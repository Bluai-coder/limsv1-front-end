
'use client';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useRoles } from '@/hooks/use-roles';
import { useAuthStore } from '@/lib/auth-store';
import { useCreateUser } from "@/hooks/use-users";
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { ArrowLeft, Save, Loader2, ShieldAlert } from 'lucide-react';
import MultiSelectField from '@/components/form-fields/MultiSelectField';

export default function NewUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();
  const { tenant } = useAuthStore();
  
  // Permission checks :::----
  const { canCreate, isAdmin, hasPermission } = usePermissions();

  // Check if user has permission to create users
  const hasCreatePermission = canCreate('Users');

  
  // Redirect or show permission denied if no access :--
  if (!hasCreatePermission) {
    return <PermissionDenied resource="Users" action="create" />;
  }

  const { register, setValue, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      roleId: []
    }
  });

  const onSubmit = async (data) => {
    // Double-check permission before submission
    if (!hasCreatePermission) {
      toast.error("You don't have permission to create users");
      return;
    }

    try {
      const payload = {
        tenantId: tenant?.id,
        fullName: data.fullName || "",
        email: data.email || "",
        password: data.password || "",
        phone: data.phone || "",
        designation: data.designation || "",
        department: data.department || "",
        employeeId: data.employeeId || "",
        roleId: data.roleId || [],
      };

      await createUser.mutateAsync(payload);
      toast.success(`User created successfully`);
      router.push('/dashboard/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Role Options
  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    tenantId: tenant?.id,
    limit: 50,
  });

  const roleOptions = rolesData?.data?.data?.map((item) => ({
    id: item.id,
    label: item.displayName || item.name
  })) || [];

  // Check if user can assign specific roles
  const canAssignAdminRoles = isAdmin() || hasPermission('Roles', 'assign');
  
  // Filter roles based on permission
  const filteredRoleOptions = canAssignAdminRoles 
    ? roleOptions 
    : roleOptions.filter(role => 
        !role.label.toLowerCase().includes('admin') && 
        !role.label.toLowerCase().includes('super')
      );

  // Show loading state while roles are being fetched
  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto py-6">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard/users" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New User</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add a new user to the system</p>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1b4dff] dark:text-[#1b4dff] mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading roles...</p>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200";
  const errorClass = "text-red-500 dark:text-red-400 text-xs mt-1";
  const cardClass = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/users" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New User</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add a new user to the system</p>
          </div>
        </div>

        {/* Permission Info Banner for Non-Admins */}
        {!isAdmin() && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Limited Access</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  You can create users but cannot assign administrator roles. 
                  Only administrators can assign admin-level permissions.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("fullName", { required: "Full name is required" })}
                    placeholder="Enter full name"
                    className={inputClass}
                    autoFocus
                  />
                  {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    placeholder="user@example.com"
                    className={inputClass}
                  />
                  {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    {...register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    placeholder="Enter secure password"
                    className={inputClass}
                  />
                  {errors.password && <p className={errorClass}>{errors.password.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register("phone", { 
                      required: "Phone number is required",
                      pattern: {
                        value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{3,4}[-\s.]?[0-9]{3,4}$/,
                        message: "Invalid phone number"
                      }
                    })}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                  {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Employment Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Designation</label>
                  <input
                    {...register("designation")}
                    placeholder="Lab Technician / Receptionist"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    {...register("department")}
                    placeholder="Pathology / Front Desk"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <MultiSelectField
                    label="Assign Roles"
                    name="roleId"
                    options={filteredRoleOptions}
                    register={register}
                    setValue={setValue}
                    error={errors.roleId}
                    watch={watch}
                    required={false}
                    helperText={!canAssignAdminRoles ? "You can only assign non-admin roles" : "Select one or more roles for this user"}
                  />
                  {!canAssignAdminRoles && filteredRoleOptions.length !== roleOptions.length && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ Admin roles are hidden - only administrators can assign admin-level permissions
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            <Link
              href="/dashboard/users"
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
                  Creating User...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}