'use client';

import React, { useState, useEffect } from 'react';

const MODULES = [
  'Dashboard', 'Patients', 'Orders', 'Worklist', 'Results Entry', 'QC Management', 
  'Packages', 'Result History', 'Specimens', 'Users', 'Tests & Prices', 'Instruments', 
  'Roles', 'Templates', 'Hospitals', 'Inventory', 'Settings', 'Physicians', 
  'Audit Logs', 'Notifications', 'Waste Management'
];

const ACTIONS = [
  { id: 'read', label: 'Read' },
  { id: 'create', label: 'Create' },
  { id: 'update', label: 'Update' },
  { id: 'delete', label: 'Delete' },
];

export default function PermissionBuilder({ initialPermissions = [], onChange }) {
  // State is an object keyed by module name. Values are arrays of actions.
  // e.g., { 'Patients': ['read', 'create'], 'Orders': ['read'] }
  const [permissions, setPermissions] = useState({});

  // Initialize state from props
  useEffect(() => {
    if (initialPermissions && Array.isArray(initialPermissions)) {
      const initialMap = {};
      initialPermissions.forEach((p) => {
        initialMap[p.module] = p.actions || [];
      });
      setPermissions(initialMap);
    }
  }, [initialPermissions]);

  const notifyChange = (newPermissionsMap) => {
    // Convert back to array format
    const permissionsArray = Object.entries(newPermissionsMap).map(([module, actions]) => ({
      module,
      actions
    })).filter(p => p.actions.length > 0);
    
    onChange(permissionsArray);
  };

  const handleActionToggle = (module, action) => {
    setPermissions((prev) => {
      const moduleActions = prev[module] || [];
      const isSelected = moduleActions.includes(action);
      
      let newActions;
      if (isSelected) {
        newActions = moduleActions.filter((a) => a !== action);
      } else {
        newActions = [...moduleActions, action];
      }
      
      const newMap = { ...prev, [module]: newActions };
      notifyChange(newMap);
      return newMap;
    });
  };

  const handleSelectAllModule = (module, selectAll) => {
    setPermissions((prev) => {
      const newMap = { 
        ...prev, 
        [module]: selectAll ? ACTIONS.map(a => a.id) : [] 
      };
      notifyChange(newMap);
      return newMap;
    });
  };

  const handleSelectAllGlobal = (selectAll) => {
    setPermissions((prev) => {
      const newMap = {};
      MODULES.forEach(m => {
        newMap[m] = selectAll ? ACTIONS.map(a => a.id) : [];
      });
      notifyChange(newMap);
      return newMap;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Module Permissions
        </h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSelectAllGlobal(true)}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => handleSelectAllGlobal(false)}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:underline"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                {ACTIONS.map(action => (
                  <th key={action.id} className="px-4 py-3 font-medium text-center">{action.label}</th>
                ))}
                <th className="px-4 py-3 font-medium text-right pr-6">All</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {MODULES.map((module) => {
                const moduleActions = permissions[module] || [];
                const isAllSelected = ACTIONS.every(a => moduleActions.includes(a.id));
                
                return (
                  <tr key={module} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">
                      {module}
                    </td>
                    
                    {ACTIONS.map(action => {
                      const isSelected = moduleActions.includes(action.id);
                      return (
                        <td key={action.id} className="px-4 py-3 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer w-full h-full">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleActionToggle(module, action.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/40 bg-white dark:bg-gray-800 dark:border-gray-600 dark:checked:bg-blue-500"
                            />
                          </label>
                        </td>
                      );
                    })}
                    
                    <td className="px-4 py-3 text-right pr-6">
                      <button
                        type="button"
                        onClick={() => handleSelectAllModule(module, !isAllSelected)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isAllSelected 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isAllSelected ? 'Clear' : 'All'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
