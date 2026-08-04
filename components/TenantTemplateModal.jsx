// components/AdminTemplateModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, Eye, Palette, Type, Layout } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateAdminTemplate, useUpdateAdminTemplate } from '@/hooks/use-admin-templates';
import { useCreatetenantTemplate, useUpdatetenantTemplate } from '../hooks/use-tenant-templates-pdf';

// Pre-built templates for non-technical users
const PREBUILT_TEMPLATES = {
    classic: {
        name: 'Classic Laboratory Report',
        css: `
            .header { background: #1b4dff; color: white; padding: 20px; text-align: center; border-radius: 10px; margin-bottom: 20px; }
            .patient-card { background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .result-table { width: 100%; border-collapse: collapse; }
            .result-table th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
            .result-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            .flag-normal { color: #16a34a; font-weight: 600; }
            .flag-high { background: #ffedd5; color: #ea580c; padding: 4px 8px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-line { border-top: 1px solid #94a3b8; width: 200px; padding-top: 8px; text-align: center; }
            .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; }`
    },
    modern: {
        name: 'Modern Minimalist',
        css: `
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 15px; margin-bottom: 25px; }
            .patient-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
            .result-table { width: 100%; border-collapse: collapse; }
            .result-table th { background: #faf5ff; padding: 12px; text-align: left; font-weight: 600; color: #6b21a5; }
            .result-table td { padding: 10px 12px; border-bottom: 1px solid #f3e8ff; }
            .flag-normal { color: #16a34a; }
            .flag-high { background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-line { border-top: 2px solid #e5e7eb; width: 200px; padding-top: 10px; text-align: center; }
            .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 30px; }`
    },
    clinical: {
        name: 'Clinical Pathology',
        css: `
            .header { background: #0b5e7e; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
            .patient-card { background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #0b5e7e; }
            .result-table { width: 100%; border-collapse: collapse; }
            .result-table th { background: #e0f2fe; padding: 10px; text-align: left; }
            .result-table td { padding: 8px 10px; border-bottom: 1px solid #e0f2fe; }
            .flag-critical { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-line { border-top: 1px solid #cbd5e1; width: 200px; padding-top: 8px; text-align: center; }
            .footer { text-align: center; font-size: 11px; color: #6c757d; margin-top: 30px; }`
    },
    elegant: {
        name: 'Elegant Design',
        css: `
            .header { background: #1e293b; color: white; padding: 25px; text-align: center; border-bottom: 3px solid #f59e0b; margin-bottom: 25px; }
            .patient-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            .patient-card h3 { color: #f59e0b; margin-bottom: 15px; }
            .result-table { width: 100%; border-collapse: collapse; }
            .result-table th { background: #1e293b; color: white; padding: 12px; text-align: left; }
            .result-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            .flag-normal { color: #10b981; font-weight: 600; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
            .signature-line { border-top: 1px solid #cbd5e1; width: 200px; padding-top: 10px; text-align: center; font-size: 12px; }
            .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; }`
    }
};

// Color presets
const COLOR_PRESETS = {
    blue: { primary: '#1b4dff', secondary: '#0e3a5f' },
    purple: { primary: '#667eea', secondary: '#764ba2' },
    green: { primary: '#059669', secondary: '#047857' },
    orange: { primary: '#ea580c', secondary: '#c2410c' },
    teal: { primary: '#0d9488', secondary: '#0f766e' },
    indigo: { primary: '#4f46e5', secondary: '#4338ca' }
};

export default function TenantTemplateModal({ isOpen, onClose, mode, template, onSuccess }) {
    const [activeTab, setActiveTab] = useState('basic');
    const [formData, setFormData] = useState({
        name: '',
        type: 'laboratory',
        header_text: 'LABORATORY REPORT',
        lab_name: 'PathLIMS Diagnostics',
        primary_color: '#1b4dff',
        secondary_color: '#0e3a5f',
        show_patient_info: true,
        show_reference_range: true,
        show_signatures: true,
        show_footer: true,
        is_default: false,
        is_active: true,
        css_styles: PREBUILT_TEMPLATES.classic.css
    });

    const createTemplate = useCreatetenantTemplate();
    const updateTemplate = useUpdatetenantTemplate();
    const isLoading = createTemplate.isPending || updateTemplate.isPending;

    useEffect(() => {
        if (mode === 'edit' && template) {
            setFormData({
                name: template.name || '',
                type: template.type || 'laboratory',
                header_text: template.header_text || 'LABORATORY REPORT',
                lab_name: template.lab_name || 'PathLIMS Diagnostics',
                primary_color: template.primary_color || '#1b4dff',
                secondary_color: template.secondary_color || '#0e3a5f',
                show_patient_info: template.show_patient_info !== false,
                show_reference_range: template.show_reference_range !== false,
                show_signatures: template.show_signatures !== false,
                show_footer: template.show_footer !== false,
                is_default: template.is_default || false,
                is_active: template.is_active !== false,
                css_styles: template.css_styles || PREBUILT_TEMPLATES.classic.css
            });
        }
    }, [mode, template]);

    const applyPreset = (presetKey) => {
        const preset = PREBUILT_TEMPLATES[presetKey];
        if (preset) {
            setFormData(prev => ({
                ...prev,
                name: preset.name,
                css_styles: preset.css
            }));
            toast.success(`Applied "${preset.name}" template`);
        }
    };

    const applyColorPreset = (colorKey) => {
        const colors = COLOR_PRESETS[colorKey];
        if (colors) {
            let newCss = formData.css_styles;
            newCss = newCss.replace(/#1b4dff/g, colors.primary);
            newCss = newCss.replace(/#0e3a5f/g, colors.secondary);
            newCss = newCss.replace(/#667eea/g, colors.primary);
            newCss = newCss.replace(/#764ba2/g, colors.secondary);
            
            setFormData(prev => ({
                ...prev,
                primary_color: colors.primary,
                secondary_color: colors.secondary,
                css_styles: newCss
            }));
            toast.success(`Applied ${colorKey} color theme`);
        }
    };

    const generateCSS = () => {
        let css = `
            .header { 
                background: linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color});
                color: white; 
                padding: 20px; 
                text-align: center; 
                border-radius: 12px; 
                margin-bottom: 20px; 
            }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .patient-card { 
                background: #f8fafc; 
                border-radius: 12px; 
                padding: 20px; 
                margin-bottom: 20px; 
                border: 1px solid #e2e8f0; 
            }
            .result-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .result-table th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid ${formData.primary_color}; }
            .result-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            .flag-normal { color: #16a34a; font-weight: 600; }
            .flag-high { background: #ffedd5; color: #ea580c; padding: 4px 8px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .flag-low { background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 20px; display: inline-block; }
            .flag-critical { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
        `;
        
        if (formData.show_signatures) {
            css += `
                .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
                .signature-line { border-top: 1px solid #94a3b8; width: 200px; padding-top: 8px; text-align: center; }
            `;
        }
        
        if (formData.show_footer) {
            css += `
                .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; }
            `;
        }
        
        return css;
    };

    const updateCSS = () => {
        const newCSS = generateCSS();
        setFormData(prev => ({ ...prev, css_styles: newCSS }));
        toast.success('Styles updated');
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error('Template name is required');
            return;
        }

        const submitData = {
            ...formData,
            header_config: {
                ...(formData.header_config || {}),
                lab_name: formData.lab_name
            },
            css_styles: formData.css_styles
        };

        if (mode === 'create') {
            await createTemplate.mutateAsync(submitData);
            onSuccess();
        } else {
            await updateTemplate.mutateAsync({ id: template.id, data: submitData });
            onSuccess();
        }
    };

    const handlePreview = () => {
        const previewWindow = window.open();
        previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Preview - ${formData.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #f0f2f5;
            padding: 40px;
        }
        .preview-container {
            max-width: 1100px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .preview-header {
            background: linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%);
            color: white;
            padding: 12px 20px;
            font-size: 12px;
            text-align: center;
        }
        .preview-content {
            padding: 30px;
        }
        ${formData.css_styles}
        
        .info-row {
            display: flex;
            margin-bottom: 10px;
        }
        .info-label {
            width: 140px;
            font-weight: 600;
            color: #475569;
        }
        .test-section {
            margin-bottom: 30px;
        }
        .test-section h3 {
            background: #f1f5f9;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            color: ${formData.primary_color};
        }
        .interpretation {
            background: #fefce8;
            border-left: 4px solid #eab308;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .interpretation h4 {
            margin-bottom: 8px;
            color: #854d0e;
        }
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .signature-box {
            text-align: center;
            flex: 1;
        }
        .signature-line {
            border-top: 1px solid #94a3b8;
            width: 80%;
            margin: 0 auto 8px;
            padding-top: 8px;
        }
        .footer {
            text-align: center;
            font-size: 11px;
            color: #64748b;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            🔍 PREVIEW MODE - ${formData.name}
        </div>
        <div class="preview-content">
            <div class="header">
                <h1>${formData.header_text}</h1>
                <p>${formData.lab_name}</p>
            </div>
            
            ${formData.show_patient_info ? `
            <div class="patient-card">
                <h3>PATIENT INFORMATION</h3>
                <div class="info-row"><span class="info-label">Patient Name:</span><span>John Doe</span></div>
                <div class="info-row"><span class="info-label">MRN / UHID:</span><span>MRN-00123</span></div>
                <div class="info-row"><span class="info-label">Date of Birth:</span><span>15 Mar 1985 (40 years)</span></div>
                <div class="info-row"><span class="info-label">Gender:</span><span>Male</span></div>
                <div class="info-row"><span class="info-label">Order ID:</span><span>ORD-2024-001</span></div>
                <div class="info-row"><span class="info-label">Collection Date:</span><span>${new Date().toLocaleString()}</span></div>
            </div>
            ` : ''}
            
            <div class="test-section">
                <h3>COMPLETE BLOOD COUNT (CBC)</h3>
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Result</th>
                            <th>Unit</th>
                            ${formData.show_reference_range ? '<th>Reference Range</th>' : ''}
                            <th>Flag</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Hemoglobin</td>
                            <td>14.5</td>
                            <td>g/dL</td>
                            ${formData.show_reference_range ? '<td>13.5-17.5</td>' : ''}
                            <td><span class="flag-normal">Normal</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="interpretation">
                <h4>📋 Clinical Interpretation</h4>
                <p>All parameters are within normal reference range. Further clinical correlation is advised.</p>
            </div>
            
            ${formData.show_signatures ? `
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line">Medical Lab Technologist</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line">Consulting Pathologist</div>
                </div>
            </div>
            ` : ''}
            
            ${formData.show_footer ? `
            <div class="footer">
                <p>This is a computer-generated report. Valid without signature.</p>
                <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
        `);
        previewWindow.document.close();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        {mode === 'create' ? 'Create Template' : 'Edit Template'}
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`px-4 py-2 text-sm font-medium transition ${
                            activeTab === 'basic' 
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Basic Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('design')}
                        className={`px-4 py-2 text-sm font-medium transition ${
                            activeTab === 'design' 
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Design & Colors
                    </button>
                    <button
                        onClick={() => setActiveTab('sections')}
                        className={`px-4 py-2 text-sm font-medium transition ${
                            activeTab === 'sections' 
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Sections
                    </button>
                    <button
                        onClick={() => setActiveTab('signatures')}
                        className={`px-4 py-2 text-sm font-medium transition ${
                            activeTab === 'signatures' 
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Signatures
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
                    {activeTab === 'basic' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Template Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g., My Lab Report"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Report Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="laboratory">Laboratory Report</option>
                                        <option value="pathology">Pathology Report</option>
                                        <option value="radiology">Radiology Report</option>
                                        <option value="invoice">Invoice</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Report Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.header_text}
                                    onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="LABORATORY REPORT"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Lab Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.lab_name}
                                    onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="PathLIMS Diagnostics"
                                />
                            </div>

                            {/* Quick Templates */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Quick Templates (Click to apply)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => applyPreset('classic')}
                                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                                    >
                                        📄 Classic
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyPreset('modern')}
                                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                                    >
                                        ✨ Modern
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyPreset('clinical')}
                                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                                    >
                                        🏥 Clinical
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyPreset('elegant')}
                                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                                    >
                                        👔 Elegant
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'design' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Color Theme
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {Object.keys(COLOR_PRESETS).map((colorKey) => (
                                        <button
                                            key={colorKey}
                                            type="button"
                                            onClick={() => applyColorPreset(colorKey)}
                                            className={`w-10 h-10 rounded-full bg-${colorKey === 'blue' ? 'blue-600' : colorKey === 'purple' ? 'purple-600' : colorKey === 'green' ? 'green-600' : colorKey === 'orange' ? 'orange-600' : colorKey === 'teal' ? 'teal-600' : 'indigo-600'} hover:ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-blue-400 transition`}
                                            title={`${colorKey.charAt(0).toUpperCase() + colorKey.slice(1)} Theme`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Primary Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.primary_color}
                                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                            className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primary_color}
                                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Secondary Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.secondary_color}
                                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                            className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700"
                                        />
                                        <input
                                            type="text"
                                            value={formData.secondary_color}
                                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={updateCSS}
                                className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                            >
                                Apply Colors
                            </button>
                            
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-2">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    💡 Tip: Try different color themes to see how your report looks!
                                </p>
                            </div>
                        </>
                    )}

                    {activeTab === 'sections' && (
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Patient Information</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, show_patient_info: !formData.show_patient_info })}
                                    className={`w-10 h-5 rounded-full transition ${formData.show_patient_info ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`block w-4 h-4 rounded-full bg-white transition transform ${formData.show_patient_info ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </label>
                            
                            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Reference Range</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, show_reference_range: !formData.show_reference_range })}
                                    className={`w-10 h-5 rounded-full transition ${formData.show_reference_range ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`block w-4 h-4 rounded-full bg-white transition transform ${formData.show_reference_range ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </label>
                            
                            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Signatures</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, show_signatures: !formData.show_signatures })}
                                    className={`w-10 h-5 rounded-full transition ${formData.show_signatures ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`block w-4 h-4 rounded-full bg-white transition transform ${formData.show_signatures ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </label>
                            
                            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Footer</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, show_footer: !formData.show_footer })}
                                    className={`w-10 h-5 rounded-full transition ${formData.show_footer ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`block w-4 h-4 rounded-full bg-white transition transform ${formData.show_footer ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </label>
                        </div>
                    )}
                </div>

                
                    {activeTab === 'signatures' && (
                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Digital Signature Blocks</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    Configure which signature placeholders should appear at the bottom of the report. The actual users will sign these electronically.
                                </p>
                            </div>
                            
                            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer">
                                <div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Enable Signatures on Report</span>
                                    <span className="text-xs text-gray-500">Master toggle to show or hide all signatures.</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, show_signatures: !formData.show_signatures })}
                                    className={`w-10 h-5 rounded-full transition ${formData.show_signatures ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`block w-4 h-4 rounded-full bg-white transition transform ${formData.show_signatures ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </label>

                            {formData.show_signatures && (
                                <div className="space-y-4 mt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">Required Signers</h4>
                                    
                                    {formData?.signatures?.map((sig, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 block mb-1">Role Identifier (e.g. 'pathologist')</label>
                                                <input
                                                    type="text"
                                                    value={sig.id}
                                                    onChange={(e) => {
                                                        const newSigs = [...formData?.signatures];
                                                        newSigs[index].id = e.target.value.toLowerCase().replace(/\s+/g, '_');
                                                        setFormData({ ...formData, signatures: newSigs });
                                                    }}
                                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 block mb-1">Display Label</label>
                                                <input
                                                    type="text"
                                                    value={sig.label}
                                                    onChange={(e) => {
                                                        const newSigs = [...formData?.signatures];
                                                        newSigs[index].label = e.target.value;
                                                        setFormData({ ...formData, signatures: newSigs });
                                                    }}
                                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="pt-5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSigs = formData?.signatures.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, signatures: newSigs });
                                                    }}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                signatures: [...formData?.signatures, { id: 'new_role', label: 'New Signature Role' }]
                                            });
                                        }}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition text-sm font-medium"
                                    >
                                        + Add Signature Block
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between gap-3">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handlePreview}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {mode === 'create' ? 'Create Template' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}