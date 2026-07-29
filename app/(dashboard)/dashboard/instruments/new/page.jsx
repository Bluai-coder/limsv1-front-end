

'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCreateInstrument } from "@/hooks/use-instruments";
import { useAuthStore } from '@/lib/auth-store';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

export default function NewInstrumentPage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Instruments
  if (!canCreate('Instruments')) {
    return <PermissionDenied resource="Instruments" action="create" />;
  }
  
  const router = useRouter();
  const { tenant } = useAuthStore();
  const createInstrument = useCreateInstrument();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        model: data.model,
        manufacturer: data.manufacturer,
        serial_number: data.serial_number,
        instrument_type: data.instrument_type,
        department: data.department,
        location: data.location,
        status: data.status,
        installation_date: data.installation_date,

        maintenances: [
          {
            maintenance_type: "calibration",
            status: "completed",
            description: "Initial calibration",
            scheduled_date: data.installation_date,
            completed_date: data.installation_date,
          },
        ],

        interfaces: [
          {
            protocol: "HL7",
            direction: "inbound",
            connection_config: {
              ip: data.ip,
              port: Number(data.port),
            },
            auto_download: true,
          },
        ],
      };

      await createInstrument.mutateAsync(payload);

      toast.success("Instrument created successfully");
      router.push('/dashboard/instruments');

    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create instrument');
    }
  };

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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Register New Instrument</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add a new laboratory instrument</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Instrument Details */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Instrument Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Instrument Name <span className="text-red-500">*</span></label>
                  <input
                    {...register("name", { required: "Instrument name is required" })}
                    placeholder="e.g. Hematology Analyzer"
                    className={inputClass}
                    autoFocus
                  />
                  {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Model</label>
                  <input
                    {...register("model")}
                    placeholder="e.g. Sysmex XN-550"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Manufacturer</label>
                  <input
                    {...register("manufacturer")}
                    placeholder="e.g. Sysmex, Beckman Coulter"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Serial Number</label>
                  <input
                    {...register("serial_number")}
                    placeholder="SN-123456789"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Instrument Type</label>
                  <input
                    {...register("instrument_type")}
                    placeholder="e.g. Analyzer, Centrifuge"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    {...register("department")}
                    placeholder="Hematology, Biochemistry..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    {...register("location")}
                    placeholder="Lab Room A-12"
                    className={inputClass}
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

          {/* Submit Buttons */}
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
              {isSubmitting ? "Creating Instrument..." : "Create Instrument"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}