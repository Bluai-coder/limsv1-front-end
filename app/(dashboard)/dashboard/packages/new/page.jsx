"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreatePackage } from "@/hooks/use-packages";
import { useTestCatalog } from "@/hooks/use-test-catalog";
import { toast } from "sonner";
import { ArrowLeft, Save, Search, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewPackagePage() {
  const router = useRouter();
  const createMutation = useCreatePackage();
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    price: "",
    offer_price: "",
  });

  const [selectedTests, setSelectedTests] = useState([]);

  // Auto calculate price
  useEffect(() => {
    if (selectedTests.length > 0) {
      const total = selectedTests.reduce((sum, test) => sum + (Number(test.price) || 0), 0);
      setFormData(prev => ({ ...prev, price: total.toFixed(2) }));
    }
  }, [selectedTests]);
  
  // Test Search
  const [testSearch, setTestSearch] = useState("");
  const [debouncedTestSearch, setDebouncedTestSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTestSearch(testSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [testSearch]);

  const { data: testData, isLoading: isLoadingTests } = useTestCatalog({
    search: debouncedTestSearch,
    limit: 10,
    page: 1
  });

  const availableTests = testData?.data?.data || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTest = (test) => {
    if (!selectedTests.find(t => t.id === test.id)) {
      setSelectedTests(prev => [...prev, test]);
    }
  };

  const handleRemoveTest = (testId) => {
    setSelectedTests(prev => prev.filter(t => t.id !== testId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        code: formData.code,
        description: formData.description,
        price: Number(formData.price) || 0,
        offer_price: formData.offer_price ? Number(formData.offer_price) : null,
        testIds: selectedTests.map(t => t.id)
      });
      
      toast.success("Package created successfully");
      router.push("/dashboard/packages");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create package");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/packages" className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Package</h1>
          <p className="text-gray-600 dark:text-gray-400">Add a new test panel or profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Package Details</h2>
            <form id="package-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    placeholder="e.g. Complete Blood Count"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    placeholder="e.g. CBC"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                  placeholder="Details about this package..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Offer Price</label>
                  <input
                    type="number"
                    name="offer_price"
                    min="0"
                    step="0.01"
                    value={formData.offer_price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    placeholder="0.00 (Optional)"
                  />
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl p-6 md:p-8 shadow-sm flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ensure all required fields are filled out correctly before saving.
            </p>
            <button
              type="submit"
              form="package-form"
              disabled={createMutation.isPending}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Package
            </button>
          </div>
        </div>

        {/* Test Selection Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col h-[500px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              Selected Tests
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs py-1 px-2 rounded-full">
                {selectedTests.length}
              </span>
            </h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                placeholder="Search tests to add..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
            </div>

            {testSearch && (
              <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                {isLoadingTests ? (
                  <div className="p-3 text-center text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
                ) : availableTests.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">No tests found</div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {availableTests.map(test => (
                      <div key={test.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between group">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">
                          {test.name}
                        </div>
                        <button 
                          onClick={() => handleAddTest(test)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/50 p-2">
              {selectedTests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm text-center">Search and add tests to this package</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTests.map((test, idx) => (
                    <div key={test.id || idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-md flex items-center justify-between shadow-sm">
                      <div className="truncate pr-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{test.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{test.code || 'No code'}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveTest(test.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
