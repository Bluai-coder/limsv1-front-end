

// components/TestCatalogUploadForm.jsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle,
    Loader2,
    Download,
    Trash2,
    Eye,
    AlertCircle,
    FileText,
    Database,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Plus
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useUploadAdminFile, useAdminUploads, useDeleteAdminUpload, useAdminUploadData } from '@/hooks/useAdminFileUpload';
import AdminAddTestModal from './AdminAddTestModal';

// View Data Modal Component
const ViewDataModal = ({ isOpen, onClose, uploadId, uploadName }) => {
    const { data: uploadData, isLoading } = useAdminUploadData(uploadId);
    const [expandedRows, setExpandedRows] = useState({});
    const [activeTab, setActiveTab] = useState('json');

    const toggleRowExpand = (index) => {
        setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
    };

    if (!isOpen) return null;

    const jsonData = uploadData?.data || [];
    const totalRecords = uploadData?.total_records || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden mx-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Upload Details</h2>
                        <p className="text-blue-100 text-sm mt-1">File: {uploadName}</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                    <button
                        onClick={() => setActiveTab('json')}
                        className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'json'
                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        JSON View
                    </button>
                    <button
                        onClick={() => setActiveTab('table')}
                        className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'table'
                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Table View
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : activeTab === 'json' ? (
                        <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 overflow-x-auto">
                            <pre className="text-sm text-gray-300 dark:text-gray-400 font-mono whitespace-pre-wrap">
                                {JSON.stringify(jsonData, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Total Tests: <span className="font-semibold text-gray-700 dark:text-gray-300">{totalRecords}</span>
                            </div>
                            {jsonData.map((test, idx) => (
                                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <div
                                        className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                        onClick={() => toggleRowExpand(idx)}
                                    >
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="px-2 py-1 text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                                    {test.code}
                                                </span>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{test.name}</h3>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">₹{test.price}</span>
                                            </div>
                                            <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span>{test.department}</span>
                                                <span>{test.specimen_type}</span>
                                                <span>Analytes: {test.analytes?.length || 0}</span>
                                            </div>
                                        </div>
                                        {expandedRows[idx] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>

                                    {expandedRows[idx] && (
                                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div><span className="text-gray-500 dark:text-gray-400">Display Name:</span> <span className="font-medium text-gray-900 dark:text-white">{test.display_name || '-'}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Department:</span> <span className="font-medium text-gray-900 dark:text-white">{test.department || '-'}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Sub Department:</span> <span className="font-medium text-gray-900 dark:text-white">{test.sub_department || '-'}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Specimen Type:</span> <span className="font-medium text-gray-900 dark:text-white">{test.specimen_type || '-'}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Specimen Volume:</span> <span className="font-medium text-gray-900 dark:text-white">{test.specimen_volume_ml || '-'} ml</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Container Type:</span> <span className="font-medium text-gray-900 dark:text-white">{test.container_type || '-'}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Method:</span> <span className="font-medium text-gray-900 dark:text-white">{test.method || '-'}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">TAT Hours:</span> <span className="font-medium text-gray-900 dark:text-white">{test.tat_hours || '-'}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Result Type:</span> <span className="font-medium text-gray-900 dark:text-white">{test.result_type || '-'}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Price:</span> <span className="font-medium text-gray-900 dark:text-white">₹{test.price || 0}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Requires Fasting:</span> <span className="font-medium text-gray-900 dark:text-white">{test.requires_fasting ? 'Yes' : 'No'}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Sort Order:</span> <span className="font-medium text-gray-900 dark:text-white">{test.sort_order || '-'}</span></div>
                                            </div>

                                            {test.analytes && test.analytes.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Analytes</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-gray-100 dark:bg-gray-800">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Code</th>
                                                                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Name</th>
                                                                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Unit</th>
                                                                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Sequence</th>
                                                                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Ref Low</th>
                                                                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Ref High</th>
                                                                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Critical Low</th>
                                                                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Critical High</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                {test.analytes.map((analyte, aIdx) => (
                                                                    <tr key={aIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                                        <td className="px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">{analyte.code}</td>
                                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{analyte.name}</td>
                                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{analyte.unit || '-'}</td>
                                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{analyte.sequence}</td>
                                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{analyte.ref_low ?? '-'}</td>
                                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{analyte.ref_high ?? '-'}</td>
                                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{analyte.critical_low ?? '-'}</td>
                                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{analyte.critical_high ?? '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function TestCatalogUploadForm() {
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [preview, setPreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedUpload, setSelectedUpload] = useState(null);
    const [addTestModalOpen, setAddTestModalOpen] = useState(false);

    const { mutate: uploadFile, isPending: uploading } = useUploadAdminFile();
    const { data: uploadsData, refetch } = useAdminUploads();
    const { mutate: deleteUpload } = useDeleteAdminUpload();

    const uploads = uploadsData?.data || [];
    const allTests = uploads.flatMap(upload => upload.data || []);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setValidationErrors([]);
            previewFile(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv'],
            'application/json': ['.json'],
        },
        maxFiles: 1,
        maxSize: 50 * 1024 * 1024,
    });

    const previewFile = (selectedFile) => {
        setIsPreviewLoading(true);
        const fileExt = selectedFile.name.split('.').pop().toLowerCase();

        if (fileExt === 'json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    setPreview({
                        total_rows: Array.isArray(jsonData) ? jsonData.length : 1,
                        valid_rows: Array.isArray(jsonData) ? jsonData.length : 1,
                        invalid_rows: 0,
                    });
                    setValidationErrors([]);
                } catch (error) {
                    toast.error('Invalid JSON file');
                    setPreview({ total_rows: 0, valid_rows: 0, invalid_rows: 1 });
                } finally {
                    setIsPreviewLoading(false);
                }
            };
            reader.readAsText(selectedFile);
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    let jsonData = XLSX.utils.sheet_to_json(worksheet);
                    const hasJsonDataColumn = jsonData.length > 0 && 'json_data' in jsonData[0];
                    let validRows = 0;
                    let invalidRows = 0;
                    const errors = [];

                    if (hasJsonDataColumn) {
                        jsonData.forEach((row, index) => {
                            try {
                                const parsedData = JSON.parse(row.json_data);
                                if (parsedData && (parsedData.code || parsedData.name)) {
                                    validRows++;
                                } else {
                                    invalidRows++;
                                    errors.push({ row: index + 1, errors: ['Invalid JSON structure'] });
                                }
                            } catch (parseError) {
                                invalidRows++;
                                errors.push({ row: index + 1, errors: ['Invalid JSON format'] });
                            }
                        });
                    } else {
                        jsonData.forEach((row, index) => {
                            const rowErrors = [];
                            const testCode = row['Test Code'] || row.code || row.test_code;
                            const testName = row['Test Name'] || row.name || row.test_name;
                            if (!testCode) rowErrors.push('Test Code is required');
                            if (!testName) rowErrors.push('Test Name is required');
                            if (rowErrors.length > 0) {
                                errors.push({ row: index + 1, errors: rowErrors });
                                invalidRows++;
                            } else {
                                validRows++;
                            }
                        });
                    }

                    setPreview({
                        total_rows: jsonData.length,
                        valid_rows: validRows,
                        invalid_rows: invalidRows,
                        hasJsonDataColumn
                    });
                    setValidationErrors(errors);
                } catch (error) {
                    console.error('Preview error:', error);
                    toast.error('Failed to preview file');
                    setPreview({ total_rows: 0, valid_rows: 0, invalid_rows: 0 });
                } finally {
                    setIsPreviewLoading(false);
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleUpload = () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 500);

        const formData = new FormData();
        formData.append('file', file);

        uploadFile(formData, {
            onSuccess: () => {
                clearInterval(interval);
                setUploadProgress(100);
                setFile(null);
                setPreview(null);
                setValidationErrors([]);
                refetch();
                toast.success('File uploaded successfully!');
                setTimeout(() => setUploadProgress(0), 1000);
            },
            onError: (error) => {
                clearInterval(interval);
                setUploadProgress(0);
                toast.error(error?.response?.data?.message || 'Upload failed');
            },
        });
    };

    const downloadTemplate = () => {
        const templateData = [{
            "json_data": JSON.stringify({
                "code": "CBC", "name": "Complete Blood Count", "display_name": "CBC",
                "department": "Hematology", "sub_department": "Routine", "specimen_type": "whole blood",
                "specimen_volume_ml": 2, "container_type": "EDTA", "method": "Automated Analyzer",
                "tat_hours": 2, "result_type": "panel", "analytes": [
                    { "code": "HB", "name": "Hemoglobin", "unit": "g/dL", "sequence": 1, "ref_low": 12.0, "ref_high": 16.0, "critical_low": 7.0, "critical_high": 20.0 }
                ], "price": 500, "is_orderable": true, "is_active": true, "requires_fasting": false, "sort_order": 1
            })
        }];
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
        XLSX.writeFile(workbook, 'test_catalog_template.xlsx');
        toast.success('Template downloaded');
    };

    const removeFile = () => {
        setFile(null);
        setPreview(null);
        setValidationErrors([]);
        setUploadProgress(0);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this upload?')) {
            deleteUpload(id, { onSuccess: () => refetch() });
        }
    };

    const handleAddTest = async (newTest) => {
        console.log('New Test:', newTest);
        toast.success(`Test "${newTest.code}" added successfully!`);
        refetch();
    };

    const getStatusBadge = (status) => {
        if (status === 'completed') {
            return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"><CheckCircle className="w-3 h-3" /> Completed</span>;
        }
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>;
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                <div className="mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
                                    <Database className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Test Catalog</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bulk upload tests and analytes using Excel, CSV, or JSON file</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAddTestModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                <Plus className="w-4 h-4" /> Add New Test
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upload Area */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'} ${file ? 'bg-green-50 dark:bg-green-900/10 border-green-500' : ''}`}>
                                        <input {...getInputProps()} />
                                        {!file ? (
                                            <>
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><FileSpreadsheet className="w-8 h-8 text-blue-600" /></div>
                                                <p className="text-gray-600 dark:text-gray-400 mb-2">{isDragActive ? 'Drop your file here' : 'Drag & drop your Excel/CSV/JSON file here'}</p>
                                                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                                                <div className="flex justify-center gap-2 text-xs text-gray-400"><span>✓ .xlsx, .xls, .csv</span><span>•</span><span>✓ .json</span><span>•</span><span>✓ Max 50MB</span></div>
                                                <div className="mt-3 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded"><p className="font-medium">📌 For JSON data, use CSV with single column named 'json_data'</p><p>Each row's json_data should contain a valid JSON object of a test</p></div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><FileText className="w-8 h-8 text-green-600" /></div>
                                                <p className="font-medium text-gray-900 dark:text-white mb-1">{file.name}</p>
                                                <p className="text-sm text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                <button onClick={removeFile} className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 mx-auto"><Trash2 className="w-3 h-3" /> Remove file</button>
                                            </>
                                        )}
                                    </div>

                                    {uploading && (
                                        <div className="mt-6">
                                            <div className="flex justify-between text-sm mb-2"><span className="text-gray-600 dark:text-gray-400">Uploading...</span><span className="text-gray-600 dark:text-gray-400">{uploadProgress}%</span></div>
                                            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>
                                        </div>
                                    )}

                                    {file && !uploading && (
                                        <div className="mt-6 flex gap-3">
                                            <button onClick={removeFile} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                                            <button onClick={handleUpload} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"><Upload className="w-4 h-4" /> Upload & Process</button>
                                        </div>
                                    )}
                                </div>

                                {validationErrors.length > 0 && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                                        <div className="flex items-center gap-2 mb-4"><AlertCircle className="w-5 h-5 text-red-500" /><h3 className="font-semibold text-gray-900 dark:text-white">Validation Issues ({validationErrors.length})</h3></div>
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {validationErrors.slice(0, 10).map((error, idx) => (
                                                <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm"><p className="font-medium text-red-800 dark:text-red-300">Row {error.row}</p><p className="text-red-700 dark:text-red-400 text-xs mt-1">{error.errors.join(', ')}</p></div>
                                            ))}
                                            {validationErrors.length > 10 && <p className="text-sm text-gray-500 text-center pt-2">+ {validationErrors.length - 10} more issues</p>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upload History Table */}
                            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload History</h2></div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-900/50"><tr><th className="px-6 py-3 text-left text-gray-600 dark:text-gray-400">File Name</th><th className="px-6 py-3 text-left text-gray-600 dark:text-gray-400">Records</th><th className="px-6 py-3 text-left text-gray-600 dark:text-gray-400">Status</th><th className="px-6 py-3 text-left text-gray-600 dark:text-gray-400">Uploaded At</th><th className="px-6 py-3 text-center text-gray-600 dark:text-gray-400">Actions</th></tr></thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {uploads.map((upload) => (
                                                <tr key={upload.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{upload.file_name}</td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{upload.total_records}</td>
                                                    <td className="px-6 py-4">{getStatusBadge(upload.status)}</td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(upload.created_at).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => { setSelectedUpload(upload); setViewModalOpen(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" title="View Details"><Eye className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDelete(upload.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {uploads.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No uploads found</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Instructions Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-5 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Download Template</h2></div>
                                <div className="p-5"><p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Download our Excel/CSV template. Each row contains a JSON object in the 'json_data' column.</p><button onClick={downloadTemplate} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download Template (Excel)</button></div>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-5 border border-yellow-200 dark:border-yellow-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-yellow-600" /> CSV File Format</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your CSV file should have this structure:</p>
                                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono overflow-x-auto">json_data<br />{"{\"code\":\"CBC\",\"name\":\"Complete Blood Count\",...}"}</code>
                                <p className="text-xs text-gray-500 mt-3">Each cell in the 'json_data' column must contain a valid JSON object of a test with its analytes.</p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Instructions</h3>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /><span>Use the template for correct format</span></li>
                                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /><span>Each row = one complete test with all analytes</span></li>
                                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /><span>'json_data' column contains the entire test JSON</span></li>
                                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /><span>Supported formats: .xlsx, .xls, .csv, .json</span></li>
                                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /><span>Maximum file size: 50MB</span></li>
                                </ul>
                            </div>

                            {isPreviewLoading ? (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" /><p className="text-sm text-gray-500 mt-2">Previewing file...</p></div>
                            ) : preview && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="p-5 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">File Preview</h2></div>
                                    <div className="p-5">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"><span className="text-gray-500">Total Records:</span><span className="font-medium">{preview.total_rows}</span></div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"><span className="text-gray-500">Valid Records:</span><span className="font-medium text-green-600">{preview.valid_rows}</span></div>
                                            <div className="flex justify-between items-center py-2"><span className="text-gray-500">Invalid Records:</span><span className="font-medium text-red-600">{preview.invalid_rows}</span></div>
                                            {preview.hasJsonDataColumn && <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded"><p className="text-xs text-green-700 dark:text-green-300">✓ Detected 'json_data' column format</p></div>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ViewDataModal isOpen={viewModalOpen} onClose={() => { setViewModalOpen(false); setSelectedUpload(null); }} uploadId={selectedUpload?.id} uploadName={selectedUpload?.file_name} />
            <AdminAddTestModal isOpen={addTestModalOpen} onClose={() => setAddTestModalOpen(false)} onSave={handleAddTest} existingTests={allTests} />
        </>
    );
}


