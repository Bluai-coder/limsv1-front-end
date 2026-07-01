// components/EditTenantModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Server,
  Calendar,
  CreditCard,
  Shield,
  Briefcase,
  Zap,
  Globe,
  User,
  Database,
  ArrowLeft
} from 'lucide-react';
import { useTenantById, useUpdateTenant } from '@/hooks/use-tenants';

const EditTenantModal = ({ isOpen, onClose, tenantId, onUpdate }) => {
  const { data, isLoading } = useTenantById(tenantId);
  const updateTenant = useUpdateTenant();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      plan: 'standard',
      status: 'active',
    },
  });

  const watchedName = watch('name');
  const watchedSubdomain = watch('subdomain');

  useEffect(() => {
    if (data?.data) {
      setValue('name', data.data.name || '');
      setValue('subdomain', data.data.subdomain || '');
      setValue('email', data.data.email || '');
      setValue('phone', data.data.phone || '');
      setValue('address', data.data.address || '');
      setValue('city', data.data.city || '');
      setValue('state', data.data.state || '');
      setValue('country', data.data.country || 'India');
      setValue('pincode', data.data.pincode || '');
      setValue('plan', data.data.plan || 'standard');
      setValue('status', data.data.status || 'active');
    }
  }, [data, setValue]);

  const plans = [
    { value: 'free', label: 'Free', price: '$0', features: ['1 User', '100 Tests/month', 'Basic Support'], icon: Zap },
    { value: 'starter', label: 'Starter', price: '$49', features: ['5 Users', '1000 Tests/month', 'Email Support'], icon: Briefcase },
    { value: 'standard', label: 'Standard', price: '$99', features: ['10 Users', '5000 Tests/month', 'Priority Support'], icon: Shield },
    { value: 'professional', label: 'Professional', price: '$199', features: ['25 Users', '20000 Tests/month', '24/7 Support'], icon: Server },
    { value: 'enterprise', label: 'Enterprise', price: 'Custom', features: ['Unlimited Users', 'Unlimited Tests', 'Dedicated Support'], icon: Building },
  ];

  const selectedPlan = plans.find(p => p.value === watch('plan'));

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      await updateTenant.mutateAsync({ id: tenantId, data: formData });
      toast.success('Tenant updated successfully', { icon: <CheckCircle className="w-4 h-4" /> });
      onUpdate?.();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Update failed', { icon: <AlertCircle className="w-4 h-4" /> });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Tenant</h2>
              <p className="text-blue-100 text-sm">Update tenant information</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Main Form - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tenant Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register('name', { required: 'Tenant name is required' })}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                              errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="e.g., Acme Diagnostics"
                          />
                        </div>
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subdomain <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register('subdomain', { required: 'Subdomain is required' })}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                              errors.subdomain ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="e.g., acme"
                          />
                        </div>
                        {watchedSubdomain && (
                          <p className="mt-1 text-xs text-gray-500">URL: https://{watchedSubdomain}.bluai.ai</p>
                        )}
                        {errors.subdomain && <p className="mt-1 text-xs text-red-500">{errors.subdomain.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Billing Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            {...register('email', { 
                              required: 'Billing email is required',
                              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }
                            })}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                              errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="billing@example.com"
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register('phone')}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {watch('status') === 'active' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <select
                            {...register('status')}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Schema Name
                        </label>
                        <div className="relative">
                          <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register('schemaName')}
                            disabled
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                            placeholder="tenant_schema"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Schema name cannot be changed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Address</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Street Address
                        </label>
                        <input
                          {...register('address')}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                          <input {...register('city')} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="New York" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                          <input {...register('state')} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="NY" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                          <select {...register('country')} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <option value="India">India</option>
                            <option value="USA">United States</option>
                            <option value="UK">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                          <input {...register('pincode')} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="10001" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Information (Read-only) */}
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Server className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Technical Information</h3>
                    <span className="text-xs text-gray-500">(Read-only)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Database Schema</label>
                      <p className="font-mono text-sm text-gray-900 dark:text-white mt-1">tenant_{data?.data?.subdomain || 'unknown'}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Created At</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{data?.data?.createdAt ? new Date(data.data.createdAt).toLocaleString() : '—'}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Last Updated</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{data?.data?.updatedAt ? new Date(data.data.updatedAt).toLocaleString() : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Sidebar - Plan Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Plan Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-6">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Select Plan</h3>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {plans.map((plan) => (
                  <label
                    key={plan.value}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      watch('plan') === plan.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        watch('plan') === plan.value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                      }`}>
                        <plan.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{plan.label}</p>
                        <p className="text-sm text-gray-500">{plan.price}</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      value={plan.value}
                      {...register('plan')}
                      className="w-4 h-4 text-blue-600"
                    />
                  </label>
                ))}
              </div>

              {/* Plan Features Preview */}
              {selectedPlan && (
                <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Features included:</p>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Preview Card */}
            {watchedName && watchedSubdomain && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-2">Preview</p>
                <h3 className="text-xl font-bold mb-1">{watchedName}</h3>
                <p className="text-sm opacity-80">{watchedSubdomain}.bluai.ai</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs opacity-75">Ready to save changes?</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTenantModal;