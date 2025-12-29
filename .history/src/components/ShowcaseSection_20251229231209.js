'use client';


import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserCircleIcon, PhoneIcon, InformationCircleIcon, PlusIcon, ArrowRightCircleIcon, BoltIcon, PaintBrushIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const CONTACT_EMAIL = 'guntakachakravaishnavreddy@gmail.com';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

export default function ShowcaseSection() {
  return (
    <section className="py-20 px-6 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              Experience Whisp
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Clean, intuitive interface designed for modern communication.
            </p>
          </motion.div>

          {/* Chat Interface Showcase */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl" aria-hidden="true" />
            
            {/* Main Chat Window */}
            <div className="relative bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-800/50">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <UserCircleIcon className="w-8 h-8 text-white/80" aria-label="User profile" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Sarah</h3>
                    <p className="text-xs text-white/70">Active 2m ago</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                    aria-label="Email the Whisp team"
                  >
                    <PhoneIcon className="w-6 h-6 text-white/80" />
                  </Link>
                  <Link
                    href="#contact"
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                    aria-label="See contact options"
                  >
                    <InformationCircleIcon className="w-6 h-6 text-white/80" />
                  </Link>
                </div>
              </div>

              {/* Messages Area */}
              <ChatShowcaseMessages />

              {/* Input Area */}
              <ChatShowcaseInput />
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              { icon: <BoltIcon className="w-8 h-8 mx-auto text-blue-400" />, label: 'Instant Delivery', text: 'Messages arrive in milliseconds' },
              { icon: <PaintBrushIcon className="w-8 h-8 mx-auto text-purple-400" />, label: 'Beautiful UI', text: 'Minimal and aesthetic design' },
              { icon: <LockClosedIcon className="w-8 h-8 mx-auto text-blue-500" />, label: 'Fully Encrypted', text: 'End-to-end encrypted' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="text-center p-6 rounded-2xl bg-gray-800 border border-gray-700 hover:border-blue-500/50 transition-all"
              >
                <div className="mb-3">{item.icon}</div>
                <h3 className="font-semibold text-white mb-2">{item.label}</h3>
                <p className="text-gray-400 text-sm">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        // --- ChatShowcaseMessages and ChatShowcaseInput components ---

        import { useState } from 'react';

        const initialMessages = [
          { text: "Hey! How are you doing? 👋", from: "left" },
          { text: "Great! Just got Whisp, it's amazing 🎉", from: "right" },
          { text: "That's awesome! I love how fast and secure it is 🔒", from: "left" },
          { text: "Yeah, AES-256 encryption is no joke! Want to chat more? 💬", from: "right" },
          { text: "Absolutely! 😊", from: "left" },
        ];

        function ChatShowcaseMessages() {
          const [messages, setMessages] = useState(initialMessages);
          // Expose setter for input
          ChatShowcaseMessages.setMessages = setMessages;
          ChatShowcaseMessages.getMessages = () => messages;
          return (
            <div className="h-96 px-8 py-6 space-y-4 overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.from === 'left' ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex ${msg.from === 'left' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`${msg.from === 'left' ? 'bg-gray-700 text-gray-100 rounded-3xl rounded-bl-none' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl rounded-br-none'} px-6 py-3 max-w-xs text-sm leading-relaxed shadow-sm`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
          );
        }

        function ChatShowcaseInput() {
          const [input, setInput] = useState("");
          const handleSend = () => {
            if (!input.trim()) return;
            // Add message to messages list
            const setMessages = ChatShowcaseMessages.setMessages;
            if (setMessages) {
              setMessages((prev) => [...prev, { text: input, from: "right" }]);
            }
            setInput("");
          };
          return (
            <div className="bg-gray-900 px-8 py-4 border-t border-gray-800 flex gap-3 items-center">
              <button className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-300" tabIndex={-1} aria-label="Add attachment" disabled>
                <PlusIcon className="w-6 h-6" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 rounded-full px-6 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-white"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                aria-label="Type a message"
              />
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-3 font-semibold hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                onClick={handleSend}
                aria-label="Send message"
              >
                <ArrowRightCircleIcon className="w-6 h-6" />
              </button>
            </div>
          );
        }
        </motion.div>
      </div>
    </section>
  );
}
