'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth-store';
import { adminApi, authApi } from '@/lib/api';
import { Eye, EyeOff, Building2, Settings, ArrowRight, ShieldCheck } from 'lucide-react';
import CommonModal from '@/components/CommonModal';
import MedicalBackground3D from '@/components/ui/MedicalBackground3D';

// ================= CUSTOM LOGO =================
const BluLimsLogo = ({ className = "text-4xl" }) => (
  <div className={`flex items-center font-bold tracking-tighter select-none ${className}`}>
    <div className="bg-[#1b4dff] text-white px-2 pt-1 pb-1.5 leading-none shadow-md">Blu</div>
    <div className="text-[#1b4dff] ml-1.5 leading-none tracking-tight">LIMS</div>
  </div>
);

// ================= LOGIN TYPE SELECTION MODAL =================
const LoginTypeModal = ({ onSelectLoginType }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <MedicalBackground3D />
    
    <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in duration-500">
      
      {/* Modal Container */}
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(27,77,255,0.15)] overflow-hidden border border-white">
        
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-[#1b4dff] rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Secure Authentication
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Select your portal to access the LIMS network
          </p>
        </div>

        {/* Options Section */}
        <div className="px-8 pb-8 space-y-4">
          
          {/* Lab Tenant Login Option */}
          <button
            onClick={() => onSelectLoginType('lab_tenant')}
            className="relative w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#1b4dff]/40 hover:shadow-lg hover:shadow-[#1b4dff]/5 transition-all duration-300 group overflow-hidden text-left"
          >
            <div className="relative flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1b4dff] transition-all duration-300 shadow-sm border border-slate-100 group-hover:border-[#1b4dff]">
                <Building2 className="w-6 h-6 text-[#1b4dff] group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 group-hover:text-[#1b4dff] transition-colors">Lab Tenant Portal</h3>
                <p className="text-xs text-slate-500 mt-1">For lab staff, directors, and pathologists</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#1b4dff] group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </button>

          {/* Lab Management Login Option */}
          <button
            onClick={() => onSelectLoginType('lab_management')}
            className="relative w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#1b4dff]/40 hover:shadow-lg hover:shadow-[#1b4dff]/5 transition-all duration-300 group overflow-hidden text-left"
          >
            <div className="relative flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1b4dff] transition-all duration-300 shadow-sm border border-slate-100 group-hover:border-[#1b4dff]">
                <Settings className="w-6 h-6 text-[#1b4dff] group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 group-hover:text-[#1b4dff] transition-colors">Management Portal</h3>
                <p className="text-xs text-slate-500 mt-1">For platform super admins and configuration</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#1b4dff] group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            Encrypted connection established
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ================= LAB TENANT LOGIN FORM =================
const LabTenantLoginForm = ({
  tenant, setTenant, email, setEmail, password, setPassword,
  showPassword, setShowPassword, error, loading, onSubmit, onBack
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <MedicalBackground3D />
    
    <div className="relative w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
      {/* Glass Card Container (Split Layout) */}
      <div className="relative flex flex-col md:flex-row bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(27,77,255,0.15)] overflow-hidden border border-white min-h-[550px]">
        
        {/* LEFT PANEL: Branding */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-12 bg-slate-50/50 border-r border-slate-100 relative overflow-hidden group">
          {/* Subtle floating background icon */}
          <Building2 className="absolute -bottom-10 -left-10 w-72 h-72 text-blue-50/50 group-hover:text-blue-100/50 group-hover:scale-110 transition-all duration-1000 rotate-12" />
          
          <div className="relative z-10">
            <div className="h-12 flex items-center mb-12">
              <BluLimsLogo className="text-5xl" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight leading-tight">
              Precision in <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b4dff] to-blue-400">Every Result</span>
            </h2>
            <p className="text-slate-500 mt-4 max-w-sm text-sm leading-relaxed">
              End-to-end laboratory workflow management for Clinical & Anatomic Pathology.
            </p>
          </div>

          <div className="relative z-10 flex gap-3 flex-wrap mt-12">
            {["CP Workflow", "AP Workflow", "QC/QA"].map((item) => (
              <span key={item} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 shadow-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-12 relative bg-white">
          <button onClick={onBack} className="absolute top-8 right-8 text-sm text-slate-400 hover:text-[#1b4dff] flex items-center gap-2 transition-colors group font-medium">
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          <div className="md:hidden flex justify-center mb-8">
            <BluLimsLogo className="text-4xl" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Lab Portal Login</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your secure tenant workspace</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-sm shadow-red-500/50"></span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 ml-1">Workspace ID</label>
              <input value={tenant} type="text" required onChange={(e) => setTenant(e.target.value)} placeholder="your-lab-id"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1b4dff] focus:ring-4 focus:ring-[#1b4dff]/10 transition-all font-medium"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 ml-1">Email Address</label>
              <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} placeholder="name@laboratory.com"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1b4dff] focus:ring-4 focus:ring-[#1b4dff]/10 transition-all font-medium"
              />
            </div>
            
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-slate-600 ml-1">Password</label>
              <input type={showPassword ? 'text' : 'password'} value={password} required onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1b4dff] focus:ring-4 focus:ring-[#1b4dff]/10 transition-all pr-12 font-medium"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-3.5 text-slate-400 hover:text-[#1b4dff] transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-8 py-4 bg-[#1b4dff] hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-[#1b4dff]/20 hover:shadow-xl hover:shadow-[#1b4dff]/30 transition-all disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Workspace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

// ================= LAB MANAGEMENT LOGIN FORM =================
const LabManagementLoginForm = ({
  adminEmail, setAdminEmail, adminPassword, setAdminPassword,
  showPassword, setShowPassword, error, loading, onSubmit, onBack
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <MedicalBackground3D />
    
    <div className="relative w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
      {/* Glass Card Container (Split Layout) */}
      <div className="relative flex flex-col md:flex-row bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(27,77,255,0.15)] overflow-hidden border border-white min-h-[550px]">
        
        {/* LEFT PANEL: Branding */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-12 bg-slate-50/50 border-r border-slate-100 relative overflow-hidden group">
          {/* Subtle floating background icon */}
          <Settings className="absolute -bottom-10 -left-10 w-72 h-72 text-blue-50/50 group-hover:text-blue-100/50 group-hover:scale-110 group-hover:rotate-45 transition-all duration-1000" />
          
          <div className="relative z-10">
            <div className="flex items-center mb-12">
              <BluLimsLogo className="text-5xl" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight leading-tight">
              Platform <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b4dff] to-blue-400">Management</span>
            </h2>
            <p className="text-slate-500 mt-4 max-w-sm text-sm leading-relaxed">
              Centralized administrative control and configuration for all lab tenant operations.
            </p>
          </div>

          <div className="relative z-10 flex gap-3 flex-wrap mt-12">
            {["System Settings", "User Management", "Global Metrics"].map((item) => (
              <span key={item} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 shadow-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-12 relative bg-white">
          <button onClick={onBack} className="absolute top-8 right-8 text-sm text-slate-400 hover:text-[#1b4dff] flex items-center gap-2 transition-colors group font-medium">
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          <div className="md:hidden flex justify-center mb-8">
            <BluLimsLogo className="text-4xl" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Portal</h2>
            <p className="text-slate-500 text-sm mt-1">Super administrator access only</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-sm shadow-red-500/50"></span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 ml-1">Admin Email</label>
              <input type="email" value={adminEmail} required onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@blulims.com"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1b4dff] focus:ring-4 focus:ring-[#1b4dff]/10 transition-all font-medium"
              />
            </div>
            
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-slate-600 ml-1">Admin Password</label>
              <input type={showPassword ? 'text' : 'password'} value={adminPassword} required onChange={(e) => setAdminPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1b4dff] focus:ring-4 focus:ring-[#1b4dff]/10 transition-all pr-12 font-medium"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-3.5 text-slate-400 hover:text-[#1b4dff] transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-8 py-4 bg-[#1b4dff] hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-[#1b4dff]/20 hover:shadow-xl hover:shadow-[#1b4dff]/30 transition-all disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Authorize Access"}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, logout } = useAuthStore();

  // Login type selection
  const [showTypeModal, setShowTypeModal] = useState(true);
  const [loginType, setLoginType] = useState(null); // 'lab_tenant' or 'lab_management'

  // 2FA states
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [mfaSetupRequired, setMfaSetupRequired] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  // Lab Tenant Login (Users/Owner) form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenant, setTenant] = useState('');

  // Lab Management Login (Admin/Super Admin) form fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Common states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Role selection states
  const [isHaveMultipleRoles, setIsHaveMultipleRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);

  // ================= LOGIN TYPE SELECTION =================
  const handleSelectLoginType = useCallback((type) => {
    setLoginType(type);
    setShowTypeModal(false);
    setError('');
  }, []);

  const handleBackToTypeSelection = useCallback(() => {
    setLoginType(null);
    setShowTypeModal(true);
    setError('');
    // Clear forms
    setEmail('');
    setPassword('');
    setTenant('');
    setAdminEmail('');
    setAdminPassword('');
  }, []);

  // ================= LAB TENANT LOGIN =================
  const handleLabTenantSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = loginType === 'lab_management' ? await adminApi.login({
        email: adminEmail,
        password: adminPassword,
      }) : await authApi.login({
        email,
        password,
        tenantSubdomain: tenant,
      });

      const data = res?.data;

      // Check if 2FA is required
      if (data?.requires2FA) {
        setTempToken(data.tempToken);
        setMfaSetupRequired(data.mfaSetupRequired);
        setIs2FAStep(true);
        
        // If setup is required, fetch the QR code immediately
        if (data.mfaSetupRequired) {
          try {
            const qrRes = await authApi.customRequest({
              method: 'POST',
              url: '/auth/2fa/setup',
              headers: { Authorization: `Bearer ${data.tempToken}` },
              data: {}
            });
            if (qrRes?.data?.qrCodeDataUrl) {
              setQrCodeUrl(qrRes.data.qrCodeDataUrl);
            }
          } catch (qrErr) {
            setError("Failed to generate 2FA setup code.");
          }
        }
        return;
      }
      const permissionMap = Object.fromEntries(
        (data?.user?.permissions || data.data?.permissions || []).map((p) => [p.module, p.actions || []])
      );

      const normalizedUser = {
        ...data.user,
        permissions: permissionMap,
      };

      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: normalizedUser,
        tenant: data.tenant,
      });

      const apiRoles = data?.user?.roles || [];

      if (apiRoles.length > 1) {
        setRoles(apiRoles);
        setIsHaveMultipleRoles(true);
      } else {
        loginType === 'lab_management' ? router.push("/admin/tenants") :
          router.push("/dashboard");
      }

    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, [loginType, adminEmail, adminPassword, email, password, tenant, setAuth, router]);

  // ================= ROLE SELECT =================
  const goToDashboard = useCallback(async (roleId) => {
    setSelectedRole(roleId);
    try {
      const res = await authApi.selectRole({ roleId });
      const data = res?.data?.data;

      const permissionMap = Object.fromEntries(
        (data.user.permissions || []).map((p) => [p.module, p.actions || []])
      );

      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: { ...data.user, permissions: permissionMap },
        tenant: data.tenant,
      });

      setIsHaveMultipleRoles(false);

      if (loginType === 'lab_management') {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
    }
  }, [loginType, setAuth, router]);

  const closeHandler = useCallback(() => {
    setIsHaveMultipleRoles(false);
    logout();
    handleBackToTypeSelection();
  }, [logout, handleBackToTypeSelection]);

  // ================= 2FA SUBMIT =================
  const handle2FASubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setTwoFaLoading(true);
    setError("");

    try {
      const endpoint = mfaSetupRequired ? '/auth/2fa/verify-setup' : '/auth/2fa/verify';
      const res = await authApi.customRequest({
        method: 'POST',
        url: endpoint,
        headers: { Authorization: `Bearer ${tempToken}` },
        data: { token: totpCode }
      });

      const data = res?.data;
      if (data?.success) {
        const permissionMap = Object.fromEntries(
          (data?.user?.permissions || []).map((p) => [p.module, p.actions || []])
        );

        const normalizedUser = {
          ...data.user,
          permissions: permissionMap,
        };

        setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: normalizedUser,
          tenant: data.tenant,
        });

        const apiRoles = data?.user?.roles || [];

        if (apiRoles.length > 1) {
          setRoles(apiRoles);
          setIsHaveMultipleRoles(true);
        } else {
          loginType === 'lab_management' ? router.push("/admin/tenants") : router.push("/dashboard");
        }
      } else {
        setError(data?.message || "Invalid 2FA code.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid 2FA code.");
    } finally {
      setTwoFaLoading(false);
    }
  }, [totpCode, tempToken, mfaSetupRequired, loginType, setAuth, router]);

  // Show role modal first if multiple roles
  if (isHaveMultipleRoles) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <MedicalBackground3D />
        
        <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in duration-500">
          
          {/* Modal Container */}
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(27,77,255,0.15)] overflow-hidden border border-white flex flex-col max-h-[90vh]">
            
            {/* Header Section */}
            <div className="px-8 pt-8 pb-6 text-center shrink-0">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-[#1b4dff]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Select Role
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Choose your role to continue
              </p>
            </div>

            {/* Options Section */}
            <div className="px-8 pb-4 space-y-3 overflow-y-auto">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    relative w-full p-4 rounded-2xl transition-all duration-300 group overflow-hidden text-left border
                    ${selectedRole === role.id
                      ? "bg-blue-50/50 border-[#1b4dff]/50 shadow-md shadow-[#1b4dff]/10"
                      : "bg-slate-50 border-slate-100 hover:bg-white hover:border-[#1b4dff]/30 hover:shadow-sm"
                    }
                  `}
                >
                  <div className="relative flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border
                      ${selectedRole === role.id
                        ? "bg-[#1b4dff] border-[#1b4dff] text-white shadow-md shadow-[#1b4dff]/30"
                        : "bg-white border-slate-200 text-[#1b4dff] group-hover:bg-blue-50 group-hover:border-blue-200"
                      }
                    `}>
                      {role.name === 'Admin' || role.name === 'Super Admin' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : role.name === 'Pathologist' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold transition-colors ${selectedRole === role.id ? "text-[#1b4dff]" : "text-slate-800"}`}>
                        {role.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {role.description || `Access with ${role.name} permissions`}
                      </p>
                    </div>

                    {selectedRole === role.id && (
                      <div className="flex-shrink-0 animate-in zoom-in duration-200">
                        <svg className="w-6 h-6 text-[#1b4dff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions Section */}
            <div className="px-8 pb-8 pt-4 flex gap-4 shrink-0 bg-white">
              <button 
                onClick={closeHandler} 
                className="flex-1 py-3 px-4 rounded-xl font-medium border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => goToDashboard(selectedRole)} 
                disabled={!selectedRole} 
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-[#1b4dff] hover:bg-blue-600 text-white shadow-lg shadow-[#1b4dff]/20 transition-all disabled:opacity-50"
              >
                Continue
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Show login type selection modal
  if (showTypeModal) {
    return <LoginTypeModal onSelectLoginType={handleSelectLoginType} />;
  }

  // Show respective login form
  if (is2FAStep) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100 text-center">
          <div className="flex justify-center mb-6">
            <ShieldCheck className="w-16 h-16 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
          
          {mfaSetupRequired ? (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">
                Your organization requires two-factor authentication. Please scan the QR code below with your authenticator app (like Google Authenticator or Authy).
              </p>
              {qrCodeUrl ? (
                <div className="flex justify-center mb-4">
                  <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
                </div>
              ) : (
                <div className="flex justify-center items-center h-48 mb-4 bg-gray-100 rounded animate-pulse">
                  <span className="text-gray-400">Loading QR Code...</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-6">
              Enter the 6-digit code from your authenticator app to continue.
            </p>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-left">
              {error}
            </div>
          )}

          <form onSubmit={handle2FASubmit} className="space-y-5">
            <input
              type="text"
              required
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
            />
            <button
              type="submit"
              disabled={twoFaLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {twoFaLoading ? "Verifying..." : "Verify Code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIs2FAStep(false);
                setTotpCode("");
                setError("");
              }}
              className="w-full py-2 text-gray-500 hover:text-gray-700 font-medium transition"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loginType === 'lab_tenant') {
    return (
      <LabTenantLoginForm
        tenant={tenant}
        setTenant={setTenant}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        error={error}
        loading={loading}
        onSubmit={handleLabTenantSubmit}
        onBack={handleBackToTypeSelection}
      />
    );
  }

  if (loginType === 'lab_management') {
    return (
      <LabManagementLoginForm
        adminEmail={adminEmail}
        setAdminEmail={setAdminEmail}
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        error={error}
        loading={loading}
        onSubmit={handleLabTenantSubmit}
        onBack={handleBackToTypeSelection}
      />
    );
  }

  return null;
}




