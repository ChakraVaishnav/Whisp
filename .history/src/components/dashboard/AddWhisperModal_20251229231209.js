"use client";
import { useState, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '../../utils/logger';
import { useAuth } from "../../context/AuthContext";

import { getFingerprint } from "bro-auth/browser";

export default function AddWhisperModal({ userId, onClose, onSuccess, accessToken }) {
  const { authFetch } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(null);

  // Debounced search on input
  const debounceRef = useRef();
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`/api/users/search?query=${encodeURIComponent(query)}&usernameOnly=1&me=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.users || []);
      }
    } catch (err) {
      logger.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (targetUserId) => {
    setSending(targetUserId);
    try {
      const res = await authFetch('/api/whispers', {
        method: "POST",
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
      logger.error('Failed to send whisper request', err);
    } finally {
      setSending(null);
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
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search Form */}
          <div className="p-6">
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    const val = e.target.value;
                    debounceRef.current = setTimeout(() => handleSearch(val), 250);
                  }}
                  placeholder="Search by username..."
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  autoFocus
                  aria-label="Search by username"
                />
                {loading && <div className="flex items-center px-2 text-gray-400 text-xs">Searching...</div>}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  {search ? 'No users found' : 'Search for users to connect'}
                </div>
              ) : (
                results.map((user) => {
                  const status = user.connectionStatus || 'NONE';
                  const sentByMe = !!user.sentByMe;
                  return (
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
                          {user.username || 'Unknown'}
                        </p>
                      </div>

                      {/* Connection state / action */}
                      {user.id === userId ? (
                        <div className="px-3 py-1.5 text-xs text-gray-300">You</div>
                      ) : status === 'ACCEPTED' ? (
                        <div className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white">Connected</div>
                      ) : status === 'PENDING' && sentByMe ? (
                        <div className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-white">Sent</div>
                      ) : status === 'PENDING' && !sentByMe ? (
                        <div className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-600 text-white">Requested</div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSendRequest(user.id)}
                          disabled={!!sending}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-linear-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                        >
                          {sending === user.id ? '...' : 'Connect'}
                        </motion.button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
