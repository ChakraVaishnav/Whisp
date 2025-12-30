export const metadata = {
  title: "Dashboard | Whisp",
  description: "Your private, encrypted dashboard for secure messaging on Whisp.",
  keywords: [
    "dashboard",
    "private chat",
    "encrypted messaging",
    "Whisp",
    "user dashboard"
  ],
  openGraph: {
    title: "Dashboard | Whisp",
    description: "Your private, encrypted dashboard for secure messaging on Whisp.",
    url: "https://whispchat.vercel.app/dashboard",
    siteName: "Whisp",
    type: "website",
    images: [
      {
        url: "https://whispchat.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Whisp dashboard screenshot",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFingerprint } from "bro-auth/browser";
import { useAuth } from "../../context/AuthContext";
import logger from '../../utils/logger';
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { accessToken, setToken, clearToken, refreshAccessToken } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      let token = accessToken;

      // 1️⃣ Try using existing access token
      if (token) {
        const ok = await verifyToken(token);
        if (ok.valid) {
          setValid(true);
          setUser(ok.payload);
          setLoading(false);
          return;
        }
      }

      // 2️⃣ If verify failed or token missing → try refresh
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        const ok2 = await verifyToken(refreshedToken);
        if (ok2.valid) {
          setValid(true);
          setUser(ok2.payload);
          setLoading(false);
          return;
        }
      }

      // 3️⃣ Everything failed → logout & redirect
      clearToken();
      router.push("/login");
    };

    checkSession();
  }, [accessToken, router, setToken, clearToken, refreshAccessToken]);

  // ------------------------------
  // Helper: Verify token
  // ------------------------------
  const verifyToken = async (token) => {
    try {
      const fp = await getFingerprint();
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ token, fingerprint: fp.hash }),
      });
      return res.json();
    } catch (err) {
      logger.error("Verify error", err);
      return { valid: false };
    }
  };

  // ------------------------------

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );

  if (!valid) return null;

  return <DashboardLayout user={user} accessToken={accessToken} />;
}
