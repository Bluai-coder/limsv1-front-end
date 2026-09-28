'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';

/**
 * SessionTimeoutWatcher
 * Reads sessionTimeout (minutes) from the JWT payload and auto-logs out on inactivity.
 * Warns the user 1 minute before expiry.
 * Attach inside the authenticated layout (AppLayout).
 */
export default function SessionTimeoutWatcher() {
  const router = useRouter();
  const { accessToken, logout, isAuthenticated } = useAuthStore();
  const timerRef = useRef(null);
  const warningRef = useRef(null);

  const getTimeoutMs = useCallback(() => {
    if (!accessToken) return null;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const minutes = payload.sessionTimeout;
      if (minutes && Number.isFinite(minutes) && minutes > 0) {
        return minutes * 60 * 1000;
      }
    } catch (_) {}
    return null;
  }, [accessToken]);

  const handleLogout = useCallback(() => {
    logout();
    toast.warning('Your session expired due to inactivity. Please log in again.');
    router.push('/auth/login');
  }, [logout, router]);

  const resetTimer = useCallback(() => {
    const timeoutMs = getTimeoutMs();
    if (!timeoutMs) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (timeoutMs > 2 * 60 * 1000) {
      warningRef.current = setTimeout(() => {
        toast.warning('Your session will expire in 1 minute due to inactivity.', { duration: 10000 });
      }, timeoutMs - 60 * 1000);
    }
    timerRef.current = setTimeout(handleLogout, timeoutMs);
  }, [getTimeoutMs, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated || !getTimeoutMs()) return;
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleActivity = () => resetTimer();
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [isAuthenticated, resetTimer, getTimeoutMs]);

  return null;
}
