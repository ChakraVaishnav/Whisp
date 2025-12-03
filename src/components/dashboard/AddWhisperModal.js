"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddWhisperModal({ userId, onClose, onSuccess }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?query=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.users || []);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (targetUserId) => {
    setSending(true);
    try {
      const res = await fetch('/api/whispers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAId: userId,
          userBId: targetUserId,
        }),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Failed to send whisper request', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Add Whisper Connect</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              ✕
            </button>
          </div>

          {/* Search Form */}
          <div className="p-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by username or email..."
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50"
                >
                  {loading ? '...' : 'Search'}
                </motion.button>
              </div>
            </form>

            {/* Results */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  {search ? 'No users found' : 'Search for users to connect'}
                </div>
              ) : (
                results.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                      {(user.username || user.email || '?')[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.username || user.email || 'Unknown'}
                      </p>
                      {user.email && user.username && (
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      )}
                    </div>

                    {/* Connect Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendRequest(user.id)}
                      disabled={sending}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-linear-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                    >
                      {sending ? '...' : 'Connect'}
                    </motion.button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
