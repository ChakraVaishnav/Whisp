export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8">
          <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>
          <p className="text-gray-300 leading-relaxed mb-4">
            Whisp is committed to protecting your privacy. This Privacy Policy explains what information we collect,
            how we use it, and your rights.
          </p>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              We collect information necessary to provide the service, including account details (email, display name),
              and encrypted message metadata. We do not store message plaintext on our servers when end-to-end encryption
              is enabled.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">2. Cookies & Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              We use minimal cookies for session management and security. We do not use third-party trackers for analytics
              by default.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">3. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain account and message metadata for operational purposes. If you request account deletion, we will
              remove personal data in accordance with applicable law.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">4. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You may request access to, correction of, or deletion of your personal data. Contact us to exercise these
              rights.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">5. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              For privacy inquiries, please email{' '}
              <a href="mailto:guntakachakravaishnavreddy@gmail.com" className="text-blue-400 hover:underline">
                guntakachakravaishnavreddy@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
