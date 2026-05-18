
// "use client";

// import React, { useEffect, useState } from "react";
// import { useAuthStore } from "@/lib/auth-store";
// import { useCreateRolesModulesPermissions, useRoleModulesPermissionsById } from "@/hooks/useRoleModulepermission";
// import { useRoles } from "@/hooks/use-roles";
// import SingleSelectField from "@/components/form-fields/SingleSelectField";
// import { useForm } from "react-hook-form";

// const modules = [
//   "Dashboard",
//   "Patients",
//   "Specimens",
//   "Orders",
//   "Worklist",
//   "Results Entry",
//   "QC Management",
//   "Users",
//   "Tests & Prices",
//   "Instruments",
//   "Roles",
//   "Settings",
//   "Permissions",
//   "Assign Permissions",
// ];

// const actions = ["create", "read", "update", "delete"];

// const initialState = modules.reduce((acc, m) => {
//   acc[m] = {
//     create: false,
//     read: false,
//     update: false,
//     delete: false,
//   };
//   return acc;
// }, {});

// export default function RolePermissionMatrix() {
//   const [permissions, setPermissions] = useState(initialState);
//   const [selected, setSelected] = useState(null);
//   const { user, tenant } = useAuthStore();

//     // ✅ ROLES LIST
//   const { data } = useRoles({
//     page: 1,
//     limit: 20,
//     tenantId: tenant?.id,
//   });


//   const {
//     register,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       roleId: null,
//     },
//   });


//   const createPermission = useCreateRolesModulesPermissions();

//   // ✅ ROLE ID
//   const roleId = watch("roleId");

//   // ✅ FETCH ROLE PERMISSION
//   const { data: roleData } = useRoleModulesPermissionsById(roleId, tenant?.id);

//   // ✅ MAP API → UI STATE
//   const mapApiToState = (apiPermissions) => {
//     const state = {};

//     modules.forEach((module) => {
//       state[module] = {
//         create: false,
//         read: false,
//         update: false,
//         delete: false,
//       };
//     });

//     apiPermissions?.forEach(({ module, actions }) => {
//       if (!state[module]) return;

//       actions.forEach((action) => {
//         if (state[module][action] !== undefined) {
//           state[module][action] = true;
//         }
//       });
//     });

//     return state;
//   };



//  useEffect(() => {
//    console.log("rolerolerole",user?.role?.id)
//    console.log("rolerolerolddde",data)

// const loginUserRole = data?.data?.find(
//   (r) => r.name === user?.roles?.[0]?.name
// );

// console.log("loginUserRole:", loginUserRole);

// if (user?.role || loginUserRole) {
//     const role = loginUserRole?.id || user?.role?.id;

//     setValue("roleId", role, {
//       shouldValidate: true,
//       shouldDirty: false,
//     });
//   }
// }, [user, setValue, data]);

// console.log("bbbbb",watch("roleId"))
//   // ✅ AUTO POPULATE
//   useEffect(() => {
//     if (roleData?.permission) {
//       const mapped = mapApiToState(roleData.permission);
//       console.log("mappedmappedmapped",mapped)
//       setPermissions(mapped);
//     } else {
//       setPermissions(initialState);
//     }
//   }, [roleData]);




//   // clear :----

//   const clearField = () => {
//     // ✅ Reset all permissions (checkboxes)
//     const clearedPermissions = Object.fromEntries(
//       Object.entries(initialState).map(([module, actionObj]) => [
//         module,
//         Object.fromEntries(
//           Object.keys(actionObj).map((action) => [action, false])
//         ),
//       ])
//     );

//     // ✅ Reset role field (IMPORTANT)
//     setSelected(null)

//     // ✅ Reset permissions state
//     setPermissions(clearedPermissions);
//   };
//   // ✅ SAVE
//   const handleSave = async () => {
//     const selectedModules = Object.entries(permissions)
//       .map(([module, actionObj]) => {
//         const selectedActions = Object.entries(actionObj)
//           .filter(([_, value]) => value)
//           .map(([action]) => action);

//         if (!selectedActions.length) return null;

//         return {
//           module,
//           actions: selectedActions,
//         };
//       })
//       .filter(Boolean);

//     const payload = {
//       role_id: roleId,
//       permission: selectedModules,
//     };

//     console.log("FINAL:", payload);

//     try {
//       await createPermission.mutateAsync(payload);
//       alert("Permissions saved successfully ✅");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save ❌");
//     }
//   };



//   const roleOptions =
//     data?.data?.map((item) => ({
//       id: item.id,
//       label: item.displayName,
//     })) || [];


// return (
//   <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6">

//     {/* HEADER */}
//     <div className="mb-6">
//       <h2 className="text-xl font-semibold text-gray-900">Role Permissions</h2>
//       <p className="text-sm text-gray-500 mt-1">
//         Manage module-level access for each role
//       </p>
//     </div>

//     {/* ROLE SELECT */}
//     <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-4 shadow-sm mb-6">
//       <SingleSelectField
//         label="Select Role"
//         name="roleId"
//         options={roleOptions}
//         register={register}
//         setValue={setValue}
//         error={errors.roles}
//         watch={watch}
//         selected={selected}
//         setSelected={setSelected}
//       />
//     </div>

//     {/* MATRIX TABLE */}
//     <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-lg overflow-hidden">

//       <div className="overflow-x-auto">
//         <div className="min-w-[700px]">

//           {/* HEADER */}
//           <div className="flex px-5 py-3 bg-gray-50 border-b text-xs uppercase text-gray-500 tracking-wider">
//             <div className="w-[40%] font-semibold">Module</div>

//             {actions.map((action) => (
//               <div key={action} className="w-[15%] flex justify-center font-semibold">
//                 {action}
//               </div>
//             ))}
//           </div>

//           {/* ROWS */}
//           {modules.map((module, idx) => (
//             <div
//               key={module}
//               className={`flex px-5 py-3 items-center border-b transition
//               ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//               hover:bg-blue-50`}
//             >

//               {/* MODULE NAME */}
//               <div className="w-[40%] flex items-center gap-3">

//                 <input
//                   type="checkbox"
//                   className="w-4 h-4 accent-blue-600"
//                   checked={actions.every((a) => permissions[module][a])}
//                   ref={(el) => {
//                     if (el) {
//                       const values = Object.values(permissions[module]);
//                       el.indeterminate =
//                         values.some(Boolean) && !values.every(Boolean);
//                     }
//                   }}
//                   onChange={() => {
//                     const allChecked = actions.every(
//                       (a) => permissions[module][a]
//                     );

//                     const updated = {};
//                     actions.forEach((a) => (updated[a] = !allChecked));

//                     setPermissions((prev) => ({
//                       ...prev,
//                       [module]: updated,
//                     }));
//                   }}
//                 />

//                 <span className="text-sm font-medium text-gray-800">
//                   {module}
//                 </span>
//               </div>

//               {/* ACTION CHECKBOXES */}
//               {actions.map((action) => (
//                 <div key={action} className="w-[15%] flex justify-center">
//                   <input
//                     type="checkbox"
//                     className="w-4 h-4 accent-blue-600"
//                     checked={permissions[module][action]}
//                     onChange={() => {
//                       setPermissions((prev) => ({
//                         ...prev,
//                         [module]: {
//                           ...prev[module],
//                           [action]: !prev[module][action],
//                         },
//                       }));
//                     }}
//                   />
//                 </div>
//               ))}

//             </div>
//           ))}

//         </div>
//       </div>
//     </div>

//     {/* ACTION BUTTONS */}
//     <div className="flex justify-end gap-3 mt-6">

//       <button
//         onClick={clearField}
//         className="px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
//       >
//         Cancel
//       </button>

//       <button
//         disabled={!roleId}
//         onClick={handleSave}
//         className="px-6 py-2.5 bg-[#1b4dff] text-white rounded-xl text-sm shadow hover:shadow-lg transition disabled:opacity-50"
//       >
//         Save Permissions
//       </button>

//     </div>

//   </div>
// );
// }





















// "use client";

// import React, { useEffect, useState } from "react";
// import { useAuthStore } from "@/lib/auth-store";
// import { useCreateRolesModulesPermissions, useRoleModulesPermissionsById } from "@/hooks/useRoleModulepermission";
// import { useRoles } from "@/hooks/use-roles";
// import SingleSelectField from "@/components/form-fields/SingleSelectField";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { Loader2, Save, X } from "lucide-react";
// import { usePermissions } from "@/hooks/permissions/usePermissions";
// import { PermissionDenied } from "@/components/PermissionGuard";

// const modules = [
//   "Dashboard",
//   "Patients",
//   "Specimens",
//   "Orders",
//   "Worklist",
//   "Results Entry",
//   "QC Management",
//   "Users",
//   "Tests & Prices",
//   "Instruments",
//   "Roles",
//   "Settings",
//   // "Permissions",
//   "Physicians",
//   "Audit Logs",
//   // "Assign Permissions",
// ];

// const actions = ["create", "read", "update", "delete"];

// const initialState = modules.reduce((acc, m) => {
//   acc[m] = {
//     create: false,
//     read: false,
//     update: false,
//     delete: false,
//   };
//   return acc;
// }, {});

// export default function RolePermissionMatrix() {
//   // Use permission hook
//   const {
//     canCreate,
//     canRead,
//     canUpdate,
//     canDelete,
//     isAdmin
//   } = usePermissions();

//   // Check if user has read access to Physicians
//   if (!canRead('Settings')) {
//     return <PermissionDenied resource="Settings" action="read" />;
//   }
//   const [permissions, setPermissions] = useState(initialState);
//   const [selectedRole, setSelectedRole] = useState(null);
//   const { user, tenant } = useAuthStore();

//   // ✅ ROLES LIST
//   const { data: rolesData, isLoading: rolesLoading } = useRoles({
//     page: 1,
//     limit: 100,
//     tenantId: tenant?.id,
//   });

//   const {
//     register,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       roleId: null,
//     },
//   });

//   const createPermission = useCreateRolesModulesPermissions();

//   // ✅ ROLE ID
//   const roleId = watch("roleId");

//   // ✅ FETCH ROLE PERMISSION
//   const { data: roleData, isLoading: permissionLoading } = useRoleModulesPermissionsById(roleId, tenant?.id);

//   // ✅ MAP API → UI STATE
//   const mapApiToState = (apiPermissions) => {
//     const state = JSON.parse(JSON.stringify(initialState));

//     apiPermissions?.forEach(({ module, actions: moduleActions }) => {
//       if (state[module]) {
//         moduleActions.forEach((action) => {
//           if (state[module][action] !== undefined) {
//             state[module][action] = true;
//           }
//         });
//       }
//     });

//     return state;
//   };

//   // ✅ Set default role based on logged-in user
//   useEffect(() => {
//     if (!rolesData?.data?.data?.length || !user) return;

//     // Try to find role by user's role name
//     const userRoleName = user?.roles?.[0]?.name || user?.role?.name;

//     if (userRoleName) {
//       const matchedRole = rolesData?.data?.data.find(
//         (r) => r.name === userRoleName || r.displayName === userRoleName
//       );

//       if (matchedRole) {
//         setValue("roleId", matchedRole.id);
//         setSelectedRole({ id: matchedRole.id, label: matchedRole.displayName || matchedRole.name });
//       }
//     }
//   }, [rolesData, user, setValue]);

//   // ✅ AUTO POPULATE permissions when role changes
//   useEffect(() => {
//     if (roleData?.permission) {
//       const mapped = mapApiToState(roleData.permission);
//       setPermissions(mapped);
//     } else if (roleId) {
//       // Reset to empty permissions for new role
//       setPermissions(JSON.parse(JSON.stringify(initialState)));
//     }
//   }, [roleData, roleId]);

//   // ✅ CLEAR FORM
//   const clearField = () => {
//     // Reset permissions
//     const clearedPermissions = JSON.parse(JSON.stringify(initialState));
//     setPermissions(clearedPermissions);

//     // Reset role field
//     setValue("roleId", null);
//     setSelectedRole(null);

//     toast.info("Form cleared");
//   };

//   // ✅ SAVE PERMISSIONS
//   const handleSave = async () => {
//     if (!roleId) {
//       toast.error("Please select a role first");
//       return;
//     }

//     const selectedModules = Object.entries(permissions)
//       .map(([module, actionObj]) => {
//         const selectedActions = Object.entries(actionObj)
//           .filter(([_, value]) => value)
//           .map(([action]) => action);

//         if (!selectedActions.length) return null;

//         return {
//           module,
//           actions: selectedActions,
//         };
//       })
//       .filter(Boolean);

//     if (selectedModules.length === 0) {
//       toast.error("Please select at least one permission");
//       return;
//     }

//     const payload = {
//       role_id: roleId,
//       permission: selectedModules,
//     };

//     try {
//       await createPermission.mutateAsync(payload);
//       toast.success("Permissions saved successfully!");
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.message || "Failed to save permissions");
//     }
//   };

//   // Role options for dropdown
//   console.log("rolesDatarolesData", rolesData)
//   const roleOptions =
//     rolesData?.data?.data?.map((item) => ({
//       id: item.id,
//       label: item.displayName || item.name,
//     })) || [];

//   // Check if any permission is selected for a module
//   const getModuleCheckState = (module) => {
//     const modulePermissions = permissions[module];
//     const allChecked = actions.every(action => modulePermissions[action]);
//     const someChecked = actions.some(action => modulePermissions[action]);
//     return { allChecked, someChecked };
//   };

//   // Toggle all permissions for a module
//   const toggleModule = (module) => {
//     const { allChecked } = getModuleCheckState(module);
//     const updated = {};
//     actions.forEach((action) => (updated[action] = !allChecked));

//     setPermissions((prev) => ({
//       ...prev,
//       [module]: updated,
//     }));
//   };

//   if (rolesLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6">
//       {/* HEADER */}
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-900">Role Permissions</h2>
//         <p className="text-sm text-gray-500 mt-1">
//           Manage module-level access for each role
//         </p>
//       </div>

//       {/* ROLE SELECT */}
//       <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Select Role <span className="text-red-500">*</span>
//         </label>

//         <SingleSelectField
//           name="roleId"
//           options={roleOptions}
//           register={register}
//           setValue={setValue}
//           watch={watch}
//           error={errors.roleId}
//           selected={selectedRole}
//           setSelected={setSelectedRole}
//           placeholder="Choose a role..."
//         />

//         {roleId && (
//           <p className="text-xs text-gray-400 mt-2">
//             {permissionLoading ? "Loading permissions..." : "Editing permissions for selected role"}
//           </p>
//         )}
//       </div>

//       {/* PERMISSIONS MATRIX TABLE */}
//       <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
//         {permissionLoading ? (
//           <div className="flex justify-center items-center py-20">
//             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//             <span className="ml-3 text-gray-600">Loading permissions...</span>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <div className="min-w-[800px]">
//               {/* TABLE HEADER */}
//               <div className="flex px-5 py-4 bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                 <div className="w-[40%]">Module</div>
//                 {actions.map((action) => (
//                   <div key={action} className="w-[15%] text-center">
//                     {action}
//                   </div>
//                 ))}
//               </div>

//               {/* TABLE ROWS */}
//               {modules.map((module, idx) => {
//                 const { allChecked, someChecked } = getModuleCheckState(module);

//                 return (
//                   <div
//                     key={module}
//                     className={`flex px-5 py-3 items-center border-b transition-colors
//                       ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                       hover:bg-blue-50/50`}
//                   >
//                     {/* MODULE NAME with select all checkbox */}
//                     <div className="w-[40%] flex items-center gap-3">
//                       <input
//                         type="checkbox"
//                         className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         checked={allChecked}
//                         ref={(el) => {
//                           if (el) {
//                             el.indeterminate = someChecked && !allChecked;
//                           }
//                         }}
//                         onChange={() => toggleModule(module)}
//                       />
//                       <span className="text-sm font-medium text-gray-800">
//                         {module}
//                       </span>
//                     </div>

//                     {/* ACTION CHECKBOXES */}
//                     {actions.map((action) => (
//                       <div key={action} className="w-[15%] flex justify-center">
//                         <input
//                           type="checkbox"
//                           className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                           checked={permissions[module]?.[action] || false}
//                           onChange={() => {
//                             setPermissions((prev) => ({
//                               ...prev,
//                               [module]: {
//                                 ...prev[module],
//                                 [action]: !prev[module]?.[action],
//                               },
//                             }));
//                           }}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 );
//               })}

//               {modules.length === 0 && (
//                 <div className="text-center py-12 text-gray-500">
//                   No modules configured
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ACTION BUTTONS */}
//       <div className="flex justify-end gap-3 mt-6">
//         <button
//           onClick={clearField}
//           className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
//         >
//           <X className="w-4 h-4" />
//           Clear
//         </button>

//         <button
//           disabled={!roleId || createPermission.isPending}
//           onClick={handleSave}
//           className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//         >
//           {createPermission.isPending ? (
//             <>
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Saving...
//             </>
//           ) : (
//             <>
//               <Save className="w-4 h-4" />
//               Save Permissions
//             </>
//           )}
//         </button>
//       </div>

//       {/* INFO FOOTER */}
//       {roleId && (
//         <div className="mt-4 text-center">
//           <p className="text-xs text-gray-400">
//             💡 Tip: Use the module checkbox to select/deselect all permissions for that module
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }













"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useCreateRolesModulesPermissions, useRoleModulesPermissionsById } from "@/hooks/useRoleModulepermission";
import { useRoles } from "@/hooks/use-roles";
import SingleSelectField from "@/components/form-fields/SingleSelectField";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { PermissionDenied } from "@/components/PermissionGuard";

const modules = [
  "Dashboard",
  "Patients",
  "Specimens",
  "Orders",
  "Worklist",
  "Results Entry",
  "QC Management",
  "Users",
  "Tests & Prices",
  "Instruments",
  "Roles",
  "Settings",
  "Physicians",
  "Audit Logs",
];

const actions = ["create", "read", "update", "delete"];

const initialState = modules.reduce((acc, m) => {
  acc[m] = {
    create: false,
    read: false,
    update: false,
    delete: false,
  };
  return acc;
}, {});

export default function RolePermissionMatrix() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Settings
  if (!canRead('Settings')) {
    return <PermissionDenied resource="Settings" action="read" />;
  }

  const [permissions, setPermissions] = useState(initialState);
  const [selectedRole, setSelectedRole] = useState(null);
  const { user, tenant } = useAuthStore();

  // ✅ ROLES LIST
  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: 1,
    limit: 100,
    tenantId: tenant?.id,
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      roleId: null,
    },
  });

  const createPermission = useCreateRolesModulesPermissions();

  // ✅ ROLE ID
  const roleId = watch("roleId");

  // ✅ FETCH ROLE PERMISSION
  const { data: roleData, isLoading: permissionLoading } = useRoleModulesPermissionsById(roleId, tenant?.id);

  // ✅ MAP API → UI STATE
  const mapApiToState = (apiPermissions) => {
    const state = JSON.parse(JSON.stringify(initialState));

    apiPermissions?.forEach(({ module, actions: moduleActions }) => {
      if (state[module]) {
        moduleActions.forEach((action) => {
          if (state[module][action] !== undefined) {
            state[module][action] = true;
          }
        });
      }
    });

    return state;
  };

  // ✅ Set default role based on logged-in user
  useEffect(() => {
    if (!rolesData?.data?.data?.length || !user) return;

    // Try to find role by user's role name
    const userRoleName = user?.roles?.[0]?.name || user?.role?.name;

    if (userRoleName) {
      const matchedRole = rolesData?.data?.data.find(
        (r) => r.name === userRoleName || r.displayName === userRoleName
      );

      if (matchedRole) {
        setValue("roleId", matchedRole.id);
        setSelectedRole({ id: matchedRole.id, label: matchedRole.displayName || matchedRole.name });
      }
    }
  }, [rolesData, user, setValue]);

  // ✅ AUTO POPULATE permissions when role changes
  useEffect(() => {
    if (roleData?.permission) {
      const mapped = mapApiToState(roleData.permission);
      setPermissions(mapped);
    } else if (roleId) {
      // Reset to empty permissions for new role
      setPermissions(JSON.parse(JSON.stringify(initialState)));
    }
  }, [roleData, roleId]);

  // ✅ CLEAR FORM
  const clearField = () => {
    // Reset permissions
    const clearedPermissions = JSON.parse(JSON.stringify(initialState));
    setPermissions(clearedPermissions);

    // Reset role field
    setValue("roleId", null);
    setSelectedRole(null);

    toast.info("Form cleared");
  };

  // ✅ SAVE PERMISSIONS
  const handleSave = async () => {
    if (!roleId) {
      toast.error("Please select a role first");
      return;
    }

    const selectedModules = Object.entries(permissions)
      .map(([module, actionObj]) => {
        const selectedActions = Object.entries(actionObj)
          .filter(([_, value]) => value)
          .map(([action]) => action);

        if (!selectedActions.length) return null;

        return {
          module,
          actions: selectedActions,
        };
      })
      .filter(Boolean);

    if (selectedModules.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    const payload = {
      role_id: roleId,
      permission: selectedModules,
    };

    try {
      await createPermission.mutateAsync(payload);
      toast.success("Permissions saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save permissions");
    }
  };

  // Role options for dropdown
  const roleOptions =
    rolesData?.data?.data?.map((item) => ({
      id: item.id,
      label: item.displayName || item.name,
    })) || [];

  // Check if any permission is selected for a module
  const getModuleCheckState = (module) => {
    const modulePermissions = permissions[module];
    const allChecked = actions.every(action => modulePermissions[action]);
    const someChecked = actions.some(action => modulePermissions[action]);
    return { allChecked, someChecked };
  };

  // Toggle all permissions for a module
  const toggleModule = (module) => {
    const { allChecked } = getModuleCheckState(module);
    const updated = {};
    actions.forEach((action) => (updated[action] = !allChecked));

    setPermissions((prev) => ({
      ...prev,
      [module]: updated,
    }));
  };

  if (rolesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Role Permissions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage module-level access for each role
        </p>
      </div>

      {/* ROLE SELECT */}
      {/* <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-5 shadow-sm mb-6"> */}
      <div className="relative z-50 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-5 shadow-sm mb-6 overflow-visible">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Role <span className="text-red-500">*</span>
        </label>

        <SingleSelectField
          name="roleId"
          options={roleOptions}
          register={register}
          setValue={setValue}
          watch={watch}
          error={errors.roleId}
          selected={selectedRole}
          setSelected={setSelectedRole}
          placeholder="Choose a role..."
        />

        {roleId && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {permissionLoading ? "Loading permissions..." : "Editing permissions for selected role"}
          </p>
        )}
      </div>

      {/* PERMISSIONS MATRIX TABLE */}
      {/* <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg overflow-hidden"> */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg overflow-visible z-0">        {permissionLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading permissions...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* TABLE HEADER */}
            <div className="flex px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              <div className="w-[40%]">Module</div>
              {actions.map((action) => (
                <div key={action} className="w-[15%] text-center">
                  {action}
                </div>
              ))}
            </div>

            {/* TABLE ROWS */}
            {modules.map((module, idx) => {
              const { allChecked, someChecked } = getModuleCheckState(module);

              return (
                <div
                  key={module}
                  className={`flex px-5 py-3 items-center border-b border-gray-100 dark:border-gray-800 transition-colors
                      ${idx % 2 === 0 ? "bg-white dark:bg-gray-800/50" : "bg-gray-50 dark:bg-gray-800/30"}
                      hover:bg-blue-50/50 dark:hover:bg-blue-900/20`}
                >
                  {/* MODULE NAME with select all checkbox */}
                  <div className="w-[40%] flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = someChecked && !allChecked;
                        }
                      }}
                      onChange={() => toggleModule(module)}
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {module}
                    </span>
                  </div>

                  {/* ACTION CHECKBOXES */}
                  {actions.map((action) => (
                    <div key={action} className="w-[15%] flex justify-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                        checked={permissions[module]?.[action] || false}
                        onChange={() => {
                          setPermissions((prev) => ({
                            ...prev,
                            [module]: {
                              ...prev[module],
                              [action]: !prev[module]?.[action],
                            },
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              );
            })}

            {modules.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No modules configured
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={clearField}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Clear
        </button>

        <button
          disabled={!roleId || createPermission.isPending}
          onClick={handleSave}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {createPermission.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Permissions
            </>
          )}
        </button>
      </div>

      {/* INFO FOOTER */}
      {roleId && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            💡 Tip: Use the module checkbox to select/deselect all permissions for that module
          </p>
        </div>
      )}
    </div>
  );
}