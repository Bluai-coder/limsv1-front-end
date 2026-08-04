'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, Key, Phone, Mail, Building2, Briefcase, Loader2, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuthStore();
  
  // Make admin check more robust to catch different role names or designations
  const isAdmin = 
    user?.roles?.some(r => r.name?.toLowerCase().includes('admin')) || 
    user?.designation?.trim().toLowerCase() === 'admin';
  
  const [pin, setPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSetPin = async () => {
    if (!pin || pin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }
    
    try {
      setIsSettingPin(true);
      // We pass userId because the authGuard middleware is currently bypassed in user routes
      await api.put('/users/me/signature-pin', { pin, userId: user?.id });
      toast.success('Signature PIN set successfully!');
      setPin('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set PIN');
    } finally {
      setIsSettingPin(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      // Assuming a generic update password endpoint exists, or we mock success for now since it's outside core scope
      toast.error('Password change API not fully wired yet.');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-purple-600" />
          My Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal information and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-purple-600" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/30">
                {user.fullName?.[0]}{user.fullName?.split(' ')?.[1]?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium mt-2 border border-purple-100 dark:border-purple-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></span>
                  Active User
                </span>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <InfoRow icon={Mail} label="Email Address" value={user.email} />
              <InfoRow icon={Phone} label="Phone Number" value={user.phone || 'Not provided'} />
              <InfoRow icon={Briefcase} label="Designation" value={user.designation || 'Not assigned'} />
              <InfoRow icon={Building2} label="Department" value={user.department || 'Not assigned'} />
            </div>
          </div>
        </div>

        {/* Right Column - Security Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Signature PIN Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Digital Signature PIN</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Set a 4-6 digit PIN to quickly and securely sign off on Pathologist Reviews.
                </p>
              </div>
            </div>

            {isAdmin ? (
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Signature PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-6 digits"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSetPin}
                  disabled={isSettingPin || !pin || pin.length < 4}
                  className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-500/20"
                >
                  {isSettingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save PIN'}
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-start gap-3 border border-gray-100 dark:border-gray-800">
                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your Signature PIN is securely managed by the laboratory administrator. Please contact your administrator if you need to reset or update your PIN.
                </p>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ensure your account remains secure by using a strong password.
                </p>
              </div>
            </div>

            {isAdmin ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
                  >
                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-start gap-3 border border-gray-100 dark:border-gray-800">
                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your account password is securely managed by the laboratory administrator. Please contact your administrator if you need a password reset.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-colors">
    <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
    </div>
  </div>
);
