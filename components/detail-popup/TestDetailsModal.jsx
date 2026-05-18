
'use client';

import { useState } from 'react';
import {
  X, Calendar, DollarSign, FlaskConical, Clock, AlertCircle,
  CheckCircle, FileText, Droplet, Microscope,
  Activity, Shield, Zap, Edit, Package, Thermometer,
  Syringe, TestTube, Beaker, Mail, Phone, MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';



export default function TestDetailsModal({ isOpen, onClose, test }) {
  const [activeTab, setActiveTab] = useState('details');
  const router = useRouter();

  if (!isOpen || !test) return null;

  const getDepartmentIcon = (dept) => {
    switch (dept?.toLowerCase()) {
      case 'hematology': return <Microscope className="w-5 h-5" />;
      case 'biochemistry': return <Beaker className="w-5 h-5" />;
      case 'clinical pathology': return <Droplet className="w-5 h-5" />;
      case 'hormone': return <Activity className="w-5 h-5" />;
      case 'cardiac': return <Heart className="w-5 h-5" />;
      default: return <FlaskConical className="w-5 h-5" />;
    }
  };

  const getSpecimenIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'serum': return <Droplet className="w-4 h-4" />;
      case 'plasma': return <Droplet className="w-4 h-4" />;
      case 'whole blood': return <Syringe className="w-4 h-4" />;
      case 'urine': return <TestTube className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
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
              {getDepartmentIcon(test.department)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-white/20 rounded-md text-xs font-mono text-white">
                  {test.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  test.is_active 
                    ? 'bg-green-500/20 text-green-100' 
                    : 'bg-red-500/20 text-red-100'
                }`}>
                  {test.is_active ? 'Active' : 'Inactive'}
                </span>
                {test.requires_fasting && (
                  <span className="px-2 py-0.5 bg-orange-500/20 rounded-full text-xs font-medium text-orange-100">
                    Fasting Required
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">{test.display_name || test.name}</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                {test.department} {test.sub_department ? `• ${test.sub_department}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          {[
            { id: 'details', label: 'Test Details', icon: FileText },
            { id: 'analytes', label: `Analytes (${test.analytes?.length || 0})`, icon: Activity },
            { id: 'instructions', label: 'Instructions', icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Tab: Details */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">Price</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">₹{parseFloat(test.price).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    {getSpecimenIcon(test.specimen_type)}
                    <span className="text-xs">Specimen</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200 capitalize">
                    {test.specimen_type}
                    {test.specimen_volume_ml && ` (${test.specimen_volume_ml} ml)`}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{test.container_type} container</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">TAT</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{test.tat_hours} hours</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Last Updated</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{formatDate(test.updated_at)}</p>
                </div>
              </div>

              {/* Method & Result Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-medium">Methodology</span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{test.method || 'Not specified'}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-1">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-medium">Result Type</span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 capitalize">{test.result_type}</p>
                </div>
              </div>

              {/* Orderability Status */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${test.is_orderable ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {test.is_orderable ? 'Available for ordering' : 'Not available for ordering'}
                  </span>
                </div>
                {test.loinc_code && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    LOINC: <span className="font-mono">{test.loinc_code}</span>
                  </div>
                )}
              </div>

              {/* Instructions Summary */}
              {test.instructions && Object.keys(test.instructions).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Special Instructions
                  </h3>
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-100 dark:border-amber-800">
                    <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-sans">
                      {JSON.stringify(test.instructions, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Report Notes */}
              {test.report_notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Report Notes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    {test.report_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Analytes / Parameters */}
          {activeTab === 'analytes' && (
            <div>
              {test.analytes && test.analytes.length > 0 ? (
                <div className="space-y-3">
                  {test.analytes.map((analyte, idx) => (
                    <div key={analyte.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white">{analyte.name}</p>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{analyte.code}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{analyte.data_type}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{analyte.unit}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Reference: <span className="font-medium">{getReferenceRange(analyte)}</span>
                          </span>
                        </div>
                        {getCriticalRange(analyte) && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-red-500 dark:text-red-400" />
                            <span className="text-xs text-red-600 dark:text-red-400">
                              Critical: {getCriticalRange(analyte)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No analytes configured for this test</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add analytes from test configuration</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Instructions */}
          {activeTab === 'instructions' && (
            <div className="space-y-6">
              {/* Fasting Requirement */}
              <div className={`p-4 rounded-xl border ${
                test.requires_fasting 
                  ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' 
                  : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {test.requires_fasting ? (
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {test.requires_fasting ? 'Fasting Required' : 'No Fasting Required'}
                  </h3>
                </div>
                {test.requires_fasting && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                    Patient should fast for 8-12 hours before sample collection. Only water is allowed.
                  </p>
                )}
              </div>

              {/* Specimen Collection Instructions */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Droplet className="w-4 h-4" /> Specimen Collection
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5" />
                    <span>Specimen Type: <span className="font-medium capitalize">{test.specimen_type}</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5" />
                    <span>Container: <span className="font-medium capitalize">{test.container_type}</span> tube</span>
                  </li>
                  {test.specimen_volume_ml && (
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5" />
                      <span>Volume Required: <span className="font-medium">{test.specimen_volume_ml} mL</span></span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Method Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Test Method
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{test.method || 'Standard laboratory method'}</p>
              </div>

              {/* Turnaround Time */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Turnaround Time
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Results will be available within <span className="font-semibold">{test.tat_hours} hours</span> after sample receipt.
                </p>
              </div>

              {/* Codes */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Reference Codes
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Test Code:</span>
                    <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">{test.code}</span>
                  </div>
                  {test.loinc_code && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">LOINC:</span>
                      <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">{test.loinc_code}</span>
                    </div>
                  )}
                  {test.cpt_code && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">CPT:</span>
                      <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">{test.cpt_code}</span>
                    </div>
                  )}
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
            onClick={() => router.push(`test-price/edit?id=${test.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Edit Test
          </button>
        </div>
      </div>
    </div>
  );
}

// Heart icon component (if not imported from lucide)
function Heart(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}