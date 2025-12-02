'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Download', href: '#download' },
  { label: 'Contact', href: '#contact' },
];

const socialLinks = [
  { icon: '𝕏', href: '#' },
  { icon: '🔗', href: '#' },
  { icon: '📧', href: '#' },
  { icon: '🐙', href: '#' },
];

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
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors text-lg"
                >
                  {social.icon}
                </motion.a>
              ))}
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
            © 2024 Whisp. All rights reserved. Made with ❤️ for privacy.
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
