"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '../../utils/logger';

export default function NotificationBell({ userId, onUpdate }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/whispers/pending?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            senderId: currentUserId,
            receiverId,
            message: msgText,
            fingerprint: fp.hash,
          }),
      }
      );
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.pending || []);
      }
    } catch (err) {
      logger.error('Failed to fetch notifications', err);
    }
  };

  const handleAccept = async (whisperId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/whispers/${whisperId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== whisperId));
        onUpdate?.();
      }
    } catch (err) {
      logger.error('Failed to accept whisper', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (whisperId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/whispers/${whisperId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== whisperId));
      }
    } catch (err) {
      logger.error('Failed to reject whisper', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-300 hover:text-white transition-all"
      >
        <span className="text-xl">🔔</span>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full text-xs text-white flex items-center justify-center font-semibold">
            {notifications.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800/50">
              <h3 className="text-sm font-semibold text-white">Whisper Requests</h3>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No pending requests
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 border-b border-gray-800/30 hover:bg-gray-800/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {(notif.userA?.username || notif.userA?.email || '?')[0].toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {notif.userA?.username || notif.userA?.email || 'Someone'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Wants to connect with you
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAccept(notif.id)}
                            disabled={loading}
                            className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-linear-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(notif.id)}
                            disabled={loading}
                            className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
