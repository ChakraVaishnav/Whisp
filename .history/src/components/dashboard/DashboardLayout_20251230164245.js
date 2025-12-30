"use client";
import { useState, useEffect } from "react";
import WhispersSidebar from "./WhispersSidebar";
import ChatWindow from "./ChatWindow";
import NotificationBell from "./NotificationBell";
import AddWhisperModal from "./AddWhisperModal";
import { SocketProvider } from "../../context/SocketContext";

export default function DashboardLayout({ user, accessToken }) {
  const [selectedWhisper, setSelectedWhisper] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState("sidebar");

  const handleWhisperSelect = (whisper) => {
    setSelectedWhisper(whisper);
    if (isMobile) setMobileView("chat");
  };

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);
  const handleBackToList = () => setMobileView("sidebar");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileView("sidebar");
  }, [isMobile]);

  return (
    <SocketProvider userId={user?.id}>
      <div className="h-screen bg-gray-950 flex flex-col">

        {/* TOP BAR — Desktop only */}
        <header className="hidden sm:flex bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4 items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            <h1 className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Whisp
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <h1 className="text-sm text-gray-400">Welcome, {user?.name || user?.username}</h1>
            <NotificationBell userId={user?.id} onUpdate={handleRefresh} accessToken={accessToken} />
          </div>
        </header>

        {/* MAIN CONTENT FIXED */}
        <div className="flex-1 flex min-h-0">

          {/* MOBILE VIEW */}
          {isMobile ? (
            <>
              {mobileView === "sidebar" && (
                <div className="w-full h-full">
                  <WhispersSidebar
                    userId={user?.id}
                    selectedWhisper={selectedWhisper}
                    onSelectWhisper={handleWhisperSelect}
                    onAddClick={() => setShowAddModal(true)}
                    refreshKey={refreshKey}
                    showBell
                    onNotificationUpdate={handleRefresh}
                    accessToken={accessToken}
                  />
                </div>
              )}

              {mobileView === "chat" && (
                <div className="w-full h-full">
                  <ChatWindow
                    selectedWhisper={selectedWhisper}
                    currentUserId={user?.id}
                    onBack={handleBackToList}
                    accessToken={accessToken}
                  />
                </div>
              )}
            </>
          ) : (
            /* DESKTOP VIEW */
            <>

              <WhispersSidebar
                userId={user?.id}
                selectedWhisper={selectedWhisper}
                onSelectWhisper={handleWhisperSelect}
                onAddClick={() => setShowAddModal(true)}
                refreshKey={refreshKey}
                accessToken={accessToken}
                className="w-80 flex-shrink-0"
              />

              <div className="flex flex-col flex-1 min-h-0">
                <ChatWindow
                  selectedWhisper={selectedWhisper}
                  currentUserId={user?.id}
                  accessToken={accessToken}
                />
              </div>
            </>
          )}
        </div>

        {/* ADD WHISPER MODAL */}
        {showAddModal && (
          <AddWhisperModal
            userId={user?.id}
            onClose={() => setShowAddModal(false)}
            onSuccess={handleRefresh}
            accessToken={accessToken}
          />
        )}
      </div>
    </SocketProvider>
  );
}
