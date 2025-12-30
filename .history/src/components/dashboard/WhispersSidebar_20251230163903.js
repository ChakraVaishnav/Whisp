"use client";
import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { getFingerprint } from "bro-auth/browser";
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';
import logger from '../../utils/logger';

export default function WhispersSidebar({ accessToken, userId, selectedWhisper, onSelectWhisper, onAddClick, refreshKey, showBell = false, onNotificationUpdate }) {
  const [whispers, setWhispers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const [presenceMap, setPresenceMap] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const { clearToken, authFetch, setToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    fetchWhispers();
  }, [userId, refreshKey]);

  // Update presence when whispers list changes or socket connects
  useEffect(() => {
    if (!socket || whispers.length === 0) return;
    const userIds = whispers.map((w) => (w.userAId === userId ? w.userBId : w.userAId));
    // ask server for presence
    socket.emit('get-presence', { userIds }, (result) => {
      if (result && typeof result === 'object') setPresenceMap(result);
    });

    const handlePresence = ({ userId: uid, online }) => {
      setPresenceMap((prev) => ({ ...prev, [uid]: !!online }));
    };
    socket.on('presence-update', handlePresence);
    return () => socket.off('presence-update', handlePresence);
  }, [socket, whispers, userId]);

  const fetchWhispers = async () => {
    try {
      const res = await authFetch(`/api/whispers?userId=${userId}`,
        {
          method: "GET",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setWhispers(data.whispers || []);
      }
    } catch (err) {
      logger.error('Failed to fetch whispers', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWhispers = whispers.filter((w) => {
    const otherUser = w.userAId === userId ? w.userB : w.userA;
    const name = otherUser?.username || otherUser?.email || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <aside className="w-full sm:w-80 h-full bg-gray-900/50 border-r border-gray-800/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="w-9 h-9 rounded-md bg-gray-800/30 flex items-center justify-center text-white hover:bg-gray-800/40 transition-all"
              aria-label="menu"
            >
              ≡
            </button>
            <h2 className="text-lg font-semibold text-white">Whispers</h2>
          </div>

          <div className="flex items-center gap-3">
            {showBell && (
              <NotificationBell userId={userId} onUpdate={onNotificationUpdate} />
            )}

            {/* Dropdown menu */}
            <div className="relative">
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 border border-gray-800/50 rounded-lg shadow-lg p-2 z-50">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onAddClick?.();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-800/20 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-md bg-purple-600/20 flex items-center justify-center text-purple-300">+</span>
                    <span className="text-sm text-white font-medium">Add Whisper</span>
                  </button>

                  <button
                    className="flex items-center gap-3 w-full px-3 py-2 mt-1 rounded bg-gray-800/10 text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    <span className="w-8 h-8 rounded-md bg-gray-700/30 flex items-center justify-center text-gray-300">⚑</span>
                    <span className="text-sm">Create Group (coming soon)</span>
                  </button>

                  <div className="mt-2 border-t border-gray-800/40" />

                  <button
                    onClick={async () => {
                      try {
                        setMenuOpen(false);
                        await authFetch('/api/auth/logout', { method: 'POST' });
                      } catch (err) {
                        logger.error('Logout failed', err);
                      }
                      if (setToken) setToken(null);
                      clearToken();
                      router.push('/login');
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 mt-2 rounded hover:bg-red-700/10 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-md bg-red-700/10 flex items-center justify-center text-red-300">⎋</span>
                    <span className="text-sm text-red-300 font-medium">Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search whispers..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
        />
      </div>

      {/* Whispers List */}
      <div className="flex-1 overflow-y-auto dashboard-scrollbar">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
        ) : filteredWhispers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {search ? 'No whispers found' : 'No connections yet. Use the menu to add!'}
          </div>
        ) : (
          filteredWhispers.map((whisper) => {
            const otherUser = whisper.userAId === userId ? whisper.userB : whisper.userA;
            const isSelected = selectedWhisper?.id === whisper.id;
            return (
              <motion.div
                key={whisper.id}
                whileHover={{ x: 4 }}
                onClick={() => onSelectWhisper(whisper)}
                className={`p-4 border-b border-gray-800/30 cursor-pointer transition-all ${isSelected
                  ? 'bg-linear-to-r from-purple-600/20 to-blue-600/20 border-l-4 border-l-purple-500'
                  : 'hover:bg-gray-800/30'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                      {(otherUser?.username || otherUser?.email || '?')[0].toUpperCase()}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-gray-900 ${presenceMap[otherUser?.id] ? 'bg-green-400' : 'bg-orange-400'}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {otherUser?.username || otherUser?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {whisper.lastMessage || 'Start chatting...'}
                    </p>
                  </div>

                  {/* Unread Badge (placeholder) */}
                  {whisper.unread && (
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-semibold">
                      {whisper.unread}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </aside>
  );
}
