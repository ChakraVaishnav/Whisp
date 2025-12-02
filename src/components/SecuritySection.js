'use client';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 px-6 bg-linear-to-r from-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center gap-16"
        >
          {/* Icon & Visual */}
          <motion.div
            variants={itemVariants}
            className="flex-1 flex justify-center lg:justify-start"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Animated background circles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8 border-2 border-purple-500/30 rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative text-8xl drop-shadow-2xl"
              >
                🔐
              </motion.div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div variants={itemVariants} className="flex-1 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold">Privacy First</h2>
            
            <p className="text-lg text-gray-300 leading-relaxed">
              We believe privacy is a fundamental right. Every aspect of Whisp is designed with your security in mind.
            </p>

            <div className="space-y-4 pt-6">
              {[
                { icon: '🔑', title: 'AES-256-GCM Encryption', desc: 'Military-grade encryption for all messages' },
                { icon: '📸', title: 'No Profile Pictures Stored', desc: 'Profile data is never stored on servers' },
                { icon: '📁', title: 'Stateless File Transfers', desc: 'Files are transferred peer-to-peer, never stored' },
                { icon: '🛡️', title: 'Secure Authentication', desc: 'Fingerprint binding for verified connections' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                  className="flex gap-4 items-start"
                >
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
