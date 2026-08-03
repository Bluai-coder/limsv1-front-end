"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Search, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight, Activity } from "lucide-react";

export default function ResultHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedTests, setExpandedTests] = useState({});

  const searchPatients = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      // const res = await api.get(`/patients?q=${searchQuery}`);
      // setPatients(res.data);
      setTimeout(() => {
        setPatients([
          { id: 'P001', name: 'John Doe', mrn: 'MRN12345', age: 45, gender: 'Male' }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      toast.error("Failed to search patients");
      setLoading(false);
    }
  };

  const loadHistory = async (patientId) => {
    setLoading(true);
    try {
      // const res = await api.get(`/worklist?patient_id=${patientId}`);
      // setHistory(res.data);
      setTimeout(() => {
        setHistory([
          {
            test_name: "Hemoglobin",
            results: [
              { date: "2026-08-01", value: 13.5, unit: "g/dL", range: "13.0-17.0", flag: "N" },
              { date: "2026-07-15", value: 12.8, unit: "g/dL", range: "13.0-17.0", flag: "L" },
              { date: "2026-06-01", value: 14.1, unit: "g/dL", range: "13.0-17.0", flag: "N" }
            ]
          },
          {
             test_name: "Fasting Blood Sugar",
             results: [
               { date: "2026-08-01", value: 110, unit: "mg/dL", range: "70-100", flag: "H" },
               { date: "2026-07-15", value: 105, unit: "mg/dL", range: "70-100", flag: "H" }
             ]
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      toast.error("Failed to load result history");
      setLoading(false);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatients([]);
    setSearchQuery("");
    loadHistory(patient.id);
  };

  const toggleTest = (testName) => {
    setExpandedTests(prev => ({ ...prev, [testName]: !prev[testName] }));
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-orange-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-blue-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Result History</h1>
        <p className="text-gray-600 dark:text-gray-400">View longitudinal patient result history and trends</p>
      </div>

      <form onSubmit={searchPatients} className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patient by Name or MRN..." 
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          Search
        </button>
      </form>

      {patients.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm max-w-xl divide-y divide-gray-200 dark:divide-gray-700">
          {patients.map(p => (
            <div key={p.id} onClick={() => selectPatient(p)} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex justify-between items-center transition-colors">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">MRN: {p.mrn} | {p.age}y {p.gender}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      )}

      {selectedPatient && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">{selectedPatient.name}</h2>
            <p className="text-sm text-blue-700 dark:text-blue-300">MRN: {selectedPatient.mrn} | {selectedPatient.age}y {selectedPatient.gender}</p>
          </div>
          <button onClick={() => {setSelectedPatient(null); setHistory([]);}} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Clear</button>
        </div>
      )}

      {selectedPatient && history.length > 0 && (
        <div className="space-y-4">
          {history.map((testGroup, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <button onClick={() => toggleTest(testGroup.test_name)} className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">{testGroup.test_name}</span>
                </div>
                {expandedTests[testGroup.test_name] ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
              </button>
              
              {expandedTests[testGroup.test_name] && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Date</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Result</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Range</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {testGroup.results.map((res, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 text-sm text-gray-900 dark:text-gray-300">{res.date}</td>
                          <td className={`py-3 text-sm font-medium ${res.flag !== 'N' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {res.value} {res.unit} {res.flag !== 'N' && `(${res.flag})`}
                          </td>
                          <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{res.range}</td>
                          <td className="py-3">
                            {i < testGroup.results.length - 1 && getTrendIcon(res.value, testGroup.results[i+1].value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
