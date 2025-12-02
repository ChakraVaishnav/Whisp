'use client';

import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function FeatureCard({ feature }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="p-6 rounded-2xl bg-linear-to-br from-gray-800 to-gray-900 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer"
    >
      <div className="mb-4 text-4xl group-hover:scale-110 transition-transform duration-300">
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
    </motion.div>
  );
}
