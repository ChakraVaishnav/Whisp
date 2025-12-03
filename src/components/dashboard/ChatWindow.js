"use client";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';

export default function ChatWindow({ selectedWhisper, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket || !selectedWhisper) return;

    const otherUser = selectedWhisper.userAId === currentUserId ? selectedWhisper.userB : selectedWhisper.userA;
    const roomId = [currentUserId, otherUser?.id].sort().join('-');

    // Join room for this conversation
    socket.emit('join-room', { roomId });

    // Fetch message history
    socket.emit('get-messages', { 
      senderId: currentUserId, 
      receiverId: otherUser?.id 
    });

    // Listen for message history
    socket.on('messages-history', (history) => {
      setMessages(history || []);
    });

    // Listen for new messages
    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('messages-history');
      socket.off('new-message');
    };
  }, [socket, selectedWhisper, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedWhisper || sending || !socket || !connected) return;

    const otherUser = selectedWhisper.userAId === currentUserId ? selectedWhisper.userB : selectedWhisper.userA;
    const receiverId = otherUser?.id;

    setSending(true);
    
    // Emit message via Socket.IO
    socket.emit('send-message', {
      senderId: currentUserId,
      receiverId,
      message: newMessage,
    });

    setNewMessage('');
    setSending(false);
  };

  if (!selectedWhisper) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Select a Whisper</h3>
          <p className="text-gray-400 text-sm">Choose a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  const otherUser = selectedWhisper.userAId === currentUserId ? selectedWhisper.userB : selectedWhisper.userA;

  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      {/* Chat Header */}
      <div className="bg-gray-900/50 border-b border-gray-800/50 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
          {(otherUser?.username || otherUser?.email || '?')[0].toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            {otherUser?.username || otherUser?.email || 'Unknown User'}
          </h3>
          <p className="text-xs text-gray-400">Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!connected ? (
          <div className="text-center text-gray-500 text-sm">Connecting to chat server...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    isMe
                      ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-800/80 text-gray-100'
                  }`}
                >
                  <p className="text-sm wrap-break-word">{msg.message}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="bg-gray-900/50 border-t border-gray-800/50 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending || !connected}
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!newMessage.trim() || sending || !connected}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
