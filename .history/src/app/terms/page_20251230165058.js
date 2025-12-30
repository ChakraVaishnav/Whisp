export const metadata = {
  title: "Terms of Service | Whisp",
  description: "Review Whisp's terms of service to understand your rights and responsibilities as a user.",
  keywords: [
    "terms of service",
    "Whisp terms",
    "user agreement",
    "legal"
  ],
  openGraph: {
    title: "Terms of Service | Whisp",
    description: "Review Whisp's terms of service to understand your rights and responsibilities as a user.",
    url: "https://whispchat.vercel.app/terms",
    siteName: "Whisp",
    type: "article",
    images: [
      {
        url: "https://whispchat.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Whisp terms of service screenshot",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8">
          <h1 className="text-3xl font-semibold mb-4">Terms of Service</h1>
          <p className="text-gray-300 leading-relaxed mb-4">
            These Terms of Service ("Terms") govern your access to and use of Whisp. By using our services,
            you agree to these Terms. Please read them carefully. If you do not agree, do not use Whisp.
          </p>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By creating an account and using Whisp, you accept and agree to be bound by these Terms and any
              additional terms referenced herein.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">2. Use of Service</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to use Whisp in compliance with all applicable laws. Prohibited conduct includes unauthorized
              access, harassment, distribution of malicious software, and any activity that interferes with others' use
              of the service.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">3. Account Security</h2>
            <p className="text-gray-300 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. Notify us promptly
              of any unauthorized use.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              All content and trademarks on Whisp are the property of their respective owners. You may not reproduce
              or misuse our intellectual property without permission.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">5. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, Whisp is not liable for indirect, incidental, or consequential
              damages arising from your use of the service.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">6. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update these Terms from time to time. We will provide notice of material changes when appropriate.
            </p>
          </section>

          <section className="mt-8 text-sm text-gray-400">
            <p>
              For questions about these Terms, contact us at{' '}
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
