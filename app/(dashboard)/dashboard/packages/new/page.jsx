
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Info, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

import MultiSelectField from "@/components/form-fields/MultiSelectField";
import { useTestCatalog } from "@/hooks/use-test-catalog";
import { useAuthStore } from "@/lib/auth-store";
import { useCreateTestPackage } from "@/hooks/use-test-packages-catalog";
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

export default function CreatePackage() {
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
  
  const { tenant } = useAuthStore();
  const router = useRouter();

  const [selectedTests, setSelectedTests] = useState([]);
  const [expandedTest, setExpandedTest] = useState(null);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      testsIds: [],
      total_price: 0,
      offer_price: 0,
    },
  });

  const selectedIds = watch("testsIds");
  const totalPrice = watch("total_price");
  const offerPrice = watch("offer_price");

  // Fetch Tests
  const { data: testCatalog } = useTestCatalog({
    q: "",
    page: 1,
    limit: 100,
    tenantId: tenant?.id,
  });

  const testList = testCatalog?.data?.data || [];

  // Test Options for MultiSelect
  const testOptions = testList.map((t) => ({
    id: t.id,
    label: `${t.display_name || t.name} (₹${t.price})`,
    price: Number(t.price || 0),
  }));

  // Sync selected tests
  useEffect(() => {
    if (!selectedIds?.length) {
      setSelectedTests([]);
      return;
    }

    const selected = testList.filter((t) => selectedIds.includes(t.id));
    setSelectedTests(selected);
  }, [selectedIds, testList]);

  // Auto calculate total price from selected tests
  useEffect(() => {
    const total = selectedTests.reduce((sum, t) => sum + Number(t.price || 0), 0);
    setValue("total_price", total);
    
    if (offerPrice > total) {
      setValue("offer_price", total);
    }
  }, [selectedTests, setValue]);

  const createMutation = useCreateTestPackage();

  const onSubmit = async (data) => {
    if (!selectedTests.length) {
      toast.error("Please select at least one test");
      return;
    }

    const total = Number(data.total_price);
    const offer = Number(data.offer_price);

    if (offer > total) {
      toast.error(`Offer price (₹${offer}) cannot be greater than total price (₹${total})`);
      return;
    }

    if (offer === total) {
      toast.warning("Offer price is same as total price. Consider adding a discount.");
    }

    try {
      const payload = {
        name: data.name,
        code: data.code,
        description: data.description || "",
        price: total,
        offer_price: offer,
        testIds: selectedTests.map((t) => t.id),
      };

      await createMutation.mutateAsync(payload);
      toast.success("Package created successfully");
      router.push("/dashboard/test-price");
    } catch (err) {
      console.error("Create package error:", err);
      toast.error(err?.response?.data?.message || "Failed to create package");
    }
  };

  const toggleExpand = (testId) => {
    if (expandedTest === testId) {
      setExpandedTest(null);
    } else {
      setExpandedTest(testId);
    }
  };

  const inputClass = "w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200";
  const cardClass = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const errorClass = "text-red-500 dark:text-red-400 text-xs mt-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/test-price" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Test Package</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bundle multiple tests with discounted price</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Package Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Package Name <span className="text-red-500">*</span></label>
                  <input
                    {...register("name", { required: "Package name is required" })}
                    placeholder="e.g. Basic Health Package"
                    className={inputClass}
                  />
                  {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Package Code <span className="text-red-500">*</span></label>
                  <input
                    {...register("code", { required: "Code is required" })}
                    placeholder="e.g. BASIC01"
                    className={inputClass}
                  />
                  {errors.code && <p className={errorClass}>{errors.code.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Package description..."
                    className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pricing</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Total Price (Auto Calculated)</label>
                  <input
                    {...register("total_price")}
                    type="number"
                    readOnly
                    className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-lg font-semibold text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sum of all selected test prices</p>
                </div>

                <div>
                  <label className={labelClass}>
                    Offer Price (Discounted) 
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">(Must be ≤ Total Price)</span>
                  </label>
                  <input
                    {...register("offer_price", {
                      required: "Offer price is required",
                      valueAsNumber: true,
                      validate: (value) => {
                        const total = watch("total_price");
                        if (value > total) {
                          return `Offer price (₹${value}) cannot be greater than total price (₹${total})`;
                        }
                        if (value < 0) {
                          return "Offer price cannot be negative";
                        }
                        return true;
                      }
                    })}
                    type="number"
                    placeholder="Enter discounted price"
                    className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors ${
                      offerPrice > totalPrice && totalPrice > 0 
                        ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20" 
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                  {errors.offer_price ? (
                    <p className={errorClass}>{errors.offer_price.message}</p>
                  ) : offerPrice > totalPrice && totalPrice > 0 ? (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      Offer price (₹{offerPrice}) is greater than total price (₹{totalPrice})
                    </p>
                  ) : offerPrice < totalPrice && offerPrice > 0 ? (
                    <p className="text-green-500 dark:text-green-400 text-xs mt-1">
                      Customer saves ₹{totalPrice - offerPrice} ({Math.round((1 - offerPrice / totalPrice) * 100)}% off)
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Discount Visual Indicator */}
              {totalPrice > 0 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTests.length} test(s) selected
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total: <span className="text-gray-900 dark:text-white">₹{totalPrice}</span>
                    </span>
                    {offerPrice < totalPrice && offerPrice > 0 && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Discount: ₹{totalPrice - offerPrice}
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(offerPrice / totalPrice) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹{Math.floor(totalPrice / 2)}</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>
              )}

              {/* Info Message when no tests selected */}
              {selectedTests.length === 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Select tests below to see total price and set offer price
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Select Tests */}
          <div className={cardClass}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Select Tests for Package</h2>
              
              <MultiSelectField
                label="Select Tests"
                name="testsIds"
                options={testOptions}
                register={register}
                setValue={setValue}
                watch={watch}
                error={errors.testsIds}
              />
              
              {/* Selected Tests Preview with Analytes */}
              {selectedTests.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Tests Details:</p>
                  {selectedTests.map((test) => (
                    <div key={test.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleExpand(test.id)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 dark:text-white">{test.display_name || test.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({test.code})</span>
                          <span className="text-sm text-blue-600 dark:text-blue-400">₹{test.price}</span>
                        </div>
                        {expandedTest === test.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      
                      {expandedTest === test.id && (
                        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Analytes:</p>
                          <div className="space-y-2">
                            {test.analytes?.length > 0 ? (
                              test.analytes.map((analyte, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm flex-wrap gap-2">
                                  <div>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{analyte.name}</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">({analyte.code})</span>
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Range: {analyte.ref_low || '?'} - {analyte.ref_high || '?'} {analyte.unit}
                                    {(analyte.critical_low || analyte.critical_high) && (
                                      <span className="ml-2 text-orange-600 dark:text-orange-400">
                                        ⚠️ Critical: {analyte.critical_low || '?'} - {analyte.critical_high || '?'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 dark:text-gray-500">No analytes configured for this test</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/dashboard/test-price"
              className="flex-1 sm:flex-none px-6 py-3 text-center border border-gray-300 dark:border-gray-600 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || selectedTests.length === 0 || offerPrice > totalPrice}
              className="flex-1 sm:flex-none px-8 py-3 bg-[#1b4dff] hover:bg-[#1a40e0] dark:bg-[#1b4dff] dark:hover:bg-[#1a40e0] text-white rounded-2xl font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || createMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSubmitting || createMutation.isPending ? "Creating Package..." : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
