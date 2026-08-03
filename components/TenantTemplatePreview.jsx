// components/AdminTemplatePreview.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Download, Printer } from 'lucide-react';
import { usePreviewtenantTemplate } from '../hooks/use-tenant-templates-pdf';

export default function TenantTemplatePreview({ isOpen, onClose, template }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const previewTemplate = usePreviewtenantTemplate();

    useEffect(() => {
        if (isOpen && template) {
            fetchPreview();
        }
    }, [isOpen, template]);

    const fetchPreview = async () => {
        const blob = await previewTemplate.mutateAsync(template.id);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
    };

    const handlePrint = () => {
        const printWindow = window.open(previewUrl);
        printWindow?.print();
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = `${template?.name || 'template'}.pdf`;
        link.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Template Preview</h2>
                        <p className="text-blue-100 text-sm">{template?.name} (v{template?.version})</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 text-white/80 hover:text-white transition"
                            title="Print"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 text-white/80 hover:text-white transition"
                            title="Download PDF"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/80 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Preview Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    {previewTemplate.isPending ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : previewUrl ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-[70vh] border-0 rounded-lg"
                            title="Template Preview"
                        />
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            Unable to load preview
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}