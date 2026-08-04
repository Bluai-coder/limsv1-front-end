"use client";

import React, { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { 
  Save, RefreshCw, Building2, Globe2, Palette, Clock, 
  ShieldCheck, Bell, Mail, Smartphone, Info 
} from "lucide-react";

export default function SettingsPage() {
  const { isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState("lab");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State structure matching backend Tenant model
  const [settingsData, setSettingsData] = useState({
    settings: {
      lab: { name: "", address: "", city: "", state: "", zip: "", country: "", phone: "", email: "", website: "", nabl: "", license: "" },
      reporting: { headerText: "", footerText: "", pathologistName: "", designation: "" },
      notifications: { emailEnabled: false, smsEnabled: false, criticalAlerts: false, tatBreach: false },
      tat: { hematology: 24, biochemistry: 24, immunology: 48, microbiology: 72, pathology: 120 },
      security: { sessionTimeout: 30, maxLoginAttempts: 5, require2FA: false }
    },
    branding: {
      primaryColor: "#1b4dff",
      logoUrl: "",
      faviconUrl: "",
      companyName: ""
    },
    defaultCurrency: "INR",
    defaultLocale: "en-IN",
    timezone: "Asia/Kolkata"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data && res.data.data) {
        const fetchedData = res.data.data;
        // Deep merge fetched data with defaults to ensure all keys exist
        setSettingsData(prev => ({
          ...prev,
          settings: { ...prev.settings, ...(fetchedData.settings || {}) },
          branding: { ...prev.branding, ...(fetchedData.branding || {}) },
          defaultCurrency: fetchedData.defaultCurrency || prev.defaultCurrency,
          defaultLocale: fetchedData.defaultLocale || prev.defaultLocale,
          timezone: fetchedData.timezone || prev.timezone
        }));
      }
    } catch (error) {
      console.error(error);
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
      await api.put('/settings', settingsData);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, field, value) => {
    setSettingsData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [category]: {
          ...(prev.settings[category] || {}),
          [field]: value
        }
      }
    }));
  };

  const updateTopLevel = (field, value) => {
    setSettingsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateBranding = (field, value) => {
    setSettingsData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: "lab", label: "Laboratory Info", icon: Building2 },
    { id: "localization", label: "Localization", icon: Globe2 },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "tat", label: "Turnaround Time", icon: Clock },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input 
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={!isAdmin()}
        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-gray-900 dark:text-white disabled:opacity-60"
      />
    </div>
  );

  const ToggleSwitch = ({ label, checked, onChange, description }) => (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex-1">
        <label className="text-sm font-semibold text-gray-900 dark:text-white block">{label}</label>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      <button 
        type="button"
        disabled={!isAdmin()}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} disabled:opacity-50`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">System Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your laboratory preferences and global defaults.</p>
        </div>
        {isAdmin() && (
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="flex items-center px-6 py-2.5 bg-[#1b4dff] text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all shadow-sm font-medium"
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-700' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            
            {/* LAB INFO TAB */}
            {activeTab === 'lab' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Laboratory Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Basic details about your facility for reports and invoices.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <InputField label="Laboratory Name" value={settingsData.settings.lab?.name} onChange={v => updateSetting('lab', 'name', v)} placeholder="e.g. Apex Diagnostics" />
                  <InputField label="License Number" value={settingsData.settings.lab?.license} onChange={v => updateSetting('lab', 'license', v)} placeholder="e.g. LAB-12345" />
                  <div className="md:col-span-2">
                    <InputField label="Address Line" value={settingsData.settings.lab?.address} onChange={v => updateSetting('lab', 'address', v)} placeholder="Street address" />
                  </div>
                  <InputField label="City" value={settingsData.settings.lab?.city} onChange={v => updateSetting('lab', 'city', v)} placeholder="City" />
                  <InputField label="State / Region" value={settingsData.settings.lab?.state} onChange={v => updateSetting('lab', 'state', v)} placeholder="State" />
                  <InputField label="ZIP / Postal Code" value={settingsData.settings.lab?.zip} onChange={v => updateSetting('lab', 'zip', v)} placeholder="ZIP code" />
                  <InputField label="Country" value={settingsData.settings.lab?.country} onChange={v => updateSetting('lab', 'country', v)} placeholder="Country" />
                  <InputField label="Phone Number" value={settingsData.settings.lab?.phone} onChange={v => updateSetting('lab', 'phone', v)} placeholder="Contact number" type="tel" />
                  <InputField label="Email Address" value={settingsData.settings.lab?.email} onChange={v => updateSetting('lab', 'email', v)} placeholder="Official email" type="email" />
                </div>
              </div>
            )}

            {/* LOCALIZATION TAB */}
            {activeTab === 'localization' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Localization & Region</h2>
                  <p className="text-sm text-gray-500 mt-1">Set your default region, currency, and time settings.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Timezone</label>
                    <select 
                      disabled={!isAdmin()}
                      value={settingsData.timezone}
                      onChange={e => updateTopLevel('timezone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-60"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Currency</label>
                    <select 
                      disabled={!isAdmin()}
                      value={settingsData.defaultCurrency}
                      onChange={e => updateTopLevel('defaultCurrency', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-60"
                    >
                      <option value="INR">₹ INR - Indian Rupee</option>
                      <option value="USD">$ USD - US Dollar</option>
                      <option value="EUR">€ EUR - Euro</option>
                      <option value="GBP">£ GBP - British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Locale (Language & Dates)</label>
                    <select 
                      disabled={!isAdmin()}
                      value={settingsData.defaultLocale}
                      onChange={e => updateTopLevel('defaultLocale', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-60"
                    >
                      <option value="en-IN">English (India)</option>
                      <option value="en-US">English (United States)</option>
                      <option value="en-GB">English (United Kingdom)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* BRANDING TAB */}
            {activeTab === 'branding' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Branding & Identity</h2>
                  <p className="text-sm text-gray-500 mt-1">Customize the look and feel of your portal and reports.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <InputField label="Brand Name" value={settingsData.branding?.companyName} onChange={v => updateBranding('companyName', v)} placeholder="e.g. Apex Diagnostics" />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Primary Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color"
                        disabled={!isAdmin()}
                        value={settingsData.branding?.primaryColor || "#1b4dff"}
                        onChange={e => updateBranding('primaryColor', e.target.value)}
                        className="w-12 h-12 p-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer disabled:opacity-60"
                      />
                      <input 
                        type="text"
                        disabled={!isAdmin()}
                        value={settingsData.branding?.primaryColor || "#1b4dff"}
                        onChange={e => updateBranding('primaryColor', e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-60 uppercase"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <InputField label="Logo Image URL" value={settingsData.branding?.logoUrl} onChange={v => updateBranding('logoUrl', v)} placeholder="https://..." type="url" />
                    {settingsData.branding?.logoUrl && (
                      <div className="mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl inline-block bg-gray-50 dark:bg-gray-800/50">
                        <img src={settingsData.branding.logoUrl} alt="Logo Preview" className="max-h-16 object-contain" onError={(e) => e.target.style.display='none'} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAT TAB */}
            {activeTab === 'tat' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Turnaround Time (TAT)</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure default expected reporting hours per department.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  {['hematology', 'biochemistry', 'immunology', 'microbiology', 'pathology'].map(dept => (
                    <div key={dept} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                      <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{dept}</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min="1"
                          value={settingsData.settings.tat?.[dept] || ""} 
                          disabled={!isAdmin()} 
                          onChange={(e) => updateSetting('tat', dept, parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500/40" 
                        />
                        <span className="text-xs text-gray-500">hrs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Policies</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage global security and access policies for the tenant.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <InputField label="Session Timeout (Minutes)" value={settingsData.settings.security?.sessionTimeout} onChange={v => updateSetting('security', 'sessionTimeout', parseInt(v))} type="number" />
                  <InputField label="Max Login Attempts (Lockout)" value={settingsData.settings.security?.maxLoginAttempts} onChange={v => updateSetting('security', 'maxLoginAttempts', parseInt(v))} type="number" />
                  
                  <div className="md:col-span-2 space-y-4">
                    <ToggleSwitch 
                      label="Require Two-Factor Authentication (2FA)" 
                      description="Force all users in this tenant to configure 2FA upon their next login."
                      checked={settingsData.settings.security?.require2FA} 
                      onChange={v => updateSetting('security', 'require2FA', v)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Notifications</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure automated communication triggers.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <ToggleSwitch 
                    label="Enable Email Notifications" 
                    description="Send email alerts to patients and doctors when reports are finalized."
                    checked={settingsData.settings.notifications?.emailEnabled} 
                    onChange={v => updateSetting('notifications', 'emailEnabled', v)} 
                  />
                  <ToggleSwitch 
                    label="Enable SMS Notifications" 
                    description="Send SMS text messages using the integrated gateway."
                    checked={settingsData.settings.notifications?.smsEnabled} 
                    onChange={v => updateSetting('notifications', 'smsEnabled', v)} 
                  />
                  <ToggleSwitch 
                    label="Critical Value Alerts" 
                    description="Immediately notify pathologists and referring doctors for critical panic values."
                    checked={settingsData.settings.notifications?.criticalAlerts} 
                    onChange={v => updateSetting('notifications', 'criticalAlerts', v)} 
                  />
                  <ToggleSwitch 
                    label="TAT Breach Warnings" 
                    description="Alert department heads when a test approaches or breaches Turnaround Time."
                    checked={settingsData.settings.notifications?.tatBreach} 
                    onChange={v => updateSetting('notifications', 'tatBreach', v)} 
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
