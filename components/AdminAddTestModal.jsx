// components/AddTestModal.jsx
'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminAddTestModal = ({ isOpen, onClose, onSave, existingTests = [] }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [testData, setTestData] = useState({
        code: '', name: '', display_name: '', department: '', sub_department: '',
        specimen_type: '', specimen_volume_ml: '', container_type: '', method: '',
        tat_hours: '', result_type: 'panel', price: '', is_orderable: true,
        is_active: true, requires_fasting: false, sort_order: 0,
        analytes: [{ code: '', name: '', unit: '', sequence: 1, ref_low: '', ref_high: '', critical_low: '', critical_high: '' }]
    });

    const isCodeExists = (code) => existingTests.some(test => test.code === code);

    const handleChange = (field, value) => {
        setTestData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleAnalyteChange = (index, field, value) => {
        const updated = [...testData.analytes];
        updated[index] = { ...updated[index], [field]: value };
        setTestData(prev => ({ ...prev, analytes: updated }));
    };

    const addAnalyte = () => {
        setTestData(prev => ({
            ...prev,
            analytes: [...prev.analytes, { code: '', name: '', unit: '', sequence: prev.analytes.length + 1, ref_low: '', ref_high: '', critical_low: '', critical_high: '' }]
        }));
    };

    const removeAnalyte = (index) => {
        if (testData.analytes.length === 1) { toast.error('At least one analyte is required'); return; }
        const updated = testData.analytes.filter((_, i) => i !== index);
        updated.forEach((a, idx) => a.sequence = idx + 1);
        setTestData(prev => ({ ...prev, analytes: updated }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!testData.code.trim()) newErrors.code = 'Test Code is required';
        else if (isCodeExists(testData.code)) newErrors.code = `Test code "${testData.code}" already exists`;
        if (!testData.name.trim()) newErrors.name = 'Test Name is required';
        if (!testData.department) newErrors.department = 'Department is required';
        if (!testData.specimen_type) newErrors.specimen_type = 'Specimen Type is required';
        if (!testData.price || testData.price <= 0) newErrors.price = 'Valid price is required';

        const analyteErrors = [];
        testData.analytes.forEach((analyte, idx) => {
            const err = {};
            if (!analyte.code) err.code = 'Analyte Code required';
            if (!analyte.name) err.name = 'Analyte Name required';
            if (Object.keys(err).length > 0) analyteErrors[idx] = err;
        });
        if (analyteErrors.length > 0) newErrors.analytes = analyteErrors;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) { toast.error('Please fix the errors before submitting'); return; }
        setLoading(true);
        try {
            const submissionData = {
                ...testData,
                specimen_volume_ml: testData.specimen_volume_ml ? parseFloat(testData.specimen_volume_ml) : null,
                price: parseFloat(testData.price),
                tat_hours: testData.tat_hours ? parseInt(testData.tat_hours) : null,
                sort_order: parseInt(testData.sort_order) || 0,
                analytes: testData.analytes.map(a => ({
                    ...a, ref_low: a.ref_low ? parseFloat(a.ref_low) : null,
                    ref_high: a.ref_high ? parseFloat(a.ref_high) : null,
                    critical_low: a.critical_low ? parseFloat(a.critical_low) : null,
                    critical_high: a.critical_high ? parseFloat(a.critical_high) : null
                }))
            };
            await onSave(submissionData);
            onClose();
            resetForm();
        } catch (error) { toast.error(error?.message || 'Failed to add test'); }
        finally { setLoading(false); }
    };

    const resetForm = () => {
        setTestData({
            code: '', name: '', display_name: '', department: '', sub_department: '',
            specimen_type: '', specimen_volume_ml: '', container_type: '', method: '',
            tat_hours: '', result_type: 'panel', price: '', is_orderable: true,
            is_active: true, requires_fasting: false, sort_order: 0,
            analytes: [{ code: '', name: '', unit: '', sequence: 1, ref_low: '', ref_high: '', critical_low: '', critical_high: '' }]
        });
        setErrors({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
                    <div><h2 className="text-xl font-bold text-white">Add New Test</h2><p className="text-green-100 text-sm mt-1">Create a new test catalog entry</p></div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                    {/* Basic Information */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Code <span className="text-red-500">*</span></label>
                                <input type="text" value={testData.code} onChange={(e) => handleChange('code', e.target.value.toUpperCase())} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="e.g., CBC001" />
                                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Name <span className="text-red-500">*</span></label>
                                <input type="text" value={testData.name} onChange={(e) => handleChange('name', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="e.g., Complete Blood Count" />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                                <input type="text" value={testData.display_name} onChange={(e) => handleChange('display_name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" placeholder="e.g., CBC" />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department <span className="text-red-500">*</span></label>
                                <select value={testData.department} onChange={(e) => handleChange('department', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${errors.department ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                    <option value="">Select Department</option>
                                    <option value="Hematology">Hematology</option><option value="Biochemistry">Biochemistry</option><option value="Hormone">Hormone</option><option value="Cardiac">Cardiac</option><option value="Clinical Pathology">Clinical Pathology</option>
                                </select>
                                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub Department</label>
                                <input type="text" value={testData.sub_department} onChange={(e) => handleChange('sub_department', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" placeholder="e.g., Routine" />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Result Type</label>
                                <select value={testData.result_type} onChange={(e) => handleChange('result_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"><option value="panel">Panel</option><option value="numeric">Numeric</option><option value="text">Text</option></select>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price <span className="text-red-500">*</span></label>
                                <input type="number" value={testData.price} onChange={(e) => handleChange('price', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="0" />
                                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort Order</label>
                                <input type="number" value={testData.sort_order} onChange={(e) => handleChange('sort_order', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" placeholder="0" />
                            </div>
                        </div>
                    </div>

                    {/* Specimen Information */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specimen Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specimen Type <span className="text-red-500">*</span></label>
                                <input type="text" value={testData.specimen_type} onChange={(e) => handleChange('specimen_type', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${errors.specimen_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="e.g., whole blood, serum, urine" />
                                {errors.specimen_type && <p className="text-xs text-red-500 mt-1">{errors.specimen_type}</p>}
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specimen Volume (ml)</label>
                                <input type="number" step="0.1" value={testData.specimen_volume_ml} onChange={(e) => handleChange('specimen_volume_ml', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" placeholder="2" />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Container Type</label>
                                <input type="text" value={testData.container_type} onChange={(e) => handleChange('container_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" placeholder="e.g., EDTA, Plain, Fluoride" />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
                                <input type="text" value={testData.method} onChange={(e) => handleChange('method', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" placeholder="e.g., Automated Analyzer, CLIA" />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TAT Hours</label>
                                <input type="number" value={testData.tat_hours} onChange={(e) => handleChange('tat_hours', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" placeholder="2" />
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options</h3>
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={testData.is_orderable} onChange={(e) => handleChange('is_orderable', e.target.checked)} className="w-4 h-4 text-green-600 rounded" /><span className="text-sm text-gray-700 dark:text-gray-300">Orderable</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={testData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} className="w-4 h-4 text-green-600 rounded" /><span className="text-sm text-gray-700 dark:text-gray-300">Active</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={testData.requires_fasting} onChange={(e) => handleChange('requires_fasting', e.target.checked)} className="w-4 h-4 text-green-600 rounded" /><span className="text-sm text-gray-700 dark:text-gray-300">Requires Fasting</span></label>
                        </div>
                    </div>

                    {/* Analytes */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytes</h3><button type="button" onClick={addAnalyte} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1"><Plus className="w-4 h-4" /> Add Analyte</button></div>
                        {testData.analytes.map((analyte, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-3"><h4 className="font-medium text-gray-800 dark:text-white">Analyte {idx + 1}</h4>{testData.analytes.length > 1 && <button type="button" onClick={() => removeAnalyte(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Analyte Code <span className="text-red-500">*</span></label><input type="text" value={analyte.code} onChange={(e) => handleAnalyteChange(idx, 'code', e.target.value.toUpperCase())} className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${errors.analytes?.[idx]?.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="e.g., HB" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Analyte Name <span className="text-red-500">*</span></label><input type="text" value={analyte.name} onChange={(e) => handleAnalyteChange(idx, 'name', e.target.value)} className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${errors.analytes?.[idx]?.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="e.g., Hemoglobin" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label><input type="text" value={analyte.unit} onChange={(e) => handleAnalyteChange(idx, 'unit', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" placeholder="e.g., g/dL" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sequence</label><input type="number" value={analyte.sequence} onChange={(e) => handleAnalyteChange(idx, 'sequence', parseInt(e.target.value))} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reference Low</label><input type="number" step="any" value={analyte.ref_low} onChange={(e) => handleAnalyteChange(idx, 'ref_low', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reference High</label><input type="number" step="any" value={analyte.ref_high} onChange={(e) => handleAnalyteChange(idx, 'ref_high', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Critical Low</label><input type="number" step="any" value={analyte.critical_low} onChange={(e) => handleAnalyteChange(idx, 'critical_low', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Critical High</label><input type="number" step="any" value={analyte.critical_high} onChange={(e) => handleAnalyteChange(idx, 'critical_high', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4  border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 !pt-0 py-0 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{loading ? 'Adding...' : 'Add Test'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminAddTestModal;