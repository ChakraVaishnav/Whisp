'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

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
            <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl" />
            
            {/* Main Chat Window */}
            <div className="relative bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-800/50">
              {/* Header */}
              <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">
                    👤
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
                    📞
                  </Link>
                  <Link
                    href="#contact"
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                    aria-label="See contact options"
                  >
                    ℹ️
                  </Link>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-96 px-8 py-6 space-y-4 overflow-hidden bg-linear-to-b from-gray-900 to-gray-950">
                {/* Message Group 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-gray-100 rounded-3xl rounded-bl-none px-6 py-3 max-w-xs text-sm leading-relaxed shadow-sm">
                    Hey! How are you doing? 👋
                  </div>
                </motion.div>

                {/* Message Group 2 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex justify-end"
                >
                  <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-3xl rounded-br-none px-6 py-3 max-w-xs text-sm leading-relaxed shadow-md">
                    Great! Just got Whisp, it's amazing 🎉
                  </div>
                </motion.div>

                {/* Message Group 3 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-gray-100 rounded-3xl rounded-bl-none px-6 py-3 max-w-xs text-sm leading-relaxed shadow-sm">
                    That's awesome! I love how fast and secure it is 🔒
                  </div>
                </motion.div>

                {/* Message Group 4 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex justify-end"
                >
                  <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-3xl rounded-br-none px-6 py-3 max-w-xs text-sm leading-relaxed shadow-md">
                    Yeah, AES-256 encryption is no joke! Want to chat more? 💬
                  </div>
                </motion.div>

                {/* Message Group 5 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-200 text-gray-900 rounded-3xl rounded-bl-none px-6 py-3 max-w-xs text-sm leading-relaxed shadow-sm">
                    Absolutely! 😊
                  </div>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="bg-gray-900 px-8 py-4 border-t border-gray-800 flex gap-3 items-center">
                <button className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-300">
                  ➕
                </button>
                <input
                  type="text"
                  placeholder="Aa"
                  className="flex-1 bg-gray-800 rounded-full px-6 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-white"
                />
                <button className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full p-3 font-semibold hover:shadow-lg transition-all">
                  ➜
                </button>
              </div>
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              { emoji: '⚡', label: 'Instant Delivery', text: 'Messages arrive in milliseconds' },
              { emoji: '🎨', label: 'Beautiful UI', text: 'Minimal and aesthetic design' },
              { emoji: '🔐', label: 'Fully Encrypted', text: 'End-to-end encrypted' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="text-center p-6 rounded-2xl bg-gray-800 border border-gray-700 hover:border-blue-500/50 transition-all"
              >
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-semibold text-white mb-2">{item.label}</h3>
                <p className="text-gray-400 text-sm">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
