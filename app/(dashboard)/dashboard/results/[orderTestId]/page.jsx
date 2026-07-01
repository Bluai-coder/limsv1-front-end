
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Save, CheckCircle, AlertTriangle,
  ArrowLeft, ChevronLeft, ChevronRight, Zap,
  Menu, X, AlertCircle,
  TrendingDown, TrendingUp, Database, Network
} from "lucide-react";
import { toast } from "sonner";
import { useOrderTestWithResults, useSaveResults, useVerifyResult } from "@/hooks/use-results";
import { useAuthStore } from "@/lib/auth-store";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { PermissionDenied } from "@/components/PermissionGuard";
import DeviceScanner from "@/components/DeviceScanner";
import { api } from "@/lib/api";
import { useInstruments } from "@/hooks/use-instruments";

import {
  FlaskConical,
  Microscope,
  RotateCw,
  Thermometer,
  Activity,
  Monitor
} from 'lucide-react';

// ============================================================
// MACHINE CONNECTION MODAL COMPONENT (with Theme Support)
// ============================================================
// function MachineConnectionModal({ isOpen, onClose, onFetch, onScanNetwork, orderTest, entries }) {
//   const [connectionType, setConnectionType] = useState('mllp_receiver');
//   const [port, setPort] = useState('COM3');
//   const [baudRate, setBaudRate] = useState('9600');
//   const [host, setHost] = useState('127.0.0.1');
//   const [tcpPort, setTcpPort] = useState('2575');
//   const [ip, setIp] = useState('0.0.0.0');
//   const [testing, setTesting] = useState(false);
//   const [fetching, setFetching] = useState(false);
//   const [connected, setConnected] = useState(null);
//   const [showDeviceScanner, setShowDeviceScanner] = useState(false);

//   if (!isOpen) return null;

//   const handleTestConnection = async () => {
//     setTesting(true);
//     setConnected(null);
//     try {
//       const data = await api.post('/machine/test-connection', {
//         connectionType,
//         port,
//         baudRate: parseInt(baudRate),
//         host,
//         tcpPort: parseInt(tcpPort),
//         ip
//       })

//       console.log("datadatadata", data)
//       setConnected(data?.data?.success);
//       toast[data?.data?.success ? 'success' : 'error'](data?.data?.message);
//     } catch (error) {
//       setConnected(false);
//       toast.error('Connection test failed');
//     } finally {
//       setTesting(false);
//     }
//   };

//   const handleFetch = async () => {
//     setFetching(true);
//     await onFetch({
//       connectionType,
//       port,
//       baudRate: parseInt(baudRate),
//       host,
//       tcpPort: parseInt(tcpPort),
//       ip
//     });
//     setFetching(false);
//     onClose();
//   };

//   const handleDeviceSelect = (device) => {
//     setHost(device.host);
//     setTcpPort(device.port.toString());
//     setConnectionType(device.connectionType || 'tcp');
//     setShowDeviceScanner(false);
//     toast.success(`Selected device: ${device.host}:${device.port}`);
//   };

//   return (
//     <>
//       <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4">
//           <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
//                 <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect to Instrument</h3>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">{orderTest?.test?.name || 'Select analyzer'}</p>
//               </div>
//             </div>
//             <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
//               <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//             </button>
//           </div>

//           <div className="p-5 space-y-4">
//             {/* Scan Network Button */}
//             <button
//               onClick={() => setShowDeviceScanner(true)}
//               className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition"
//             >
//               <Network className="w-4 h-4" />
//               Search Network for Devices
//             </button>

//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
//               </div>
//               <div className="relative flex justify-center text-xs">
//                 <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
//               </div>
//             </div>

//             {/* Connection Type */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Connection Type
//               </label>
//               <select
//                 value={connectionType}
//                 onChange={(e) => setConnectionType(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
//               >
//                 {/* <option value="serial">Serial Port (RS-232)</option> */}
//                 <option value="tcp">TCP/IP</option>
//                 <option value="mllp_receiver">Mllp receiver</option>
//                 <option value="hl7">HL7</option>
//               </select>
//             </div>

//             {/* Serial Port Settings */}
//             {connectionType === 'serial' && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     COM Port
//                   </label>
//                   <input
//                     type="text"
//                     value={port}
//                     onChange={(e) => setPort(e.target.value)}
//                     placeholder="COM3"
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Baud Rate
//                   </label>
//                   <select
//                     value={baudRate}
//                     onChange={(e) => setBaudRate(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
//                   >
//                     <option value="9600">9600</option>
//                     <option value="19200">19200</option>
//                     <option value="38400">38400</option>
//                     <option value="57600">57600</option>
//                     <option value="115200">115200</option>
//                   </select>
//                 </div>
//               </>
//             )}

//             {/* TCP/IP Settings */}
//             {(connectionType === 'tcp' || connectionType === 'hl7' || connectionType === 'mllp_receiver') && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     {connectionType === 'hl7' ? 'IP Address' : 'Host'}
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={connectionType === 'hl7' ? ip : host}
//                       onChange={(e) => connectionType === 'hl7' ? setIp(e.target.value) : setHost(e.target.value)}
//                       placeholder={connectionType === 'hl7' ? '192.168.1.100' : 'localhost'}
//                       className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Port
//                   </label>
//                   <input
//                     type="number"
//                     value={tcpPort}
//                     onChange={(e) => setTcpPort(e.target.value)}
//                     placeholder="5000"
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
//                   />
//                 </div>
//               </>
//             )}

//             {/* Connection Status */}
//             {connected !== null && (
//               <div className={`p-3 rounded-xl ${connected ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
//                 <div className="flex items-center gap-2">
//                   {connected ? (
//                     <>
//                       <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
//                       </svg>
//                       <span className="text-sm text-green-700 dark:text-green-300">Connected successfully</span>
//                     </>
//                   ) : (
//                     <>
//                       <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728" />
//                       </svg>
//                       <span className="text-sm text-red-700 dark:text-red-300">Connection failed</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
//             <button
//               onClick={handleTestConnection}
//               disabled={testing}
//               className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
//             >
//               {testing ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
//               Test Connection
//             </button>
//             <button
//               onClick={handleFetch}
//               disabled={fetching}
//               className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2"
//             >
//               {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
//               Fetch Results
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Device Scanner Modal */}
//       {showDeviceScanner && (
//         <DeviceScanner
//           onDeviceSelect={handleDeviceSelect}
//           onClose={() => setShowDeviceScanner(false)}
//         />
//       )}
//     </>
//   );
// }





function MachineConnectionModal({ isOpen, onClose, onFetch, onScanNetwork, orderTest, entries, instruments }) {
  const [connectionType, setConnectionType] = useState('mllp_receiver');
  const [port, setPort] = useState('COM3');
  const [baudRate, setBaudRate] = useState('9600');
  const [host, setHost] = useState('127.0.0.1');
  const [tcpPort, setTcpPort] = useState('2575');
  const [ip, setIp] = useState('0.0.0.0');
  const [testing, setTesting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [connected, setConnected] = useState(null);
  const [showDeviceScanner, setShowDeviceScanner] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null)


  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setConnected(null);
    try {
      const data = await api.post('/machine/test-connection', {
        connectionType,
        port,
        baudRate: parseInt(baudRate),
        host,
        tcpPort: parseInt(tcpPort),
        ip
      })

      setConnected(data?.data?.success);
      toast[data?.data?.success ? 'success' : 'error'](data?.data?.message);
    } catch (error) {
      setConnected(false);
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleFetch = async () => {
    setFetching(true);
    await onFetch({
      connectionType,
      port,
      baudRate: parseInt(baudRate),
      host,
      tcpPort: parseInt(tcpPort),
      ip
    });
    setFetching(false);
    onClose();
  };

  const handleDeviceSelect = (device) => {
    setHost(device.host);
    setTcpPort(device.port.toString());
    setConnectionType(device.connectionType || 'tcp');
    setShowDeviceScanner(false);
    toast.success(`Selected device: ${device.host}:${device.port}`);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect to Instrument</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{orderTest?.test?.name || 'Select analyzer'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Scan Network Button */}
            <button
              onClick={() => setShowDeviceScanner(true)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Network className="w-4 h-4" />
              Search Network for Devices
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
              </div>
            </div>

            <div>
              {instruments?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    Instruments Found ({instruments.length})
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {instruments?.map((item, idx) => (
                      <div
                        key={idx}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedInstrument?.id === item.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        onClick={() => setSelectedInstrument(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {/* Instrument Icon */}
                              {item.instrument_type === 'analyzer' && (
                                <FlaskConical className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                              )}
                              {item.instrument_type === 'microscope' && (
                                <Microscope className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                              )}
                              {item.instrument_type === 'centrifuge' && (
                                <RotateCw className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                              )}
                              {item.instrument_type === 'incubator' && (
                                <Thermometer className="w-5 h-5 text-red-500 dark:text-red-400" />
                              )}
                              {item.instrument_type === 'spectrometer' && (
                                <Activity className="w-5 h-5 text-green-500 dark:text-green-400" />
                              )}
                              {!['analyzer', 'microscope', 'centrifuge', 'incubator', 'spectrometer'].includes(item.instrument_type) && (
                                <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              )}

                              <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>

                              {item.status === 'active' && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Active</span>
                              )}
                              {item.status === 'maintenance' && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">Maintenance</span>
                              )}
                              {item.status === 'inactive' && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">Inactive</span>
                              )}
                              {item.status === 'decommissioned' && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">Decommissioned</span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1">
                              {item?.model && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Model: <span className="font-mono text-gray-800 dark:text-gray-200">{item.model}</span>
                                </span>
                              )}
                              {item?.department && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Dept: <span className="text-gray-800 dark:text-gray-200">{item.department}</span>
                                </span>
                              )}
                              {item?.location && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  📍 {item.location}
                                </span>
                              )}
                            </div>

                            {item?.manufacturer && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Manufacturer: {item.manufacturer}
                                </span>
                                {item.serial_number && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    | SN: {item.serial_number}
                                  </span>
                                )}
                              </div>
                            )}

                            {item.capabilities && Object.keys(item.capabilities).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.keys(item.capabilities).map((key, idx2) => (
                                  <span key={idx2} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                    {key}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0 ml-4">
                            {item.last_calibration && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Last Cal: <span className="text-gray-800 dark:text-gray-200">{new Date(item.last_calibration).toLocaleDateString()}</span>
                              </div>
                            )}
                            {item.next_calibration_due && (
                              <div className={`text-xs mt-1 ${new Date(item.next_calibration_due) < new Date()
                                ? 'text-red-500 dark:text-red-400 font-medium'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                Due: {new Date(item.next_calibration_due).toLocaleDateString()}
                                {new Date(item.next_calibration_due) < new Date() && (
                                  <span className="ml-1">⚠️ Overdue</span>
                                )}
                              </div>
                            )}
                            {!item.last_calibration && !item.next_calibration_due && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                No calibration data
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Connection Type */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Connection Type
              </label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="tcp">TCP/IP</option>
                <option value="mllp_receiver">Mllp receiver</option>
                <option value="hl7">HL7</option>
              </select>
            </div> */}

            {/* Serial Port Settings */}
            {/* {connectionType === 'serial' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    COM Port
                  </label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="COM3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Baud Rate
                  </label>
                  <select
                    value={baudRate}
                    onChange={(e) => setBaudRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="9600">9600</option>
                    <option value="19200">19200</option>
                    <option value="38400">38400</option>
                    <option value="57600">57600</option>
                    <option value="115200">115200</option>
                  </select>
                </div>
              </>
            )} */}

            {/* TCP/IP Settings */}
            {/* {(connectionType === 'tcp' || connectionType === 'hl7' || connectionType === 'mllp_receiver') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {connectionType === 'hl7' ? 'IP Address' : 'Host'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={connectionType === 'hl7' ? ip : host}
                      onChange={(e) => connectionType === 'hl7' ? setIp(e.target.value) : setHost(e.target.value)}
                      placeholder={connectionType === 'hl7' ? '192.168.1.100' : 'localhost'}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={tcpPort}
                    onChange={(e) => setTcpPort(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )} */}

            {/* Connection Status */}
            {/* {connected !== null && (
              <div className={`p-3 rounded-xl ${connected ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2">
                  {connected ? (
                    <>
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      <span className="text-sm text-green-700 dark:text-green-300">Connected successfully</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728" />
                      </svg>
                      <span className="text-sm text-red-700 dark:text-red-300">Connection failed</span>
                    </>
                  )}
                </div>
              </div>
            )} */}
          </div>

          <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
              Test Connection
            </button>
            <button
              onClick={handleFetch}
              disabled={fetching}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Fetch Results
            </button>
          </div>
        </div>
      </div>

      {/* Device Scanner Modal */}
      {showDeviceScanner && (
        <DeviceScanner
          onDeviceSelect={handleDeviceSelect}
          onClose={() => setShowDeviceScanner(false)}
        />
      )}
    </>
  );
}

// ============================================================
// MAIN RESULT ENTRY PAGE (with Full Theme Support)
// ============================================================
export default function ResultEntryPage() {
  const { canRead } = usePermissions();

  if (!canRead('Results Entry')) {
    return <PermissionDenied resource="Results Entry" action="read" />;
  }

  const { orderTestId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [fetchingFromMachine, setFetchingFromMachine] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);

  const inputRefs = useRef([]);
  const autoSaveTimeout = useRef(null);


  // Hooks
  const {
    data: orderTestData,
    isLoading,
    error,
    refetch
  } = useOrderTestWithResults(orderTestId);

  const { data } = useInstruments({
    q: undefined,
    page: 1,
    limit: 100,
  });

  const instruments = data?.data || [];

  const saveResults = useSaveResults();
  const verifyResult = useVerifyResult();

  const currentOrderTest = orderTestData?.data;
  const allOrderTests = currentOrderTest?.allOrderTests || [];
  const currentTestId = currentOrderTest?.id;
  const currentIndex = allOrderTests.findIndex((t) => t.id === currentTestId);
  const selectedTest = allOrderTests[selectedTestIdx] || allOrderTests[currentIndex] || null;

  // Build entries from API data with safety check
  useEffect(() => {
    // SAFETY CHECK: Ensure testResults is an array
    const testResults = currentOrderTest?.testResults;

    if (!testResults || !Array.isArray(testResults)) {
      setEntries([]);
      return;
    }

    const builtEntries = testResults.map((r) => ({
      id: r.id,
      analyteCode: r.analyte_code,
      analyteName: r.analyte_name,
      value: r.value || "",
      numericValue: r.numeric_value,
      unit: r.unit || "",
      referenceRangeText: r.reference_range_text,
      isCritical: r.is_critical || false,
      isDeltaExceeded: r.is_delta_exceeded || false,
      resultStatus: r.result_status || "preliminary",
      isAutoVerified: r.is_auto_verified || false,
      flag: r.flag || 'N',
      comment: r.comment || "",
    }));

    setEntries(builtEntries);
  }, [currentOrderTest?.testResults]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order data");
    }
  }, [error]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [selectedTestIdx]);

  // Auto-save function (debounced)
  const autoSaveResult = useCallback(async (resultId, value, numericValue) => {
    if (!value || value === "") return;

    try {
      await saveResults.mutateAsync({
        orderTestId: currentOrderTest?.id,
        results: [{
          id: resultId,
          analyte_code: entries.find(e => e.id === resultId)?.analyteCode,
          value: value,
          numeric_value: numericValue,
        }],
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [currentOrderTest?.id, saveResults, entries]);

  const handleValueChange = (index, value) => {
    const numericValue = parseFloat(value);

    setEntries((prev) =>
      prev.map((e, i) =>
        i === index
          ? { ...e, value, numericValue: isNaN(numericValue) ? null : numericValue }
          : e
      )
    );

    const resultId = entries[index]?.id;
    if (resultId && value && value !== "") {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      autoSaveTimeout.current = setTimeout(() => {
        autoSaveResult(resultId, value, numericValue);
      }, 1000);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const entry = entries[index];
      if (entry.value && entry.value !== "") {
        autoSaveResult(entry.id, entry.value, entry.numericValue);
      }
      if (index < entries.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Save all results manually
  const handleSaveResults = async () => {
    const filled = entries.filter((e) => e.value !== "" && e.value !== null);

    if (!filled.length) {
      toast.error("Enter at least one value");
      return;
    }

    setSaving(true);
    try {
      await saveResults.mutateAsync({
        orderTestId: currentOrderTest?.id,
        results: filled.map((e) => ({
          id: e.id,
          analyte_code: e.analyteCode,
          value: e.value,
          numeric_value: e.numericValue,
        })),
      });
      await refetch();
      toast.success("Results saved successfully");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Verify single result
  const handleVerifyResult = async (resultId) => {
    const entry = entries.find(e => e.id === resultId);

    if (!entry?.value || entry.value === "") {
      toast.error("Please enter a value before verifying");
      return;
    }

    if (entry.resultStatus === "final") {
      toast.info("Result already verified");
      return;
    }

    setVerifyingId(resultId);
    try {
      await verifyResult.mutateAsync(resultId);
      await refetch();
      toast.success("Result verified successfully");
    } catch (err) {
      console.error("Verify error:", err);
      toast.error(err?.message || "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleFetchFromMachine = async (connectionConfig) => {
    if (fetchingFromMachine) return;

    setFetchingFromMachine(true);
    const loadingToast = toast.loading(`Connecting to ${connectionConfig.host}:${connectionConfig.tcpPort}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const endpoint = "/machine/fetch-results";

      const response = await api.post(endpoint, {
        orderTestId: currentOrderTest?.id,
        testCode: currentOrderTest?.test?.code,
        analytes: entries.map(e => ({
          id: e.id,
          code: e.analyteCode,
          name: e.analyteName
        })),
        ...connectionConfig
      }, {
        signal: controller.signal,
        timeout: 5000
      });

      clearTimeout(timeoutId);

      if (response.data?.success && response.data?.results) {
        const { results } = response.data;
        console.log("resultsresults", results)

        if (results.length > 0) {
          const updatedEntries = [...entries];
          let updatesCount = 0;

          results.forEach((machineResult) => {
            const entryIndex = updatedEntries.findIndex(
              e => e.analyteCode === machineResult.analyteCode
            );

            if (entryIndex !== -1 && machineResult.value) {
              updatedEntries[entryIndex] = {
                ...updatedEntries[entryIndex],
                value: machineResult.value,
                numericValue: parseFloat(machineResult.value),
                unit: machineResult.unit || updatedEntries[entryIndex].unit,
                isCritical: machineResult.isCritical || false,
              };
              updatesCount++;
              autoSaveResult(updatedEntries[entryIndex].id, machineResult.value, parseFloat(machineResult.value));
            }
          });





          setEntries(updatedEntries);
          toast.success(`Fetched results`, { id: loadingToast });
          await refetch();
        } else {
          toast.warning("No results received", { id: loadingToast });
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      clearTimeout(timeoutId);

      let errorMsg = "Failed to fetch";
      if (err.name === 'AbortError') {
        errorMsg = "Request timeout";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      toast.error(errorMsg, { id: loadingToast });
      console.error("Fetch error:", err);
    } finally {
      setFetchingFromMachine(false);
    }
  };

  const getFlagDisplay = (flag) => {
    switch (flag) {
      case 'LL':
        return { text: 'CRITICAL LOW', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: <AlertTriangle className="w-3 h-3" /> };
      case 'HH':
        return { text: 'CRITICAL HIGH', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: <AlertTriangle className="w-3 h-3" /> };
      case 'L':
        return { text: 'LOW', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300', icon: <TrendingDown className="w-3 h-3" /> };
      case 'H':
        return { text: 'HIGH', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300', icon: <TrendingUp className="w-3 h-3" /> };
      case 'A':
        return { text: 'ABNORMAL', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: <AlertTriangle className="w-3 h-3" /> };
      default:
        return { text: 'NORMAL', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: <CheckCircle className="w-3 h-3" /> };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!currentOrderTest) {
    return (
      <div className="text-center py-12 px-4">
        <AlertTriangle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No order found</p>
        <Link href="/dashboard/worklist" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">
          Return to Worklist
        </Link>
      </div>
    );
  }

  const hasCritical = entries.some((e) => e.isCritical);
  const hasDelta = entries.some((e) => e.isDeltaExceeded);
  const allValuesEntered = entries.length > 0 && entries.every((e) => e.value !== "" && e.value !== null);
  const allFinal = entries.every((e) => e.resultStatus === "final");
  const canAutoVerify = allValuesEntered && !hasCritical && !hasDelta && !allFinal;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Machine Connection Modal */}
      {showMachineModal && (
        <MachineConnectionModal
          isOpen={showMachineModal}
          onClose={() => setShowMachineModal(false)}
          onFetch={handleFetchFromMachine}
          orderTest={currentOrderTest}
          entries={entries}
          instruments={instruments}
        />
      )}

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/worklist" className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Result Entry</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                {currentOrderTest?.order?.order_number}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMachineModal(true)}
              disabled={fetchingFromMachine}
              className="p-2 text-purple-600 dark:text-purple-400 disabled:opacity-50"
              title="Get Result from Machine"
            >
              {fetchingFromMachine ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSaveResults}
              disabled={saving}
              className="p-2 text-blue-600 dark:text-blue-400 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
            {canAutoVerify && (
              <button
                onClick={() => { }}
                disabled={autoVerifying}
                className="p-2 text-green-600 dark:text-green-400"
              >
                {autoVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -mr-2"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-900 dark:text-white" /> : <Menu className="w-5 h-5 text-gray-900 dark:text-white" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/worklist" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Result Entry</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order #{currentOrderTest?.order?.order_number} | Patient: {currentOrderTest?.order?.patient?.firstName} {currentOrderTest?.order?.patient?.lastName} | {currentOrderTest?.order?.patient?.mrn}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMachineModal(true)}
              disabled={fetchingFromMachine}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50"
            >
              {fetchingFromMachine ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Get Result from Machine
            </button>
            <button
              onClick={handleSaveResults}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>
            {canAutoVerify && (
              <button
                onClick={() => { }}
                disabled={autoVerifying}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50"
              >
                {autoVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Auto-Verify
              </button>
            )}
          </div>
        </div>

        {/* Alert Banners with Theme Support */}
        {(hasCritical || hasDelta) && (
          <div className="mb-4">
            {hasCritical && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 lg:p-4 mb-2">
                <div className="flex items-center gap-2 lg:gap-3">
                  <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm lg:text-base text-red-800 dark:text-red-300 font-medium">
                    Critical value detected! Pathologist review required.
                  </p>
                </div>
              </div>
            )}
            {hasDelta && !hasCritical && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3 lg:p-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 dark:text-purple-400" />
                  <p className="text-sm lg:text-base text-purple-800 dark:text-purple-300 font-medium">
                    Delta check failed! Review required.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Test Switcher */}
        {allOrderTests.length > 1 && (
          <div className="lg:hidden mb-4">
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
              <button
                onClick={() => setSelectedTestIdx(Math.max(0, selectedTestIdx - 1))}
                disabled={selectedTestIdx === 0}
                className="p-2 rounded-lg disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedTest?.test?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedTestIdx + 1} of {allOrderTests.length}
                </p>
              </div>
              <button
                onClick={() => setSelectedTestIdx(Math.min(allOrderTests.length - 1, selectedTestIdx + 1))}
                disabled={selectedTestIdx === allOrderTests.length - 1}
                className="p-2 rounded-lg disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Test Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/50 dark:bg-black/70" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Ordered Tests</h3>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-60px)]">
                {allOrderTests.map((test, idx) => (
                  <button
                    key={test.id}
                    onClick={() => {
                      setSelectedTestIdx(idx);
                      setMobileMenuOpen(false);
                      router.push(`/dashboard/results/${test.id}`);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition ${test.id === currentTestId
                      ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{test.test?.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">{test.status}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Panel - Desktop Test List */}
          <div className="hidden lg:block lg:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-fit">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Ordered Tests ({allOrderTests.length})</h2>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {allOrderTests.map((test, idx) => (
                <div
                  key={test.id}
                  onClick={() => {
                    if (test.id !== currentTestId) {
                      router.push(`/dashboard/results/${test.id}`);
                    }
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${test.id === currentTestId
                    ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{test.test?.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">{test.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Result Entry */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 lg:px-6 lg:py-4">
              <h2 className="text-base lg:text-lg font-semibold text-white truncate">
                {currentOrderTest?.test?.name}
              </h2>
              <p className="text-blue-100 text-xs lg:text-sm">
                Code: {currentOrderTest?.test?.code} | Status: {currentOrderTest?.status}
              </p>
            </div>

            <div className="p-3 lg:p-6 overflow-x-auto">
              <div className="overflow-x-auto -mx-3 lg:mx-0">
                <div className="min-w-[500px] lg:min-w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-2 lg:pb-3 pr-2 font-medium text-gray-600 dark:text-gray-400">Analyte</th>
                        <th className="pb-2 lg:pb-3 pr-2 font-medium text-gray-600 dark:text-gray-400">Result</th>
                        <th className="pb-2 lg:pb-3 pr-2 font-medium text-gray-600 dark:text-gray-400">Unit</th>
                        <th className="pb-2 lg:pb-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Reference Range</th>
                        <th className="pb-2 lg:pb-3 font-medium text-gray-600 dark:text-gray-400">Flag</th>
                        <th className="pb-2 lg:pb-3 font-medium text-gray-600 dark:text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => {
                        const flagDisplay = getFlagDisplay(entry.flag);
                        const isFinal = entry.resultStatus === "final";

                        return (
                          <tr key={entry.id} className={`border-b border-gray-100 dark:border-gray-700 ${entry.isCritical ? "bg-red-50 dark:bg-red-900/20" : entry.isDeltaExceeded ? "bg-purple-50 dark:bg-purple-900/20" : ""}`}>
                            <td className="py-2 lg:py-3 pr-2">
                              <div className="font-medium text-gray-900 dark:text-white text-xs lg:text-sm">{entry.analyteName}</div>
                              <div className="text-[10px] lg:text-xs text-gray-400 dark:text-gray-500">{entry.analyteCode}</div>
                            </td>
                            <td className="py-2 lg:py-3 pr-2">
                              <input
                                ref={el => { inputRefs.current[idx] = el; }}
                                type="text"
                                value={entry.value}
                                onChange={(e) => handleValueChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                onFocus={() => setFocusedInput(idx)}
                                onBlur={() => setFocusedInput(null)}
                                className={`w-24 lg:w-32 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm dark:bg-gray-900 dark:text-white ${entry.isCritical ? "border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-600" : "border-gray-200 dark:border-gray-600"} ${focusedInput === idx ? "ring-2 ring-blue-500" : ""}`}
                                placeholder="Enter value"
                                disabled={isFinal}
                              />
                            </td>
                            <td className="py-2 lg:py-3 text-gray-600 dark:text-gray-400 text-xs lg:text-sm pr-2">{entry.unit || "—"}</td>
                            <td className="py-2 lg:py-3 text-gray-600 dark:text-gray-400 text-xs lg:text-sm hidden sm:table-cell">
                              {entry.referenceRangeText || "—"}
                            </td>
                            <td className="py-2 lg:py-3">
                              <span className={`inline-flex items-center gap-1 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-medium whitespace-nowrap ${flagDisplay.color}`}>
                                {flagDisplay.icon}
                                <span className="hidden xs:inline">{flagDisplay.text}</span>
                              </span>
                            </td>
                            <td className="py-2 lg:py-3">
                              {!isFinal && entry.value && entry.value !== "" ? (
                                <button
                                  onClick={() => handleVerifyResult(entry.id)}
                                  disabled={verifyingId === entry.id}
                                  className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs disabled:opacity-50"
                                >
                                  {verifyingId === entry.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
                                </button>
                              ) : isFinal ? (
                                <span className="text-green-600 dark:text-green-400 text-xs flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-xs">Enter value</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Desktop Navigation */}
              {allOrderTests.length > 1 && (
                <div className="hidden lg:flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      const prevTest = allOrderTests[selectedTestIdx - 1];
                      if (prevTest) router.push(`/dashboard/results/${prevTest.id}`);
                    }}
                    disabled={selectedTestIdx === 0}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous Test
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{selectedTestIdx + 1} of {allOrderTests.length}</span>
                  <button
                    onClick={() => {
                      const nextTest = allOrderTests[selectedTestIdx + 1];
                      if (nextTest) router.push(`/dashboard/results/${nextTest.id}`);
                    }}
                    disabled={selectedTestIdx === allOrderTests.length - 1}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                  >
                    Next Test <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(saving || autoVerifying || fetchingFromMachine) && (
        <div className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3 shadow-xl">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {saving ? "Saving..." : fetchingFromMachine ? "Fetching from machine..." : "Processing..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}