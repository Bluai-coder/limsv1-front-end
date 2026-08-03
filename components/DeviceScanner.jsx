// components/DeviceScanner.jsx
import { useState, useEffect } from 'react';
import {
    Loader2, Wifi, WifiOff, Network, CheckCircle,
    X, Zap, Activity, Heart, Database,
    Printer, FolderOpen, Globe, Terminal, Music
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function DeviceScanner({ onDeviceSelect, onClose }) {
    const [scanning, setScanning] = useState(false);
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [scanStats, setScanStats] = useState(null);

    // Auto-detect network info on mount
    useEffect(() => {
        getNetworkInfo();
    }, []);

    const getNetworkInfo = async () => {
        try {
            const response = await api.get("/network-discovery/network-info");
            if (response.data?.success && response.data.networkInfo?.subnet) {
                setNetworkInfo(response.data.networkInfo);
                toast.info(`Detected network: ${response.data.networkInfo.subnet}.0/24`);
            }
        } catch (error) {
            console.error('Failed to get network info:', error);
        }
    };

    // Auto Discover - Scans all localhost IPs and common network IPs
    const handleAutoDiscover = async () => {
        setScanning(true);
        setDevices([]);
        toast.loading('🔍 Auto-discovering devices on your network...', { id: 'auto-discover' });

        try {
            const response = await api.post("/network-discovery/auto-discover", { fullScan: false });
            const data = response.data;

            if (data.success) {
                setDevices(data.devices);
                setNetworkInfo(data.networkInfo);
                setScanStats({
                    total: data.count,
                    byCategory: data.byCategory,
                    byImportance: data.byImportance
                });
                toast.success(`Found ${data.count} devices`, { id: 'auto-discover' });
            } else {
                toast.error(data.error || 'Auto-discover failed', { id: 'auto-discover' });
            }
        } catch (error) {
            toast.error('Auto-discover failed: ' + error.message, { id: 'auto-discover' });
        } finally {
            setScanning(false);
        }
    };

    // Full Scan - Scans entire subnet
    const handleFullScan = async () => {
        setScanning(true);
        setDevices([]);
        toast.loading('🔬 Full network scan (1-254 IPs) may take 60 seconds...', { id: 'full-scan' });

        try {
            const response = await api.post("/network-discovery/full-scan");
            const data = response.data;

            if (data.success) {
                setDevices(data.devices);
                setNetworkInfo(data.networkInfo);
                setScanStats({
                    total: data.count,
                    byCategory: data.byCategory,
                    byImportance: data.byImportance
                });
                toast.success(`Found ${data.count} devices`, { id: 'full-scan' });
            } else {
                toast.error(data.error || 'Full scan failed', { id: 'full-scan' });
            }
        } catch (error) {
            toast.error('Full scan failed: ' + error.message, { id: 'full-scan' });
        } finally {
            setScanning(false);
        }
    };

    // Get device icon based on type (with theme support)
    const getDeviceIcon = (deviceType) => {
        const type = deviceType?.type?.toLowerCase() || '';
        const category = deviceType?.category?.toLowerCase() || '';

        if (type.includes('medical') || category.includes('medical')) {
            return <Heart className="w-4 h-4 text-red-500 dark:text-red-400" />;
        }
        if (type.includes('web') || category.includes('web')) {
            return <Globe className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
        }
        if (type.includes('database') || category.includes('database')) {
            return <Database className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
        }
        if (type.includes('printer') || category.includes('printer')) {
            return <Printer className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
        }
        if (type.includes('ssh') || type.includes('rdp') || category.includes('remote')) {
            return <Terminal className="w-4 h-4 text-green-500 dark:text-green-400" />;
        }
        if (type.includes('media') || category.includes('media')) {
            return <Music className="w-4 h-4 text-pink-500 dark:text-pink-400" />;
        }
        if (type.includes('file') || category.includes('file')) {
            return <FolderOpen className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
        }
        return <Network className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    };

    // Get category badge color (with theme support)
    const getCategoryColor = (category) => {
        const colors = {
            'Medical': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
            'Web': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            'Database': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
            'Printer': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
            'Remote': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            'Media': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
            'Network': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
            'Other': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        };
        return colors[category] || colors['Other'];
    };

    // Filter devices
    const getFilteredDevices = () => {
        if (filterType === 'all') return devices;
        return devices.filter(d => d.deviceType?.category === filterType);
    };

    const filteredDevices = getFilteredDevices();

    // Get unique categories for filter
    const categories = ['all', ...new Set(devices.map(d => d.deviceType?.category).filter(Boolean))];

    const handleSelectDevice = () => {
        if (selectedDevice && onDeviceSelect) {
            const bestPort = selectedDevice.openPorts?.find(p => [7777, 5000, 2575, 8080, 3000].includes(p)) || selectedDevice.openPorts[0] || 7777;
            onDeviceSelect({
                host: selectedDevice.ip,
                port: bestPort,
                connectionType: selectedDevice.deviceType?.protocol === 'HL7' ? 'hl7' : 'tcp',
                deviceInfo: selectedDevice
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Network className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Network Device Scanner</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {networkInfo ? `Your IP: ${networkInfo.localIp} | Network: ${networkInfo.subnet}.0/24` : 'Detecting network...'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(85vh-200px)]">
                    {/* Scan Options */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleAutoDiscover}
                            disabled={scanning}
                            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md"
                        >
                            {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                            <span className="font-medium">🚀 Auto Discover</span>
                        </button>
                        <button
                            onClick={handleFullScan}
                            disabled={scanning}
                            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md"
                        >
                            {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                            <span className="font-medium">🔬 Full Scan (1-254)</span>
                        </button>
                    </div>

                    {/* Scan Stats */}
                    {scanStats && scanStats?.total > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 Scan Results</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Total Devices:</span>
                                    <span className="font-bold text-gray-900 dark:text-white ml-2">{scanStats.total}</span>
                                </div>
                                {scanStats.byCategory && Object.entries(scanStats.byCategory).map(([cat, count]) => (
                                    <div key={cat}>
                                        <span className="text-gray-500 dark:text-gray-400">{cat}:</span>
                                        <span className="font-bold text-gray-900 dark:text-white ml-2">{count.length || count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Category Filter */}
                    {devices?.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterType(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize ${filterType === cat
                                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {cat === 'all' ? `All (${devices.length})` : `${cat} (${devices.filter(d => d.deviceType?.category === cat).length})`}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Discovered Devices */}
                    {filteredDevices?.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                Devices Found ({filteredDevices.length})
                            </h4>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {filteredDevices.map((device, idx) => (
                                    <div
                                        key={idx}
                                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedDevice?.ip === device.ip
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                        onClick={() => setSelectedDevice(device)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {getDeviceIcon(device.deviceType)}
                                                    <span className="font-mono font-bold text-gray-900 dark:text-white">{device.ip}</span>
                                                    {device.reachable ? (
                                                        <Wifi className="w-4 h-4 text-green-500 dark:text-green-400" />
                                                    ) : (
                                                        <WifiOff className="w-4 h-4 text-red-500 dark:text-red-400" />
                                                    )}
                                                    {device.deviceType?.importance === 'critical' && (
                                                        <span className="px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">Critical</span>
                                                    )}
                                                    {device.deviceType?.importance === 'high' && (
                                                        <span className="px-1.5 py-0.5 text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">High</span>
                                                    )}
                                                </div>
                                                {device.hostname && device.hostname !== device.ip && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{device.hostname}</div>
                                                )}
                                                {device.deviceType && device.deviceType.type !== 'Unknown' && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(device.deviceType.category)}`}>
                                                            {device.deviceType.category || 'Other'}
                                                        </span>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {device.deviceType.type}
                                                        </span>
                                                        {device.deviceType.manufacturer && device.deviceType.manufacturer !== 'Unknown' && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                | {device.deviceType.manufacturer}
                                                            </span>
                                                        )}
                                                        {device.deviceType.protocol && device.deviceType.protocol !== 'Unknown' && (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                | {device.deviceType.protocol}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                                    {device.openPorts?.length || 0} port(s) open
                                                </div>
                                                {device.responseTime && (
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{device.responseTime}ms</div>
                                                )}
                                            </div>
                                        </div>
                                        {device.openPorts && device.openPorts.length > 0 && (
                                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Ports: {device.openPorts.slice(0, 10).join(', ')}
                                                {device.openPorts.length > 10 && ` +${device.openPorts.length - 10} more`}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Devices Found */}
                    {devices.length === 0 && !scanning && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <Network className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No devices found</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Auto Discover" to scan your network</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Make sure devices are powered on and connected</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {scanning && (
                        <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Scanning network...</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This may take a moment</p>
                        </div>
                    )}

                    {/* Selected Device Info */}
                    {selectedDevice && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                Selected Device
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">IP Address:</span>
                                    <p className="text-gray-900 dark:text-white font-mono">{selectedDevice.ip}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Open Ports:</span>
                                    <p className="text-gray-900 dark:text-white">{selectedDevice.openPorts?.length || 0} ports</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Device Type:</span>
                                    <p className="text-gray-900 dark:text-white">{selectedDevice.deviceType?.type || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Category:</span>
                                    <p className="text-gray-900 dark:text-white">{selectedDevice.deviceType?.category || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Protocol:</span>
                                    <p className="text-gray-900 dark:text-white">{selectedDevice.deviceType?.protocol || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Response Time:</span>
                                    <p className="text-gray-900 dark:text-white">{selectedDevice.responseTime || 'N/A'}ms</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
                    >
                        Cancel
                    </button>
                    {selectedDevice && (
                        <button
                            onClick={handleSelectDevice}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center gap-2 transition shadow-md"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Use This Device
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}