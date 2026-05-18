// // ============================================================
// // app/auth/login/page.jsx — Login page
// // ============================================================


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { authApi } from '@/lib/api';
import { FlaskConical, Eye, EyeOff, Loader2 } from 'lucide-react';
import CommonModal from '@/components/CommonModal';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, logout } = useAuthStore();

  const [email, setEmail] = useState('blulab99@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [tenant, setTenant] = useState('blulab.in');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isHaveMultipleRoles, setIsHaveMultipleRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);

  // ================= LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authApi.login({
        email,
        password,
        tenantSubdomain: tenant,
      });

      const data = res?.data;

      const permissionMap = Object.fromEntries(
        (data.user.permissions || []).map((p) => [p.module, p.actions || []])
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
        router.push("/dashboard");
      }

    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= ROLE SELECT =================
  const goToDashboard = async () => {
    try {
      const res = await authApi.selectRole({ roleId: selectedRole });
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

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const closeHandler = () => {
    setIsHaveMultipleRoles(false);
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row ">
      {/* <div className="min-h-screen flex flex-col lg:flex-row bg-white/70 backdrop-blur-md"></div> */}

      {/* LEFT PANEL */}
      <div className="hidden md:flex md:w-full lg:w-1/2 bg-[#1b4dff] text-white">

        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 w-full">

        <div className="h-18 flex items-center gap-3 border-gray-200  w-[130px]">
            {/* <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PathLIMS</h1>
              <p className="text-sm text-indigo-200">Laboratory Management</p>
            </div> */}
             <img
              src="/blu-login.png"
              alt="BluLIMS"
              className="h-8 sm:h-9 md:h-24 w-auto max-w-[180px] object-contain"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Precision in Every Result
          </h2>

          <p className="text-sm sm:text-base text-indigo-200 max-w-md">
            End-to-end lab workflow for Clinical & Anatomic Pathology.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["CP Workflow", "AP Workflow", "QC/QA"].map((item) => (
              <div key={item} className="bg-white/10 p-4 rounded-lg">
                {item}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">

       <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">

          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-6">
            {/* <FlaskConical className="w-8 h-8 text-indigo-600" /> */}
             <img
              src="/blu-lims.png"
              alt="BluLIMS"
              className="h-8 sm:h-9 md:h-16 w-auto max-w-[180px] object-contain"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Welcome back
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Sign in to your workspace
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">

            <input
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              placeholder="Subdomain"
              className="input-lab"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-lab"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-lab pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1b4dff] text-white rounded-lg"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

        </div>
      </div>

      {/* ROLE MODAL */}
      {isHaveMultipleRoles && (
        <CommonModal
          open={isHaveMultipleRoles}
          title="Select Role"
          description="Choose your role"
          onClose={closeHandler}
          onSubmit={goToDashboard}
        >
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`w-full p-2 border rounded ${
                selectedRole === role.id ? "bg-indigo-100" : ""
              }`}
            >
              {role.name}
            </button>
          ))}
        </CommonModal>
      )}

    </div>
  );
}