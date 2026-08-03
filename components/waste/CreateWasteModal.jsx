'use client';

import React, { useState, useRef } from 'react';
import { 
    X, Droplet, Package, Scissors, Syringe, 
    Barcode, QrCode, Loader2, CheckCircle,
    AlertTriangle, Download, Printer
} from 'lucide-react';
import { useCreateWaste, useGenerateBarcode, useGenerateQR, useGenerateLabel } from '@/hooks/use-waste';
import { toast } from 'sonner';

export default function CreateWasteModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        waste_type: '',
        waste_sub_type: '',
        volume_ml: '',
        weight_kg: '',
        quantity: '',
        container_type: '',
        color_code: 'RED',
        patient_name: '',
        specimen_barcode: '',
        order_number: '',
        biohazard_level: 'BSL-2',
        is_hazardous: true,
        notes: '',
    });

    const [createdWaste, setCreatedWaste] = useState(null);
    const [showBarcodeActions, setShowBarcodeActions] = useState(false);
    const [barcodeData, setBarcodeData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('form');

    const createMutation = useCreateWaste();
    const generateBarcodeMutation = useGenerateBarcode();
    const generateQRMutation = useGenerateQR();
    const generateLabelMutation = useGenerateLabel();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const cleanedData = Object.keys(formData).reduce((acc, key) => {
            const value = formData[key];
            if (value === '') {
                acc[key] = null;
            } else if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
                const numericFields = ['volume_ml', 'weight_kg', 'quantity'];
                if (numericFields.includes(key)) {
                    acc[key] = parseFloat(value);
                } else {
                    acc[key] = value;
                }
            } else {
                acc[key] = value;
            }
            return acc;
        }, {});

        createMutation.mutate(cleanedData, {
            onSuccess: (response) => {
                setCreatedWaste(response.data);
                setShowBarcodeActions(true);
                toast.success('Waste record created successfully!');
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || 'Failed to create waste record');
            }
        });
    };

    const handleGenerateBarcode = async () => {
        if (!createdWaste) return;
        setIsGenerating(true);
        try {
            const result = await generateBarcodeMutation.mutateAsync(createdWaste.id);
            setBarcodeData(result.data);
            toast.success('Barcode generated successfully!');
        } catch (error) {
            toast.error('Failed to generate barcode');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateQR = async () => {
        if (!createdWaste) return;
        setIsGenerating(true);
        try {
            await generateQRMutation.mutateAsync(createdWaste.id);
            toast.success('QR code generated successfully!');
        } catch (error) {
            toast.error('Failed to generate QR code');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateLabel = async () => {
        if (!createdWaste) return;
        setIsGenerating(true);
        try {
            const result = await generateLabelMutation.mutateAsync(createdWaste.id);
            setBarcodeData(result.data);
            toast.success('Label generated successfully!');
        } catch (error) {
            toast.error('Failed to generate label');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrintLabel = () => {
        if (!barcodeData?.label_image) return;
        const win = window.open('', '_blank');
        win.document.write(`<img src="${barcodeData.label_image}" style="width:100%;max-width:500px;" />`);
        win.document.write('<br><button onclick="window.print()">Print</button>');
        win.document.close();
    };

    const handleDownloadLabel = () => {
        if (!barcodeData?.label_image) return;
        const link = document.createElement('a');
        link.href = barcodeData.label_image;
        link.download = `waste-label-${createdWaste?.waste_barcode || 'unknown'}.png`;
        link.click();
    };

    const handleClose = () => {
        onClose();
        setCreatedWaste(null);
        setShowBarcodeActions(false);
        setBarcodeData(null);
    };

    const handleReset = () => {
        setCreatedWaste(null);
        setShowBarcodeActions(false);
        setBarcodeData(null);
        setActiveTab('form');
        setFormData({
            waste_type: '',
            waste_sub_type: '',
            volume_ml: '',
            weight_kg: '',
            quantity: '',
            container_type: '',
            color_code: 'RED',
            patient_name: '',
            specimen_barcode: '',
            order_number: '',
            biohazard_level: 'BSL-2',
            is_hazardous: true,
            notes: '',
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const wasteTypes = [
        { value: 'liquid', label: 'Liquid', icon: Droplet, color: 'blue' },
        { value: 'solid', label: 'Solid', icon: Package, color: 'orange' },
        { value: 'sharps', label: 'Sharps', icon: Scissors, color: 'red' },
        { value: 'pathological', label: 'Pathological', icon: Syringe, color: 'purple' },
    ];

    // Success Screen
    if (showBarcodeActions && createdWaste) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Waste Record Created!
                            </h2>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                <CheckCircle className="inline w-4 h-4 mr-1" />
                                Record created successfully
                            </p>
                        </div>
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                            <button
                                onClick={() => setActiveTab('form')}
                                className={`px-4 py-2 text-sm font-medium transition ${
                                    activeTab === 'form'
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => setActiveTab('barcode')}
                                className={`px-4 py-2 text-sm font-medium transition ${
                                    activeTab === 'barcode'
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                <Barcode className="inline w-4 h-4 mr-1" />
                                Barcode
                            </button>
                            <button
                                onClick={() => setActiveTab('label')}
                                className={`px-4 py-2 text-sm font-medium transition ${
                                    activeTab === 'label'
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                <Printer className="inline w-4 h-4 mr-1" />
                                Label
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-4">
                            {activeTab === 'form' && (
                                <div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Barcode</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {createdWaste.waste_barcode || 'Not generated'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {createdWaste.waste_type}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                {createdWaste.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Patient</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {createdWaste.patient_name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'barcode' && (
                                <div className="space-y-4">
                                    {!createdWaste.waste_barcode ? (
                                        <button
                                            onClick={handleGenerateBarcode}
                                            disabled={isGenerating}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Barcode className="w-5 h-5" />
                                            )}
                                            {isGenerating ? 'Generating...' : 'Generate Barcode'}
                                        </button>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                                                <CheckCircle className="inline w-4 h-4 mr-1" />
                                                Barcode: {createdWaste.waste_barcode}
                                            </p>
                                            {createdWaste.barcode_image_url && (
                                                <img 
                                                    src={createdWaste.barcode_image_url} 
                                                    alt="Barcode" 
                                                    className="mx-auto max-w-full h-auto"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleGenerateQR}
                                        disabled={isGenerating}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <QrCode className="w-5 h-5" />
                                        )}
                                        {isGenerating ? 'Generating...' : 'Generate QR Code'}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'label' && (
                                <div className="space-y-4">
                                    <button
                                        onClick={handleGenerateLabel}
                                        disabled={isGenerating}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Printer className="w-5 h-5" />
                                        )}
                                        {isGenerating ? 'Generating...' : 'Generate Full Label'}
                                    </button>

                                    {barcodeData?.label_image && (
                                        <div>
                                            <img 
                                                src={barcodeData.label_image} 
                                                alt="Label" 
                                                className="w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
                                            />
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={handlePrintLabel}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                    Print
                                                </button>
                                                <button
                                                    onClick={handleDownloadLabel}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                Create Another
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Create Form
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Waste Record</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add a new biohazardous waste record</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Waste Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Waste Type *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {wasteTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = formData.waste_type === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, waste_type: type.value })}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                                            isSelected
                                                ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <Icon className={`w-6 h-6 mx-auto mb-1 ${
                                            isSelected 
                                                ? `text-${type.color}-500` 
                                                : 'text-gray-400 dark:text-gray-500'
                                        }`} />
                                        <span className={`text-xs font-medium ${
                                            isSelected 
                                                ? `text-${type.color}-700 dark:text-${type.color}-400` 
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {type.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sub Type
                            </label>
                            <input
                                type="text"
                                name="waste_sub_type"
                                value={formData.waste_sub_type}
                                onChange={handleChange}
                                placeholder="e.g., blood_serum, gloves"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Container Type
                            </label>
                            <select
                                name="container_type"
                                value={formData.container_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select...</option>
                                <option value="tube">Tube</option>
                                <option value="biohazard_bag">Biohazard Bag</option>
                                <option value="sharps_container">Sharps Container</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Volume (ml)
                            </label>
                            <input
                                type="number"
                                name="volume_ml"
                                value={formData.volume_ml}
                                onChange={handleChange}
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                name="weight_kg"
                                value={formData.weight_kg}
                                onChange={handleChange}
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Patient Name
                            </label>
                            <input
                                type="text"
                                name="patient_name"
                                value={formData.patient_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Specimen Barcode
                            </label>
                            <input
                                type="text"
                                name="specimen_barcode"
                                value={formData.specimen_barcode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Order Number
                            </label>
                            <input
                                type="text"
                                name="order_number"
                                value={formData.order_number}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Color Code
                            </label>
                            <select
                                name="color_code"
                                value={formData.color_code}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="RED">🔴 RED</option>
                                <option value="YELLOW">🟡 YELLOW</option>
                                <option value="BLUE">🔵 BLUE</option>
                                <option value="WHITE">⚪ WHITE</option>
                                <option value="BLACK">⚫ BLACK</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Biohazard Level
                            </label>
                            <select
                                name="biohazard_level"
                                value={formData.biohazard_level}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="BSL-1">BSL-1</option>
                                <option value="BSL-2">BSL-2</option>
                                <option value="BSL-3">BSL-3</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_hazardous"
                            checked={formData.is_hazardous}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                            This waste is hazardous
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || !formData.waste_type}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {createMutation.isPending ? (
                                <><Loader2 className="inline w-4 h-4 mr-2 animate-spin" /> Creating...</>
                            ) : (
                                'Create Record'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}