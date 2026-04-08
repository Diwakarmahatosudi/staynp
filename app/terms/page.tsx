import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-nepal-sand">
      <section className="bg-mountain-gradient py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-4 font-heading text-3xl font-bold md:text-4xl">Terms of Service</h1>
          <p className="text-white/80">Last updated: April 7, 2026</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="card p-8 md:p-10">
          <div className="prose prose-sm max-w-none text-gray-600">
            <h2 className="text-lg font-semibold text-nepal-slate">1. Agreement to Terms</h2>
            <p>By accessing or using StayNP (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. StayNP is operated by StayNP Pvt. Ltd., registered in Nepal.</p>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">2. Eligibility</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>You must be at least 18 years old to use StayNP</li>
              <li>You must provide accurate and truthful information</li>
              <li>Hosts must have legal right to list their property</li>
              <li>One account per person (both guest and host capabilities)</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">3. Guest Terms</h2>
            <p>As a guest, you agree to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Provide accurate booking information and valid contact number</li>
              <li>Respect the host&apos;s property and house rules</li>
              <li>Check in and check out at agreed times</li>
              <li>Report any damage promptly</li>
              <li>Leave honest reviews after your stay</li>
              <li>Not use properties for illegal activities</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">4. Host Terms</h2>
            <p>As a host, you agree to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Provide accurate property descriptions and photos</li>
              <li>Maintain clean, safe accommodations as described</li>
              <li>Honor confirmed bookings</li>
              <li>Complete KYC verification for the Verified Local badge</li>
              <li>Comply with local regulations and tax obligations</li>
              <li>Respond to booking requests within 24 hours</li>
              <li>Not discriminate against guests</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">5. Booking & Payment</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>All prices are listed in NPR (Nepali Rupees)</li>
              <li>A 5% service fee is added to the booking total for guests</li>
              <li>Hosts receive payment 24 hours after guest check-in</li>
              <li>Accepted payment methods: eSewa, Khalti, Credit/Debit Card, Bank Transfer</li>
              <li>StayNP retains a 5% commission from host earnings</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">6. Cancellation Policy</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>48+ hours before check-in:</strong> Full refund</li>
              <li><strong>Within 48 hours:</strong> 50% refund</li>
              <li><strong>No-show:</strong> No refund</li>
              <li><strong>Host cancellation:</strong> Full refund to guest, possible account penalties for host</li>
            </ul>
            <p>Hosts may set stricter cancellation policies for peak seasons, which will be clearly displayed before booking.</p>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">7. Reviews</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>Only verified guests who completed a stay can leave reviews</li>
              <li>Reviews must be honest and respectful</li>
              <li>StayNP reserves the right to remove reviews that violate guidelines</li>
              <li>Hosts can respond to reviews publicly</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">8. Prohibited Activities</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>Creating fake listings or accounts</li>
              <li>Posting fraudulent reviews</li>
              <li>Using properties for illegal purposes</li>
              <li>Circumventing StayNP payment system</li>
              <li>Harassment or discrimination of any kind</li>
              <li>Sharing login credentials</li>
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">9. Limitation of Liability</h2>
            <p>StayNP acts as a marketplace connecting hosts and guests. We do not own or manage properties listed on the platform. While we verify hosts through KYC, we are not liable for the condition of properties, host behavior, or guest behavior beyond our reasonable control.</p>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">10. Dispute Resolution</h2>
            <p>In case of disputes between hosts and guests, StayNP will mediate in good faith. Unresolved disputes are subject to arbitration under Nepal Arbitration Act. The jurisdiction is Kathmandu, Nepal.</p>

            <h2 className="mt-8 text-lg font-semibold text-nepal-slate">11. Contact</h2>
            <p>For questions about these terms:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Email: <a href="mailto:legal@staynp.com" className="text-nepal-crimson hover:underline">legal@staynp.com</a></li>
              <li>Phone: +977-01-5970000</li>
              <li>Address: Thamel, Kathmandu, Nepal</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/privacy" className="text-sm text-nepal-crimson hover:underline">Read our Privacy Policy →</Link>
        </div>
      </div>
    </div>
  );
}
