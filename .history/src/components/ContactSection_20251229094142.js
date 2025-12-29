"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

const EMAIL = 'guntakachakravaishnavreddy@gmail.com';

export default function ContactSection() {

  return (
    <section
      id="contact"
      className="py-20 px-6 bg-linear-to-br from-gray-900/80 via-slate-950 to-gray-900 text-white"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">Contact</p>
          <h2 className="text-4xl lg:text-5xl font-bold">Contact the Whisp Team</h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            For inquiries about encryption, presence, or high-speed messaging, contact our team directly. We monitor all communications daily.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.15 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-6 text-center"
        >
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            For support, bug reports, or deployment requests, email us. We respond within one business day.
          </p>
          <Link
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-blue-400/60"
          >
            Email the team
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
