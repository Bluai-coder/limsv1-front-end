import { useState } from 'react';
import { X, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { useInstruments, useCreateInterface } from '@/hooks/use-instruments';

export default function IntegrationConfigModal({ instrumentId, onClose }) {
  const [selectedInstrument, setSelectedInstrument] = useState(instrumentId || '');
  const [protocol, setProtocol] = useState('HL7');
  
  // Connection settings state
  const [hl7Host, setHl7Host] = useState('');
  const [hl7Port, setHl7Port] = useState('');
  
  const [serialPort, setSerialPort] = useState('');
  const [serialBaud, setSerialBaud] = useState('9600');
  const [serialDataBits, setSerialDataBits] = useState('8');
  
  const [restUrl, setRestUrl] = useState('');
  const [restToken, setRestToken] = useState('');

  const { data: instrumentsData } = useInstruments({ limit: 100 });
  const instruments = instrumentsData?.data || [];
  const createInterface = useCreateInterface();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstrument) {
      toast.error('Please select an instrument');
      return;
    }
    
    let connection_settings = {};
    if (protocol === 'HL7') connection_settings = { host: hl7Host, port: hl7Port };
    else if (protocol === 'Serial') connection_settings = { port: serialPort, baud: serialBaud, data_bits: serialDataBits };
    else if (protocol === 'REST') connection_settings = { url: restUrl, token: restToken };

    try {
      await createInterface.mutateAsync({
        id: selectedInstrument,
        data: {
          interface_type: protocol,
          connection_settings,
          status: 'disconnected'
        }
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configure Integration</h3>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Protocol</label>
            <div className="flex gap-2">
              {['HL7', 'Serial', 'REST'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProtocol(p)}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${
                    protocol === p
                      ? 'border-[#1b4dff] bg-blue-50 dark:bg-[#1b4dff]/20 text-[#1b4dff] dark:text-[#1b4dff]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {protocol === 'HL7' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Host/IP Address</label>
                <input required value={hl7Host} onChange={(e) => setHl7Host(e.target.value)} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="192.168.1.100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Port</label>
                <input required value={hl7Port} onChange={(e) => setHl7Port(e.target.value)} type="number" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="2575" />
              </div>
            </div>
          )}

          {protocol === 'Serial' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">COM Port</label>
                <input required value={serialPort} onChange={(e) => setSerialPort(e.target.value)} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="COM3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Baud Rate</label>
                  <select value={serialBaud} onChange={(e) => setSerialBaud(e.target.value)} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option>9600</option>
                    <option>19200</option>
                    <option>38400</option>
                    <option>115200</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Bits</label>
                  <select value={serialDataBits} onChange={(e) => setSerialDataBits(e.target.value)} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option>8</option>
                    <option>7</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {protocol === 'REST' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint URL</label>
                <input required value={restUrl} onChange={(e) => setRestUrl(e.target.value)} type="url" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="https://api.instrument.local/v1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key / Token</label>
                <input value={restToken} onChange={(e) => setRestToken(e.target.value)} type="password" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1b4dff] outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="Optional" />
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95">
              <Link2 className="w-4 h-4" /> Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
