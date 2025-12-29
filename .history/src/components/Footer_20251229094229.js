'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Contact', href: '#contact' },
  { label: 'Docs', href: 'https://github.com/ChakraVaishnav/Whisp#readme' },
];

const EMAIL = 'guntakachakravaishnavreddy@gmail.com';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800"
        >
          {/* Logo Section */}
          <div className="col-span-1">
            <Link href="/" className="text-2xl font-bold inline-block mb-4">
              <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Whisp
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              A modern, encrypted chat app focused on privacy, simplicity, and speed.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => {
                const isExternal = link.href.startsWith('http');
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noreferrer' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <p className="text-gray-400 text-sm mb-3">
              For deployment, security, or API inquiries, please contact us. We respond within one business day.
            </p>
            <div className="space-y-2 text-sm">
              <Link
                href={`mailto:${EMAIL}`}
                className="block text-blue-400 hover:text-blue-300 transition-colors"
              >
                {EMAIL}
              </Link>
              <Link href="#contact" className="block text-blue-400 hover:text-blue-300 transition-colors">
                Open the contact form
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between pt-8"
        >
          <p className="text-gray-400 text-sm">
            © 2025 Whisp. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex gap-6 text-gray-400 text-sm">
            <Link href="#" className="hover:text-white transition-colors">
              Status
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Changelog
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Github
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
