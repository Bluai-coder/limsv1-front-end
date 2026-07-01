// // // ============================================================
// // // app/auth/login/page.jsx — Login page
// // // ============================================================


// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/lib/auth-store';
// import { authApi } from '@/lib/api';
// import { Eye, EyeOff } from 'lucide-react';
// import CommonModal from '@/components/CommonModal';

// export default function LoginPage() {
//   const router = useRouter();
//   const { setAuth, logout } = useAuthStore();

//   const [email, setEmail] = useState('blulab99@gmail.com');
//   const [password, setPassword] = useState('Admin@123');
//   const [tenant, setTenant] = useState('blulab.in');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const [isHaveMultipleRoles, setIsHaveMultipleRoles] = useState(false);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [roles, setRoles] = useState([]);

//   // ================= LOGIN =================
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await authApi.login({
//         email,
//         password,
//         tenantSubdomain: tenant,
//       });

//       const data = res?.data;

//       const permissionMap = Object.fromEntries(
//         (data.user.permissions || []).map((p) => [p.module, p.actions || []])
//       );

//       const normalizedUser = {
//         ...data.user,
//         permissions: permissionMap,
//       };

//       setAuth({
//         accessToken: data.accessToken,
//         refreshToken: data.refreshToken,
//         user: normalizedUser,
//         tenant: data.tenant,
//       });

//       const apiRoles = data?.user?.roles || [];

//       if (apiRoles.length > 1) {
//         setRoles(apiRoles);
//         setIsHaveMultipleRoles(true);
//       } else {
//         router.push("/dashboard");
//       }

//     } catch (err) {
//       setError(err?.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= ROLE SELECT =================
//   const goToDashboard = async () => {
//     try {
//       const res = await authApi.selectRole({ roleId: selectedRole });
//       const data = res?.data?.data;

//       const permissionMap = Object.fromEntries(
//         (data.user.permissions || []).map((p) => [p.module, p.actions || []])
//       );

//       setAuth({
//         accessToken: data.accessToken,
//         refreshToken: data.refreshToken,
//         user: { ...data.user, permissions: permissionMap },
//         tenant: data.tenant,
//       });

//       router.push("/dashboard");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const closeHandler = () => {
//     setIsHaveMultipleRoles(false);
//     logout();
//   };

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row ">
//       {/* <div className="min-h-screen flex flex-col lg:flex-row bg-white/70 backdrop-blur-md"></div> */}

//       {/* LEFT PANEL */}
//       <div className="hidden md:flex md:w-full lg:w-1/2 bg-[#1b4dff] text-white">

//         <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 w-full">

//         <div className="h-18 flex items-center gap-3 border-gray-200  w-[130px]">

//              <img
//               src="/blu-login.png"
//               alt="BluLIMS"
//               className="h-8 sm:h-9 md:h-24 w-auto max-w-[180px] object-contain"
//             />
//           </div>

//           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
//             Precision in Every Result
//           </h2>

//           <p className="text-sm sm:text-base text-indigo-200 max-w-md">
//             End-to-end lab workflow for Clinical & Anatomic Pathology.
//           </p>

//           <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {["CP Workflow", "AP Workflow", "QC/QA"].map((item) => (
//               <div key={item} className="bg-white/10 p-4 rounded-lg">
//                 {item}
//               </div>
//             ))}
//           </div>

//         </div>
//       </div>

//       {/* RIGHT PANEL */}
//       <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">

//        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">

//           {/* Mobile Logo */}
//           <div className="md:hidden flex justify-center mb-6">
//             {/* <FlaskConical className="w-8 h-8 text-indigo-600" /> */}
//              <img
//               src="/blu-lims.png"
//               alt="BluLIMS"
//               className="h-8 sm:h-9 md:h-16 w-auto max-w-[180px] object-contain"
//             />
//           </div>

//           <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
//             Welcome back
//           </h2>
//           <p className="text-gray-500 mb-6 text-sm">
//             Sign in to your workspace
//           </p>

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5 mt-6">

//             <input
//               value={tenant}
//               onChange={(e) => setTenant(e.target.value)}
//               placeholder="Subdomain"
//               className="input-lab"
//             />

//             <input
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Email"
//               className="input-lab"
//             />

//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Password"
//                 className="input-lab pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-2"
//               >
//                 {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-[#1b4dff] text-white rounded-lg"
//             >
//               {loading ? "Signing in..." : "Sign in"}
//             </button>

//           </form>

//         </div>
//       </div>

//       {/* ROLE MODAL */}
//       {isHaveMultipleRoles && (
//         <CommonModal
//           open={isHaveMultipleRoles}
//           title="Select Role"
//           description="Choose your role"
//           onClose={closeHandler}
//           onSubmit={goToDashboard}
//         >
//           {roles.map((role) => (
//             <button
//               key={role.id}
//               onClick={() => setSelectedRole(role.id)}
//               className={`w-full p-2 border rounded ${
//                 selectedRole === role.id ? "bg-indigo-100" : ""
//               }`}
//             >
//               {role.name}
//             </button>
//           ))}
//         </CommonModal>
//       )}

//     </div>
//   );
// }















// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/lib/auth-store';
// import { adminApi, authApi } from '@/lib/api';
// import { Eye, EyeOff, Building2, Settings, ArrowRight, X } from 'lucide-react';
// import CommonModal from '@/components/CommonModal';

// export default function LoginPage() {
//   const router = useRouter();
//   const { setAuth, logout } = useAuthStore();

//   // Login type selection
//   const [showTypeModal, setShowTypeModal] = useState(true);
//   const [loginType, setLoginType] = useState(null); // 'lab_tenant' or 'lab_management'

//   // Lab Tenant Login (Users/Owner) form fields
//   const [email, setEmail] = useState('blulab99@gmail.com');
//   const [password, setPassword] = useState('Admin@123');
//   const [tenant, setTenant] = useState('blulab.in');

//   // Lab Management Login (Admin/Super Admin) form fields
//   const [adminEmail, setAdminEmail] = useState('superadmin@bluai.ai');
//   const [adminPassword, setAdminPassword] = useState('Admin@123');
//   const [adminSecretKey, setAdminSecretKey] = useState('');

//   // Common states
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Role selection states
//   const [isHaveMultipleRoles, setIsHaveMultipleRoles] = useState(false);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [roles, setRoles] = useState([]);

//   // ================= LOGIN TYPE SELECTION =================
//   const handleSelectLoginType = (type) => {
//     setLoginType(type);
//     setShowTypeModal(false);
//     setError('');
//   };

//   const handleBackToTypeSelection = () => {
//     setLoginType(null);
//     setShowTypeModal(true);
//     setError('');
//     // Clear forms
//     setEmail('blulab99@gmail.com');
//     setPassword('Admin@123');
//     setTenant('blulab.in');
//     setAdminEmail('');
//     setAdminPassword('');
//     setAdminSecretKey('');
//   };

//   // ================= LAB TENANT LOGIN =================
//   const handleLabTenantSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = loginType === 'lab_management' ? await adminApi.login({
//         email: adminEmail,
//         password: adminPassword,

//       }) : await authApi.login({
//         email,
//         password,
//         tenantSubdomain: tenant,
//       });

//       console.log("resresres", res)

//       const data = res?.data;

//       console.log("datadata", data)

//       const permissionMap = Object.fromEntries(
//         (data?.user?.permissions || data.data?.permissions || []).map((p) => [p.module, p.actions || []])
//       );

//       const normalizedUser = {
//         ...data.user,
//         permissions: permissionMap,
//       };

//       setAuth({
//         accessToken: data.accessToken,
//         refreshToken: data.refreshToken,
//         user: normalizedUser,
//         tenant: data.tenant,
//       });

//       const apiRoles = data?.user?.roles || [];

//       if (apiRoles.length > 1) {
//         setRoles(apiRoles);
//         setIsHaveMultipleRoles(true);
//       } else {

//         loginType === 'lab_management' ? router.push("/admin/tenants") :
//           router.push("/dashboard");
//       }

//     } catch (err) {
//       setError(err?.response?.data?.message || "Login failed" );
//     } finally {
//       setLoading(false);
//     }
//   };



//   // ================= ROLE SELECT =================
//   const goToDashboard = async (roleId) => {
//     setSelectedRole(roleId);
//     try {
//       const res = await authApi.selectRole({ roleId });
//       const data = res?.data?.data;

//       const permissionMap = Object.fromEntries(
//         (data.user.permissions || []).map((p) => [p.module, p.actions || []])
//       );

//       setAuth({
//         accessToken: data.accessToken,
//         refreshToken: data.refreshToken,
//         user: { ...data.user, permissions: permissionMap },
//         tenant: data.tenant,
//       });

//       setIsHaveMultipleRoles(false);

//       if (loginType === 'lab_management') {
//         router.push("/admin/dashboard");
//       } else {
//         router.push("/dashboard");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const closeHandler = () => {
//     setIsHaveMultipleRoles(false);
//     logout();
//     handleBackToTypeSelection();
//   };

//   // ================= LOGIN TYPE SELECTION MODAL =================
//   const LoginTypeModal = () => (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-bold text-white">Select Login Type</h2>
//             {/* <button
//               onClick={() => router.push('/')}
//               className="text-white/80 hover:text-white transition"
//             >
//               <X className="w-5 h-5" />
//             </button> */}
//           </div>
//           <p className="text-blue-100 text-sm mt-1">Choose how you want to access the system</p>
//         </div>

//         <div className="p-6 space-y-4">
//           {/* Lab Tenant Login Option */}
//           <button
//             onClick={() => handleSelectLoginType('lab_tenant')}
//             className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
//           >
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 transition">
//                 <Building2 className="w-6 h-6 text-blue-600" />
//               </div>
//               <div className="flex-1 text-left">
//                 <h3 className="font-semibold text-gray-900 dark:text-white">Lab Tenant Login</h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">For lab users, owners, and staff members</p>
//               </div>
//               <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition" />
//             </div>
//           </button>

//           {/* Lab Management Login Option */}
//           <button
//             onClick={() => handleSelectLoginType('lab_management')}
//             className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
//           >
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 transition">
//                 <Settings className="w-6 h-6 text-purple-600" />
//               </div>
//               <div className="flex-1 text-left">
//                 <h3 className="font-semibold text-gray-900 dark:text-white">Tenant Management Login</h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">For administrators and super admins</p>
//               </div>
//               <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition" />
//             </div>
//           </button>
//         </div>

//         <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
//           <p className="text-xs text-center text-gray-500 dark:text-gray-400">
//             Secure access to BluLIMS platform
//           </p>
//         </div>
//       </div>
//     </div>
//   );

//   // ================= LAB TENANT LOGIN FORM =================
//   const LabTenantLoginForm = () => (
//     <div className="min-h-screen flex flex-col lg:flex-row">
//       {/* LEFT PANEL */}
//       <div className="hidden md:flex md:w-full lg:w-1/2 bg-[#1b4dff] text-white">
//         <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 w-full">
//           <div className="h-18 flex items-center gap-3 border-gray-200 w-[130px]">
//             <img
//               src="/blu-login.png"
//               alt="BluLIMS"
//               className="h-8 sm:h-9 md:h-24 w-auto max-w-[180px] object-contain"
//             />
//           </div>
//           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
//             Precision in Every Result
//           </h2>
//           <p className="text-sm sm:text-base text-indigo-200 max-w-md">
//             End-to-end lab workflow for Clinical & Anatomic Pathology.
//           </p>
//           <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {["CP Workflow", "AP Workflow", "QC/QA"].map((item) => (
//               <div key={item} className="bg-white/10 p-4 rounded-lg">{item}</div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* RIGHT PANEL */}
//       <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">
//         <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
//           {/* Back Button */}
//           <button
//             onClick={handleBackToTypeSelection}
//             className="mb-4 text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
//           >
//             ← Back to login type
//           </button>

//           {/* Mobile Logo */}
//           <div className="md:hidden flex justify-center mb-6">
//             <img
//               src="/blu-lims.png"
//               alt="BluLIMS"
//               className="h-8 sm:h-9 md:h-16 w-auto max-w-[180px] object-contain"
//             />
//           </div>

//           <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
//             Welcome back
//           </h2>
//           <p className="text-gray-500 mb-6 text-sm">
//             Sign in to your workspace
//           </p>

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleLabTenantSubmit} className="space-y-5 mt-6">
//             <input
//               value={tenant}
//               type="text"
//               onChange={(e) => setTenant(e.target.value)}
//               placeholder="Subdomain"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <input
//             type="text"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Email"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Password"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-[#1b4dff] text-white rounded-lg font-medium transition disabled:opacity-50"
//             >
//               {loading ? "Signing in..." : "Sign in"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );

//   // ================= LAB MANAGEMENT LOGIN FORM =================
//   const LabManagementLoginForm = () => (
//     <div className="min-h-screen flex flex-col lg:flex-row">
//       {/* LEFT PANEL */}
//       <div className="hidden md:flex md:w-full lg:w-1/2 bg-gradient-to-br from-[#8800ff] to-[#000000] text-white">
//         <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 w-full">
//           <div className="h-18 flex items-center gap-3 w-[130px]">
//             <img
//               src="/blu-login.png"
//               alt="BluLIMS"
//               className="h-8 sm:h-9 md:h-24 w-auto max-w-[180px] object-contain brightness-0 invert"
//             />
//           </div>
//           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
//             Tenant Management Portal
//           </h2>
//           <p className="text-sm sm:text-base text-purple-200 max-w-md">
//             Centralized control for all laboratory operations and administration.
//           </p>
//           <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {["Tenant Management", "User Management", "System Settings"].map((item) => (
//               <div key={item} className="bg-white/10 p-4 rounded-lg">{item}</div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* RIGHT PANEL */}
//       <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">
//         <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
//           {/* Back Button */}
//           <button
//             onClick={handleBackToTypeSelection}
//             className="mb-4 text-sm text-gray-500 hover:text-purple-600 flex items-center gap-1"
//           >
//             ← Back to login type
//           </button>

//           {/* Mobile Logo */}
//           <div className="md:hidden flex justify-center mb-6">
//             <img
//               src="/blu-lims.png"
//               alt="BluLIMS"
//               className="h-8 sm:h-9 md:h-16 w-auto max-w-[180px] object-contain"
//             />
//           </div>

//           <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
//             Admin Login
//           </h2>
//           <p className="text-gray-500 mb-6 text-sm">
//             Administrator access only
//           </p>

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleLabTenantSubmit} className="space-y-5 mt-6">
//             <input
//               value={adminEmail}
//               onChange={(e) => setAdminEmail(e.target.value)}
//               placeholder="Admin Email"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={adminPassword}
//                 onChange={(e) => setAdminPassword(e.target.value)}
//                 placeholder="Password"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//             {/* <input
//               value={adminSecretKey}
//               onChange={(e) => setAdminSecretKey(e.target.value)}
//               placeholder="Admin Secret Key"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             /> */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-gradient-to-br from-[#8800ff] to-[#000000] hover:from-[#7700e6] hover:to-[#000000] text-white rounded-lg font-medium transition disabled:opacity-50"
//             >
//               {loading ? "Signing in..." : "Sign in as Admin"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );

//   // ================= MAIN RENDER =================
//   // Show role modal first if multiple roles
//   if (isHaveMultipleRoles) {
//     return (
//       <CommonModal
//         open={isHaveMultipleRoles}
//         title="Select Role"
//         description="Choose your role to continue"
//         onClose={closeHandler}
//         onClick={goToDashboard}
//         submitText="Continue to Dashboard"
//         cancelText="Cancel"
//       >
//         <div className="space-y-3">
//           {roles.map((role) => (
//             <button
//               key={role.id}
//               onClick={() => goToDashboard(role.id)}
//               className={`
//           w-full p-4 rounded-xl text-left transition-all duration-200
//           flex items-center gap-4
//           ${selectedRole === role.id
//                   ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-500 dark:border-blue-400 shadow-md"
//                   : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm"
//                 }
//         `}
//             >
//               {/* Role Icon */}
//               <div className={`
//           w-12 h-12 rounded-full flex items-center justify-center transition-all
//           ${selectedRole === role.id
//                   ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
//                   : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
//                 }
//         `}>
//                 {role.name === 'Admin' || role.name === 'Super Admin' ? (
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                   </svg>
//                 ) : role.name === 'Pathologist' ? (
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                   </svg>
//                 ) : (
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 )}
//               </div>

//               {/* Role Info */}
//               <div className="flex-1">
//                 <h3 className={`font-semibold text-lg ${selectedRole === role.id
//                   ? "text-gray-900 dark:text-white"
//                   : "text-gray-800 dark:text-gray-200"
//                   }`}>
//                   {role.name}
//                 </h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {role.description || `Access with ${role.name} permissions`}
//                 </p>
//               </div>

//               {/* Selected Checkmark */}
//               {selectedRole === role.id && (
//                 <div className="flex-shrink-0">
//                   <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                 </div>
//               )}
//             </button>
//           ))}
//         </div>
//       </CommonModal>
//     );
//   }

//   // Show login type selection modal
//   if (showTypeModal) {
//     return <LoginTypeModal />;
//   }

//   // Show respective login form
//   if (loginType === 'lab_tenant') {
//     return <LabTenantLoginForm />;
//   }

//   if (loginType === 'lab_management') {
//     return <LabManagementLoginForm />;
//   }

//   return null;
// }













'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { adminApi, authApi } from '@/lib/api';
import { Eye, EyeOff, Building2, Settings, ArrowRight, X } from 'lucide-react';
import CommonModal from '@/components/CommonModal';

// ================= LOGIN TYPE SELECTION MODAL =================
const LoginTypeModal = ({ onSelectLoginType }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Select Login Type</h2>
        </div>
        <p className="text-blue-100 text-sm mt-1">Choose how you want to access the system</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Lab Tenant Login Option */}
        <button
          onClick={() => onSelectLoginType('lab_tenant')}
          className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 transition">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Lab Tenant Login</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">For lab users, owners, and staff members</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Lab Management Login Option */}
        <button
          onClick={() => onSelectLoginType('lab_management')}
          className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 transition">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Tenant Management Login</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">For administrators and super admins</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Secure access to BluLIMS platform
        </p>
      </div>
    </div>
  </div>
);

// ================= LAB TENANT LOGIN FORM =================
const LabTenantLoginForm = ({
  tenant,
  setTenant,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  loading,
  onSubmit,
  onBack
}) => (
  <div className="min-h-screen flex flex-col lg:flex-row">
    {/* LEFT PANEL */}
    <div className="hidden md:flex md:w-full lg:w-1/2 bg-[#1b4dff] text-white">
      <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 w-full">
        <div className="h-18 flex items-center gap-3 border-gray-200 w-[130px]">
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
            <div key={item} className="bg-white/10 p-4 rounded-lg">{item}</div>
          ))}
        </div>
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
        >
          ← Back to login type
        </button>

        {/* Mobile Logo */}
        <div className="md:hidden flex justify-center mb-6">
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

        <form onSubmit={onSubmit} className="space-y-5 mt-6">
          <input
            value={tenant}
            type="text"
            onChange={(e) => setTenant(e.target.value)}
            placeholder="Subdomain"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1b4dff] text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  </div>
);

// ================= LAB MANAGEMENT LOGIN FORM =================
const LabManagementLoginForm = ({
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  showPassword,
  setShowPassword,
  error,
  loading,
  onSubmit,
  onBack
}) => (
  <div className="min-h-screen flex flex-col lg:flex-row">
    {/* LEFT PANEL */}
    <div className="hidden md:flex md:w-full lg:w-1/2 bg-gradient-to-br from-[#8800ff] to-[#000000] text-white">
      <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 w-full">
        <div className="h-18 flex items-center gap-3 w-[130px]">
          <img
            src="/blu-login.png"
            alt="BluLIMS"
            className="h-8 sm:h-9 md:h-24 w-auto max-w-[180px] object-contain brightness-0 invert"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          Tenant Management Portal
        </h2>
        <p className="text-sm sm:text-base text-purple-200 max-w-md">
          Centralized control for all laboratory operations and administration.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["Tenant Management", "User Management", "System Settings"].map((item) => (
            <div key={item} className="bg-white/10 p-4 rounded-lg">{item}</div>
          ))}
        </div>
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 text-sm text-gray-500 hover:text-purple-600 flex items-center gap-1"
        >
          ← Back to login type
        </button>

        {/* Mobile Logo */}
        <div className="md:hidden flex justify-center mb-6">
          <img
            src="/blu-lims.png"
            alt="BluLIMS"
            className="h-8 sm:h-9 md:h-16 w-auto max-w-[180px] object-contain"
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Admin Login
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Administrator access only
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5 mt-6">
          <input
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Admin Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-br from-[#8800ff] to-[#000000] hover:from-[#7700e6] hover:to-[#000000] text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>
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

  // Lab Tenant Login (Users/Owner) form fields
  const [email, setEmail] = useState('blulab99@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [tenant, setTenant] = useState('blulab.in');

  // Lab Management Login (Admin/Super Admin) form fields
  const [adminEmail, setAdminEmail] = useState('superadmin@bluai.ai');
  const [adminPassword, setAdminPassword] = useState('Admin@123');
  const [adminSecretKey, setAdminSecretKey] = useState('');

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
    setEmail('blulab99@gmail.com');
    setPassword('Admin@123');
    setTenant('blulab.in');
    setAdminEmail('');
    setAdminPassword('');
    setAdminSecretKey('');
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

      console.log("resresres", res)

      const data = res?.data;

      console.log("datadata", data)

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

  // Show role modal first if multiple roles
  if (isHaveMultipleRoles) {
    return (
      <CommonModal
        open={isHaveMultipleRoles}
        title="Select Role"
        description="Choose your role to continue"
        onClose={closeHandler}
        onClick={goToDashboard}
        submitText="Continue to Dashboard"
        cancelText="Cancel"
      >
        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => goToDashboard(role.id)}
              className={`
          w-full p-4 rounded-xl text-left transition-all duration-200
          flex items-center gap-4
          ${selectedRole === role.id
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-500 dark:border-blue-400 shadow-md"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm"
                }
        `}
            >
              {/* Role Icon */}
              <div className={`
          w-12 h-12 rounded-full flex items-center justify-center transition-all
          ${selectedRole === role.id
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
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

              {/* Role Info */}
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${selectedRole === role.id
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-800 dark:text-gray-200"
                  }`}>
                  {role.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {role.description || `Access with ${role.name} permissions`}
                </p>
              </div>

              {/* Selected Checkmark */}
              {selectedRole === role.id && (
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </CommonModal>
    );
  }

  // Show login type selection modal
  if (showTypeModal) {
    return <LoginTypeModal onSelectLoginType={handleSelectLoginType} />;
  }

  // Show respective login form
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




