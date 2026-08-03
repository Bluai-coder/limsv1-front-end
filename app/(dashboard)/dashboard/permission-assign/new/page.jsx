'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRoles } from "@/hooks/use-roles";
import { useAuthStore } from '@/lib/auth-store';
import { useState } from 'react';
import { usePermission } from '@/hooks/use-permission';
import { useRolesPermissionToRole } from '@/hooks/use-role-permission';

export default function NewPermissionAssignPage() {
  const router = useRouter();
  const createPermissionAssigneToRole = useRolesPermissionToRole();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { isAuthenticated, user, tenant, } = useAuthStore();

const {
  data: rolesData,
  isLoading: rolesLoading,
  isFetching: rolesFetching,
} = useRoles({
  q: search || undefined,
  page,
  limit: 20,
  tenantId: tenant?.id, // Pass tenant ID for multi-tenancy
});

const {
  data: permissionsData,
  isLoading: permissionsLoading,
  isFetching: permissionsFetching,
} = usePermission({
  q: search || undefined,
  page,
  limit: 20,
  tenantId: tenant?.id, // Pass tenant ID for multi-tenancy
});
  
  const roleOptions = rolesData?.data?.data?.map((item)=> { return { id: item.id, label: item.displayName } })
  
  const permissionOptions = permissionsData?.data?.map((item)=> { return { id: item.id, label: item.action } })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {

      const payload = {
        tenantId: tenant?.id,
        roleId: data.roleId,
        permissionId: data.permissionId
      };

      const role = await createPermissionAssigneToRole.mutateAsync(payload);

      toast.success(`Permission Assigned: ${role.id}`);

      router.push('/dashboard/permission-assign');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign permission');
    }
  };

  const SelectField = ({ label, name, options, error, required }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        {...register(name)}
        className={error ? 'input-lab-error' : 'input-lab'}
      >
        <option value="">Select {label}</option>

        {options?.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}

      </select>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error.message}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/permission-assign"
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>

        <h1 className="text-xl font-bold text-gray-900">
          Register New Permission Assign
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="card p-6">

          <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
            Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <SelectField
              label="Role"
              name="roleId"
              options={roleOptions}
              error={errors.roleId}
              required
            />

            <SelectField
              label="Permission"
              name="permissionId"
              options={permissionOptions}
              error={errors.permissionId}
              required
            />

          </div>

        </div>

        {/* Actions */}

        <div className="flex items-center justify-end gap-3 pb-8">

          <Link
            href="/dashboard/permission-assign"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-[#1b4dff] text-white rounded-lg text-sm font-medium hover:bg-brand-700 focus-ring disabled:opacity-60"
          >

            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            {isSubmitting ? "loading..." : "Permission Assign"}

          </button>

        </div>

      </form>

    </div>
  );
}
