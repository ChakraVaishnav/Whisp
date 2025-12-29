'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  PhoneIcon,
  InformationCircleIcon,
  PlusIcon,
  ArrowRightCircleIcon,
  BoltIcon,
  PaintBrushIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const CONTACT_EMAIL = 'guntakachakravaishnavreddy@gmail.com';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const initialMessages = [
  { text: 'Hey! How are you doing?', from: 'left' },
  { text: 'Great! Just started using Whisp.', from: 'right' },
  { text: 'Nice. The interface feels very smooth.', from: 'left' },
  { text: 'Security and speed are impressive.', from: 'right' },
  { text: 'Absolutely.', from: 'left' },
];

export default function ShowcaseSection() {
  const [messages, setMessages] = useState(initialMessages);

  return (
    <section className="py-20 px-6 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-10"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Experience Whisp
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              A clean, intuitive interface designed for modern communication.
            </p>
          </motion.div>

          {/* Chat Card */}
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl rounded-3xl" />

            <div className="relative bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <UserCircleIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold">Sarah</p>
                    <p className="text-xs text-white/70">Active recently</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                    aria-label="Email"
                  >
                    <PhoneIcon className="w-6 h-6" />
                  </Link>
                  <Link
                    href="#contact"
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                    aria-label="Info"
                  >
                    <InformationCircleIcon className="w-6 h-6" />
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <ChatMessages messages={messages} />

              {/* Input */}
              <ChatInput onSend={(text) =>
                setMessages((prev) => [...prev, { text, from: 'right' }])
              } />
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12"
          >
            {[
              {
                icon: <BoltIcon className="w-8 h-8 text-blue-400 mx-auto" />,
                title: 'Instant Delivery',
                desc: 'Messages delivered in milliseconds',
              },
              {
                icon: <PaintBrushIcon className="w-8 h-8 text-purple-400 mx-auto" />,
                title: 'Clean Design',
                desc: 'Minimal and elegant user interface',
              },
              {
                icon: <LockClosedIcon className="w-8 h-8 text-blue-500 mx-auto" />,
                title: 'Secure',
                desc: 'End-to-end encrypted communication',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="p-6 text-center bg-gray-800 border border-gray-700 rounded-2xl hover:border-blue-500/50 transition"
              >
                <div className="mb-3">{item.icon}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Sub Components ---------------- */

function ChatMessages({ messages }) {
  return (
    <div className="h-96 px-8 py-6 space-y-4 overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950">
      {messages.map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: msg.from === 'left' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={`flex ${msg.from === 'left' ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`px-6 py-3 max-w-xs text-sm rounded-3xl shadow
              ${
                msg.from === 'left'
                  ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
              }`}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ChatInput({ onSend }) {
  const [value, setValue] = useState('');

  const send = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="flex items-center gap-3 px-8 py-4 bg-gray-900 border-t border-gray-800">
      <button
        disabled
        className="p-2 rounded-lg text-gray-400 cursor-not-allowed"
        aria-label="Attachment"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="Type a message"
        className="flex-1 bg-gray-800 rounded-full px-6 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />

      <button
        onClick={send}
        className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition"
        aria-label="Send"
      >
        <ArrowRightCircleIcon className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
