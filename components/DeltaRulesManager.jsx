// components/DeltaRulesManager.tsx
'use client';

import { useState } from 'react';
import { useDeltaRules, useCreateDeltaRule, useUpdateDeltaRule, useDeleteDeltaRule } from '@/hooks/use-results';
import { toast } from 'sonner';

export default function DeltaRulesManager() {
    const { data: rules, refetch } = useDeltaRules();
    const createRule = useCreateDeltaRule();
    const updateRule = useUpdateDeltaRule();
    const deleteRule = useDeleteDeltaRule();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        analyte_code: '',
        check_type: '%',
        max_percent_change: '',
        max_absolute_change: '',
        lookback_hours: 48,
        is_active: true,
    });

    const handleSubmit = async () => {
        try {
            await createRule.mutateAsync(formData);
            toast.success('Delta rule created');
            setFormData({
                analyte_code: '',
                check_type: '%',
                max_percent_change: '',
                max_absolute_change: '',
                lookback_hours: 48,
                is_active: true,
            });
            refetch();
        } catch (error) {
            toast.error('Failed to create rule');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Delta Check Rules</h2>

            {/* Add Rule Form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <input
                    type="text"
                    placeholder="Analyte Code (e.g., GLU)"
                    value={formData.analyte_code}
                    onChange={(e) => setFormData({ ...formData, analyte_code: e.target.value.toUpperCase() })}
                    className="px-3 py-2 border rounded-lg"
                />
                <select
                    value={formData.check_type}
                    onChange={(e) => setFormData({ ...formData, check_type: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="%">Percent Change (%)</option>
                    <option value="absolute">Absolute Change</option>
                </select>

                {formData.check_type === '%' ? (
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Max % Change (e.g., 20)"
                        value={formData.max_percent_change}
                        onChange={(e) => setFormData({ ...formData, max_percent_change: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    />
                ) : (
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Max Absolute Change"
                        value={formData.max_absolute_change}
                        onChange={(e) => setFormData({ ...formData, max_absolute_change: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    />
                )}

                <input
                    type="number"
                    placeholder="Lookback Hours (default: 48)"
                    value={formData.lookback_hours}
                    onChange={(e) => setFormData({ ...formData, lookback_hours: parseInt(e.target.value) })}
                    className="px-3 py-2 border rounded-lg"
                />

                <button
                    onClick={handleSubmit}
                    disabled={createRule.isPending || !formData.analyte_code}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {createRule.isPending ? 'Adding...' : 'Add Rule'}
                </button>
            </div>

            {/* Rules Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">Analyte</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">Threshold</th>
                            <th className="px-4 py-2 text-left">Lookback</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules?.data?.map((rule) => (
                            <tr key={rule.id} className="border-b">
                                <td className="px-4 py-2 font-medium">{rule.analyte_code}</td>
                                <td className="px-4 py-2">{rule.check_type === '%' ? 'Percent' : 'Absolute'}</td>
                                <td className="px-4 py-2">
                                    {rule.check_type === '%'
                                        ? `${rule.max_percent_change}%`
                                        : `${rule.max_absolute_change} units`}
                                </td>
                                <td className="px-4 py-2">{rule.lookback_hours} hours</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {rule.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => deleteRule.mutateAsync(rule.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}