"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WhispersSidebar({ userId, selectedWhisper, onSelectWhisper, onAddClick, refreshKey }) {
  const [whispers, setWhispers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchWhispers();
  }, [userId, refreshKey]);

  const fetchWhispers = async () => {
    try {
      const res = await fetch(`/api/whispers?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setWhispers(data.whispers || []);
      }
    } catch (err) {
      console.error('Failed to fetch whispers', err);
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
    <aside className="w-80 bg-gray-900/50 border-r border-gray-800/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Whispers</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddClick}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            +
          </motion.button>
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
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
        ) : filteredWhispers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {search ? 'No whispers found' : 'No connections yet. Click + to add!'}
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
                className={`p-4 border-b border-gray-800/30 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-l-4 border-l-purple-500'
                    : 'hover:bg-gray-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {(otherUser?.username || otherUser?.email || '?')[0].toUpperCase()}
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
