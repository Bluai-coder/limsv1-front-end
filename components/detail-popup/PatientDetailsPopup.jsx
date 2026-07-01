'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  FileText,
  Phone,
  Mail,
  MapPin,
  Hash,
  Clock,
  Stethoscope,
  ClipboardList,
  Activity,
  TestTube,
  ChevronRight,
  CalendarDays,
  Building,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  Printer,
  Download,
  Share2,
  CreditCard,
  History,
  Users,
  Heart,
  Pill,
  Syringe,
  Beaker,
  Hospital
} from 'lucide-react';

const getGenderBadge = (gender) => {
  const genderMap = {
    male: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    female: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    other: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  };
  const color = genderMap[gender?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${color}`}>{gender || 'Not specified'}</span>;
};

const getStatusBadge = (status) => {
  const statusMap = {
    active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: CheckCircle },
    inactive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: X },
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Clock },
    blocked: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: AlertCircle },
  };
  const config = statusMap[status?.toLowerCase()] || statusMap.active;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {status || 'Active'}
    </span>
  );
};

export default function PatientDetailsPopup({ patient, isOpen, onClose, onViewOrders }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !patient) return null;

  const handleClose = () => {
    setTimeout(onClose, 200);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return '—';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // Get full name
  const getFullName = (p) => {
    if (!p) return '—';
    return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
  };

  // Get initials
  const getInitials = (f, l) => {
    return `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();
  };

  // Get address
  const getFullAddress = (p) => {
    if (!p) return '—';
    const parts = [
      p.addressLine1,
      p.addressLine2,
      p.city,
      p.state,
      p.pincode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  // Sample orders data (replace with actual data from API)
  const recentOrders = patient.orders || patient.recentOrders || [];

  // Sample timeline data (replace with actual data)
  const timeline = [
    { status: 'Patient Registered', date: patient.created_at, icon: User, completed: !!patient.created_at },
    { status: 'First Visit', date: patient.firstVisitDate || patient.created_at, icon: Calendar, completed: !!patient.created_at },
    { status: 'Last Visit', date: patient.lastVisitDate, icon: Clock, completed: !!patient.lastVisitDate },
    { status: 'Recent Order', date: patient.lastOrderDate, icon: ClipboardList, completed: !!patient.lastOrderDate },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 !m-0 z-50 transition-all duration-300 ${
          isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer/Popup */}
      <div
        className={`fixed right-0 top-[-32px] h-full w-full sm:max-w-2xl lg:max-w-3xl bg-white dark:bg-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1b4dff] dark:bg-[#1b4dff] text-white">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Patient Details</h2>
                <p className="text-xs text-white/70 font-mono mt-0.5">MRN: {patient.mrn}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewOrders?.(patient.id)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="View Orders"
              >
                <ClipboardList className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="px-5 py-3 bg-black/20 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(patient.firstName, patient.lastName)}
              </div>
              <span className="text-white/90 font-medium">
                {getFullName(patient)}
              </span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/90 font-mono text-xs">{patient.mrn}</span>
            </div>
            {patient.dateOfBirth && (
              <>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-white/90 text-xs">
                    {calculateAge(patient.dateOfBirth)} yrs
                  </span>
                </div>
              </>
            )}
            {patient.gender && (
              <>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-white/90 text-xs">{patient.gender}</span>
                </div>
              </>
            )}
            {patient.phonePrimary && (
              <>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-white/90 text-xs">{patient.phonePrimary}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-5">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'details', label: 'Details', icon: User },
              { id: 'medical', label: 'Medical Info', icon: Heart },
              { id: 'orders', label: 'Orders', icon: ClipboardList, count: recentOrders?.length || 0 },
              { id: 'timeline', label: 'Timeline', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isActive 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-220px)] p-5">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Patient Profile Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#1b4dff] rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg flex-shrink-0">
                    {getInitials(patient.firstName, patient.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getFullName(patient)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        MRN: <span className="font-mono text-gray-700 dark:text-gray-300">{patient.mrn}</span>
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                      {getStatusBadge(patient.status || 'active')}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {patient.dateOfBirth && (
                        <span>Born: {formatDateOnly(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} yrs)</span>
                      )}
                      {patient.gender && <span>Gender: {patient.gender}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Primary Phone</label>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-500" /> {patient.phonePrimary || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Secondary Phone</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-500" /> {patient.phoneSecondary || '—'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Email</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-500" /> {patient.email || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </h3>
                <p className="text-sm text-gray-800 dark:text-gray-200">{getFullAddress(patient)}</p>
              </div>

              {/* Emergency Contact */}
              {(patient.emergencyContactName || patient.emergencyContactPhone) && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-red-100 dark:border-red-800">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {patient.emergencyContactName && (
                      <div>
                        <label className="text-xs text-red-600 dark:text-red-400">Name</label>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{patient.emergencyContactName}</p>
                      </div>
                    )}
                    {patient.emergencyContactPhone && (
                      <div>
                        <label className="text-xs text-red-600 dark:text-red-400">Phone</label>
                        <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-red-500" /> {patient.emergencyContactPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Registered On</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{formatDate(patient.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Last Updated</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{formatDate(patient.updatedAt)}</p>
                  </div>
                  {patient.bloodGroup && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Blood Group</label>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{patient.bloodGroup}</p>
                    </div>
                  )}
                  {patient.nationality && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Nationality</label>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{patient.nationality}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Medical Info Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-5">
              {/* Medical History */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Medical History
                </h3>
                {patient.medicalHistory ? (
                  <p className="text-sm text-gray-800 dark:text-gray-200">{patient.medicalHistory}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No medical history recorded</p>
                )}
              </div>

              {/* Allergies */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl p-4 border border-red-100 dark:border-red-800">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Allergies
                </h3>
                {patient.allergies ? (
                  <p className="text-sm text-gray-800 dark:text-gray-200">{patient.allergies}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No allergies recorded</p>
                )}
              </div>

              {/* Medications */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Current Medications
                </h3>
                {patient.medications ? (
                  <p className="text-sm text-gray-800 dark:text-gray-200">{patient.medications}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No medications recorded</p>
                )}
              </div>

              {/* Vital Signs */}
              {(patient.bloodPressure || patient.heartRate || patient.weight || patient.height) && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-xl p-4 border border-teal-100 dark:border-teal-800">
                  <h3 className="text-sm font-semibold text-teal-800 dark:text-teal-300 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Vital Signs (Latest)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {patient.bloodPressure && (
                      <div>
                        <label className="text-xs text-teal-600 dark:text-teal-400">Blood Pressure</label>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{patient.bloodPressure}</p>
                      </div>
                    )}
                    {patient.heartRate && (
                      <div>
                        <label className="text-xs text-teal-600 dark:text-teal-400">Heart Rate</label>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{patient.heartRate} bpm</p>
                      </div>
                    )}
                    {patient.weight && (
                      <div>
                        <label className="text-xs text-teal-600 dark:text-teal-400">Weight</label>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{patient.weight} kg</p>
                      </div>
                    )}
                    {patient.height && (
                      <div>
                        <label className="text-xs text-teal-600 dark:text-teal-400">Height</label>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{patient.height} cm</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {recentOrders?.length > 0 ? (
                recentOrders.map((order, index) => (
                  <div
                    key={order.id || index}
                    className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all cursor-pointer"
                    onClick={() => onViewOrders?.(patient.id, order.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {order.order_number || `Order #${index + 1}`}
                          </span>
                          {order.status && getStatusBadge(order.status)}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {order.created_at && (
                            <span>Date: {formatDate(order.created_at)}</span>
                          )}
                          {order.totalAmount && (
                            <span>Amount: ₹{order.totalAmount}</span>
                          )}
                          {order.tests?.length > 0 && (
                            <span>{order.tests.length} tests</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-gray-500">No orders found for this patient</p>
                  {/* <button
                    onClick={() => onViewOrders?.(patient.id)}
                    className="mt-4 text-[#1b4dff] text-sm hover:underline"
                  >
                    Create New Order →
                  </button> */}
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-6">
                {timeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="relative flex gap-4">
                      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        item.completed
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }`}>
                        <Icon className={`w-5 h-5 ${item.completed ? '' : 'opacity-50'}`} />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h4 className={`font-medium text-sm ${item.completed ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                            {item.status}
                          </h4>
                          {item.date && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(item.date)}</span>
                          )}
                        </div>
                        {item.completed && item.date && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Completed on {formatDate(item.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex justify-between items-center">
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Patient ID: {patient.id?.slice(0, 8)}... | Updated: {formatDate(patient.updatedAt)}
          </div>
          {/* <div className="flex items-center gap-2">
            <button
              onClick={() => onViewOrders?.(patient.id)}
              className="px-4 py-2 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-xl text-sm font-medium transition"
            >
              View All Orders
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
}