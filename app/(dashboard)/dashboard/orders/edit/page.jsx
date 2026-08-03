
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePatients } from '@/hooks/use-patients';
import { useUpdateOrder, useOrder } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Search, X, AlertTriangle, Check, Eye } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useTestCatalog, useTestCatalogPackages } from '@/hooks/use-test-catalog';
import TestDetailsModal from '@/components/detail-popup/TestDetailsModal';
import { useReferringPhysician } from '@/hooks/use-referring-physician';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

export default function UpdateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  if (!canUpdate('Orders')) {
    return <PermissionDenied resource="Orders" action="update" />;
  }

  const { tenant, user } = useAuthStore();
  const updateOrder = useUpdateOrder();

  const { data: orderData, isLoading: orderLoading } = useOrder(orderId);


  // Patient search
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState([]);

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = usePatients({
    tenantId: tenant?.id || "",
    q: patientSearch || undefined,
    page,
    limit: 100
  });

  // Physician states
  const [physicianSearch, setPhysicianSearch] = useState('');
  const [selectedPhysician, setSelectedPhysician] = useState(null);
  const [showPhysicianDropdown, setShowPhysicianDropdown] = useState(false);

  const {
    physicians,
    loading: physiciansLoading,
    getPhysicians
  } = useReferringPhysician();

  const patientResults = data?.data || [];

  const { data: testCatalog } = useTestCatalog({
    q: "" || undefined,
    page,
    limit: 100,
    tenantId: tenant?.id,
  });

  const { data: packagesData } = useTestCatalogPackages({
    q: "" || undefined,
    page,
    limit: 100,
    tenantId: tenant?.id,
  });

  // Form state
  const [selectedTests, setSelectedTests] = useState([]);
  const [priority, setPriority] = useState('routine');
  const [clinicalInfo, setClinicalInfo] = useState('');

  // Load physicians
  useEffect(() => {
    if (physicianSearch) {
      getPhysicians(1, 20, physicianSearch, "true");
    } else {
      getPhysicians(1, 20, "", "true");
    }
  }, [physicianSearch]);

  // Load existing order data
  useEffect(() => {
    if (orderData?.data?.data) {
      const order = orderData.data?.data;

      // Set patient
      if (order.patient) {
        setSelectedPatient(order.patient);
      }

      // Set physician
      if (order.referringPhysician) {
        setSelectedPhysician(order.referringPhysician);
      }

      // Set priority
      if (order.priority) {
        setPriority(order.priority);
      }

      // Set clinical info
      if (order.clinical_info) {
        setClinicalInfo(order.clinical_info);
      }

      // Set selected tests
      if (order.tests && order.tests.length > 0) {
        const tests = order.tests.map(t => t.test).filter(Boolean);
        setSelectedTests(tests);
      }

      // Set selected packages if any
      if (order.packages && order.packages.length > 0) {
        setSelectedPackages(order.packages);
      }
    }
  }, [orderData]);

  // For single test details view
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const toggleTest = (test) => {
    setSelectedTests(prev =>
      prev.find(t => t.id === test.id)
        ? prev.filter(t => t.id !== test.id)
        : [...prev, test]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPrice = (() => {
    let total = 0;
    selectedPackages.forEach((pkg) => {
      total += Number(pkg.offer_price || pkg.price || 0);
    });
    selectedTests.forEach((test) => {
      const isFromPackage = selectedPackages.some((pkg) =>
        pkg.tests?.some((t) => t.id === test.id)
      );
      if (!isFromPackage) {
        total += Number(test.price || 0);
      }
    });
    return total;
  })();

  // New code
  const [activeTab, setActiveTab] = useState('Tests');
  const [search, setSearch] = useState('');

  const filteredTests =
    testCatalog?.data?.data?.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const filteredPackages =
    packagesData?.data?.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const togglePackage = (pkg) => {
    const isSelected = selectedPackages.some(p => p.id === pkg.id);
    if (isSelected) {
      setSelectedPackages(prev => prev.filter(p => p.id !== pkg.id));
      setSelectedTests(prev =>
        prev.filter(t => !pkg.tests.some((pt) => pt.id === t.id))
      );
    } else {
      setSelectedPackages(prev => [...prev, pkg]);
      setSelectedTests(prev => [
        ...prev,
        ...pkg.tests.filter((t) => !prev.find(p => p.id === t.id))
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (selectedTests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    try {
      const updateData = {
        priority,
        clinical_info: clinicalInfo || undefined,
        referring_physician_id: selectedPhysician?.id || null,
      };

      await updateOrder.mutateAsync({ id: orderId, data: updateData });
      toast.success(`Order updated successfully`);
      router.push('/dashboard/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    }
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1b4dff] dark:text-[#1b4dff] mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No order ID provided</p>
          <Link href="/dashboard/orders" className="text-[#1b4dff] dark:text-[#1b4dff] mt-2 inline-block hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto animate-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/orders" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Update Order</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Order #{orderData?.data?.order_number} - Update patient and test details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Patient + Tests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient + Physician Row */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-visible">


              {/* Patient Selection - Readonly for update? Or can change */}
              <div className="relative z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-sm overflow-visible">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient</h2>

                  {selectedPatient ? (
                    <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#1b4dff] to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                          {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {selectedPatient.firstName} {selectedPatient.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            MRN: {selectedPatient.mrn}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {selectedPatient.phonePrimary}
                          </div>
                        </div>
                      </div>
                      {/* <span className="text-xs text-gray-400">Cannot change patient</span> */}
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setShowPatientDropdown(true);
                        }}
                        onFocus={() => setShowPatientDropdown(true)}
                        placeholder="Search patient by name or MRN..."
                        className="w-full pl-12 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                      />

                      {showPatientDropdown && patientSearch && (
                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-auto">
                          {isLoading ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">Searching patients...</div>
                          ) : patientResults.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">No patients found</div>
                          ) : (
                            patientResults.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setSelectedPatient(p);
                                  setShowPatientDropdown(false);
                                  setPatientSearch('');
                                }}
                                className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center border-b dark:border-gray-700 last:border-none transition-colors"
                              >
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{p.firstName} {p.lastName}</div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500">MRN: {p.mrn}</div>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{p.phonePrimary}</div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Physician Selection */}
              <div className="relative z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-sm overflow-visible">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Physician / Referring Doctor</h2>

                  {selectedPhysician ? (
                    <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                          {selectedPhysician.full_name?.[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {selectedPhysician.full_name}
                          </div>
                          {selectedPhysician.specialty && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {selectedPhysician.specialty}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {selectedPhysician.phone}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPhysician(null)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        value={physicianSearch}
                        onChange={(e) => {
                          setPhysicianSearch(e.target.value);
                          setShowPhysicianDropdown(true);
                        }}
                        onFocus={() => setShowPhysicianDropdown(true)}
                        placeholder="Search physician by name or phone..."
                        className="w-full pl-12 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                      />

                      {showPhysicianDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-auto">
                          {physiciansLoading ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                              Searching physicians...
                            </div>
                          ) : physicians?.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                              No physicians found
                            </div>
                          ) : (
                            physicians?.map((physician) => (
                              <button
                                key={physician.id}
                                onClick={() => {
                                  setSelectedPhysician(physician);
                                  setShowPhysicianDropdown(false);
                                  setPhysicianSearch('');
                                }}
                                className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center border-b dark:border-gray-700 last:border-none transition-colors"
                              >
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{physician.full_name}</div>
                                  {physician.specialty && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">{physician.specialty}</div>
                                  )}
                                  {physician.qualification && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">{physician.qualification}</div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{physician.phone}</div>
                                  {physician.facility_name && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px]">
                                      {physician.facility_name}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Test Selection - Readonly for existing tests? Or can add/remove */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Selected Tests/Packages ({selectedTests.length})
                </h2>
                <button
                  onClick={() => router.push(activeTab === "Tests" ? "/dashboard/test-price/new" : "/dashboard/packages/new")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b4dff] hover:bg-[#1b4dff] dark:bg-[#1b4dff] dark:hover:bg-[#1a40e0] text-white text-sm font-medium shadow-md transition"
                >
                  ＋ Add More
                </button>
              </div>

              {/* TABS */}
              <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
                {['Tests', 'Packages'].map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveTab(s)}
                    className={`flex-1 py-3 text-sm font-medium transition-all ${activeTab === s
                        ? 'bg-[#1b4dff] text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* SEARCH */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${activeTab.toLowerCase()}...`}
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                {/* TESTS LIST */}
                {activeTab === "Tests" && (
                  <div className="mt-2 max-h-[520px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {filteredTests?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredTests.map((test) => {
                          const isSelected = selectedTests.some(t => t.id === test.id);
                          return (
                            <button
                              key={test.id}
                              onClick={() => toggleTest(test)}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${isSelected
                                  ? "border-[#1b4dff] bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className={`w-6 h-6 rounded-xl flex items-center justify-center border-2 transition-all flex-shrink-0 ${isSelected
                                      ? "bg-[#1b4dff] border-[#1b4dff]"
                                      : "border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                  {isSelected && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white truncate">{test.name}</div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                                    <span>{test.code}</span>
                                    {test.department && <span className="text-[10px]">• {test.department}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white ml-4 whitespace-nowrap">
                                {formatCurrency(test.price)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                        No tests found
                      </div>
                    )}
                  </div>
                )}

                {/* PACKAGES LIST */}
                {activeTab === "Packages" && (
                  <div className="mt-2 max-h-[400px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {filteredPackages?.length > 0 ? (
                      filteredPackages.map((pkg) => {
                        const isSelected = selectedPackages.some(p => p.id === pkg.id);
                        return (
                          <button
                            key={pkg.id}
                            onClick={() => togglePackage(pkg)}
                            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${isSelected
                                ? "border-[#1b4dff] bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{pkg.name}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {pkg.tests?.length || 0} tests included
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 bg-[#1b4dff] rounded flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-2">
                              {formatCurrency(pkg.offer_price || pkg.price)}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                        No packages found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Info */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Clinical Information</h2>
              <textarea
                value={clinicalInfo}
                onChange={(e) => setClinicalInfo(e.target.value)}
                placeholder="Relevant clinical history, suspected diagnosis, medications..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[80px] resize-y transition-colors"
                rows={3}
              />
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-sm p-6 sticky top-20">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Order Summary</h2>

              {/* Priority */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'routine', label: 'Routine', color: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800' },
                    { value: 'urgent', label: 'Urgent', color: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700' },
                    { value: 'stat', label: 'STAT', color: 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700' },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${priority === p.value
                          ? p.color + ' ring-2 ring-offset-1 dark:ring-offset-gray-800 ring-brand-500/30'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected tests */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Tests/Packages ({selectedTests.length})</div>
                {selectedTests.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">No tests selected</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedTests.map(test => (
                      <div key={test.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300 truncate">{test.code} — {test.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleViewDetails(test)} className="text-blue-400 dark:text-blue-400 hover:text-green-500 dark:hover:text-green-400 transition">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleTest(test)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Physician */}
              {selectedPhysician && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Referring Physician</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedPhysician.full_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{selectedPhysician.phone}</div>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Warnings */}
              {priority === 'stat' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-300">STAT orders are processed immediately and may incur additional charges.</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={updateOrder.isPending || !selectedPatient || selectedTests.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1b4dff] hover:bg-[#1b4dff] dark:bg-[#1b4dff] dark:hover:bg-[#1a40e0] text-white rounded-lg font-medium focus-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updateOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {updateOrder.isPending ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>

        {/* Single test details modal */}
        <TestDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          test={selectedTest}
        />
      </div>
    </div>
  );
}
