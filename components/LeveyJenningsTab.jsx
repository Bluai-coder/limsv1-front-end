'use client';

import { useState } from 'react';
import {
  LineChart as LucideLineChart, BarChart3, Loader2, Download,
  AlertCircle, CheckCircle
} from 'lucide-react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { useLevyJenningsData } from '@/hooks/use-qc';
import { toast } from 'sonner';

// ==================== Helper Functions ====================
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status, zScore) => {
  if (status === 'fail') return '#ef4444';
  if (Math.abs(zScore) >= 2) return '#eab308';
  return '#22c55e';
};

const getStatusLabel = (status, zScore) => {
  if (status === 'fail') return 'Out of Control';
  if (Math.abs(zScore) >= 2) return 'Warning (2s)';
  return 'In Control';
};

const getZScoreColor = (zScore) => {
  const abs = Math.abs(zScore);
  if (abs >= 3) return 'text-red-600 font-bold';
  if (abs >= 2) return 'text-yellow-600 font-semibold';
  return 'text-green-600';
};

// ==================== Custom Tooltip ====================
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
        <p className="font-semibold text-gray-800 mb-1">{formatDate(label)}</p>
        <div className="space-y-1">
          <p className="text-gray-600">
            <span className="font-medium">Value:</span> {data.value?.toFixed(2)}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Target:</span> {data.mean?.toFixed(2)} ± {data.sd?.toFixed(2)}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Z-Score:</span>{' '}
            <span className={Math.abs(data.z_score) >= 2 ? 'text-yellow-600 font-bold' : ''}>
              {data.z_score > 0 ? '+' : ''}{data.z_score?.toFixed(2)}
            </span>
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Status:</span>{' '}
            <span className={data.status === 'fail' ? 'text-red-600' : 'text-green-600'}>
              {getStatusLabel(data.status, data.z_score)}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// ==================== Main Component ====================
export default function LeveyJenningsTab() {
  const [selectedAnalyte, setSelectedAnalyte] = useState('GLU');
  const [selectedLevel, setSelectedLevel] = useState<'Level1' | 'Level2'>('Level1');
  const [days, setDays] = useState(90);
  
  const { data: levyData, isLoading, refetch } = useLevyJenningsData(selectedAnalyte, undefined, days);


  // ✅ FIXED: Access data correctly - levyData?.data?.levels
  const levelData = selectedLevel === 'Level1' 
    ? levyData?.data?.data?.levels?.Level1?.data || [] 
    : levyData?.data?.data?.levels?.Level2?.data || [];

  
  // Get target mean and SD from first data point
  const targetMean = levelData[0]?.mean || 0;
  const targetSD = levelData[0]?.sd || 1;
  
  // Prepare chart data with run numbers
  const chartData = levelData.map((point, index) => ({
    ...point,
    runNumber: index + 1,
    dateFormatted: formatDate(point.date),
    upper3sd: point.mean + (3 * point.sd),
    upper2sd: point.mean + (2 * point.sd),
    lower2sd: point.mean - (2 * point.sd),
    lower3sd: point.mean - (3 * point.sd),
  }));


  const handleExport = () => {
    if (!levelData.length) {
      toast.error('No data to export');
      return;
    }
    
    const csv = [
      ['Run Number', 'Date', 'Value', 'Target Mean', 'Target SD', 'Z-Score', 'Status'],
      ...levelData.map((point, i) => [
        i + 1,
        new Date(point.date).toLocaleString(),
        point.value,
        point.mean,
        point.sd,
        point.z_score,
        point.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levy-jennings-${selectedAnalyte}-${selectedLevel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const getReferenceLines = () => {
    if (!chartData.length || !targetMean) return null;
    
    return (
      <>
        <ReferenceLine y={targetMean} stroke="#3b82f6" strokeWidth={2} label={{ value: 'Mean', position: 'right', fill: '#3b82f6', fontSize: 11 }} />
        <ReferenceLine y={targetMean + (2 * targetSD)} stroke="#eab308" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '+2SD', position: 'right', fill: '#eab308', fontSize: 10 }} />
        <ReferenceLine y={targetMean - (2 * targetSD)} stroke="#eab308" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '-2SD', position: 'right', fill: '#eab308', fontSize: 10 }} />
        <ReferenceLine y={targetMean + (3 * targetSD)} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: '+3SD', position: 'right', fill: '#ef4444', fontSize: 10 }} />
        <ReferenceLine y={targetMean - (3 * targetSD)} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: '-3SD', position: 'right', fill: '#ef4444', fontSize: 10 }} />
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Analyte</label>
              <select
                value={selectedAnalyte}
                onChange={(e) => setSelectedAnalyte(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GLU">Glucose (GLU)</option>
                <option value="sdres">sdres</option>
                <option value="RTREWER993">RTREWER993</option>
                <option value="TRTE6554">TRTE6554</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Control Level</label>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setSelectedLevel('Level1')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                    selectedLevel === 'Level1' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Level 1
                </button>
                <button
                  onClick={() => setSelectedLevel('Level2')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                    selectedLevel === 'Level2' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Level 2
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Period</label>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                {[30, 60, 90, 180].map(d => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      days === d ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition"
            >
              <Loader2 className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={!levelData.length}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <LucideLineChart className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Levey-Jennings Control Chart</h2>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {selectedAnalyte} - {selectedLevel} ({levelData.length} runs)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span>In Control</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span>±2σ Warning</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span>±3σ Action</span></div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[450px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[450px] flex flex-col items-center justify-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No data available for {selectedAnalyte}</p>
            <p className="text-xs text-gray-400 mt-1">Enter QC results to see the Levey-Jennings chart</p>
          </div>
        ) : chartData.length === 1 ? (
          <div className="h-[450px] flex flex-col items-center justify-center">
            <AlertCircle className="w-16 h-16 text-yellow-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Insufficient data for chart</p>
            <p className="text-xs text-gray-400 mt-1">Need at least 2 data points to draw chart. Currently have {chartData.length} run(s).</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Latest result: {chartData[0]?.value} (Z-Score: {chartData[0]?.z_score?.toFixed(2)})</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="runNumber" 
                label={{ value: 'Run Number', position: 'insideBottom', offset: -10, fontSize: 12 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                label={{ value: 'Control Value', angle: -90, position: 'insideLeft', fontSize: 12 }}
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {getReferenceLines()}
              
              <Area
                type="monotone"
                dataKey="upper2sd"
                stroke="none"
                fill="#22c55e"
                fillOpacity={0.05}
              />
              
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const color = getStatusColor(payload.status, payload.z_score);
                  return (
                    <circle
                      key={`dot-${payload.runNumber}`}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 8 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Table */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Raw Data ({chartData.length} runs)</h3>
          </div>
          <div className="overflow-x-auto max-h-[300px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2">Run #</th>
                  <th className="text-left px-4 py-2">Date/Time</th>
                  <th className="text-left px-4 py-2">Value</th>
                  <th className="text-left px-4 py-2">Target Mean</th>
                  <th className="text-left px-4 py-2">SD</th>
                  <th className="text-left px-4 py-2">Z-Score</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...chartData].reverse().map((point, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{point.runNumber}</td>
                    <td className="px-4 py-2 text-xs">{formatDate(point.date)}</td>
                    <td className="px-4 py-2 font-medium">{point.value?.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-500">{point.mean?.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-500">{point.sd?.toFixed(2)}</td>
                    <td className={`px-4 py-2 font-mono text-xs ${getZScoreColor(point.z_score)}`}>
                      {point.z_score > 0 ? '+' : ''}{point.z_score?.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{getStatusLabel(point.status, point.z_score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}