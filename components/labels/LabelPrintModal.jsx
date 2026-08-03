'use client';

import React, { useState } from 'react';
import { X, Printer, Minus, Plus } from 'lucide-react';
import SpecimenLabel from './SpecimenLabel';
import WasteLabel from './WasteLabel';

export default function LabelPrintModal({ isOpen, onClose, labelType, labelData }) {
  const [size, setSize] = useState(labelType === 'specimen' ? 'tube' : 'bag');
  const [copies, setCopies] = useState(1);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Label
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Controls */}
          <div className="w-full md:w-72 bg-gray-50 dark:bg-gray-800/50 p-6 border-r border-gray-200 dark:border-gray-800 flex flex-col gap-6 overflow-y-auto">
            {/* Size Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Label Size</label>
              <div className="flex flex-col gap-2">
                {labelType === 'specimen' ? (
                  <>
                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
                      <input type="radio" name="labelSize" value="tube" checked={size === 'tube'} onChange={() => setSize('tube')} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-900 dark:text-white">Tube Label (96x240)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
                      <input type="radio" name="labelSize" value="bag" checked={size === 'bag'} onChange={() => setSize('bag')} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-900 dark:text-white">Bag Label (192x384)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
                      <input type="radio" name="labelSize" value="page" checked={size === 'page'} onChange={() => setSize('page')} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-900 dark:text-white">Full Page (A4)</span>
                    </label>
                  </>
                ) : (
                  <>
                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
                      <input type="radio" name="labelSize" value="bag" checked={size === 'bag'} onChange={() => setSize('bag')} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-900 dark:text-white">Bag Label (192x384)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
                      <input type="radio" name="labelSize" value="page" checked={size === 'page'} onChange={() => setSize('page')} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-900 dark:text-white">Full Page (A4)</span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Copies */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Copies</label>
              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setCopies(Math.max(1, copies - 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-medium">{copies}</span>
                <button 
                  onClick={() => setCopies(Math.min(10, copies + 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-6 space-y-3">
              <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Printer className="w-5 h-5" />
                Print {copies} {copies === 1 ? 'Copy' : 'Copies'}
              </button>
              <button 
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-200 dark:bg-gray-950 p-8 overflow-auto flex items-center justify-center min-h-[400px]">
            <div className="bg-white shadow-md p-8 relative flex flex-wrap gap-4 justify-center items-start">
              <div className="absolute top-2 left-2 text-xs text-gray-400">Live Preview</div>
              {Array.from({ length: copies }).map((_, i) => (
                <div key={i} className="specimen-label-container shadow-sm border border-gray-100">
                  {labelType === 'specimen' ? (
                    <SpecimenLabel {...labelData} labelSize={size} />
                  ) : (
                    <WasteLabel {...labelData} labelSize={size} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
