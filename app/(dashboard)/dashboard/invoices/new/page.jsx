'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePatients } from '@/hooks/use-patients';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useOrdersByPatientId } from '@/hooks/use-orders';

export default function CreateInvoicePage() {
    const router = useRouter();
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [patientId, setPatientId] = useState(null)
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { tenant } = useAuthStore();

    const { data } = usePatients({
        tenantId: tenant?.id || "",
        q: search || undefined,
        page,
        limit: 100
    });
    const patients = data?.data || [];




    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            patient_id: '',
            order_id: '',
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: '',
            currency: 'INR',
            notes: '',
            lines: [
                {
                    description: '',
                    unit_price: 0,
                    quantity: 1,
                    discount: 0,
                    tax_rate: 0,
                },
            ],
        },
    });

    const patientFieldId = watch('patient_id');

    useEffect(() => {
        setPatientId(patientFieldId)

    }, [patientFieldId])


    const { data: orderData } = useOrdersByPatientId({
        patientId: patientId
    });

    // console.log("odrderDataodrderData", odrderData)


    const { fields, append, remove } = useFieldArray({
        control,
        name: 'lines',
    });

    const calculateLineTotal = (line) => {
        const subtotal = (parseFloat(line.unit_price) || 0) * (parseInt(line.quantity) || 0);
        const discount = parseFloat(line.discount) || 0;
        const tax = (subtotal - discount) * ((parseFloat(line.tax_rate) || 0) / 100);
        return subtotal - discount + tax;
    };

    const calculateTotal = (lines) => {
        return lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                patient_id: data.patient_id,
                lines: data.lines.map((line) => ({
                    ...line,
                    unit_price: parseFloat(line.unit_price) || 0,
                    quantity: parseInt(line.quantity) || 1,
                    discount: parseFloat(line.discount) || 0,
                    tax_rate: parseFloat(line.tax_rate) || 0,
                })),
            };

            const response = await api.post('/invoices/add', payload);

            if (response.data.success) {
                toast.success('Invoice created successfully');
                router.push(`/dashboard/invoices/${response.data.data.id}`);
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error(error?.response?.data?.message || 'Failed to create invoice');
        }
    };

    const inputClass = "w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200";
    const cardClass = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-sm";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const selectClass = "w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200";

    const watchedLines = watch('lines');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
            <div className="max-w-5xl mx-auto py-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/dashboard/invoices" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Invoice</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generate an invoice for a patient</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Invoice Details */}
                    <div className={cardClass}>
                        <div className="p-6 md:p-8">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Invoice Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Patient <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("patient_id", { required: "Patient is required" })}
                                        className={selectClass}
                                    >
                                        <option value="">Select Patient</option>
                                        {patients?.map((patient) => (

                                            <option key={patient.id} value={patient.id}>
                                                {patient.firstName} {patient.lastName || patient.email || patient.phonePrimary || 'No contact'}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.patient_id && (
                                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.patient_id.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>Order <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("order_id")}
                                        className={selectClass}
                                    >
                                        <option value="">Select Order</option>
                                        {orderData?.data?.map((order) => (
                                            <option key={order.id} value={order.id}>
                                                {order.order_number} - {order.patient?.firstName} {order.patient?.lastName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.order_id && (
                                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.order_id.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                <div>
                                    <label className={labelClass}>Currency</label>
                                    <select
                                        {...register("currency")}
                                        className={selectClass}
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Invoice Date</label>
                                    <input
                                        type="date"
                                        {...register("invoice_date")}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Due Date</label>
                                    <input
                                        type="date"
                                        {...register("due_date")}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className={labelClass}>Notes</label>
                                <textarea
                                    {...register("notes")}
                                    rows="3"
                                    className={`${inputClass} resize-none`}
                                    placeholder="Additional notes or terms..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Items */}
                    <div className={cardClass}>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Items</h2>
                                <button
                                    type="button"
                                    onClick={() => append({
                                        description: '',
                                        unit_price: 0,
                                        quantity: 1,
                                        discount: 0,
                                        tax_rate: 0,
                                    })}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b4dff] hover:bg-[#1a40e0] text-white rounded-xl text-sm font-medium transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Description <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                {...register(`lines.${index}.description`, {
                                                    required: "Description is required"
                                                })}
                                                placeholder="Item description"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                                            />
                                            {errors.lines?.[index]?.description && (
                                                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                                                    {errors.lines[index].description.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Qty
                                            </label>
                                            <input
                                                type="number"
                                                {...register(`lines.${index}.quantity`, {
                                                    min: 1,
                                                    valueAsNumber: true,
                                                })}
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Price
                                            </label>
                                            <input
                                                type="number"
                                                {...register(`lines.${index}.unit_price`, {
                                                    min: 0,
                                                    valueAsNumber: true,
                                                })}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Discount
                                            </label>
                                            <input
                                                type="number"
                                                {...register(`lines.${index}.discount`, {
                                                    min: 0,
                                                    valueAsNumber: true,
                                                })}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Tax %
                                            </label>
                                            <input
                                                type="number"
                                                {...register(`lines.${index}.tax_rate`, {
                                                    min: 0,
                                                    valueAsNumber: true,
                                                })}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 md:justify-end">
                                            <div className="flex-1 md:flex-none">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {watchedLines?.[index] ?
                                                        calculateLineTotal(watchedLines[index]).toFixed(2) :
                                                        '0.00'
                                                    }
                                                </p>
                                            </div>
                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-end">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                        <p className="text-3xl font-bold text-[#1b4dff] dark:text-[#1b4dff]">
                                            ₹{calculateTotal(watchedLines || []).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-between flex-col sm:flex-row gap-4 pt-4">
                        <Link
                            href="/dashboard/invoices"
                            className="flex-1 sm:flex-none px-6 py-3 text-center border border-gray-300 dark:border-gray-600 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none px-8 py-3 bg-[#1b4dff] hover:bg-[#1a40e0] dark:bg-[#1b4dff] dark:hover:bg-[#1a40e0] text-white rounded-2xl font-medium flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {isSubmitting ? "Creating Invoice..." : "Create Invoice"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
