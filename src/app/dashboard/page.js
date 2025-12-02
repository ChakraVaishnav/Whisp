"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFingerprint } from "bro-auth/browser"
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { accessToken, setToken, clearToken } = useAuth();

  useEffect(() => {
    const check = async () => {
      let token = accessToken || null;

      // If no in-memory access token, try to refresh via httpOnly cookie
      if (!token) {
        try {
          const fp = await getFingerprint();
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fingerprint: fp.hash }),
          });
          if (!res.ok) throw new Error('Refresh failed');
          const data = await res.json();
          token = data.accessToken;
          if (token) setToken(token);
        } catch (err) {
          console.error('Refresh failed', err);
        }
      }

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const fp = await getFingerprint();
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, fingerprint: fp.hash }),
        });
        const data = await res.json();
        if (data.valid) {
          setValid(true);
          setUser(data.payload || null);
        } else {
          clearToken();
          router.push('/login');
        }
      } catch (err) {
        console.error('Dashboard verify error', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, router, setToken, clearToken]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Checking session...</div>;
  if (!valid) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
        <p className="mb-6">Welcome back{user?.name ? `, ${user.name}` : ''}.</p>
        <section className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-2">Session</h2>
          <pre className="text-sm text-slate-300 bg-gray-800 p-4 rounded">{JSON.stringify(user, null, 2)}</pre>
        </section>
      </div>
    </main>
  );
}
