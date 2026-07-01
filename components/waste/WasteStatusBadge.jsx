import React from 'react';

const statusConfig = {
    segregated: { 
        label: 'Segregated', 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-400',
        dot: 'bg-yellow-500'
    },
    treated: { 
        label: 'Treated', 
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-400',
        dot: 'bg-purple-500'
    },
    packaged: { 
        label: 'Packaged', 
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-400',
        dot: 'bg-blue-500'
    },
    transported: { 
        label: 'Transported', 
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-800 dark:text-indigo-400',
        dot: 'bg-indigo-500'
    },
    disposed: { 
        label: 'Disposed', 
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        dot: 'bg-green-500'
    },
    rejected: { 
        label: 'Rejected', 
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        dot: 'bg-red-500'
    },
};

export default function WasteStatusBadge({ status }) {
    const config = statusConfig[status] || { 
        label: status, 
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        dot: 'bg-gray-500'
    };
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
}