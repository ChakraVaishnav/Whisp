"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSocket } from "../../context/SocketContext";
import { getFingerprint } from "bro-auth/browser";
import { useAuth } from "../../context/AuthContext";
import logger from "../../utils/logger";

const emojiList = ["😀", "😂", "😍", "🎉", "👍", "🔥", "🤝", "✨"];

export default function ChatWindow({ selectedWhisper, currentUserId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { socket, connected } = useSocket();
  const { accessToken } = useAuth();

  // Determine other user
  const otherUser = selectedWhisper
    ? selectedWhisper.userAId === currentUserId
      ? selectedWhisper.userB
      : selectedWhisper.userA
    : null;
  const displayName = otherUser?.username || otherUser?.name || otherUser?.email || 'Unknown';

  // Load chat history from DB
  useEffect(() => {
    if (!selectedWhisper || !otherUser) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `/api/messages?senderId=${currentUserId}&receiverId=${otherUser.id}`
        );
        const data = await res.json();

        setMessages(
          (data.messages || []).map((msg) => ({
            ...msg,
            message: msg.message ?? msg.cipherText,
          }))
        );
      } catch (err) {
        logger.error("Failed to fetch chat history:", err);
      }
    };

    fetchHistory();
  }, [selectedWhisper, currentUserId]);

  // Realtime events from socket
  useEffect(() => {
    if (!socket || !selectedWhisper || !otherUser) return;

    const roomId = [currentUserId, otherUser.id].sort().join("-");
    socket.emit("join-room", { roomId });

    // Handle new message
    const handleMessage = (msg) => setMessages((prev) => [...prev, msg]);

    // Handle incoming encrypted file
    const handleFile = async (payload) => {
      const {
        senderId,
        fileName,
        mimeType,
        dataBase64,
        keyBase64,
        ivBase64,
      } = payload;

      try {
        const toArray = (b64) =>
          Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

        let blob;

        if (keyBase64 && ivBase64) {
          // decrypt file
          const rawKey = toArray(keyBase64);
          const iv = toArray(ivBase64);
          const encryptedBytes = toArray(dataBase64);

          const key = await crypto.subtle.importKey(
            "raw",
            rawKey,
            "AES-GCM",
            false,
            ["decrypt"]
          );

          const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            encryptedBytes
          );

          blob = new Blob([decrypted], { type: mimeType });
        } else {
          // fallback
          blob = new Blob([toArray(dataBase64)], { type: mimeType });
        }

        const url = URL.createObjectURL(blob);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            senderId,
            fileName,
            mimeType,
            fileUrl: url,
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        logger.error("Failed to decode file:", err);
      }
    };

    // Presence system
    const presenceHandler = ({ userId, online }) => {
      if (userId === otherUser.id) setOtherOnline(online);
    };

    socket.on("new-message", handleMessage);
    socket.on("file-received", handleFile);
    socket.on("presence-update", presenceHandler);

    socket.emit("get-presence", { userIds: [otherUser.id] }, (res) => {
      setOtherOnline(!!res?.[otherUser.id]);
    });

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("new-message", handleMessage);
      socket.off("file-received", handleFile);
      socket.off("presence-update", presenceHandler);
    };
  }, [socket, selectedWhisper, otherUser]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // File selection
  const triggerFileSelect = () => fileInputRef.current?.click();

  const onFileSelected = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    e.target.value = "";
  };

  // Send message or file
  const handleSend = async (e) => {
    e?.preventDefault?.();
    if (!socket || !connected || sending || !otherUser) return;

    setSending(true);

    try {
      const fp = await getFingerprint();
      const receiverId = otherUser.id;

      // 🔹 Sending file
      if (selectedFile) {
        const file = selectedFile;
        const buffer = await file.arrayBuffer();

        const key = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          key,
          buffer
        );

        const rawKey = await crypto.subtle.exportKey("raw", key);

        const encode = (buf) => {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};


        socket.emit("send-file", {
          senderId: currentUserId,
          receiverId,
          fileName: file.name,
          mimeType: file.type,
          dataBase64: encode(encrypted),
          keyBase64: encode(rawKey),
          ivBase64: encode(iv),
          token: accessToken,
          fingerprint: fp.hash,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            senderId: currentUserId,
            fileName: file.name,
            mimeType: file.type,
            createdAt: new Date().toISOString(),
            pending: true,
          },
        ]);

        setSelectedFile(null);
        setNewMessage("");
        return;
      }

      // 🔹 Sending text message
      if (newMessage.trim()) {
        const msgText = newMessage.trim();

        // Send realtime
        socket.emit("send-message", {
          senderId: currentUserId,
          receiverId,
          message: msgText,
          token: accessToken,
          fingerprint: fp.hash,
        });

        // Persist to DB
        await fetch("/api/messages", {
          method: "POST",
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
        });

        setNewMessage("");
      }
    } catch (err) {
      logger.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  // Empty UI when no whisper selected
  if (!selectedWhisper || !otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-gray-400">Select a Whisper to chat</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      {/* HEADER */}
      <header className="p-4 bg-gray-900 border-b border-gray-800 flex items-center gap-3 sticky top-0 z-30">

        {onBack && (
          <button
  onClick={onBack}
  className="px-5 py-2 rounded-full bg-gray-800 text-white border border-gray-700"
>
  ←
</button>

        )}

        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
            {(displayName[0] || "?").toUpperCase()}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-gray-900 ${
              otherOnline ? "bg-green-400" : "bg-orange-400"
            }`}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <p
            className="text-white font-semibold truncate whitespace-nowrap"
            title={displayName}
          >
            {displayName}
          </p>
          <p className={`text-xs ${otherOnline ? "text-green-400" : "text-orange-400"}`}>
            {otherOnline ? "Online" : "Offline"}
          </p>
        </div>
      </header>


      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => {
          const mine = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id || `${msg.senderId}-${idx}`}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-md px-4 py-2 rounded-2xl ${
                  mine
                    ? "bg-linear-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-gray-800 text-white"
                }`}
              >
                {msg.fileUrl ? (
                  <a
                    href={msg.fileUrl}
                    download={msg.fileName}
                    className="underline text-blue-300 block"
                  >
                    {msg.fileName}
                  </a>
                ) : (
                  <p>{msg.message}</p>
                )}

                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </motion.div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-gray-900/50 border-t border-gray-800 flex flex-col gap-3"
      >
        <div className="flex items-end gap-3">
          <button
            type="button"
            className="w-11 h-11 rounded-full bg-gray-800 flex items-center justify-center text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            📎
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker((p) => !p)}
            className="hidden sm:flex w-11 h-11 rounded-full bg-gray-800 items-center justify-center text-white"
          >
            😊
          </button>

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => setShowEmojiPicker(false)}
            placeholder="Type a message…"
            className="flex-1 min-h-12 rounded-2xl bg-gray-800 p-3 text-white resize-none border border-transparent focus:border-purple-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />

          <button
            type="submit"
            disabled={sending}
            className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {showEmojiPicker && (
          <div className="hidden sm:grid grid-cols-6 gap-2 bg-gray-900 p-3 rounded-xl border border-gray-700">
            {emojiList.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setNewMessage((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {selectedFile && (
          <div className="flex justify-between items-center bg-gray-800/70 text-white text-sm rounded-xl px-4 py-2">
            <span className="truncate max-w-[70%]">{selectedFile.name}</span>
            <button
              type="button"
              className="text-red-400"
              onClick={() => setSelectedFile(null)}
            >
              Remove
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelected}
          className="hidden"
        />
      </form>
    </div>
  );
}
