'use client';

import React from 'react';

export default function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
