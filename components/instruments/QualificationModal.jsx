import { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useInstruments, useCreateQualification } from '@/hooks/use-instruments';

export default function QualificationModal({ instrumentId, onClose }) {
  const [selectedInstrument, setSelectedInstrument] = useState(instrumentId || '');
  const [formData, setFormData] = useState({
    qualification_type: 'IQ',
    date_performed: new Date().toISOString().split('T')[0],
    performed_by: '',
    status: 'Pass',
  });

  const { data: instrumentsData } = useInstruments({ limit: 100 });
  const instruments = instrumentsData?.data || [];
  const createQualification = useCreateQualification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstrument) {
      toast.error('Please select an instrument');
      return;
    }
    try {
      await createQualification.mutateAsync({
        id: selectedInstrument,
        data: formData
      });
      onClose();
    } catch (err) {
      // toast handled in hook
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Qualification (IQ/OQ/PQ)</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!instrumentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instrument</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
              >
                <option value="">Select Instrument...</option>
                {instruments.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name} ({inst.model || 'N/A'})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification Type</label>
            <select
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={formData.qualification_type}
              onChange={(e) => setFormData({ ...formData, qualification_type: e.target.value })}
            >
              <option value="IQ">Installation Qualification (IQ)</option>
              <option value="OQ">Operational Qualification (OQ)</option>
              <option value="PQ">Performance Qualification (PQ)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={formData.date_performed}
              onChange={(e) => setFormData({ ...formData, date_performed: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Performed By</label>
            <input
              required
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              value={formData.performed_by}
              onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
              placeholder="Name or ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <CheckSquare className="w-4 h-4" /> Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
