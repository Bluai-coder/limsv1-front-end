"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, TrendingUp, TrendingDown, Minus, ChevronRight, Activity, Loader2, Calendar } from "lucide-react";
import { usePatientResultHistory } from "@/hooks/use-result-history";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function ResultHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: resultData, isLoading: isLoadingHistory } = usePatientResultHistory(selectedPatient?.id);
  
  // Handle extraction of data accounting for wrapper formats
  const history = resultData?.data?.history || resultData?.history || [];
  const trend = resultData?.data?.trend || resultData?.trend || {};

  const searchPatients = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.get(`/patients?q=${encodeURIComponent(searchQuery)}`);
      const patientList = res.data?.data || res.data || [];
      setPatients(patientList);
      if (patientList.length === 0) {
        toast.info("No patients found.");
      }
    } catch (error) {
      toast.error("Failed to search patients");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatients([]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Result History & Trends</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View longitudinal patient result history and analytical trends</p>
        </div>

        {/* Search Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={searchPatients} className="relative max-w-xl mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient by Name, MRN..." 
              className="w-full pl-10 pr-24 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-inner text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex items-center"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Search
            </button>
          </form>

          {/* Search Results */}
          {patients.length > 0 && !selectedPatient && (
            <div className="max-w-xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 shadow-sm bg-white dark:bg-gray-800">
              {patients.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => selectPatient(p)} 
                  className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer flex justify-between items-center transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {p.first_name} {p.last_name} {p.name && !p.first_name ? p.name : ''}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      MRN: <span className="font-medium text-gray-700 dark:text-gray-300">{p.mrn}</span> | 
                      {p.gender && ` ${p.gender}`} {p.dob && ` | DOB: ${new Date(p.dob).toLocaleDateString()}`}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Patient Overview */}
        {selectedPatient && (
          <div className="bg-blue-500/10 dark:bg-blue-500/5 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/50 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedPatient.first_name} {selectedPatient.last_name} {selectedPatient.name && !selectedPatient.first_name ? selectedPatient.name : ''}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  MRN: <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedPatient.mrn}</span>
                  {selectedPatient.gender && ` • ${selectedPatient.gender}`}
                  {selectedPatient.dob && ` • DOB: ${new Date(selectedPatient.dob).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedPatient(null)} 
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 rounded-xl transition-colors"
            >
              Change Patient
            </button>
          </div>
        )}

        {/* Data Loading State */}
        {selectedPatient && isLoadingHistory && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading history and trends...</p>
          </div>
        )}

        {/* Trends Chart Section */}
        {selectedPatient && !isLoadingHistory && Object.keys(trend).length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Analyte Trends
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Object.entries(trend).map(([analyteCode, dataPoints]) => (
                <div key={analyteCode} className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">{analyteCode}</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          stroke="#9ca3af"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#9ca3af" 
                          fontSize={12} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          labelFormatter={(val) => new Date(val).toLocaleDateString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="numeric_value" 
                          name="Value"
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Table Section */}
        {selectedPatient && !isLoadingHistory && history.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Chronological History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test / Analyte</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Result</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Units</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {history.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {record.date ? new Date(record.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{record.test_name || record.analyte_name}</div>
                        {record.analyte_code && <div className="text-xs text-gray-500">{record.analyte_code}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={
                          record.flag && record.flag !== 'N' && record.flag !== 'Normal'
                            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md'
                            : 'text-gray-900 dark:text-gray-100'
                        }>
                          {record.result_value ?? record.numeric_value ?? '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.unit || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.flag && record.flag !== 'N' && record.flag !== 'Normal' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                            {record.flag}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No historical test results found for this patient.
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Data State */}
        {selectedPatient && !isLoadingHistory && history.length === 0 && Object.keys(trend).length === 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl p-12 text-center shadow-sm">
            <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Results Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">This patient doesn't have any recorded test history yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

