// ============================================================
// lib/utils.ts — Utility functions
// ============================================================

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, format) {
  const d = new Date(date);
  if (format === 'short') return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (format === 'long') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return d.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function calculateAge(dob) {
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years < 1) return `${Math.max(0, months + (years * 12))} months`;
  if (years < 18) return `${years}Y ${months >= 0 ? months : 12 + months}M`;
  return `${years}Y`;
}

export function getStatusColor(status) {
  const colors = {
    registered: 'badge-registered',
    specimen_collected: 'badge-collected',
    collected: 'badge-collected',
    specimen_received: 'badge-received',
    received: 'badge-received',
    in_progress: 'badge-in-progress',
    partial_complete: 'badge-in-progress',
    completed: 'badge-completed',
    tech_verified: 'badge-verified',
    path_verified: 'badge-verified',
    verified: 'badge-verified',
    reported: 'badge-reported',
    cancelled: 'badge-cancelled',
    stat: 'badge-stat',
    urgent: 'badge-urgent',
    routine: 'badge-routine',
    pending: 'badge-registered',
    active: 'badge-completed',
  };
  return colors[status] || 'badge-registered';
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}
