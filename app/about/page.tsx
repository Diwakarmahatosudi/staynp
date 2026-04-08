import Link from "next/link";
import { HiHeart, HiShieldCheck, HiCurrencyDollar, HiLocationMarker, HiUserGroup, HiPhone } from "react-icons/hi";
import { MdVerified } from "react-icons/md";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-nepal-sand">
      <section className="bg-mountain-gradient py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-4 font-heading text-4xl font-bold md:text-5xl">
            About Stay<span className="text-nepal-gold-light">NP</span>
          </h1>
          <p className="text-lg text-white/80">
            Built for Nepal, by Nepal. We connect travelers with authentic local stays
            — from Kathmandu heritage homes to Himalayan mountain lodges.
          </p>
        </div>
      </section>

      <section id="our-story" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="section-title mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">
            Nepal has some of the most beautiful and diverse accommodations in the world — but they&apos;re
            hard to discover. Global platforms don&apos;t understand Nepal&apos;s unique needs: eSewa payments,
            Nepali-language support, phone-based booking, and the trust that comes from KYC-verified local hosts.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            StayNP was born from a simple idea: what if Nepal had its own world-class booking platform?
            One that understands our culture, supports our payment systems, and ensures 95% of every booking
            goes directly to local communities. That&apos;s what we&apos;re building.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: HiUserGroup, title: "50,000+", desc: "Happy guests from 80+ countries" },
            { icon: HiHeart, title: "2,500+", desc: "Verified local hosts across Nepal" },
            { icon: HiLocationMarker, title: "75", desc: "Districts covered nationwide" },
          ].map((s) => (
            <div key={s.title} className="card p-6 text-center">
              <s.icon className="mx-auto mb-3 h-8 w-8 text-nepal-crimson" />
              <p className="text-2xl font-bold text-nepal-slate">{s.title}</p>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-nepal-warm py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="section-title mb-10 text-center">How StayNP Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Search", desc: "Browse stays by region, property type, or amenities. Filter by price in NPR. Use the search bar to find exactly what you need." },
              { step: "2", title: "Book & Pay", desc: "Reserve instantly and pay securely with eSewa, Khalti, or card. Get SMS confirmation on your phone immediately." },
              { step: "3", title: "Stay & Review", desc: "Enjoy authentic Nepali hospitality. After your stay, leave a review to help future travelers find the best places." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-nepal-crimson text-lg font-bold text-white">{s.step}</div>
                <h3 className="mb-2 text-lg font-semibold text-nepal-slate">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust-safety" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="section-title mb-10 text-center">Trust & Safety</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: MdVerified, title: "KYC Verified Hosts", desc: "Every host submits Nagarikta or business license. Our team manually verifies each document before approving." },
            { icon: HiShieldCheck, title: "Secure Payments", desc: "All payments processed through encrypted channels via eSewa, Khalti, or card processors. Your money is safe." },
            { icon: HiPhone, title: "SMS Confirmations", desc: "Booking confirmations sent via SMS — works everywhere in Nepal, even without internet connection." },
            { icon: HiCurrencyDollar, title: "Transparent Pricing", desc: "No hidden fees. Price you see includes the 5% service fee. Everything priced in NPR." },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 rounded-xl bg-white p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nepal-crimson/10">
                <f.icon className="h-5 w-5 text-nepal-crimson" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-nepal-slate">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="cancellation" className="bg-nepal-warm py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="section-title mb-4">Cancellation Policy</h2>
          <div className="mb-8 text-gray-600">
            <p className="mb-6">StayNP offers a fair cancellation policy that protects both guests and hosts:</p>
            <div className="grid gap-4 text-left sm:grid-cols-3">
              {[
                { time: "48+ hours before", refund: "Full refund", color: "bg-nepal-forest/10 text-nepal-forest" },
                { time: "Within 48 hours", refund: "50% refund", color: "bg-nepal-gold/10 text-nepal-gold-dark" },
                { time: "No-show", refund: "No refund", color: "bg-nepal-crimson/10 text-nepal-crimson" },
              ].map((p) => (
                <div key={p.time} className="rounded-xl bg-white p-4 text-center">
                  <p className="mb-1 text-sm font-semibold text-nepal-slate">{p.time}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.color}`}>{p.refund}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm">Hosts may set stricter policies for peak seasons (Dashain/Tihar, spring trekking). These are clearly shown before you book.</p>
          </div>
        </div>
      </section>

      <section className="bg-mountain-gradient py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-4 font-heading text-3xl font-bold">Ready to explore Nepal?</h2>
          <p className="mb-8 text-white/80">Find your perfect stay or start hosting today.</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/properties" className="btn-gold">Explore Stays</Link>
            <Link href="/host/new" className="rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10">
              Become a Host
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
