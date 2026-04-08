import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-nepal-sand">
      <section className="bg-mountain-gradient py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-4 font-heading text-3xl font-bold md:text-4xl">Privacy Policy</h1>
          <p className="text-white/80">Last updated: April 7, 2026</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="card p-8 md:p-10">
          <div className="prose prose-sm max-w-none text-gray-600">
            <h2 className="text-lg font-semibold text-nepal-slate">1. Information We Collect</h2>
            <p>When you use StayNP, we collect information you provide directly:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Account Information:</strong> Full name, phone number, email address, and password when you create an account.</li>
              <li><strong>Profile Information:</strong> Profile photo, bio, and hosting details if you choose to become a host.</li>
              <li><strong>KYC Documents:</strong> Nagarikta (Citizenship) or Business License for host verification, stored securely in encrypted storage.</li>
              <li><strong>Payment Information:</strong> Payment method details processed securely through eSewa, Khalti, or our card payment provider. We do not store card numbers.</li>
              <li><strong>Booking Information:</strong> Property selections, dates, guest counts, and contact numbers.</li>
              <li><strong>Communications:</strong> Messages between hosts and guests, support inquiries.</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">2. How We Use Your Information</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>To create and manage your StayNP account</li>
              <li>To process bookings and payments</li>
              <li>To send booking confirmations via SMS</li>
              <li>To verify host identity through KYC documents</li>
              <li>To provide customer support</li>
              <li>To improve our services and user experience</li>
              <li>To prevent fraud and ensure platform safety</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">3. Information Sharing</h2>
            <p>We share your information only in these cases:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>With Hosts/Guests:</strong> Your name and contact number are shared with your host/guest for booking coordination.</li>
              <li><strong>Payment Providers:</strong> eSewa, Khalti, and card processors to complete transactions.</li>
              <li><strong>SMS Providers:</strong> Your phone number is shared with our SMS provider to send booking confirmations.</li>
              <li><strong>Legal Requirements:</strong> When required by Nepal law or to protect safety.</li>
            </ul>
            <p>We never sell your personal information to third parties.</p>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">4. Data Security</h2>
            <p>We take data security seriously:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>All data transmitted over HTTPS encryption</li>
              <li>KYC documents stored in encrypted Supabase storage buckets</li>
              <li>Passwords hashed using industry-standard bcrypt</li>
              <li>Regular security audits and vulnerability testing</li>
              <li>Row-level security on all database tables</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">6. Cookies</h2>
            <p>We use essential cookies to maintain your login session and preferences. We do not use third-party tracking cookies.</p>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">7. Contact Us</h2>
            <p>For privacy-related questions or to exercise your data rights:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Email: <a href="mailto:privacy@staynp.com" className="text-nepal-crimson hover:underline">privacy@staynp.com</a></li>
              <li>Phone: +977-01-5970000</li>
              <li>Address: Thamel, Kathmandu, Nepal</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/terms" className="text-sm text-nepal-crimson hover:underline">Read our Terms of Service →</Link>
        </div>
      </div>
    </div>
  );
}
