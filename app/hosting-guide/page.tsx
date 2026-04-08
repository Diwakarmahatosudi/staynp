import Link from "next/link";
import { HiCamera, HiCurrencyDollar, HiShieldCheck, HiStar, HiCheck, HiArrowRight, HiLightBulb, HiClipboardList } from "react-icons/hi";
import { MdVerified } from "react-icons/md";

const STEPS = [
  {
    step: 1,
    title: "Create Your Listing",
    description: "Tell guests about your property — what makes it special, how many rooms, what amenities you offer. Great descriptions get more bookings.",
    tips: [
      "Write an honest, detailed description",
      "Mention nearby attractions and transport",
      "Highlight what makes your place unique",
      "Include house rules clearly",
    ],
    icon: HiClipboardList,
  },
  {
    step: 2,
    title: "Take Great Photos",
    description: "Photos are the #1 factor in booking decisions. Well-lit, clean photos of every room dramatically increase your booking rate.",
    tips: [
      "Use natural daylight — shoot near windows",
      "Clean and declutter before shooting",
      "Show every room including bathroom",
      "Capture the view if you have one",
      "Include exterior/entrance photos",
    ],
    icon: HiCamera,
  },
  {
    step: 3,
    title: "Set Your Price",
    description: "Research similar stays in your area. Price competitively to get your first bookings, then adjust based on demand and reviews.",
    tips: [
      "Check prices of similar stays nearby",
      "Start slightly lower to build reviews",
      "Increase prices for peak season (Oct-Nov, Mar-Apr)",
      "Include breakfast to justify higher prices",
      "Consider weekly/monthly discounts",
    ],
    icon: HiCurrencyDollar,
  },
  {
    step: 4,
    title: "Get Verified",
    description: "Upload your Nagarikta (Citizenship) or Business License to earn the Verified Local badge. Verified hosts get 3x more bookings.",
    tips: [
      "Upload a clear photo of your document",
      "Verification takes 1-2 business days",
      "Verified badge builds guest trust",
      "Required for premium listing placement",
    ],
    icon: HiShieldCheck,
  },
  {
    step: 5,
    title: "Welcome Your Guests",
    description: "Great hospitality leads to great reviews. A warm welcome, clean space, and local tips turn first-time guests into repeat visitors.",
    tips: [
      "Respond to booking requests promptly",
      "Send check-in instructions in advance",
      "Provide clean linens and towels",
      "Share your favorite local restaurants",
      "A small welcome gesture goes a long way",
    ],
    icon: HiStar,
  },
];

const EARNINGS = [
  { type: "Homestay in Thamel", price: "NPR 2,500/night", monthly: "NPR 45,000", occupancy: "60%" },
  { type: "Lodge in Pokhara", price: "NPR 4,500/night", monthly: "NPR 94,500", occupancy: "70%" },
  { type: "Heritage Stay in Patan", price: "NPR 8,000/night", monthly: "NPR 144,000", occupancy: "60%" },
  { type: "Mountain Retreat", price: "NPR 3,000/night", monthly: "NPR 54,000", occupancy: "60%" },
];

export default function HostingGuidePage() {
  return (
    <div className="min-h-screen bg-nepal-sand">
      <section className="bg-mountain-gradient py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-4 font-heading text-3xl font-bold md:text-4xl">Hosting Guide</h1>
          <p className="text-lg text-white/80">Everything you need to know to become a successful host on StayNP</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Why Host */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-nepal-slate">Why Host on StayNP?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "95% Earnings", desc: "Keep 95% of every booking. Only 5% service fee — the lowest in the industry.", icon: HiCurrencyDollar },
              { title: "Verified Trust", desc: "Our KYC verification and review system builds trust with guests worldwide.", icon: MdVerified },
              { title: "Nepal-First", desc: "Built for Nepal — eSewa/Khalti payments, SMS notifications, Nepali language support.", icon: HiLightBulb },
            ].map((item) => (
              <div key={item.title} className="card p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-nepal-crimson/10">
                  <item.icon className="h-6 w-6 text-nepal-crimson" />
                </div>
                <h3 className="mb-2 font-semibold text-nepal-slate">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Step by Step */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-nepal-slate">Step-by-Step Guide</h2>
          <div className="space-y-8">
            {STEPS.map((s) => (
              <div key={s.step} className="card overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex items-center justify-center bg-nepal-crimson/5 p-6 md:w-48">
                    <div className="text-center">
                      <s.icon className="mx-auto mb-2 h-8 w-8 text-nepal-crimson" />
                      <span className="text-xs font-bold text-nepal-crimson">STEP {s.step}</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <h3 className="mb-2 text-lg font-semibold text-nepal-slate">{s.title}</h3>
                    <p className="mb-4 text-sm text-gray-600">{s.description}</p>
                    <div className="space-y-2">
                      {s.tips.map((tip) => (
                        <div key={tip} className="flex items-start gap-2 text-sm">
                          <HiCheck className="mt-0.5 h-4 w-4 shrink-0 text-nepal-forest" />
                          <span className="text-gray-600">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Earnings Estimate */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-nepal-slate">Potential Earnings</h2>
          <p className="mb-8 text-center text-sm text-gray-500">Estimated monthly earnings based on average occupancy rates</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {EARNINGS.map((e) => (
              <div key={e.type} className="card p-5">
                <h3 className="mb-1 text-sm font-semibold text-nepal-slate">{e.type}</h3>
                <p className="mb-3 text-xs text-gray-500">{e.price} · {e.occupancy} occupancy</p>
                <p className="text-lg font-bold text-nepal-crimson">{e.monthly}<span className="text-xs font-normal text-gray-400">/month</span></p>
              </div>
            ))}
          </div>
        </section>

        {/* Verified Badge */}
        <section className="mb-16" id="verified-badge">
          <div className="card overflow-hidden">
            <div className="bg-nepal-forest/5 p-8 text-center">
              <MdVerified className="mx-auto mb-3 h-12 w-12 text-nepal-forest" />
              <h2 className="mb-2 text-2xl font-bold text-nepal-slate">The Verified Local Badge</h2>
              <p className="text-sm text-gray-500">Stand out from the crowd and earn guest trust</p>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "3x more bookings than non-verified hosts",
                  "Priority placement in search results",
                  "Green verified badge on your listing",
                  "Access to premium host features",
                  "Higher guest trust and better reviews",
                  "Required for heritage property listings",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2 text-sm">
                    <HiCheck className="mt-0.5 h-4 w-4 shrink-0 text-nepal-forest" />
                    <span className="text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-nepal-warm p-4">
                <p className="text-sm font-semibold text-nepal-slate">How to get verified:</p>
                <p className="mt-1 text-sm text-gray-600">Go to Host Dashboard → Verification Status → Upload your Nagarikta (Citizenship) or Business License. Our team reviews it within 1-2 business days.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-mountain-gradient p-8 text-center text-white md:p-12">
          <h2 className="mb-4 font-heading text-2xl font-bold">Ready to start hosting?</h2>
          <p className="mb-6 text-white/80">List your property in minutes and start earning</p>
          <Link href="/host/new" className="btn-gold inline-flex items-center gap-2">
            List Your Property <HiArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
