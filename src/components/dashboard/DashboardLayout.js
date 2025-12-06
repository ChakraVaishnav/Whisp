"use client";
import { useState, useEffect } from 'react';
import WhispersSidebar from './WhispersSidebar';
import ChatWindow from './ChatWindow';
import NotificationBell from './NotificationBell';
import AddWhisperModal from './AddWhisperModal';
import { SocketProvider } from '../../context/SocketContext';

export default function DashboardLayout({ user }) {
  const [selectedWhisper, setSelectedWhisper] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('sidebar');

  const handleWhisperSelect = (whisper) => {
    setSelectedWhisper(whisper);
    if (isMobile) setMobileView('chat');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleBackToList = () => {
    setMobileView('sidebar');
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobileView('sidebar');
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && !selectedWhisper) {
      setMobileView('sidebar');
    }
  }, [isMobile, selectedWhisper]);

  return (
    <SocketProvider userId={user?.id}>
      <div className="h-screen bg-gray-950 flex flex-col">
      {/* Top Bar */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="text-2xl font-bold tracking-tight">
          <h1 className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Whisp
            </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <h1 className="text-sm text-gray-400">Welcome, {user?.name || user?.username}</h1>
          <NotificationBell userId={user?.id} onUpdate={handleRefresh} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {isMobile ? (
          <>
            {mobileView === 'sidebar' && (
              <div className="absolute inset-0">
                <WhispersSidebar
                  userId={user?.id}
                  selectedWhisper={selectedWhisper}
                  onSelectWhisper={handleWhisperSelect}
                  onAddClick={() => setShowAddModal(true)}
                  refreshKey={refreshKey}
                />
              </div>
            )}

            {mobileView === 'chat' && (
              <div className="absolute inset-0">
                <ChatWindow
                  selectedWhisper={selectedWhisper}
                  currentUserId={user?.id}
                  onBack={handleBackToList}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <WhispersSidebar
              userId={user?.id}
              selectedWhisper={selectedWhisper}
              onSelectWhisper={handleWhisperSelect}
              onAddClick={() => setShowAddModal(true)}
              refreshKey={refreshKey}
            />

            <ChatWindow
              selectedWhisper={selectedWhisper}
              currentUserId={user?.id}
            />
          </>
        )}
      </div>

      {/* Add Whisper Modal */}
      {showAddModal && (
        <AddWhisperModal
          userId={user?.id}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
    </SocketProvider>
  );
}
