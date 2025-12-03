"use client";
import { useState } from 'react';
import WhispersSidebar from './WhispersSidebar';
import ChatWindow from './ChatWindow';
import NotificationBell from './NotificationBell';
import AddWhisperModal from './AddWhisperModal';
import { SocketProvider } from '../../context/SocketContext';

export default function DashboardLayout({ user }) {
  const [selectedWhisper, setSelectedWhisper] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleWhisperSelect = (whisper) => {
    setSelectedWhisper(whisper);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

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
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Whispers List */}
        <WhispersSidebar
          userId={user?.id}
          selectedWhisper={selectedWhisper}
          onSelectWhisper={handleWhisperSelect}
          onAddClick={() => setShowAddModal(true)}
          refreshKey={refreshKey}
        />

        {/* Main Chat Area */}
        <ChatWindow
          selectedWhisper={selectedWhisper}
          currentUserId={user?.id}
        />
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
