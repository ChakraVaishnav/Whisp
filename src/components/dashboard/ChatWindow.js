"use client";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { getFingerprint } from 'bro-auth/browser';
import { useAuth } from '../../context/AuthContext';

export default function ChatWindow({ selectedWhisper, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket, connected } = useSocket();
  const { accessToken } = useAuth();
  const [fileUploading, setFileUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [otherOnline, setOtherOnline] = useState(false);

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

    // Listen for file transfers
    socket.on('file-received', async (payload) => {
      // payload: { senderId, receiverId, fileName, mimeType, dataBase64, keyBase64?, ivBase64? }
      const { senderId, fileName, mimeType, dataBase64, keyBase64, ivBase64 } = payload;
      try {
        if (keyBase64 && ivBase64) {
          // decrypt using provided key & iv
          const rawKey = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
          const cryptoKey = await window.crypto.subtle.importKey('raw', rawKey.buffer, 'AES-GCM', false, ['decrypt']);
          const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
          const encBytes = Uint8Array.from(atob(dataBase64), (c) => c.charCodeAt(0));
          const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, encBytes.buffer);
          const blob = new Blob([new Uint8Array(decrypted)], { type: mimeType });
          const objectUrl = URL.createObjectURL(blob);
          const fileMessage = {
            id: Date.now().toString(),
            senderId,
            fileName,
            mimeType,
            fileUrl: objectUrl,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, fileMessage]);
        } else {
          // fallback: treat payload as raw base64 blob
          const byteChars = atob(dataBase64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
          const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
          const objectUrl = URL.createObjectURL(blob);
          const fileMessage = {
            id: Date.now().toString(),
            senderId,
            fileName,
            mimeType,
            fileUrl: objectUrl,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, fileMessage]);
        }
      } catch (e) {
        console.error('Failed to handle incoming file', e);
      }
    });

    // Presence updates for the current otherUser
    const handlePresence = ({ userId, online }) => {
      if (!otherUser) return;
      if (userId === otherUser.id) setOtherOnline(!!online);
    };
    socket.on('presence-update', handlePresence);

    // Request current presence for other user
    if (otherUser?.id) {
      socket.emit('get-presence', { userIds: [otherUser.id] }, (res) => {
        if (res && typeof res === 'object') setOtherOnline(!!res[otherUser.id]);
      });
    }

    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('messages-history');
      socket.off('new-message');
      socket.off('file-received');
      socket.off('presence-update', handlePresence);
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
    if (!selectedWhisper || sending || !socket || !connected) return;

    const otherUser = selectedWhisper.userAId === currentUserId ? selectedWhisper.userB : selectedWhisper.userA;
    const receiverId = otherUser?.id;

    setSending(true);
    try {
      const fp = await getFingerprint();

      // If a file is selected, encrypt and send it, include key+iv so receiver can decrypt client-side
      if (selectedFile) {
        const file = selectedFile;
        const arrayBuffer = await file.arrayBuffer();
        const key = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, arrayBuffer);
        const encBytes = new Uint8Array(encrypted);
        let binary = '';
        for (let i = 0; i < encBytes.byteLength; i++) binary += String.fromCharCode(encBytes[i]);
        const dataBase64 = btoa(binary);

        const rawKey = await window.crypto.subtle.exportKey('raw', key);
        const rawKeyBytes = new Uint8Array(rawKey);
        let keyBin = '';
        for (let i = 0; i < rawKeyBytes.length; i++) keyBin += String.fromCharCode(rawKeyBytes[i]);
        const keyBase64 = btoa(keyBin);

        let ivBin = '';
        for (let i = 0; i < iv.length; i++) ivBin += String.fromCharCode(iv[i]);
        const ivBase64 = btoa(ivBin);

        socket.emit('send-file', {
          senderId: currentUserId,
          receiverId,
          fileName: file.name,
          mimeType: file.type,
          dataBase64,
          keyBase64,
          ivBase64,
          token: accessToken,
          fingerprint: fp.hash,
        });

        setMessages((prev) => [...prev, { id: Date.now().toString(), senderId: currentUserId, fileName: file.name, mimeType: file.type, createdAt: new Date().toISOString(), pending: true }]);
        setSelectedFile(null);
      }

      // If user typed a message, send it too (separate flow)
      if (newMessage.trim()) {
        if (receiverId === currentUserId) {
          await fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ senderId: currentUserId, receiverId, message: newMessage, fingerprint: fp.hash }),
          });
          setMessages((prev) => [...prev, { id: Date.now().toString(), senderId: currentUserId, receiverId, message: newMessage, createdAt: new Date().toISOString() }]);
        } else {
          socket.emit('send-message', {
            senderId: currentUserId,
            receiverId,
            message: newMessage,
            token: accessToken,
            fingerprint: fp.hash,
          });
        }
      }
    } catch (err) {
      console.error('Send error', err);
    } finally {
      setNewMessage('');
      setSending(false);
    }
  };

  // File selection handlers (do not auto-send on choose)
  const triggerFileSelect = () => fileInputRef.current?.click();
  const onFileSelected = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    // reset native input so choosing same file again works
    e.target.value = '';
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
    <div className="flex-1 flex flex-col bg-gray-950 min-h-0">
      {/* Chat Header */}
      <div className="bg-gray-900/50 border-b border-gray-800/50 px-6 py-4 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
              {(otherUser?.username || otherUser?.email || '?')[0].toUpperCase()}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-gray-900 ${otherOnline ? 'bg-green-400' : 'bg-orange-400'}`} />
          </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            {otherUser?.username || otherUser?.email || 'Unknown User'}
          </h3>
          <p className={`text-xs ${otherOnline ? 'text-green-300' : 'text-orange-300'}`}>{otherOnline ? 'Online' : 'Offline'}</p>
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
                  {msg.fileUrl || msg.fileName ? (
                    <div className="flex flex-col">
                      <a href={msg.fileUrl} download={msg.fileName} className="text-sm text-blue-300 underline">
                        {msg.fileName || 'Download file'}
                      </a>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm wrap-break-word">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="bg-gray-900/50 border-t border-gray-800/50 p-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={triggerFileSelect} className="w-10 h-10 rounded-full bg-gray-800/60 flex items-center justify-center text-white hover:bg-gray-800/80">
            <span className="text-xl">＋</span>
          </button>
          <input ref={fileInputRef} type="file" onChange={onFileSelected} className="hidden" />

          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={selectedFile ? `File ready: ${selectedFile.name}` : 'Type a message...'}
              disabled={sending || !connected}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all disabled:opacity-50"
            />
            {selectedFile && (
              <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                <span>{selectedFile.name} • {(selectedFile.size/1024).toFixed(1)} KB</span>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-red-400">Remove</button>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || sending || !connected}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
