'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    Activity,
    Eye,
    X,
    ChevronDown,
    ChevronUp,
    Calendar,
    User,
    Stethoscope,
    FileText,
    Beaker,
    Clock,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    AlertCircle
} from 'lucide-react';

import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { useAuthStore } from '@/lib/auth-store';
import { useCreateOrderForBluHealth } from '@/hooks/use-orders';

// Status badge component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        pending: { label: 'Pending', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
        confirmed: { label: 'Confirmed', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
        completed: { label: 'Completed', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
        cancelled: { label: 'Cancelled', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
        active: { label: 'Active', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
        inactive: { label: 'Inactive', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

    return (
        <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${config.className}`}>
            {config.label}
        </span>
    );
};

// Order Detail Modal
const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    const { order: orderData, patient, doctor, appointment, reasons, items } = order;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 pt-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Order #{orderData?.order_number || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Created: {orderData?.created_at ? new Date(orderData.created_at).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500 dark:text-gray-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Order Status & Amount */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                            <StatusBadge status={orderData?.status} />
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">₹{orderData?.total_amount || 0}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Consultation Type</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{orderData?.consultation_type || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Appointment</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {appointment?.date} {appointment?.time}
                            </p>
                            <StatusBadge status={appointment?.status} />
                        </div>
                    </div>

                    {/* Patient Details */}
                    {patient && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" /> Patient Information
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.fullName || patient.full_name}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.dateOfBirth || patient.date_of_birth}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{patient.gender || patient.sex}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.phonePrimary || patient.phone}</p>
                                    {patient.email && <p className="text-xs text-gray-500 dark:text-gray-400">{patient.email}</p>}
                                </div>
                                {patient.addressLine1 && (
                                    <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{patient.addressLine1}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Doctor Details */}
                    {doctor && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4" /> Doctor Information
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{doctor.fullName || doctor.full_name}</p>
                                </div>
                                {doctor.specialization && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Specialization</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{doctor.specialization}</p>
                                    </div>
                                )}
                                {doctor.email && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{doctor.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reasons */}
                    {reasons && reasons.reasons && reasons.reasons.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Reasons for Visit
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {reasons.reasons.map((reason, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                        {reason}
                                    </span>
                                ))}
                                {reasons.other_reason && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                        Other: {reasons.other_reason}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Test Items */}
                    {items && items.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Beaker className="w-4 h-4" /> Test Items ({items.length})
                            </h4>
                            <div className="space-y-3">
                                {items.map((item, index) => {
                                    // Handle both test and package types
                                    const isPackage = item.type === 'package';
                                    const displayItems = isPackage ? item.tests || [] : [item];

                                    return (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            {isPackage && (
                                                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                Package: {item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900 dark:text-white">₹{item.price}</p>
                                                            {item.discount && (
                                                                <p className="text-xs text-green-600 dark:text-green-400">Discount: ₹{item.discount}</p>
                                                            )}
                                                            {item.original_price && (
                                                                <p className="text-xs text-gray-400 line-through">₹{item.original_price}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {displayItems.map((test, testIndex) => (
                                                <div key={testIndex} className={`${displayItems.length > 1 ? 'ml-4 mt-3' : ''}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {test.display_name || test.name}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">Code: {test.code}</span>
                                                                {!isPackage && <span className="text-xs text-gray-500 dark:text-gray-400">Type: {item.type}</span>}
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">Department: {test.department}</span>
                                                            </div>
                                                        </div>
                                                        {!isPackage && (
                                                            <div className="text-right">
                                                                <p className="font-medium text-gray-900 dark:text-white">₹{item.price}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Specimen Details */}
                                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                        {test.specimen_type && (
                                                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                                <span className="text-gray-500 dark:text-gray-400">Specimen:</span>
                                                                <span className="ml-1 text-gray-700 dark:text-gray-300">{test.specimen_type}</span>
                                                            </div>
                                                        )}
                                                        {test.container_type && (
                                                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                                <span className="text-gray-500 dark:text-gray-400">Container:</span>
                                                                <span className="ml-1 text-gray-700 dark:text-gray-300">{test.container_type}</span>
                                                            </div>
                                                        )}
                                                        {test.method && (
                                                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                                <span className="text-gray-500 dark:text-gray-400">Method:</span>
                                                                <span className="ml-1 text-gray-700 dark:text-gray-300">{test.method}</span>
                                                            </div>
                                                        )}
                                                        {test.tat_hours && (
                                                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                                <span className="text-gray-500 dark:text-gray-400">TAT:</span>
                                                                <span className="ml-1 text-gray-700 dark:text-gray-300">{test.tat_hours} hours</span>
                                                            </div>
                                                        )}
                                                        {test.requires_fasting !== undefined && (
                                                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                                <span className="text-gray-500 dark:text-gray-400">Fasting:</span>
                                                                <span className="ml-1 text-gray-700 dark:text-gray-300">{test.requires_fasting ? 'Required' : 'Not Required'}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Analytes */}
                                                    {test.analytes && test.analytes.length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Analytes ({test.analytes.length})</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                {test.analytes.map((analyte, idx) => (
                                                                    <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                                                                        <span className="font-medium text-gray-700 dark:text-gray-300">{analyte.name}</span>
                                                                        <span className="text-gray-500 dark:text-gray-400 ml-1">({analyte.code})</span>
                                                                        <div className="text-gray-500 dark:text-gray-400">
                                                                            Range: {analyte.ref_low} - {analyte.ref_high} {analyte.unit}
                                                                        </div>
                                                                        {analyte.critical_low && analyte.critical_high && (
                                                                            <div className="text-red-500 dark:text-red-400 text-xs">
                                                                                Critical: {analyte.critical_low} - {analyte.critical_high} {analyte.unit}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 sticky bottom-0 bg-white dark:bg-gray-800 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Order Card Component
const OrderCard = ({ order, onViewDetails, createOrder }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { order: orderData, patient, doctor, appointment, items } = order;

    // Get display items for summary
    const getItemDisplayNames = () => {
        if (!items || items.length === 0) return [];
        return items.map(item => {
            if (item.type === 'package') {
                return item.name;
            }
            return item.display_name || item.name;
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {orderData?.order_number}
                            </h3>
                            <StatusBadge status={orderData?.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {patient?.fullName || patient?.full_name || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Stethoscope className="w-3.5 h-3.5" />
                                {doctor?.fullName || doctor?.full_name || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {appointment?.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {appointment?.time}
                            </span>
                            <span className="flex items-center gap-1">
                                <CreditCard className="w-3.5 h-3.5" />
                                ₹{orderData?.total_amount}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                       {orderData?.status === 'pending' && (
                            <button
                                onClick={() => createOrder(order)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Create Order"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )} 
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => onViewDetails(order)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Patient Info */}
                            {patient && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Patient</p>
                                    <p className="text-sm text-gray-900 dark:text-white">{patient.fullName || patient.full_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{patient.phonePrimary || patient.phone}</p>
                                    {(patient.dateOfBirth || patient.date_of_birth) && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">DOB: {patient.dateOfBirth || patient.date_of_birth}</p>
                                    )}
                                </div>
                            )}

                            {/* Doctor Info */}
                            {doctor && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Doctor</p>
                                    <p className="text-sm text-gray-900 dark:text-white">{doctor.fullName || doctor.full_name}</p>
                                    {doctor.specialization && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.specialization}</p>
                                    )}
                                </div>
                            )}

                            {/* Appointment Info */}
                            {appointment && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Appointment</p>
                                    <p className="text-sm text-gray-900 dark:text-white">{appointment.date} at {appointment.time}</p>
                                    <StatusBadge status={appointment.status} />
                                </div>
                            )}
                        </div>

                        {/* Test Items Summary */}
                        {items && items.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Items:</p>
                                <div className="flex flex-wrap gap-2">
                                    {getItemDisplayNames().map((name, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function LabRecommendations() {
    const searchParams = useSearchParams();
    const hospitalId = searchParams?.get('hospitalId');
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        currentPage: 1
    });

    const { tenant } = useAuthStore();

    // Fetch lab recommendations
    const fetchRecommendations = async () => {
        if (!tenant?.id) {
            setLoading(false);
            setError('No lab tenant found. Please log in again.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const endpoint = `http://192.168.1.19:3000/api/bluhealth/lab-recommendations/hospital/${hospitalId}/lab/${tenant.id}?page=${page}&limit=10`;

            const response = await fetch(endpoint, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiResponse = await response.json();

            if (apiResponse?.success && apiResponse?.data) {
                const data = apiResponse.data;

                // Create hospital data with proper mapping
                const hospitalData = {
                    id: data.hospital?.id || 1,
                    name: data.hospital?.name || 'Unknown Hospital',
                    email: data.hospital?.email || '',
                    phone: data.hospital?.phone || '',
                    address: data.hospital?.address || {},
                    lab: data.lab || {},
                    total_recommendations: data.total_recommendations || 0,
                    current_page: data.current_page || 1,
                    total_pages: data.total_pages || 1,
                    recommendations: data.recommendations || []
                };

                setHospitals([hospitalData]);
                setPagination({
                    total: hospitalData.total_recommendations,
                    totalPages: hospitalData.total_pages || 1,
                    currentPage: hospitalData.current_page || 1
                });
            } else {
                setHospitals([]);
                setPagination({
                    total: 0,
                    totalPages: 1,
                    currentPage: 1
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
            toast.error(error.message);
            setHospitals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenant?.id && hospitalId) {
            fetchRecommendations();
        } else if (!tenant?.id && !hospitalId) {
            // Show message when both are missing
            setLoading(false);
            setError('Please select a lab tenant and hospital to view recommendations.');
        } else {
            setLoading(false);
        }
    }, [tenant?.id, hospitalId, page]);

    const handleViewOrderDetails = (order) => {
        setSelectedOrder(order);
    };

    const createOrderForBluHealth = useCreateOrderForBluHealth();

    const createOrderFromItDirectlyalsofirstaddpetiendoctor = async (order) => {

        try {
            await createOrderForBluHealth.mutateAsync(order);
            toast.success(`Order created successfully`);
            router.push('/dashboard/orders');
        } catch (err) {
            console.log("errerrerr", err);
            toast.error(err.response?.data?.message || 'Failed to create order');
        }
    };

    // Get all recommendations from all hospitals
    const allRecommendations = hospitals.flatMap(h => h.recommendations || []);

    // Filter recommendations based on search
    const filteredRecommendations = allRecommendations.filter(rec => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            rec.order?.order_number?.toLowerCase().includes(searchLower) ||
            rec.patient?.fullName?.toLowerCase().includes(searchLower) ||
            rec.patient?.full_name?.toLowerCase().includes(searchLower) ||
            rec.doctor?.fullName?.toLowerCase().includes(searchLower) ||
            rec.doctor?.full_name?.toLowerCase().includes(searchLower) ||
            rec.items?.some(item => {
                if (item.type === 'package') {
                    return item.name?.toLowerCase().includes(searchLower);
                }
                return item.name?.toLowerCase().includes(searchLower) ||
                    item.display_name?.toLowerCase().includes(searchLower);
            })
        );
    });

    return (
        <div className="space-y-6">
            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        Lab Recommendations
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {hospitals.length > 0 && hospitals[0].name} • {pagination.total} orders found
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hospitals.length > 0 && hospitals[0].lab && (
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Lab: {hospitals[0].lab.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400">
                    <p className="text-sm">{error}</p>
                    {error.includes('Please select') && (
                        <p className="text-sm mt-1">Go to settings to configure your lab tenant and hospital.</p>
                    )}
                    {!error.includes('Please select') && (
                        <button
                            onClick={() => fetchRecommendations()}
                            className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by order number, patient, doctor, or test name..."
                        className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {loading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                                    <div className="flex gap-4 mt-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                            </div>
                        </div>
                    ))
                ) : filteredRecommendations.length > 0 ? (
                    filteredRecommendations.map((recommendation, index) => (
                        <OrderCard
                            key={recommendation.order?.id || index}
                            order={recommendation}
                            onViewDetails={handleViewOrderDetails}
                            createOrder={createOrderFromItDirectlyalsofirstaddpetiendoctor}
                        />
                    ))
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Activity className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-400 dark:text-gray-500 font-medium">
                            {search ? 'No matching orders found' : 'No recommendations available'}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-[#1b4dff] text-sm mt-2 hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total} orders
                    </p>

                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-600 dark:text-gray-400"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Page {page} of {pagination.totalPages}
                        </span>

                        <button
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page === pagination.totalPages}
                            className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-600 dark:text-gray-400"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}