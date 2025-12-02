'use client';

import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';

const features = [
  {
    id: 1,
    icon: '⚡',
    title: 'Real-time Messaging',
    description: 'Chat instantly with ultra-low latency socket connections for seamless conversations.',
  },
  {
    id: 2,
    icon: '🔒',
    title: 'AES-Encrypted Messages',
    description: 'Every message is encrypted with AES-256-GCM for maximum privacy and security.',
  },
  {
    id: 3,
    icon: '🚀',
    title: 'Lightweight & Fast',
    description: 'Minimal design, optimized rendering, and blazing fast UI for smooth experience.',
  },
  {
    id: 4,
    icon: '👥',
    title: 'Private Connections',
    description: 'Whispers let you chat only with people you trust, on your own terms.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
            Powerful Features,
            <br />
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Minimal Design
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Everything you need for modern, private, real-time communication.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
