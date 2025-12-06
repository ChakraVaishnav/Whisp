"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSocket } from "../../context/SocketContext";
import { getFingerprint } from "bro-auth/browser";
import { useAuth } from "../../context/AuthContext";
import logger from "../../utils/logger";

export default function ChatWindow({ selectedWhisper, currentUserId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [otherOnline, setOtherOnline] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const { socket, connected } = useSocket();
  const { accessToken } = useAuth();

  const emojiList = ["😀", "😂", "😍", "🎉", "👍", "🔥", "🤝", "✨"];

  //
  // 1️⃣ LOAD HISTORY FROM DB WHEN CHAT OPENS
  //
  useEffect(() => {
    if (!selectedWhisper) return;

    const otherUser =
      selectedWhisper.userAId === currentUserId
        ? selectedWhisper.userB
        : selectedWhisper.userA;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `/api/messages?senderId=${currentUserId}&receiverId=${otherUser.id}`
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        logger.error("Failed to fetch history", err);
      }
    };

    fetchHistory();
  }, [selectedWhisper, currentUserId]);

  //
  // 2️⃣ SOCKET EVENTS FOR REAL-TIME UPDATES
  //
  useEffect(() => {
    if (!socket || !selectedWhisper) return;

    const otherUser =
      selectedWhisper.userAId === currentUserId
        ? selectedWhisper.userB
        : selectedWhisper.userA;

    const roomId = [currentUserId, otherUser.id].sort().join("-");

    // Join chat room
    socket.emit("join-room", { roomId });

    // Live new messages
    socket.on("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // File receiving
    socket.on("file-received", async (payload) => {
      const {
        senderId,
        fileName,
        mimeType,
        dataBase64,
        keyBase64,
        ivBase64,
      } = payload;

      try {
        let blob;

        if (keyBase64 && ivBase64) {
          const rawKey = Uint8Array.from(atob(keyBase64), (c) =>
            c.charCodeAt(0)
          );
          const key = await window.crypto.subtle.importKey(
            "raw",
            rawKey,
            "AES-GCM",
            false,
            ["decrypt"]
          );

          const iv = Uint8Array.from(atob(ivBase64), (c) =>
            c.charCodeAt(0)
          );
          const encBytes = Uint8Array.from(atob(dataBase64), (c) =>
            c.charCodeAt(0)
          );

          const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            encBytes
          );

          blob = new Blob([decrypted], { type: mimeType });
        } else {
          const bytes = Uint8Array.from(atob(dataBase64), (c) =>
            c.charCodeAt(0)
          );
          blob = new Blob([bytes], { type: mimeType });
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
        logger.error("File decode failed:", err);
      }
    });

    // Presence
    const handlePresence = ({ userId, online }) => {
      if (userId === otherUser.id) setOtherOnline(online);
    };
    socket.on("presence-update", handlePresence);

    // Request current presence
    socket.emit("get-presence", { userIds: [otherUser.id] }, (res) => {
      setOtherOnline(res?.[otherUser.id] || false);
    });

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("new-message");
      socket.off("file-received");
      socket.off("presence-update", handlePresence);
    };
  }, [socket, selectedWhisper, currentUserId]);

  //
  // 3️⃣ AUTO-SCROLL ON NEW MESSAGE
  //
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //
  // 4️⃣ HANDLE SENDING MESSAGES
  //
  const handleSend = async (e) => {
    e.preventDefault();
    if (!socket || !connected) return;

    const otherUser =
      selectedWhisper.userAId === currentUserId
        ? selectedWhisper.userB
        : selectedWhisper.userA;

    const receiverId = otherUser.id;
    const fp = await getFingerprint();

    //
    // FILE MESSAGE
    //
    if (selectedFile) {
      const file = selectedFile;

      const arrayBuffer = await file.arrayBuffer();
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        arrayBuffer
      );

      const encBytes = new Uint8Array(encrypted);
      const dataBase64 = btoa(String.fromCharCode(...encBytes));

      const rawKey = await crypto.subtle.exportKey("raw", key);
      const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
      const ivBase64 = btoa(String.fromCharCode(...iv));

      socket.emit("send-file", {
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

    //
    // TEXT MESSAGE
    //
    if (newMessage.trim().length > 0) {
      socket.emit("send-message", {
        senderId: currentUserId,
        receiverId,
        message: newMessage,
        token: accessToken,
        fingerprint: fp.hash,
      });

      // Save to DB
      fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId,
          message: newMessage,
          fingerprint: fp.hash,
        }),
      });

      setNewMessage("");
    }
  };

  //
  // UI STARTS HERE
  //
  
  const otherUser =
    selectedWhisper.userAId === currentUserId
      ? selectedWhisper.userB
      : selectedWhisper.userA;

  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/50 p-4 border-b border-gray-800 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 text-white bg-gray-800 rounded-md">
            ←
          </button>
        )}

        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
            {(otherUser?.username || otherUser?.email || "?")[0].toUpperCase()}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-gray-900 ${
              otherOnline ? "bg-green-400" : "bg-orange-400"
            }`}
          ></span>
        </div>

        <div>
          <p className="text-white font-semibold">{otherUser?.username}</p>
          <p className={otherOnline ? "text-green-400" : "text-orange-400"}>
            {otherOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md px-4 py-2 rounded-2xl ${
                  isMe
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-gray-800 text-white"
                }`}
              >
                {msg.fileUrl ? (
                  <a
                    href={msg.fileUrl}
                    download={msg.fileName}
                    className="underline text-blue-300"
                  >
                    {msg.fileName}
                  </a>
                ) : (
                  <p>{msg.message}</p>
                )}

                <p className="text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-gray-900/50 border-t border-gray-800 flex gap-3"
      >
        <textarea
          className="flex-1 bg-gray-800 p-3 text-white rounded-md"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message…"
        />

        <button className="px-4 py-2 bg-purple-600 text-white rounded-md">
          Send
        </button>
      </form>
    </div>
  );
}
