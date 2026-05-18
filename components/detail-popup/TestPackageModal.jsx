
'use client';

import { useState } from 'react';
import {
  X, Calendar, DollarSign, FlaskConical, Clock, AlertCircle,
  CheckCircle, FileText, Droplet, Microscope,
  Activity, Shield, Zap, Edit, Package, Tag,
  TrendingDown, Percent, Users, Beaker, TestTube,
  ArrowRight, ChevronDown, ChevronUp, Info
} from 'lucide-react';




export default function TestPackageModal({ isOpen, onClose, packageData }) {
  const [expandedTests, setExpandedTests] = useState(new Set());
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !packageData) return null;

  const toggleTestExpand = (testId) => {
    const newSet = new Set(expandedTests);
    if (newSet.has(testId)) {
      newSet.delete(testId);
    } else {
      newSet.add(testId);
    }
    setExpandedTests(newSet);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDepartmentIcon = (dept) => {
    switch (dept?.toLowerCase()) {
      case 'hematology': return <Microscope className="w-4 h-4" />;
      case 'biochemistry': return <Beaker className="w-4 h-4" />;
      case 'clinical pathology': return <Droplet className="w-4 h-4" />;
      case 'hormone': return <Activity className="w-4 h-4" />;
      default: return <FlaskConical className="w-4 h-4" />;
    }
  };

  const getReferenceRange = (analyte) => {
    if (analyte.ref_low && analyte.ref_high) {
      return `${analyte.ref_low} - ${analyte.ref_high} ${analyte.unit}`;
    } else if (analyte.ref_low) {
      return `> ${analyte.ref_low} ${analyte.unit}`;
    } else if (analyte.ref_high) {
      return `< ${analyte.ref_high} ${analyte.unit}`;
    }
    return 'Not specified';
  };

  const getCriticalRange = (analyte) => {
    const critical= [];
    if (analyte.critical_low) critical.push(`< ${analyte.critical_low}`);
    if (analyte.critical_high) critical.push(`> ${analyte.critical_high}`);
    return critical.length > 0 ? critical.join(' or ') : null;
  };

  const savingsPercentage = ((packageData.discount / packageData.total_price) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[100vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative bg-[#1b4dff] dark:bg-[#1b4dff] px-6 py-5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-white/20 rounded-md text-xs font-mono text-white">
                  {packageData.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  packageData.is_active 
                    ? 'bg-green-500/20 text-green-100' 
                    : 'bg-red-500/20 text-red-100'
                }`}>
                  {packageData.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2 py-0.5 bg-orange-500/20 rounded-full text-xs font-medium text-orange-100">
                  {packageData.tests.length} Tests Included
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">{packageData.name}</h2>
              <p className="text-green-100 text-sm mt-0.5">Diagnostic Package</p>
            </div>
          </div>
        </div>

        {/* Price Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 px-6 py-4 border-b border-amber-100 dark:border-amber-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-through">Original Price</p>
                <p className="text-lg font-semibold text-gray-400 dark:text-gray-500">₹{packageData.total_price.toFixed(2)}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">Package Price</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">₹{parseFloat(packageData.offer_price).toFixed(2)}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full px-3 py-1">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Save {savingsPercentage}%
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              You save <span className="font-bold text-green-600 dark:text-green-400">₹{packageData.discount.toFixed(2)}</span> on this package
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          {[
            { id: 'overview', label: 'Package Overview', icon: Info },
            { id: 'tests', label: `Tests (${packageData.tests.length})`, icon: FlaskConical },
            { id: 'savings', label: 'Savings Breakdown', icon: TrendingDown },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-green-600 dark:border-green-400 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              {packageData.description && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Description
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{packageData.description}</p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-1">
                    <FlaskConical className="w-4 h-4" />
                    <span className="text-xs">Total Tests</span>
                  </div>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{packageData.tests.length}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-1">
                    <Beaker className="w-4 h-4" />
                    <span className="text-xs">Departments</span>
                  </div>
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                    {new Set(packageData.tests.map(t => t.department)).size}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-1">
                    <Tag className="w-4 h-4" />
                    <span className="text-xs">Discount</span>
                  </div>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">{savingsPercentage}%</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Created</span>
                  </div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{formatDate(packageData.createdAt)}</p>
                </div>
              </div>

              {/* Department Distribution */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Department Distribution
                </h3>
                <div className="space-y-2">
                  {Object.entries(
                    packageData.tests.reduce((acc, test) => {
                      acc[test.department] = (acc[test.department] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([dept, count]) => (
                    <div key={dept} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-gray-600 dark:text-gray-400">{dept}</div>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 dark:bg-green-500 rounded-full"
                          style={{ width: `${(count / packageData.tests.length) * 100}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{count} tests</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Tests */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              {packageData.tests.map((test, idx) => (
                <div key={test.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  {/* Test Header */}
                  <button
                    onClick={() => toggleTestExpand(test.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        {getDepartmentIcon(test.department)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{test.name}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">({test.code})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span>{test.department}</span>
                          <span className="capitalize">{test.specimen_type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-through">₹{parseFloat(test.price).toFixed(2)}</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">₹{parseFloat(test.offer_price).toFixed(2)}</p>
                      </div>
                      {expandedTests.has(test.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                  </button>

                  {/* Test Body - Analytes */}
                  {expandedTests.has(test.id) && (
                    <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Analytes / Parameters
                      </p>
                      <div className="space-y-2">
                        {test.analytes.map((analyte, analyteIdx) => (
                          <div key={analyteIdx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{analyte.name}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">({analyte.code})</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{analyte.unit}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  Reference: {getReferenceRange(analyte)}
                                </span>
                              </div>
                              {getCriticalRange(analyte) && (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-red-500 dark:text-red-400" />
                                  <span className="text-red-600 dark:text-red-400">
                                    Critical: {getCriticalRange(analyte)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab: Savings Breakdown */}
          {activeTab === 'savings' && (
            <div className="space-y-6">
              {/* Savings Summary Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-5 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-green-700 dark:text-green-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Your Savings Summary</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Individual Price</p>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">₹{packageData.total_price.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Package Price</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">₹{parseFloat(packageData.offer_price).toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Savings</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{packageData.discount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Test-wise Breakdown Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Test Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Department</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Regular Price</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Package Price</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {packageData.tests.map((test, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{test.name}</span>
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{test.code}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{test.department}</td>
                        <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">₹{parseFloat(test.price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-green-700 dark:text-green-400 font-medium">
                          ₹{parseFloat(test.offer_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                          ₹{(parseFloat(test.price) - parseFloat(test.offer_price)).toFixed(2)}
                        </td>
                       </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">Total</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                        ₹{packageData.total_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-700 dark:text-green-400">
                        ₹{parseFloat(packageData.offer_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">
                        ₹{packageData.discount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Savings Message */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Why choose this package?</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      By choosing this package, you save <strong>₹{packageData.discount.toFixed(2)} ({savingsPercentage}%)</strong> 
                      compared to booking all tests individually. Package includes all necessary tests with 
                      comprehensive reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-[#1b4dff] hover:bg-blue-700 dark:bg-[#1b4dff] dark:hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <Package className="w-4 h-4" /> View Package Details
          </button>
        </div>
      </div>
    </div>
  );
}