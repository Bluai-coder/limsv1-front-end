// // components/AdminTemplateModal.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { X, Save, Loader2, Eye, Palette, Type, Layout } from 'lucide-react';
// import { toast } from 'sonner';
// import { useCreateAdminTemplate, useUpdateAdminTemplate } from '@/hooks/useAdminTemplates';

// // Pre-built templates for non-technical users
// const PREBUILT_TEMPLATES = {
//     classic: {
//         name: 'Classic Laboratory Report',
//         css: `
//             .header { background: #1b4dff; color: white; padding: 20px; text-align: center; border-radius: 10px; margin-bottom: 20px; }
//             .patient-card { background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
//             .result-table { width: 100%; border-collapse: collapse; }
//             .result-table th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
//             .result-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
//             .flag-normal { color: #16a34a; font-weight: 600; }
//             .flag-high { background: #ffedd5; color: #ea580c; padding: 4px 8px; border-radius: 20px; font-size: 11px; display: inline-block; }
//             .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
//             .signature-line { border-top: 1px solid #94a3b8; width: 200px; padding-top: 8px; text-align: center; }
//             .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; }`
//     },
//     modern: {
//         name: 'Modern Minimalist',
//         css: `
//             .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 15px; margin-bottom: 25px; }
//             .patient-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
//             .result-table { width: 100%; border-collapse: collapse; }
//             .result-table th { background: #faf5ff; padding: 12px; text-align: left; font-weight: 600; color: #6b21a5; }
//             .result-table td { padding: 10px 12px; border-bottom: 1px solid #f3e8ff; }
//             .flag-normal { color: #16a34a; }
//             .flag-high { background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; }
//             .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
//             .signature-line { border-top: 2px solid #e5e7eb; width: 200px; padding-top: 10px; text-align: center; }
//             .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 30px; }`
//     },
//     clinical: {
//         name: 'Clinical Pathology',
//         css: `
//             .header { background: #0b5e7e; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
//             .patient-card { background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #0b5e7e; }
//             .result-table { width: 100%; border-collapse: collapse; }
//             .result-table th { background: #e0f2fe; padding: 10px; text-align: left; }
//             .result-table td { padding: 8px 10px; border-bottom: 1px solid #e0f2fe; }
//             .flag-critical { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
//             .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
//             .signature-line { border-top: 1px solid #cbd5e1; width: 200px; padding-top: 8px; text-align: center; }
//             .footer { text-align: center; font-size: 11px; color: #6c757d; margin-top: 30px; }`
//     },
//     elegant: {
//         name: 'Elegant Design',
//         css: `
//             .header { background: #1e293b; color: white; padding: 25px; text-align: center; border-bottom: 3px solid #f59e0b; margin-bottom: 25px; }
//             .patient-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
//             .patient-card h3 { color: #f59e0b; margin-bottom: 15px; }
//             .result-table { width: 100%; border-collapse: collapse; }
//             .result-table th { background: #1e293b; color: white; padding: 12px; text-align: left; }
//             .result-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
//             .flag-normal { color: #10b981; font-weight: 600; }
//             .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
//             .signature-line { border-top: 1px solid #cbd5e1; width: 200px; padding-top: 10px; text-align: center; font-size: 12px; }
//             .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; }`
//     }
// };

// // Color presets
// const COLOR_PRESETS = {
//     blue: { primary: '#1b4dff', secondary: '#0e3a5f' },
//     purple: { primary: '#667eea', secondary: '#764ba2' },
//     green: { primary: '#059669', secondary: '#047857' },
//     orange: { primary: '#ea580c', secondary: '#c2410c' },
//     teal: { primary: '#0d9488', secondary: '#0f766e' },
//     indigo: { primary: '#4f46e5', secondary: '#4338ca' }
// };

// export default function AdminTemplateModal({ isOpen, onClose, mode, template, onSuccess }) {
//     const [activeTab, setActiveTab] = useState('basic');
//     const [formData, setFormData] = useState({
//         name: '',
//         type: 'laboratory',
//         header_text: 'LABORATORY REPORT',
//         lab_name: 'PathLIMS Diagnostics',
//         primary_color: '#1b4dff',
//         secondary_color: '#0e3a5f',
//         show_patient_info: true,
//         show_reference_range: true,
//         show_signatures: true,
//         show_footer: true,
//         is_default: false,
//         is_active: true,
//         css_styles: PREBUILT_TEMPLATES.classic.css
//     });

//     const createTemplate = useCreateAdminTemplate();
//     const updateTemplate = useUpdateAdminTemplate();
//     const isLoading = createTemplate.isPending || updateTemplate.isPending;

//     useEffect(() => {
//         if (mode === 'edit' && template) {
//             setFormData({
//                 name: template.name || '',
//                 type: template.type || 'laboratory',
//                 header_text: template.header_text || 'LABORATORY REPORT',
//                 lab_name: template.lab_name || 'PathLIMS Diagnostics',
//                 primary_color: template.primary_color || '#1b4dff',
//                 secondary_color: template.secondary_color || '#0e3a5f',
//                 show_patient_info: template.show_patient_info !== false,
//                 show_reference_range: template.show_reference_range !== false,
//                 show_signatures: template.show_signatures !== false,
//                 show_footer: template.show_footer !== false,
//                 is_default: template.is_default || false,
//                 is_active: template.is_active !== false,
//                 css_styles: template.css_styles || PREBUILT_TEMPLATES.classic.css
//             });
//         }
//     }, [mode, template]);

//     const applyPreset = (presetKey) => {
//         const preset = PREBUILT_TEMPLATES[presetKey];
//         if (preset) {
//             setFormData(prev => ({
//                 ...prev,
//                 name: preset.name,
//                 css_styles: preset.css
//             }));
//             toast.success(`Applied "${preset.name}" template`);
//         }
//     };

//     const applyColorPreset = (colorKey) => {
//         const colors = COLOR_PRESETS[colorKey];
//         if (colors) {
//             let newCss = formData.css_styles;
//             newCss = newCss.replace(/#1b4dff/g, colors.primary);
//             newCss = newCss.replace(/#0e3a5f/g, colors.secondary);
//             newCss = newCss.replace(/#667eea/g, colors.primary);
//             newCss = newCss.replace(/#764ba2/g, colors.secondary);

//             setFormData(prev => ({
//                 ...prev,
//                 primary_color: colors.primary,
//                 secondary_color: colors.secondary,
//                 css_styles: newCss
//             }));
//             toast.success(`Applied ${colorKey} color theme`);
//         }
//     };

//     const generateCSS = () => {
//         let css = `
//             .header { 
//                 background: linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color});
//                 color: white; 
//                 padding: 20px; 
//                 text-align: center; 
//                 border-radius: 12px; 
//                 margin-bottom: 20px; 
//             }
//             .header h1 { font-size: 24px; margin-bottom: 5px; }
//             .patient-card { 
//                 background: #f8fafc; 
//                 border-radius: 12px; 
//                 padding: 20px; 
//                 margin-bottom: 20px; 
//                 border: 1px solid #e2e8f0; 
//             }
//             .result-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
//             .result-table th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid ${formData.primary_color}; }
//             .result-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
//             .flag-normal { color: #16a34a; font-weight: 600; }
//             .flag-high { background: #ffedd5; color: #ea580c; padding: 4px 8px; border-radius: 20px; font-size: 11px; display: inline-block; }
//             .flag-low { background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 20px; display: inline-block; }
//             .flag-critical { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
//         `;

//         if (formData.show_signatures) {
//             css += `
//                 .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
//                 .signature-line { border-top: 1px solid #94a3b8; width: 200px; padding-top: 8px; text-align: center; }
//             `;
//         }

//         if (formData.show_footer) {
//             css += `
//                 .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; }
//             `;
//         }

//         return css;
//     };

//     const updateCSS = () => {
//         const newCSS = generateCSS();
//         setFormData(prev => ({ ...prev, css_styles: newCSS }));
//         toast.success('Styles updated');
//     };

//     const handleSubmit = async () => {
//         if (!formData.name.trim()) {
//             toast.error('Template name is required');
//             return;
//         }

//         const submitData = {
//             ...formData,
//             css_styles: formData.css_styles
//         };

//         if (mode === 'create') {
//             await createTemplate.mutateAsync(submitData);
//             onSuccess();
//         } else {
//             await updateTemplate.mutateAsync({ id: template.id, data: submitData });
//             onSuccess();
//         }
//     };

//     const handlePreview = () => {
//         const previewWindow = window.open();
//         previewWindow.document.write(`
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <title>Preview - ${formData.name}</title>
//     <style>
//         * { margin: 0; padding: 0; box-sizing: border-box; }
//         body { 
//             font-family: 'Segoe UI', Arial, sans-serif; 
//             background: #f0f2f5;
//             padding: 40px;
//         }
//         .preview-container {
//             max-width: 1100px;
//             margin: 0 auto;
//             background: white;
//             border-radius: 16px;
//             box-shadow: 0 20px 40px rgba(0,0,0,0.1);
//             overflow: hidden;
//         }
//         .preview-header {
//             background: linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%);
//             color: white;
//             padding: 12px 20px;
//             font-size: 12px;
//             text-align: center;
//         }
//         .preview-content {
//             padding: 30px;
//         }
//         ${formData.css_styles}

//         .info-row {
//             display: flex;
//             margin-bottom: 10px;
//         }
//         .info-label {
//             width: 140px;
//             font-weight: 600;
//             color: #475569;
//         }
//         .test-section {
//             margin-bottom: 30px;
//         }
//         .test-section h3 {
//             background: #f1f5f9;
//             padding: 12px 15px;
//             border-radius: 8px;
//             margin-bottom: 15px;
//             color: ${formData.primary_color};
//         }
//         .interpretation {
//             background: #fefce8;
//             border-left: 4px solid #eab308;
//             padding: 15px 20px;
//             border-radius: 8px;
//             margin: 20px 0;
//         }
//         .interpretation h4 {
//             margin-bottom: 8px;
//             color: #854d0e;
//         }
//         .signature-section {
//             display: flex;
//             justify-content: space-between;
//             margin-top: 40px;
//             padding-top: 20px;
//             border-top: 1px solid #e2e8f0;
//         }
//         .signature-box {
//             text-align: center;
//             flex: 1;
//         }
//         .signature-line {
//             border-top: 1px solid #94a3b8;
//             width: 80%;
//             margin: 0 auto 8px;
//             padding-top: 8px;
//         }
//         .footer {
//             text-align: center;
//             font-size: 11px;
//             color: #64748b;
//             margin-top: 30px;
//             padding-top: 15px;
//             border-top: 1px solid #e2e8f0;
//         }
//     </style>
// </head>
// <body>
//     <div class="preview-container">
//         <div class="preview-header">
//             🔍 PREVIEW MODE - ${formData.name}
//         </div>
//         <div class="preview-content">
//             <div class="header">
//                 <h1>${formData.header_text}</h1>
//                 <p>${formData.lab_name}</p>
//             </div>

//             ${formData.show_patient_info ? `
//             <div class="patient-card">
//                 <h3>PATIENT INFORMATION</h3>
//                 <div class="info-row"><span class="info-label">Patient Name:</span><span>John Doe</span></div>
//                 <div class="info-row"><span class="info-label">MRN / UHID:</span><span>MRN-00123</span></div>
//                 <div class="info-row"><span class="info-label">Date of Birth:</span><span>15 Mar 1985 (40 years)</span></div>
//                 <div class="info-row"><span class="info-label">Gender:</span><span>Male</span></div>
//                 <div class="info-row"><span class="info-label">Order ID:</span><span>ORD-2024-001</span></div>
//                 <div class="info-row"><span class="info-label">Collection Date:</span><span>${new Date().toLocaleString()}</span></div>
//             </div>
//             ` : ''}

//             <div class="test-section">
//                 <h3>COMPLETE BLOOD COUNT (CBC)</h3>
//                 <table class="result-table">
//                     <thead>
//                         <tr>
//                             <th>Parameter</th>
//                             <th>Result</th>
//                             <th>Unit</th>
//                             ${formData.show_reference_range ? '<th>Reference Range</th>' : ''}
//                             <th>Flag</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         <tr>
//                             <td>Hemoglobin</td>
//                             <td>14.5</td>
//                             <td>g/dL</td>
//                             ${formData.show_reference_range ? '<td>13.5-17.5</td>' : ''}
//                             <td><span class="flag-normal">Normal</span></td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>

//             <div class="interpretation">
//                 <h4>📋 Clinical Interpretation</h4>
//                 <p>All parameters are within normal reference range. Further clinical correlation is advised.</p>
//             </div>

//             ${formData.show_signatures ? `
//             <div class="signature-section">
//                 <div class="signature-box">
//                     <div class="signature-line">Medical Lab Technologist</div>
//                 </div>
//                 <div class="signature-box">
//                     <div class="signature-line">Consulting Pathologist</div>
//                 </div>
//             </div>
//             ` : ''}

//             ${formData.show_footer ? `
//             <div class="footer">
//                 <p>This is a computer-generated report. Valid without signature.</p>
//                 <p>Generated on: ${new Date().toLocaleString()}</p>
//             </div>
//             ` : ''}
//         </div>
//     </div>
// </body>
// </html>
//         `);
//         previewWindow.document.close();
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
//                     <h2 className="text-xl font-bold text-white">
//                         {mode === 'create' ? 'Create Template' : 'Edit Template'}
//                     </h2>
//                     <button onClick={onClose} className="text-white/80 hover:text-white transition">
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 {/* Tabs */}
//                 <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
//                     <button
//                         onClick={() => setActiveTab('basic')}
//                         className={`px-4 py-2 text-sm font-medium transition ${
//                             activeTab === 'basic' 
//                                 ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
//                                 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                         }`}
//                     >
//                         Basic Settings
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('design')}
//                         className={`px-4 py-2 text-sm font-medium transition ${
//                             activeTab === 'design' 
//                                 ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
//                                 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                         }`}
//                     >
//                         Design & Colors
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('sections')}
//                         className={`px-4 py-2 text-sm font-medium transition ${
//                             activeTab === 'sections' 
//                                 ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
//                                 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                         }`}
//                     >
//                         Sections
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
//                     {activeTab === 'basic' && (
//                         <>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                         Template Name *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={formData.name}
//                                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                         placeholder="e.g., My Lab Report"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                         Report Type
//                                     </label>
//                                     <select
//                                         value={formData.type}
//                                         onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                     >
//                                         <option value="laboratory">Laboratory Report</option>
//                                         <option value="pathology">Pathology Report</option>
//                                         <option value="radiology">Radiology Report</option>
//                                         <option value="invoice">Invoice</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                     Report Title
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={formData.header_text}
//                                     onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                     placeholder="LABORATORY REPORT"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                     Lab Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={formData.lab_name}
//                                     onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                     placeholder="PathLIMS Diagnostics"
//                                 />
//                             </div>

//                             {/* Quick Templates */}
//                             <div className="mt-4">
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Quick Templates (Click to apply)
//                                 </label>
//                                 <div className="flex flex-wrap gap-2">
//                                     <button
//                                         type="button"
//                                         onClick={() => applyPreset('classic')}
//                                         className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
//                                     >
//                                         📄 Classic
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => applyPreset('modern')}
//                                         className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
//                                     >
//                                         ✨ Modern
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => applyPreset('clinical')}
//                                         className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
//                                     >
//                                         🏥 Clinical
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => applyPreset('elegant')}
//                                         className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
//                                     >
//                                         👔 Elegant
//                                     </button>
//                                 </div>
//                             </div>
//                         </>
//                     )}

//                     {activeTab === 'design' && (
//                         <>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Color Theme
//                                 </label>
//                                 <div className="flex flex-wrap gap-3">
//                                     {Object.keys(COLOR_PRESETS).map((colorKey) => (
//                                         <button
//                                             key={colorKey}
//                                             type="button"
//                                             onClick={() => applyColorPreset(colorKey)}
//                                             className={`w-10 h-10 rounded-full bg-${colorKey === 'blue' ? 'blue-600' : colorKey === 'purple' ? 'purple-600' : colorKey === 'green' ? 'green-600' : colorKey === 'orange' ? 'orange-600' : colorKey === 'teal' ? 'teal-600' : 'indigo-600'} hover:ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-blue-400 transition`}
//                                             title={`${colorKey.charAt(0).toUpperCase() + colorKey.slice(1)} Theme`}
//                                         />
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                         Primary Color
//                                     </label>
//                                     <div className="flex gap-2">
//                                         <input
//                                             type="color"
//                                             value={formData.primary_color}
//                                             onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
//                                             className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700"
//                                         />
//                                         <input
//                                             type="text"
//                                             value={formData.primary_color}
//                                             onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
//                                             className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                         />
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                         Secondary Color
//                                     </label>
//                                     <div className="flex gap-2">
//                                         <input
//                                             type="color"
//                                             value={formData.secondary_color}
//                                             onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
//                                             className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700"
//                                         />
//                                         <input
//                                             type="text"
//                                             value={formData.secondary_color}
//                                             onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
//                                             className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             <button
//                                 type="button"
//                                 onClick={updateCSS}
//                                 className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
//                             >
//                                 Apply Colors
//                             </button>

//                             <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-2">
//                                 <p className="text-sm text-blue-800 dark:text-blue-300">
//                                     💡 Tip: Try different color themes to see how your report looks!
//                                 </p>
//                             </div>
//                         </>
//                     )}

//                     {activeTab === 'sections' && (
//                         <div className="space-y-3">
//                             <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer">
//                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Patient Information</span>
//                                 <button
//                                     type="button"
//                                     onClick={() => setFormData({ ...formData, show_patient_info: !formData.show_patient_info })}
//                                     className={`w-10 h-5 rounded-full transition ${formData.show_patient_info ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
//                                 >
//                                     <span className={`block w-4 h-4 rounded-full bg-white transition transform ${formData.show_patient_info ? 'translate-x-5' : 'translate-x-1'}`} />
//                                 </button>
//                             </label>

//                             <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer">
//                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Reference Range</span>
//                                 <button
//                                     type="button"
//                                     onClick={() => setFormData({ ...formData, show_reference_range: !formData.show_reference_range })}
//                                     className={`w-10 h-5 rounded-full transition ${formData.show_reference_range ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
//                                 >
//                                     <span className={`block w-4 h-4 rounded-full bg-white transition transform ${formData.show_reference_range ? 'translate-x-5' : 'translate-x-1'}`} />
//                                 </button>
//                             </label>

//                             <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer">
//                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Signatures</span>
//                                 <button
//                                     type="button"
//                                     onClick={() => setFormData({ ...formData, show_signatures: !formData.show_signatures })}
//                                     className={`w-10 h-5 rounded-full transition ${formData.show_signatures ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
//                                 >
//                                     <span className={`block w-4 h-4 rounded-full bg-white transition transform ${formData.show_signatures ? 'translate-x-5' : 'translate-x-1'}`} />
//                                 </button>
//                             </label>

//                             <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer">
//                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Footer</span>
//                                 <button
//                                     type="button"
//                                     onClick={() => setFormData({ ...formData, show_footer: !formData.show_footer })}
//                                     className={`w-10 h-5 rounded-full transition ${formData.show_footer ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
//                                 >
//                                     <span className={`block w-4 h-4 rounded-full bg-white transition transform ${formData.show_footer ? 'translate-x-5' : 'translate-x-1'}`} />
//                                 </button>
//                             </label>
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer */}
//                 <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between gap-3">
//                     <div className="flex gap-2">
//                         <button
//                             type="button"
//                             onClick={handlePreview}
//                             className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition"
//                         >
//                             <Eye className="w-4 h-4" />
//                             Preview
//                         </button>
//                     </div>
//                     <div className="flex gap-3">
//                         <button
//                             onClick={onClose}
//                             className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             onClick={handleSubmit}
//                             disabled={isLoading}
//                             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
//                         >
//                             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                             {mode === 'create' ? 'Create Template' : 'Save Changes'}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }










// components/AdminTemplateModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateAdminTemplate, useUpdateAdminTemplate } from '@/hooks/useAdminTemplates';

// Pre-built templates with full configuration
const PREBUILT_TEMPLATES = {
    classic: {
        name: 'Classic Laboratory Report',
        type: 'laboratory',
        layout: {
            header: { position: 'top', style: 'centered' },
            patientInfo: { position: 'top', columns: 2 },
            results: { position: 'middle', style: 'table' },
            interpretation: { position: 'middle' },
            signatures: { position: 'bottom', align: 'space-between' },
            footer: { position: 'bottom' }
        },
        header_config: {
            title: 'LABORATORY REPORT',
            subtitle: 'PathLIMS Diagnostics',
            alignment: 'center',
            show_logo: false
        },
        footer_config: {
            text: 'This is a computer-generated report. Valid without signature.',
            show_generated_date: true,
            alignment: 'center'
        },
        css: `
            .header { background: linear-gradient(135deg, #1b4dff, #0e3a5f); color: white; padding: 20px; text-align: center; border-radius: 12px; margin-bottom: 20px; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header p { opacity: 0.9; }
            .patient-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .patient-card h3 { color: #1b4dff; margin-bottom: 15px; font-size: 14px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; }
            .info-row { display: flex; padding: 4px 0; }
            .info-label { width: 140px; font-weight: 600; color: #475569; font-size: 13px; }
            .info-value { flex: 1; color: #1e293b; font-size: 13px; }
            .result-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .result-table th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #1b4dff; }
            .result-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            .result-table tr:hover { background: #f8fafc; }
            .flag-normal { color: #16a34a; font-weight: 600; }
            .flag-high { background: #ffedd5; color: #ea580c; padding: 4px 8px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .flag-low { background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .flag-critical { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
            .interpretation { background: #fefce8; border-left: 4px solid #eab308; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-line { border-top: 1px solid #94a3b8; width: 200px; padding-top: 8px; text-align: center; font-size: 12px; }
            .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; }`
    },
    modern: {
        name: 'Modern Minimalist',
        type: 'laboratory',
        layout: {
            header: { position: 'top', style: 'gradient' },
            patientInfo: { position: 'top', columns: 2, style: 'card' },
            results: { position: 'middle', style: 'striped' },
            interpretation: { position: 'middle' },
            signatures: { position: 'bottom', align: 'space-between' },
            footer: { position: 'bottom' }
        },
        header_config: {
            title: 'LABORATORY REPORT',
            subtitle: 'PathLIMS Diagnostics',
            alignment: 'center',
            show_logo: false
        },
        footer_config: {
            text: 'Generated by PathLIMS System',
            show_generated_date: true,
            alignment: 'center'
        },
        css: `
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(102,126,234,0.3); }
            .header h1 { font-size: 28px; font-weight: 300; letter-spacing: 1px; }
            .header p { opacity: 0.85; font-weight: 300; }
            .patient-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
            .patient-card h3 { color: #667eea; margin-bottom: 15px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 30px; }
            .info-row { display: flex; padding: 4px 0; }
            .info-label { width: 140px; font-weight: 500; color: #6b7280; font-size: 13px; }
            .info-value { flex: 1; color: #1f2937; font-size: 13px; font-weight: 500; }
            .result-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .result-table th { background: #faf5ff; padding: 12px 15px; text-align: left; font-weight: 600; color: #6b21a5; border-bottom: 2px solid #e9d5ff; }
            .result-table td { padding: 10px 15px; border-bottom: 1px solid #f3e8ff; }
            .result-table tr:nth-child(even) { background: #faf5ff; }
            .flag-normal { color: #16a34a; font-weight: 600; }
            .flag-high { background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .flag-low { background: #dbeafe; color: #2563eb; padding: 4px 12px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .flag-critical { background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
            .interpretation { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 2px solid #f3e8ff; }
            .signature-line { border-top: 2px solid #e5e7eb; width: 200px; padding-top: 10px; text-align: center; font-size: 12px; }
            .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 30px; padding-top: 15px; border-top: 1px solid #f3e8ff; }`
    },
    clinical: {
        name: 'Clinical Pathology',
        type: 'pathology',
        layout: {
            header: { position: 'top', style: 'solid' },
            patientInfo: { position: 'top', columns: 2 },
            results: { position: 'middle', style: 'bordered' },
            interpretation: { position: 'middle' },
            signatures: { position: 'bottom', align: 'space-between' },
            footer: { position: 'bottom' }
        },
        header_config: {
            title: 'PATHOLOGY REPORT',
            subtitle: 'Clinical Diagnostic Laboratory',
            alignment: 'center',
            show_logo: false
        },
        footer_config: {
            text: 'This is a computer-generated report. Valid without signature.',
            show_generated_date: true,
            alignment: 'center'
        },
        css: `
            .header { background: #0b5e7e; color: white; padding: 20px 25px; text-align: center; margin-bottom: 20px; border-radius: 8px 8px 0 0; }
            .header h1 { font-size: 22px; font-weight: 600; letter-spacing: 0.5px; }
            .header p { opacity: 0.8; font-size: 14px; }
            .patient-card { background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #0b5e7e; }
            .patient-card h3 { color: #0b5e7e; margin-bottom: 15px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
            .info-row { display: flex; padding: 3px 0; }
            .info-label { width: 130px; font-weight: 600; color: #475569; font-size: 13px; }
            .info-value { flex: 1; color: #1e293b; font-size: 13px; }
            .result-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .result-table th { background: #e0f2fe; padding: 10px 12px; text-align: left; font-weight: 600; color: #0b5e7e; border-bottom: 2px solid #0b5e7e; }
            .result-table td { padding: 8px 12px; border-bottom: 1px solid #e0f2fe; }
            .flag-normal { color: #16a34a; font-weight: 600; }
            .flag-high { background: #ffedd5; color: #ea580c; padding: 4px 8px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .flag-low { background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .flag-critical { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
            .interpretation { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-line { border-top: 1px solid #cbd5e1; width: 200px; padding-top: 8px; text-align: center; font-size: 12px; }
            .footer { text-align: center; font-size: 11px; color: #6c757d; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0f2fe; }`
    },
    elegant: {
        name: 'Elegant Design',
        type: 'laboratory',
        layout: {
            header: { position: 'top', style: 'dark' },
            patientInfo: { position: 'top', columns: 2 },
            results: { position: 'middle', style: 'elegant' },
            interpretation: { position: 'middle' },
            signatures: { position: 'bottom', align: 'space-between' },
            footer: { position: 'bottom' }
        },
        header_config: {
            title: 'LABORATORY REPORT',
            subtitle: 'PathLIMS Diagnostics',
            alignment: 'center',
            show_logo: false
        },
        footer_config: {
            text: 'This is a computer-generated report. Valid without signature.',
            show_generated_date: true,
            alignment: 'center'
        },
        css: `
            .header { background: #1e293b; color: white; padding: 25px 30px; text-align: center; border-bottom: 3px solid #f59e0b; margin-bottom: 25px; }
            .header h1 { font-size: 26px; font-weight: 300; letter-spacing: 2px; }
            .header p { opacity: 0.7; font-weight: 300; }
            .patient-card { background: #f8fafc; border-radius: 12px; padding: 20px 25px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            .patient-card h3 { color: #f59e0b; margin-bottom: 15px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 30px; }
            .info-row { display: flex; padding: 4px 0; }
            .info-label { width: 140px; font-weight: 600; color: #475569; font-size: 13px; }
            .info-value { flex: 1; color: #1e293b; font-size: 13px; }
            .result-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .result-table th { background: #1e293b; color: white; padding: 12px 15px; text-align: left; font-weight: 500; letter-spacing: 0.5px; }
            .result-table td { padding: 10px 15px; border-bottom: 1px solid #e2e8f0; }
            .result-table tr:nth-child(even) { background: #f8fafc; }
            .flag-normal { color: #10b981; font-weight: 600; }
            .flag-high { background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .flag-low { background: #dbeafe; color: #2563eb; padding: 4px 12px; border-radius: 20px; font-size: 11px; display: inline-block; }
            .flag-critical { background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
            .interpretation { background: #fefce8; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; border-top: 2px solid #f1f5f9; }
            .signature-line { border-top: 1px solid #cbd5e1; width: 200px; padding-top: 10px; text-align: center; font-size: 12px; }
            .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; }`
    }
};

// Color presets with full palette
const COLOR_PRESETS = {
    blue: { primary: '#1b4dff', secondary: '#0e3a5f', accent: '#2563eb', light: '#dbeafe' },
    purple: { primary: '#667eea', secondary: '#764ba2', accent: '#7c3aed', light: '#ede9fe' },
    green: { primary: '#059669', secondary: '#047857', accent: '#10b981', light: '#d1fae5' },
    orange: { primary: '#ea580c', secondary: '#c2410c', accent: '#f59e0b', light: '#fef3c7' },
    teal: { primary: '#0d9488', secondary: '#0f766e', accent: '#14b8a6', light: '#ccfbf1' },
    indigo: { primary: '#4f46e5', secondary: '#4338ca', accent: '#6366f1', light: '#e0e7ff' },
    rose: { primary: '#e11d48', secondary: '#be123c', accent: '#fb7185', light: '#ffe4e6' },
    slate: { primary: '#475569', secondary: '#334155', accent: '#64748b', light: '#f1f5f9' }
};

export default function AdminTemplateModal({ isOpen, onClose, mode, template, onSuccess }) {
    const [activeTab, setActiveTab] = useState('basic');
    const [expandedSections, setExpandedSections] = useState({
        header: true,
        patient: true,
        results: true,
        signatures: true,
        footer: true
    });
    const [formData, setFormData] = useState({
        name: '',
        type: 'laboratory',
        layout: {
            header: { position: 'top', style: 'centered' },
            patientInfo: { position: 'top', columns: 2 },
            results: { position: 'middle', style: 'table' },
            interpretation: { position: 'middle' },
            signatures: { position: 'bottom', align: 'space-between' },
            footer: { position: 'bottom' }
        },
        header_config: {
            title: 'LABORATORY REPORT',
            subtitle: 'PathLIMS Diagnostics',
            alignment: 'center',
            show_logo: false,
            logo_url: ''
        },
        footer_config: {
            text: 'This is a computer-generated report. Valid without signature.',
            show_generated_date: true,
            alignment: 'center'
        },
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

    const createTemplate = useCreateAdminTemplate();
    const updateTemplate = useUpdateAdminTemplate();
    const isLoading = createTemplate.isPending || updateTemplate.isPending;

    useEffect(() => {
        if (mode === 'edit' && template) {
            setFormData({
                name: template.name || '',
                type: template.type || 'laboratory',
                layout: template.layout || {
                    header: { position: 'top', style: 'centered' },
                    patientInfo: { position: 'top', columns: 2 },
                    results: { position: 'middle', style: 'table' },
                    interpretation: { position: 'middle' },
                    signatures: { position: 'bottom', align: 'space-between' },
                    footer: { position: 'bottom' }
                },
                header_config: template.header_config || {
                    title: 'LABORATORY REPORT',
                    subtitle: 'PathLIMS Diagnostics',
                    alignment: 'center',
                    show_logo: false,
                    logo_url: ''
                },
                footer_config: template.footer_config || {
                    text: 'This is a computer-generated report. Valid without signature.',
                    show_generated_date: true,
                    alignment: 'center'
                },
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
                type: preset.type || 'laboratory',
                layout: preset.layout || prev.layout,
                header_config: preset.header_config || prev.header_config,
                footer_config: preset.footer_config || prev.footer_config,
                css_styles: preset.css
            }));
            toast.success(`Applied "${preset.name}" template`);
        }
    };

    const applyColorPreset = (colorKey) => {
        const colors = COLOR_PRESETS[colorKey];
        if (colors) {
            let newCss = formData.css_styles;
            // Replace common color patterns
            const colorPatterns = [
                { from: /#1b4dff/g, to: colors.primary },
                { from: /#0e3a5f/g, to: colors.secondary },
                { from: /#667eea/g, to: colors.primary },
                { from: /#764ba2/g, to: colors.secondary },
                { from: /#059669/g, to: colors.primary },
                { from: /#047857/g, to: colors.secondary },
                { from: /#ea580c/g, to: colors.primary },
                { from: /#c2410c/g, to: colors.secondary },
                { from: /#0d9488/g, to: colors.primary },
                { from: /#0f766e/g, to: colors.secondary },
                { from: /#4f46e5/g, to: colors.primary },
                { from: /#4338ca/g, to: colors.secondary }
            ];

            colorPatterns.forEach(pattern => {
                newCss = newCss.replace(pattern.from, pattern.to);
            });

            setFormData(prev => ({
                ...prev,
                primary_color: colors.primary,
                secondary_color: colors.secondary,
                css_styles: newCss
            }));
            toast.success(`Applied ${colorKey} color theme`);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error('Template name is required');
            return;
        }

        const submitData = {
            name: formData.name,
            type: formData.type,
            layout: formData.layout,
            header_config: formData.header_config,
            footer_config: formData.footer_config,
            css_styles: formData.css_styles,
            is_default: formData.is_default || false,
            is_active: formData.is_active !== false
        };

        try {
            if (mode === 'create') {
                await createTemplate.mutateAsync(submitData);
                toast.success('Template created successfully!');
                onSuccess();
            } else {
                await updateTemplate.mutateAsync({ id: template.id, data: submitData });
                toast.success('Template updated successfully!');
                onSuccess();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to save template');
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handlePreview = () => {
        const previewWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!previewWindow) {
            toast.error('Please allow popups for this site');
            return;
        }

        previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Preview - ${formData.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #f0f2f5;
            padding: 40px;
        }
        .preview-container {
            max-width: 1100px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.12);
            overflow: hidden;
        }
        .preview-header {
            background: linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%);
            color: white;
            padding: 12px 20px;
            font-size: 12px;
            text-align: center;
            letter-spacing: 0.5px;
        }
        .preview-content {
            padding: 40px;
        }
        ${formData.css_styles}
        
        .test-section {
            margin-bottom: 30px;
        }
        .test-section h3 {
            background: ${formData.primary_color}10;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 15px;
            color: ${formData.primary_color};
            font-size: 14px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            🔍 PREVIEW MODE - ${formData.name}
        </div>
        <div class="preview-content">
            <!-- Header Section -->
            <div class="header">
                <h1>${formData.header_config?.title || 'LABORATORY REPORT'}</h1>
                <p>${formData.header_config?.subtitle || 'PathLIMS Diagnostics'}</p>
            </div>
            
            <!-- Patient Information -->
            ${formData.show_patient_info ? `
            <div class="patient-card">
                <h3>PATIENT INFORMATION</h3>
                <div class="info-grid">
                    <div class="info-row"><span class="info-label">Patient Name:</span><span class="info-value">John Doe</span></div>
                    <div class="info-row"><span class="info-label">MRN / UHID:</span><span class="info-value">MRN-00123</span></div>
                    <div class="info-row"><span class="info-label">Date of Birth:</span><span class="info-value">15 Mar 1985 (40 years)</span></div>
                    <div class="info-row"><span class="info-label">Gender:</span><span class="info-value">Male</span></div>
                    <div class="info-row"><span class="info-label">Order ID:</span><span class="info-value">ORD-2024-001</span></div>
                    <div class="info-row"><span class="info-label">Collection Date:</span><span class="info-value">${new Date().toLocaleString()}</span></div>
                </div>
            </div>
            ` : ''}
            
            <!-- Results Table -->
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
                        <tr>
                            <td>WBC Count</td>
                            <td>7.2</td>
                            <td>×10³/µL</td>
                            ${formData.show_reference_range ? '<td>4.5-11.0</td>' : ''}
                            <td><span class="flag-normal">Normal</span></td>
                        </tr>
                        <tr>
                            <td>Platelets</td>
                            <td>250</td>
                            <td>×10³/µL</td>
                            ${formData.show_reference_range ? '<td>150-400</td>' : ''}
                            <td><span class="flag-normal">Normal</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Interpretation -->
            <div class="interpretation">
                <h4>📋 Clinical Interpretation</h4>
                <p>All parameters are within normal reference range. Further clinical correlation is advised.</p>
            </div>
            
            <!-- Signatures -->
            ${formData.show_signatures ? `
            <div class="signature-section">
                <div>
                    <div class="signature-line">Medical Lab Technologist</div>
                </div>
                <div>
                    <div class="signature-line">Consulting Pathologist</div>
                </div>
            </div>
            ` : ''}
            
            <!-- Footer -->
            ${formData.show_footer ? `
            <div class="footer">
                <p>${formData.footer_config?.text || 'This is a computer-generated report. Valid without signature.'}</p>
                ${formData.footer_config?.show_generated_date !== false ? `<p>Generated on: ${new Date().toLocaleString()}</p>` : ''}
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {mode === 'create' ? 'Create Template' : 'Edit Template'}
                        </h2>
                        <p className="text-blue-100 text-sm mt-0.5">
                            {mode === 'create' ? 'Design a new report template' : 'Modify existing template'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 overflow-x-auto flex-shrink-0">
                    {[
                        { id: 'basic', label: 'Basic Settings', icon: '📋' },
                        { id: 'design', label: 'Design & Colors', icon: '🎨' },
                        { id: 'sections', label: 'Sections', icon: '📐' },
                        { id: 'advanced', label: 'Advanced', icon: '⚙️' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab.id
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)] space-y-5">
                    {activeTab === 'basic' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Template Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
                                        placeholder="e.g., My Lab Report"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Report Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
                                    >
                                        <option value="laboratory">🧪 Laboratory Report</option>
                                        <option value="pathology">🔬 Pathology Report</option>
                                        <option value="radiology">🩻 Radiology Report</option>
                                        <option value="invoice">📄 Invoice</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Report Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.header_config?.title || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            header_config: { ...formData.header_config, title: e.target.value }
                                        })}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
                                        placeholder="LABORATORY REPORT"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Lab / Organization Name 
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.header_config?.subtitle || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            header_config: { ...formData.header_config, subtitle: e.target.value }
                                        })}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
                                        placeholder="PathLIMS Diagnostics"
                                    />
                                </div>
                            </div>

                            {/* Quick Templates */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Quick Templates (Click to apply)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(PREBUILT_TEMPLATES).map(([key, preset]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => applyPreset(key)}
                                            className={`px-3.5 py-2 text-sm ${formData.name === preset.name
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                } rounded-lg transition border`}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
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
                                    {Object.entries(COLOR_PRESETS).map(([colorKey, colors]) => (
                                        <button
                                            key={colorKey}
                                            type="button"
                                            onClick={() => applyColorPreset(colorKey)}
                                            className={`w-12 h-12 rounded-full border-2 ${formData.primary_color === colors.primary
                                                    ? 'border-blue-500 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-gray-800'
                                                    : 'border-transparent hover:border-gray-300'
                                                } transition-all`}
                                            style={{
                                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                                            }}
                                            title={`${colorKey.charAt(0).toUpperCase() + colorKey.slice(1)} Theme`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Primary Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.primary_color}
                                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                            className="w-12 h-11 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primary_color}
                                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                            className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Secondary Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.secondary_color}
                                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                            className="w-12 h-11 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700"
                                        />
                                        <input
                                            type="text"
                                            value={formData.secondary_color}
                                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                            className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Live CSS Preview */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    CSS Styles (Advanced)
                                </label>
                                <textarea
                                    value={formData.css_styles}
                                    onChange={(e) => setFormData({ ...formData, css_styles: e.target.value })}
                                    rows={5}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm transition"
                                    placeholder="/* Enter custom CSS styles here */"
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'sections' && (
                        <div className="space-y-3">
                            {/* Patient Info Toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition cursor-pointer"
                                onClick={() => setFormData({ ...formData, show_patient_info: !formData.show_patient_info })}>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">👤</span>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient Information</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Show patient details section</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={`w-11 h-6 rounded-full transition ${formData.show_patient_info ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`block w-5 h-5 rounded-full bg-white transition transform ${formData.show_patient_info ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* Reference Range Toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition cursor-pointer"
                                onClick={() => setFormData({ ...formData, show_reference_range: !formData.show_reference_range })}>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">📊</span>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reference Range</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Show reference ranges in results table</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={`w-11 h-6 rounded-full transition ${formData.show_reference_range ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`block w-5 h-5 rounded-full bg-white transition transform ${formData.show_reference_range ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* Signatures Toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition cursor-pointer"
                                onClick={() => setFormData({ ...formData, show_signatures: !formData.show_signatures })}>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">✍️</span>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Signatures</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Show signature section</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={`w-11 h-6 rounded-full transition ${formData.show_signatures ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`block w-5 h-5 rounded-full bg-white transition transform ${formData.show_signatures ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* Footer Toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition cursor-pointer"
                                onClick={() => setFormData({ ...formData, show_footer: !formData.show_footer })}>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">📌</span>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Footer</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Show footer section</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={`w-11 h-6 rounded-full transition ${formData.show_footer ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`block w-5 h-5 rounded-full bg-white transition transform ${formData.show_footer ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* Footer Text Editor */}
                            {formData.show_footer && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Footer Text
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.footer_config?.text || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            footer_config: { ...formData.footer_config, text: e.target.value }
                                        })}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
                                        placeholder="Footer message"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Version
                                    </label>
                                    <input
                                        type="number"
                                        value={template?.version || 1}
                                        disabled
                                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-incremented on each update</p>
                                </div>
                                <div className="flex items-center gap-6 pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_default}
                                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set as Default</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <span className="text-lg">⚠️</span>
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Template Management</p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                            Making this template default will apply it to all new reports.
                                            Setting it as inactive will hide it from the template selection list.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {mode === 'edit' && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span>🆔 ID:</span>
                                        <span className="font-mono text-xs">{template?.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <span>📅 Created:</span>
                                        <span>{template?.created_at ? new Date(template.created_at).toLocaleString() : 'N/A'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between gap-3 flex-shrink-0">
                    <div>
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
                            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
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