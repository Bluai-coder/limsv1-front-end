import React from 'react';
import { Droplet, Package, Scissors, Syringe } from 'lucide-react';

const typeConfig = {
    liquid: { 
        label: 'Liquid', 
        icon: Droplet,
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-400'
    },
    solid: { 
        label: 'Solid', 
        icon: Package,
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-800 dark:text-orange-400'
    },
    sharps: { 
        label: 'Sharps', 
        icon: Scissors,
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400'
    },
    pathological: { 
        label: 'Pathological', 
        icon: Syringe,
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-400'
    },
};

export default function WasteTypeBadge({ type }) {
    const config = typeConfig[type] || { 
        label: type, 
        icon: Package,
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300'
    };
    const Icon = config.icon;
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
}