"use client";

import React, { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState("lab");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    lab: { name: "", address: "", city: "", state: "", zip: "", country: "", phone: "", email: "", website: "", nabl: "", license: "" },
    reporting: { headerText: "", footerText: "", pathologistName: "", designation: "" },
    notifications: { emailEnabled: false, smsEnabled: false, criticalAlerts: false, tatBreach: false },
    tat: { hematology: 24, biochemistry: 24, immunology: 48, microbiology: 72, pathology: 120 },
    security: { sessionTimeout: 30, maxLoginAttempts: 5, require2FA: false }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data) setSettings(res.data);
    } catch (error) {
      toast.error("Failed to load settings. Using defaults.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin()) {
      toast.error("Permission denied. Only admins can update settings.");
      return;
    }
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "lab", label: "Lab Information" },
    { id: "reporting", label: "Reporting Defaults" },
    { id: "notifications", label: "Notifications" },
    { id: "tat", label: "TAT Settings" },
    { id: "security", label: "Security" },
  ];

  if (loading) return <div className="p-8 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage LIMS configuration and defaults</p>
        </div>
        {isAdmin() && (
          <button onClick={handleSave} disabled={saving} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm flex flex-col md:flex-row">
        {/* Tabs Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
          <nav className="flex flex-col p-2 space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-left rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6">
          {/* Implement tab content forms here based on activeTab */}
          {activeTab === 'lab' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Laboratory Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Simplified inputs for brevity */}
                <input className="input-field" placeholder="Lab Name" disabled={!isAdmin()} />
                <input className="input-field" placeholder="License Number" disabled={!isAdmin()} />
              </div>
            </div>
          )}
          {activeTab === 'tat' && (
             <div className="space-y-4">
               <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Turnaround Time (Hours)</h2>
               {Object.keys(settings.tat).map(dept => (
                 <div key={dept} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                   <span className="capitalize text-gray-700 dark:text-gray-300">{dept}</span>
                   <input type="number" value={settings.tat[dept]} disabled={!isAdmin()} className="w-24 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white" onChange={(e) => setSettings({...settings, tat: {...settings.tat, [dept]: parseInt(e.target.value)}})} />
                 </div>
               ))}
             </div>
          )}
          {/* Other tabs follow similarly */}
        </div>
      </div>
    </div>
  );
}
