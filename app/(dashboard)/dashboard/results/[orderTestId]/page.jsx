

// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   Loader2, Save, CheckCircle, AlertTriangle, Flag,
//   ArrowLeft, ChevronLeft, ChevronRight, Zap, ShieldCheck,
//   Menu, X, AlertCircle,
//   TrendingDown, 
//   TrendingUp,
//   MessageCircle
// } from "lucide-react";
// import { toast } from "sonner";
// import { useOrderTestWithResults, useSaveResults, useVerifyResult } from "@/hooks/use-results";
// import { useAuthStore } from "@/lib/auth-store";

// type AnalyteEntry = {
//   id: string;
//   analyteCode: string;
//   analyteName: string;
//   value: string;
//   numericValue: number | null;
//   unit: string;
//   referenceRangeText: string | null;
//   isCritical: boolean;
//   isDeltaExceeded: boolean;
//   resultStatus: string;
//   isAutoVerified: boolean;
//   comment: string | null;
// };

// export default function ResultEntryPage() {
//   const { orderTestId } = useParams();
//   const router = useRouter();
//   const { user } = useAuthStore();
//   const orderTestIdParam = orderTestId as string;

//   const [selectedTestIdx, setSelectedTestIdx] = useState(0);
//   const [entries, setEntries] = useState<AnalyteEntry[]>([]);
//   const [saving, setSaving] = useState(false);
//   const [autoVerifying, setAutoVerifying] = useState(false);
//   const [verifyingId, setVerifyingId] = useState<string | null>(null);
//   const [showSignModal, setShowSignModal] = useState(false);
//   const [signPassword, setSignPassword] = useState("");
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [focusedInput, setFocusedInput] = useState<number | null>(null);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
//   const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

//   // Hooks
//   const {
//     data: orderTestData,
//     isLoading,
//     error,
//     refetch
//   } = useOrderTestWithResults(orderTestIdParam);

//   const saveResults = useSaveResults();
//   const verifyResult = useVerifyResult();

//   const currentOrderTest = orderTestData?.data;
//   const allOrderTests = currentOrderTest?.allOrderTests || [];
//   const currentTestId = currentOrderTest?.id;
//   const currentIndex = allOrderTests.findIndex((t) => t.id === currentTestId);
//   const selectedTest = allOrderTests[selectedTestIdx] || allOrderTests[currentIndex] || null;

//   // Build entries from API data
//   useEffect(() => {
//     if (!currentOrderTest?.testResults) return;

//     const builtEntries: AnalyteEntry[] = currentOrderTest.testResults.map((r) => ({
//       id: r.id,
//       analyteCode: r.analyte_code,
//       analyteName: r.analyte_name,
//       value: r.value || "",
//       numericValue: r.numeric_value,
//       unit: r.unit || "",
//       referenceRangeText: r.reference_range_text,
//       isCritical: r.is_critical || false,
//       isDeltaExceeded: r.is_delta_exceeded || false,
//       resultStatus: r.result_status || "preliminary",
//       isAutoVerified: r.is_auto_verified || false,
//       comment: r.comment || "",
//     }));

//     setEntries(builtEntries);
//   }, [currentOrderTest?.testResults]);

//   useEffect(() => {
//     if (error) {
//       console.error("Error fetching order:", error);
//       toast.error("Failed to load order data");
//     }
//   }, [error]);

//   useEffect(() => {
//     setMobileMenuOpen(false);
//   }, [selectedTestIdx]);

//   // ✅ Auto-save function (debounced)
//   const autoSaveResult = useCallback(async (resultId: string, value: string, numericValue: number | null) => {
//     if (!value || value === "") return;
    
//     try {
//       await saveResults.mutateAsync({
//         orderTestId: currentOrderTest?.id,
//         results: [{
//           id: resultId,
//           analyte_code: entries.find(e => e.id === resultId)?.analyteCode,
//           value: value,
//           numeric_value: numericValue,
//         }],
//       });
//       console.log("Auto-saved:", resultId, value);
//     } catch (error) {
//       console.error("Auto-save failed:", error);
//     }
//   }, [currentOrderTest?.id, saveResults, entries]);

//   const handleValueChange = (index: number, value: string) => {
//     const numericValue = parseFloat(value);
    
//     // Update local state
//     setEntries((prev) =>
//       prev.map((e, i) =>
//         i === index
//           ? { ...e, value, numericValue: isNaN(numericValue) ? null : numericValue }
//           : e
//       )
//     );

//     // ✅ Auto-save on change with debounce
//     const resultId = entries[index]?.id;
//     if (resultId && value && value !== "") {
//       if (autoSaveTimeout.current) {
//         clearTimeout(autoSaveTimeout.current);
//       }
//       autoSaveTimeout.current = setTimeout(() => {
//         autoSaveResult(resultId, value, numericValue);
//       }, 1000);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       // Save immediately on Enter
//       const entry = entries[index];
//       if (entry.value && entry.value !== "") {
//         autoSaveResult(entry.id, entry.value, entry.numericValue);
//       }
//       if (index < entries.length - 1) {
//         inputRefs.current[index + 1]?.focus();
//       }
//     }
//   };

//   // ✅ Save all results manually
//   const handleSaveResults = async () => {
//     const filled = entries.filter((e) => e.value !== "" && e.value !== null);

//     if (!filled.length) {
//       toast.error("Enter at least one value");
//       return;
//     }

//     setSaving(true);
//     try {
//       await saveResults.mutateAsync({
//         orderTestId: currentOrderTest?.id,
//         results: filled.map((e) => ({
//           id: e.id,
//           analyte_code: e.analyteCode,
//           value: e.value,
//           numeric_value: e.numericValue,
//         })),
//       });
//       await refetch();
//       toast.success("Results saved successfully");
//     } catch (err) {
//       console.error("Save error:", err);
//       toast.error(err?.message || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ✅ Verify single result - with value check
//   const handleVerifyResult = async (resultId: string) => {
//     const entry = entries.find(e => e.id === resultId);
    
//     // ✅ Check if value exists
//     if (!entry?.value || entry.value === "") {
//       toast.error("Please enter a value before verifying");
//       return;
//     }

//     // ✅ Check if already final
//     if (entry.resultStatus === "final") {
//       toast.info("Result already verified");
//       return;
//     }

//     setVerifyingId(resultId);
//     try {
//       await verifyResult.mutateAsync(resultId);
//       await refetch();
//       toast.success("Result verified successfully");
//     } catch (err) {
//       console.error("Verify error:", err);
//       toast.error(err?.message || "Verification failed");
//     } finally {
//       setVerifyingId(null);
//     }
//   };


// const getFlagDisplay = (flag: string) => {
//   switch(flag) {
//     case 'LL':
//       return { text: 'CRITICAL LOW', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> };
//     case 'HH':
//       return { text: 'CRITICAL HIGH', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> };
//     case 'L':
//       return { text: 'LOW', color: 'bg-orange-100 text-orange-800', icon: <TrendingDown className="w-3 h-3" /> };
//     case 'H':
//       return { text: 'HIGH', color: 'bg-orange-100 text-orange-800', icon: <TrendingUp className="w-3 h-3" /> };
//     case 'A':
//       return { text: 'ABNORMAL', color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-3 h-3" /> };
//     case 'C':
//       return { text: 'COMMENT', color: 'bg-blue-100 text-blue-800', icon: <MessageCircle className="w-3 h-3" /> };
//     default:
//       return { text: 'NORMAL', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> };
//   }
// };





//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-96">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   if (!currentOrderTest) {
//     return (
//       <div className="text-center py-12 px-4">
//         <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//         <p className="text-gray-500">No order found</p>
//         <Link href="/dashboard/worklist" className="text-blue-600 hover:underline mt-4 inline-block">
//           Return to Worklist
//         </Link>
//       </div>
//     );
//   }

//   const hasCritical = entries.some((e) => e.isCritical);
//   const hasDelta = entries.some((e) => e.isDeltaExceeded);
//   const allValuesEntered = entries.length > 0 && entries.every((e) => e.value !== "" && e.value !== null);
//   const allFinal = entries.every((e) => e.resultStatus === "final");
//   const canAutoVerify = allValuesEntered && !hasCritical && !hasDelta && !allFinal;

//   return (
//     <div className="min-h-screen  bg-gray-50">
//       {/* Mobile Header - Same as before */}
//       <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Link href="/dashboard/worklist" className="p-2 -ml-2">
//               <ArrowLeft className="w-5 h-5 text-gray-500" />
//             </Link>
//             <div>
//               <h1 className="text-base font-semibold text-gray-900">Result Entry</h1>
//               <p className="text-xs text-gray-500 truncate max-w-[180px]">
//                 {currentOrderTest?.order?.order_number}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleSaveResults}
//               disabled={saving}
//               className="p-2 text-blue-600 disabled:opacity-50"
//             >
//               {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
//             </button>
//             {canAutoVerify && (
//               <button
//                 onClick={() => {}}
//                 disabled={autoVerifying}
//                 className="p-2 text-green-600"
//               >
//                 {autoVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
//               </button>
//             )}
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="p-2 -mr-2"
//             >
//               {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
//         {/* Desktop Header */}
//         <div className="hidden lg:flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <Link href="/dashboard/worklist" className="p-2 rounded-xl hover:bg-gray-100 transition">
//               <ArrowLeft className="w-5 h-5 text-gray-500" />
//             </Link>
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">Result Entry</h1>
//               <p className="text-sm text-gray-500">
//                 Order #{currentOrderTest?.order?.order_number} | Patient: {currentOrderTest?.order?.patient?.firstName} {currentOrderTest?.order?.patient?.lastName} | {currentOrderTest?.order?.patient?.mrn}
//               </p>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleSaveResults}
//               disabled={saving}
//               className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
//             >
//               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//               Save Draft
//             </button>
//             {canAutoVerify && (
//               <button
//                 onClick={() => {}}
//                 disabled={autoVerifying}
//                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50"
//               >
//                 {autoVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
//                 Auto-Verify
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Alert Banners */}
//         {(hasCritical || hasDelta) && (
//           <div className="mb-4">
//             {hasCritical && (
//               <div className="bg-red-50 border border-red-200 rounded-xl p-3 lg:p-4 mb-2">
//                 <div className="flex items-center gap-2 lg:gap-3">
//                   <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
//                   <p className="text-sm lg:text-base text-red-800 font-medium">
//                     Critical value detected! Pathologist review required.
//                   </p>
//                 </div>
//               </div>
//             )}
//             {hasDelta && !hasCritical && (
//               <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 lg:p-4">
//                 <div className="flex items-center gap-2 lg:gap-3">
//                   <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
//                   <p className="text-sm lg:text-base text-purple-800 font-medium">
//                     Delta check failed! Review required.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Mobile Test Switcher */}
//         {allOrderTests.length > 1 && (
//           <div className="lg:hidden mb-4">
//             <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-2">
//               <button
//                 onClick={() => setSelectedTestIdx(Math.max(0, selectedTestIdx - 1))}
//                 disabled={selectedTestIdx === 0}
//                 className="p-2 rounded-lg disabled:opacity-40"
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
//               <div className="text-center">
//                 <p className="text-sm font-medium text-gray-900">
//                   {selectedTest?.test?.name}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {selectedTestIdx + 1} of {allOrderTests.length}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setSelectedTestIdx(Math.min(allOrderTests.length - 1, selectedTestIdx + 1))}
//                 disabled={selectedTestIdx === allOrderTests.length - 1}
//                 className="p-2 rounded-lg disabled:opacity-40"
//               >
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Mobile Test Menu Drawer */}
//         {mobileMenuOpen && (
//           <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
//             <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
//               <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//                 <h3 className="font-semibold text-gray-900">Ordered Tests</h3>
//                 <button onClick={() => setMobileMenuOpen(false)} className="p-1">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-60px)]">
//                 {allOrderTests.map((test, idx: number) => (
//                   <button
//                     key={test.id}
//                     onClick={() => {
//                       setSelectedTestIdx(idx);
//                       setMobileMenuOpen(false);
//                       router.push(`/dashboard/results/${test.id}`);
//                     }}
//                     className={`w-full text-left p-3 rounded-xl transition ${test.id === currentTestId
//                         ? "bg-blue-50 border-l-4 border-blue-600"
//                         : "hover:bg-gray-50"
//                       }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium text-sm">{test.test?.name}</span>
//                     </div>
//                     <div className="text-xs text-gray-400 mt-0.5">{test.status}</div>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Main Content */}
//         <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
//           {/* Left Panel - Desktop Test List */}
//           <div className="hidden lg:block lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 h-fit">
//             <h2 className="font-semibold text-gray-900 mb-4">Ordered Tests ({allOrderTests.length})</h2>
//             <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
//               {allOrderTests.map((test, idx: number) => (
//                 <div
//                   key={test.id}
//                   onClick={() => {
//                     if (test.id !== currentTestId) {
//                       router.push(`/dashboard/results/${test.id}`);
//                     }
//                   }}
//                   className={`p-3 rounded-xl cursor-pointer transition-all ${test.id === currentTestId
//                       ? "bg-blue-50 border-l-4 border-blue-600"
//                       : "hover:bg-gray-50"
//                     }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <span className="font-medium text-gray-900 text-sm">{test.test?.name}</span>
//                   </div>
//                   <div className="text-xs text-gray-400 mt-1 capitalize">{test.status}</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right Panel - Result Entry */}
//           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 lg:px-6 lg:py-4">
//               <h2 className="text-base lg:text-lg font-semibold text-white truncate">
//                 {currentOrderTest?.test?.name}
//               </h2>
//               <p className="text-blue-100 text-xs lg:text-sm">
//                 Code: {currentOrderTest?.test?.code} | Status: {currentOrderTest?.status}
//               </p>
//             </div>

//             <div className="p-3 lg:p-6 overflow-x-auto">
//               <div className="overflow-x-auto -mx-3 lg:mx-0">
//                 <div className="min-w-[500px] lg:min-w-full">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="text-left border-b border-gray-200">
//                         <th className="pb-2 lg:pb-3 pr-2 font-medium text-gray-600">Analyte</th>
//                         <th className="pb-2 lg:pb-3 pr-2 font-medium text-gray-600">Result</th>
//                         <th className="pb-2 lg:pb-3 pr-2 font-medium text-gray-600">Unit</th>
//                         <th className="pb-2 lg:pb-3 font-medium text-gray-600 hidden sm:table-cell">Reference Range</th>
//                         <th className="pb-2 lg:pb-3 font-medium text-gray-600">Flag</th>
//                         <th className="pb-2 lg:pb-3 font-medium text-gray-600">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {entries.map((entry, idx) => {
//                         const flagDisplay = getFlagDisplay(entry);
//                         const isFinal = entry.resultStatus === "final";
                        
//                         return (
//                           <tr key={entry.id} className={`border-b border-gray-100 ${entry.isCritical ? "bg-red-50" : entry.isDeltaExceeded ? "bg-purple-50" : ""}`}>
//                             <td className="py-2 lg:py-3 pr-2">
//                               <div className="font-medium text-gray-900 text-xs lg:text-sm">{entry.analyteName}</div>
//                               <div className="text-[10px] lg:text-xs text-gray-400">{entry.analyteCode}</div>
//                             </td>
//                             <td className="py-2 lg:py-3 pr-2">
//                               <input
//                                 ref={el => { inputRefs.current[idx] = el; }}
//                                 type="text"
//                                 value={entry.value}
//                                 onChange={(e) => handleValueChange(idx, e.target.value)}
//                                 onKeyDown={(e) => handleKeyDown(e, idx)}
//                                 onFocus={() => setFocusedInput(idx)}
//                                 onBlur={() => setFocusedInput(null)}
//                                 className={`w-24 lg:w-32 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm ${entry.isCritical ? "border-red-400 bg-red-50" : "border-gray-200"} ${focusedInput === idx ? "ring-2 ring-blue-500" : ""}`}
//                                 placeholder="Enter value"
//                                 disabled={isFinal}
//                               />
//                             </td>
//                             <td className="py-2 lg:py-3 text-gray-600 text-xs lg:text-sm pr-2">{entry.unit || "—"}</td>
//                             <td className="py-2 lg:py-3 text-gray-600 text-xs lg:text-sm hidden sm:table-cell">
//                               {entry.referenceRangeText || "—"}
//                              </td>
//                             <td className="py-2 lg:py-3">
//                               <span className={`inline-flex items-center gap-1 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-medium whitespace-nowrap ${flagDisplay.color}`}>
//                                 {flagDisplay.icon}
//                                 <span className="hidden xs:inline">{flagDisplay.text}</span>
//                               </span>
//                              </td>
//                             <td className="py-2 lg:py-3">
//                               {!isFinal && entry.value && entry.value !== "" ? (
//                                 <button
//                                   onClick={() => handleVerifyResult(entry.id)}
//                                   disabled={verifyingId === entry.id}
//                                   className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
//                                 >
//                                   {verifyingId === entry.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
//                                 </button>
//                               ) : isFinal ? (
//                                 <span className="text-green-600 text-xs flex items-center gap-1">
//                                   <CheckCircle className="w-3 h-3" /> Verified
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-400 text-xs">Enter value</span>
//                               )}
//                              </td>
//                            </tr>
//                         );
//                       })}
//                     </tbody>
//                    </table>
//                 </div>
//               </div>

//               {/* Desktop Navigation */}
//               {allOrderTests.length > 1 && (
//                 <div className="hidden lg:flex justify-between mt-6 pt-4 border-t border-gray-200">
//                   <button
//                     onClick={() => {
//                       const prevTest = allOrderTests[selectedTestIdx - 1];
//                       if (prevTest) router.push(`/dashboard/results/${prevTest.id}`);
//                     }}
//                     disabled={selectedTestIdx === 0}
//                     className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
//                   >
//                     <ChevronLeft className="w-4 h-4" /> Previous Test
//                   </button>
//                   <span className="text-sm text-gray-500">{selectedTestIdx + 1} of {allOrderTests.length}</span>
//                   <button
//                     onClick={() => {
//                       const nextTest = allOrderTests[selectedTestIdx + 1];
//                       if (nextTest) router.push(`/dashboard/results/${nextTest.id}`);
//                     }}
//                     disabled={selectedTestIdx === allOrderTests.length - 1}
//                     className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
//                   >
//                     Next Test <ChevronRight className="w-4 h-4" />
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Loading Overlay */}
//       {(saving || autoVerifying) && (
//         <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center">
//           <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-xl">
//             <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
//             <span className="text-sm font-medium text-gray-700">
//               {saving ? "Saving..." : "Processing..."}
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }






"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Save, CheckCircle, AlertTriangle, Flag,
  ArrowLeft, ChevronLeft, ChevronRight, Zap, ShieldCheck,
  Menu, X, AlertCircle,
  TrendingDown, 
  TrendingUp,
  MessageCircle,
  Database
} from "lucide-react";
import { toast } from "sonner";
import { useOrderTestWithResults, useSaveResults, useVerifyResult } from "@/hooks/use-results";
import { useAuthStore } from "@/lib/auth-store";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { PermissionDenied } from "@/components/PermissionGuard";



export default function ResultEntryPage() {
         // Use permission hook
      const {
        canCreate,
        canRead,
        canUpdate,
        canDelete,
        isAdmin
      } = usePermissions();
    
      // Check if user has read access to Physicians
      if (!canRead('Results Entry')) {
        return <PermissionDenied resource="Results Entry" action="read" />;
      }
  const { orderTestId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const orderTestIdParam = orderTestId;

  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signPassword, setSignPassword] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [fetchingFromMachine, setFetchingFromMachine] = useState(false);
  const inputRefs = useRef([]);
  const autoSaveTimeout = useRef(null);

  // Hooks
  const {
    data: orderTestData,
    isLoading,
    error,
    refetch
  } = useOrderTestWithResults(orderTestIdParam);

  const saveResults = useSaveResults();
  const verifyResult = useVerifyResult();

  const currentOrderTest = orderTestData?.data;
  const allOrderTests = currentOrderTest?.allOrderTests || [];
  const currentTestId = currentOrderTest?.id;
  const currentIndex = allOrderTests.findIndex((t) => t.id === currentTestId);
  const selectedTest = allOrderTests[selectedTestIdx] || allOrderTests[currentIndex] || null;

  // Build entries from API data
  useEffect(() => {
    if (!currentOrderTest?.testResults) return;

    const builtEntries = currentOrderTest.testResults.map((r) => ({
      id: r.id,
      analyteCode: r.analyte_code,
      analyteName: r.analyte_name,
      value: r.value || "",
      numericValue: r.numeric_value,
      unit: r.unit || "",
      referenceRangeText: r.reference_range_text,
      isCritical: r.is_critical || false,
      isDeltaExceeded: r.is_delta_exceeded || false,
      resultStatus: r.result_status || "preliminary",
      isAutoVerified: r.is_auto_verified || false,
      comment: r.comment || "",
    }));

    setEntries(builtEntries);
  }, [currentOrderTest?.testResults]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order data");
    }
  }, [error]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [selectedTestIdx]);

  // ✅ Auto-save function (debounced)
  const autoSaveResult = useCallback(async (resultId, value, numericValue) => {
    if (!value || value === "") return;
    
    try {
      await saveResults.mutateAsync({
        orderTestId: currentOrderTest?.id,
        results: [{
          id: resultId,
          analyte_code: entries.find(e => e.id === resultId)?.analyteCode,
          value: value,
          numeric_value: numericValue,
        }],
      });
      console.log("Auto-saved:", resultId, value);
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [currentOrderTest?.id, saveResults, entries]);

  const handleValueChange = (index, value) => {
    const numericValue = parseFloat(value);
    
    // Update local state
    setEntries((prev) =>
      prev.map((e, i) =>
        i === index
          ? { ...e, value, numericValue: isNaN(numericValue) ? null : numericValue }
          : e
      )
    );

    // ✅ Auto-save on change with debounce
    const resultId = entries[index]?.id;
    if (resultId && value && value !== "") {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      autoSaveTimeout.current = setTimeout(() => {
        autoSaveResult(resultId, value, numericValue);
      }, 1000);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Save immediately on Enter
      const entry = entries[index];
      if (entry.value && entry.value !== "") {
        autoSaveResult(entry.id, entry.value, entry.numericValue);
      }
      if (index < entries.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // ✅ Save all results manually
  const handleSaveResults = async () => {
    const filled = entries.filter((e) => e.value !== "" && e.value !== null);

    if (!filled.length) {
      toast.error("Enter at least one value");
      return;
    }

    setSaving(true);
    try {
      await saveResults.mutateAsync({
        orderTestId: currentOrderTest?.id,
        results: filled.map((e) => ({
          id: e.id,
          analyte_code: e.analyteCode,
          value: e.value,
          numeric_value: e.numericValue,
        })),
      });
      await refetch();
      toast.success("Results saved successfully");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Verify single result - with value check
  const handleVerifyResult = async (resultId) => {
    const entry = entries.find(e => e.id === resultId);
    
    // ✅ Check if value exists
    if (!entry?.value || entry.value === "") {
      toast.error("Please enter a value before verifying");
      return;
    }

    // ✅ Check if already final
    if (entry.resultStatus === "final") {
      toast.info("Result already verified");
      return;
    }

    setVerifyingId(resultId);
    try {
      await verifyResult.mutateAsync(resultId);
      await refetch();
      toast.success("Result verified successfully");
    } catch (err) {
      console.error("Verify error:", err);
      toast.error(err?.message || "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  // ✅ NEW: Fetch result directly from machine
  const handleFetchFromMachine = async () => {
    setFetchingFromMachine(true);
    
    try {
      // Show loading toast
      toast.loading("Connecting to instrument...", { id: "machine-fetch" });
      
      // API call to fetch results from connected instrument
      // This would typically:
      // 1. Connect to the instrument via HL7/ASTM/Serial/Network
      // 2. Send the order/test information to the instrument
      // 3. Receive parsed results back
      // const response = await fetch("/api/instrument/fetch-results", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     orderTestId: currentOrderTest?.id,
      //     testCode: currentOrderTest?.test?.code,
      //     instrumentId: currentOrderTest?.test?.instrumentId, // If instrument is assigned to test
      //     analytes: entries.map(e => ({
      //       id: e.id,
      //       code: e.analyteCode,
      //       name: e.analyteName
      //     }))
      //   }),
      // });


      //    if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || "Failed to fetch from machine");
      // }

      // const data = await response.json();
      
      // Update entries with machine results
      // if (data.results && Array.isArray(data.results)) {
      //   const updatedEntries = [...entries];
      //   let updatesCount = 0;
        
      //   data.results.forEach((machineResult) => {
      //     const entryIndex = updatedEntries.findIndex(
      //       e => e.analyteCode === machineResult.analyteCode || 
      //            e.id === machineResult.resultId
      //     );
          
      //     if (entryIndex !== -1 && machineResult.value) {
      //       const numericValue = parseFloat(machineResult.value);
      //       updatedEntries[entryIndex] = {
      //         ...updatedEntries[entryIndex],
      //         value: machineResult.value,
      //         numericValue: isNaN(numericValue) ? null : numericValue,
      //         // Optionally update other fields from instrument
      //         unit: machineResult.unit || updatedEntries[entryIndex].unit,
      //         isCritical: machineResult.isCritical || updatedEntries[entryIndex].isCritical,
      //       };
      //       updatesCount++;
            
      //       // Auto-save each fetched result
      //       autoSaveResult(updatedEntries[entryIndex].id, machineResult.value, numericValue);
      //     }
      //   });
        
      //   setEntries(updatedEntries);
        
      //   toast.success(`Fetched ${updatesCount} results from instrument`, { 
      //     id: "machine-fetch" 
      //   });
        
      //   // Trigger a refresh to get latest from backend
      //   await refetch();
      // } else {
      //   toast.warning("No results received from instrument", { id: "machine-fetch" });
      // }
      
    } catch (err) {
      
      console.error("Machine fetch error:", err);
      toast.error(err?.message || "Failed to fetch from machine. Please check instrument connection.", { 
        id: "machine-fetch" 
      });
    } finally {
       toast.warning("No results received from instrument", { id: "machine-fetch" });
      setFetchingFromMachine(false);
    }
  };

  const getFlagDisplay = (flag) => {
    switch(flag) {
      case 'LL':
        return { text: 'CRITICAL LOW', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> };
      case 'HH':
        return { text: 'CRITICAL HIGH', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> };
      case 'L':
        return { text: 'LOW', color: 'bg-orange-100 text-orange-800', icon: <TrendingDown className="w-3 h-3" /> };
      case 'H':
        return { text: 'HIGH', color: 'bg-orange-100 text-orange-800', icon: <TrendingUp className="w-3 h-3" /> };
      case 'A':
        return { text: 'ABNORMAL', color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-3 h-3" /> };
      case 'C':
        return { text: 'COMMENT', color: 'bg-blue-100 text-blue-800', icon: <MessageCircle className="w-3 h-3" /> };
      default:
        return { text: 'NORMAL', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentOrderTest) {
    return (
      <div className="text-center py-12 px-4">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No order found</p>
        <Link href="/dashboard/worklist" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to Worklist
        </Link>
      </div>
    );
  }

  const hasCritical = entries.some((e) => e.isCritical);
  const hasDelta = entries.some((e) => e.isDeltaExceeded);
  const allValuesEntered = entries.length > 0 && entries.every((e) => e.value !== "" && e.value !== null);
  const allFinal = entries.every((e) => e.resultStatus === "final");
  const canAutoVerify = allValuesEntered && !hasCritical && !hasDelta && !allFinal;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/worklist" className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Result Entry</h1>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                {currentOrderTest?.order?.order_number}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile Machine Fetch Button */}
            <button
              onClick={handleFetchFromMachine}
              disabled={fetchingFromMachine}
              className="p-2 text-purple-600 disabled:opacity-50"
              title="Get Result from Machine"
            >
              {fetchingFromMachine ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSaveResults}
              disabled={saving}
              className="p-2 text-blue-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
            {canAutoVerify && (
              <button
                onClick={() => {}}
                disabled={autoVerifying}
                className="p-2 text-green-600"
              >
                {autoVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -mr-2"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/worklist" className="p-2 rounded-xl hover:bg-gray-100 transition">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Result Entry</h1>
              <p className="text-sm text-gray-500">
                Order #{currentOrderTest?.order?.order_number} | Patient: {currentOrderTest?.order?.patient?.firstName} {currentOrderTest?.order?.patient?.lastName} | {currentOrderTest?.order?.patient?.mrn}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* ✅ NEW: Get Result from Machine Button - Desktop */}
            <button
              onClick={handleFetchFromMachine}
              disabled={fetchingFromMachine}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50"
            >
              {fetchingFromMachine ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              Get Result from Machine
            </button>
            <button
              onClick={handleSaveResults}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>
            {canAutoVerify && (
              <button
                onClick={() => {}}
                disabled={autoVerifying}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50"
              >
                {autoVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Auto-Verify
              </button>
            )}
          </div>
        </div>

        {/* Alert Banners */}
        {(hasCritical || hasDelta) && (
          <div className="mb-4">
            {hasCritical && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 lg:p-4 mb-2">
                <div className="flex items-center gap-2 lg:gap-3">
                  <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
                  <p className="text-sm lg:text-base text-red-800 font-medium">
                    Critical value detected! Pathologist review required.
                  </p>
                </div>
              </div>
            )}
            {hasDelta && !hasCritical && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 lg:p-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                  <p className="text-sm lg:text-base text-purple-800 font-medium">
                    Delta check failed! Review required.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Test Switcher */}
        {allOrderTests.length > 1 && (
          <div className="lg:hidden mb-4">
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-2">
              <button
                onClick={() => setSelectedTestIdx(Math.max(0, selectedTestIdx - 1))}
                disabled={selectedTestIdx === 0}
                className="p-2 rounded-lg disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  {selectedTest?.test?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedTestIdx + 1} of {allOrderTests.length}
                </p>
              </div>
              <button
                onClick={() => setSelectedTestIdx(Math.min(allOrderTests.length - 1, selectedTestIdx + 1))}
                disabled={selectedTestIdx === allOrderTests.length - 1}
                className="p-2 rounded-lg disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Test Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Ordered Tests</h3>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-60px)]">
                {allOrderTests.map((test, idx) => (
                  <button
                    key={test.id}
                    onClick={() => {
                      setSelectedTestIdx(idx);
                      setMobileMenuOpen(false);
                      router.push(`/dashboard/results/${test.id}`);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition ${test.id === currentTestId
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{test.test?.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{test.status}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Panel - Desktop Test List */}
          <div className="hidden lg:block lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 h-fit">
            <h2 className="font-semibold text-gray-900 mb-4">Ordered Tests ({allOrderTests.length})</h2>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {allOrderTests.map((test, idx) => (
                <div
                  key={test.id}
                  onClick={() => {
                    if (test.id !== currentTestId) {
                      router.push(`/dashboard/results/${test.id}`);
                    }
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${test.id === currentTestId
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 text-sm">{test.test?.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 capitalize">{test.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Result Entry */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 lg:px-6 lg:py-4">
              <h2 className="text-base lg:text-lg font-semibold text-white truncate">
                {currentOrderTest?.test?.name}
              </h2>
              <p className="text-blue-100 text-xs lg:text-sm">
                Code: {currentOrderTest?.test?.code} | Status: {currentOrderTest?.status}
              </p>
            </div>

            <div className="p-3 lg:p-6 overflow-x-auto">
              <div className="overflow-x-auto -mx-3 lg:mx-0">
                <div className="min-w-[500px] lg:min-w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-2 lg:pb-3 pr-2 font-medium text-gray-600">Analyte</th>
                        <th className="pb-2 lg:pb-3 pr-2 font-medium text-gray-600">Result</th>
                        <th className="pb-2 lg:pb-3 pr-2 font-medium text-gray-600">Unit</th>
                        <th className="pb-2 lg:pb-3 font-medium text-gray-600 hidden sm:table-cell">Reference Range</th>
                        <th className="pb-2 lg:pb-3 font-medium text-gray-600">Flag</th>
                        <th className="pb-2 lg:pb-3 font-medium text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => {
                        const flagDisplay = getFlagDisplay(entry);
                        const isFinal = entry.resultStatus === "final";
                        
                        return (
                          <tr key={entry.id} className={`border-b border-gray-100 ${entry.isCritical ? "bg-red-50" : entry.isDeltaExceeded ? "bg-purple-50" : ""}`}>
                            <td className="py-2 lg:py-3 pr-2">
                              <div className="font-medium text-gray-900 text-xs lg:text-sm">{entry.analyteName}</div>
                              <div className="text-[10px] lg:text-xs text-gray-400">{entry.analyteCode}</div>
                            </td>
                            <td className="py-2 lg:py-3 pr-2">
                              <input
                                ref={el => { inputRefs.current[idx] = el; }}
                                type="text"
                                value={entry.value}
                                onChange={(e) => handleValueChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                onFocus={() => setFocusedInput(idx)}
                                onBlur={() => setFocusedInput(null)}
                                className={`w-24 lg:w-32 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm ${entry.isCritical ? "border-red-400 bg-red-50" : "border-gray-200"} ${focusedInput === idx ? "ring-2 ring-blue-500" : ""}`}
                                placeholder="Enter value"
                                disabled={isFinal}
                              />
                            </td>
                            <td className="py-2 lg:py-3 text-gray-600 text-xs lg:text-sm pr-2">{entry.unit || "—"}</td>
                            <td className="py-2 lg:py-3 text-gray-600 text-xs lg:text-sm hidden sm:table-cell">
                              {entry.referenceRangeText || "—"}
                            </td>
                            <td className="py-2 lg:py-3">
                              <span className={`inline-flex items-center gap-1 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-medium whitespace-nowrap ${flagDisplay.color}`}>
                                {flagDisplay.icon}
                                <span className="hidden xs:inline">{flagDisplay.text}</span>
                              </span>
                            </td>
                            <td className="py-2 lg:py-3">
                              {!isFinal && entry.value && entry.value !== "" ? (
                                <button
                                  onClick={() => handleVerifyResult(entry.id)}
                                  disabled={verifyingId === entry.id}
                                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                                >
                                  {verifyingId === entry.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
                                </button>
                              ) : isFinal ? (
                                <span className="text-green-600 text-xs flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">Enter value</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Desktop Navigation */}
              {allOrderTests.length > 1 && (
                <div className="hidden lg:flex justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const prevTest = allOrderTests[selectedTestIdx - 1];
                      if (prevTest) router.push(`/dashboard/results/${prevTest.id}`);
                    }}
                    disabled={selectedTestIdx === 0}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous Test
                  </button>
                  <span className="text-sm text-gray-500">{selectedTestIdx + 1} of {allOrderTests.length}</span>
                  <button
                    onClick={() => {
                      const nextTest = allOrderTests[selectedTestIdx + 1];
                      if (nextTest) router.push(`/dashboard/results/${nextTest.id}`);
                    }}
                    disabled={selectedTestIdx === allOrderTests.length - 1}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    Next Test <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(saving || autoVerifying || fetchingFromMachine) && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-xl">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {saving ? "Saving..." : fetchingFromMachine ? "Fetching from machine..." : "Processing..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}















































