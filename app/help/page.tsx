"use client";

import { useState } from "react";
import Link from "next/link";
import { HiChevronDown, HiChevronUp, HiPhone, HiMail, HiChat, HiSearch, HiHome, HiCreditCard, HiShieldCheck, HiCalendar, HiLocationMarker, HiUserGroup } from "react-icons/hi";

const FAQ_CATEGORIES = [
  {
    id: "booking",
    label: "Booking & Reservations",
    icon: HiCalendar,
    faqs: [
      { q: "How do I book a stay?", a: "Browse properties on StayNP, select your dates and guests, then click 'Reserve'. You'll be taken to the payment page where you can pay with eSewa, Khalti, or card. Once payment is confirmed, you'll receive an SMS confirmation with your booking details." },
      { q: "Can I book for someone else?", a: "Yes! During booking, enter the contact number of the person who will be staying. They'll receive the SMS confirmation directly." },
      { q: "How far in advance can I book?", a: "You can book up to 12 months in advance. For peak seasons (October-November and March-April), we recommend booking at least 2-3 months ahead." },
      { q: "What happens after I book?", a: "You'll receive an SMS confirmation immediately. The host will also be notified. You can view your booking details anytime from your profile. The host may reach out to coordinate check-in details." },
    ],
  },
  {
    id: "payment",
    label: "Payments & Pricing",
    icon: HiCreditCard,
    faqs: [
      { q: "What payment methods are accepted?", a: "We accept eSewa, Khalti, Visa/Mastercard credit and debit cards, and direct bank transfers from Nepali banks. All prices are shown in NPR (Nepali Rupees)." },
      { q: "Is my payment secure?", a: "Absolutely. All payments are processed through encrypted, PCI-compliant payment gateways. We never store your card details on our servers." },
      { q: "Are there any hidden fees?", a: "No hidden fees. The price you see includes a 5% StayNP service fee. Some hosts may add a cleaning fee which is shown clearly before you book." },
      { q: "When is the host paid?", a: "Hosts receive payment 24 hours after your check-in. This protects both guests and hosts." },
    ],
  },
  {
    id: "cancellation",
    label: "Cancellation & Refunds",
    icon: HiShieldCheck,
    faqs: [
      { q: "What is the cancellation policy?", a: "Free cancellation up to 48 hours before check-in for a full refund. Cancellations within 48 hours receive a 50% refund. No-shows are non-refundable. Some hosts may have stricter policies for peak seasons." },
      { q: "How do I cancel a booking?", a: "Go to your bookings in your profile, find the booking you want to cancel, and click 'Cancel Booking'. Your refund will be processed within 5-7 business days to your original payment method." },
      { q: "What if the host cancels?", a: "If a host cancels, you'll receive a full refund automatically. We'll also help you find alternative accommodation nearby." },
    ],
  },
  {
    id: "hosting",
    label: "Hosting on StayNP",
    icon: HiHome,
    faqs: [
      { q: "How do I become a host?", a: "Sign up for a StayNP account, then go to 'List Your Property'. Fill in your property details, upload photos, set your price, and submit. Your listing will be reviewed within 24 hours." },
      { q: "What does StayNP charge hosts?", a: "StayNP takes a 5% service fee from each booking. That means you keep 95% of your listed price — one of the lowest commissions in the industry." },
      { q: "How do I get the Verified Local badge?", a: "Upload your Nagarikta (Citizenship certificate) or Business License from the Host Dashboard. Our team verifies it within 1-2 business days. Verified hosts get more bookings!" },
      { q: "Can I set different prices for peak season?", a: "Yes! You can set custom pricing for specific date ranges from your listing settings. We recommend higher prices for October-November (Dashain/Tihar season) and March-April (spring trekking)." },
    ],
  },
  {
    id: "safety",
    label: "Safety & Trust",
    icon: HiShieldCheck,
    faqs: [
      { q: "How does StayNP verify hosts?", a: "Every host goes through KYC verification. They must submit a valid Nagarikta (Citizenship) or registered Business License. Our team manually verifies each document." },
      { q: "What if I have a problem during my stay?", a: "Contact us immediately via phone (+977-01-5970000) or email (help@staynp.com). For emergencies, we have a 24/7 support line. We'll mediate between you and the host to resolve any issues." },
      { q: "Are reviews genuine?", a: "Only guests who have completed a stay can leave reviews. We have systems to detect and remove fake reviews." },
    ],
  },
  {
    id: "account",
    label: "Account & Profile",
    icon: HiUserGroup,
    faqs: [
      { q: "How do I create an account?", a: "Click 'Sign Up' and enter your name, phone number, and create a password. You can also sign up with your email. Phone verification via OTP keeps your account secure." },
      { q: "I forgot my password. What do I do?", a: "Click 'Forgot Password' on the login page. We'll send a reset link to your email. If you signed up with phone only, contact support for assistance." },
      { q: "Can I have both a guest and host account?", a: "Yes! One account works for both. You can enable hosting from your profile settings or during signup." },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("booking");

  const toggleFaq = (id: string) => setOpenFaq(openFaq === id ? null : id);

  const currentCategory = FAQ_CATEGORIES.find((c) => c.id === activeCategory)!;

  const filteredFaqs = searchQuery
    ? FAQ_CATEGORIES.flatMap((cat) =>
        cat.faqs
          .filter((f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((f) => ({ ...f, category: cat.label }))
      )
    : null;

  return (
    <div className="min-h-screen bg-nepal-sand">
      <section className="bg-mountain-gradient py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-4 font-heading text-3xl font-bold md:text-4xl">How can we help?</h1>
          <p className="mb-8 text-white/80">Find answers to common questions about StayNP</p>
          <div className="relative mx-auto max-w-xl">
            <HiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-0 py-4 pl-12 pr-4 text-nepal-slate shadow-lg focus:outline-none focus:ring-2 focus:ring-nepal-gold"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {searchQuery && filteredFaqs ? (
          <div>
            <h2 className="mb-6 text-lg font-semibold text-nepal-slate">
              {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
            </h2>
            {filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((faq, i) => (
                  <div key={i} className="card overflow-hidden">
                    <button onClick={() => toggleFaq(`search-${i}`)} className="flex w-full items-center justify-between p-4 text-left">
                      <div>
                        <span className="mb-1 block text-[10px] font-semibold uppercase text-nepal-crimson">{faq.category}</span>
                        <span className="text-sm font-semibold text-nepal-slate">{faq.q}</span>
                      </div>
                      {openFaq === `search-${i}` ? <HiChevronUp className="h-5 w-5 shrink-0 text-gray-400" /> : <HiChevronDown className="h-5 w-5 shrink-0 text-gray-400" />}
                    </button>
                    {openFaq === `search-${i}` && <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">{faq.a}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-white p-12 text-center">
                <p className="mb-2 text-2xl">🤔</p>
                <p className="text-sm text-gray-500">No results found. Try different keywords or contact us directly.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <nav className="sticky top-24 space-y-1">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${activeCategory === cat.id ? "bg-nepal-crimson text-white" : "text-gray-600 hover:bg-white hover:text-nepal-slate"}`}
                  >
                    <cat.icon className="h-4 w-4" />
                    {cat.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="lg:col-span-3">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-nepal-slate">
                <currentCategory.icon className="h-5 w-5 text-nepal-crimson" />
                {currentCategory.label}
              </h2>
              <div className="space-y-3">
                {currentCategory.faqs.map((faq, i) => {
                  const faqId = `${activeCategory}-${i}`;
                  return (
                    <div key={faqId} className="card overflow-hidden">
                      <button onClick={() => toggleFaq(faqId)} className="flex w-full items-center justify-between p-4 text-left">
                        <span className="text-sm font-semibold text-nepal-slate pr-4">{faq.q}</span>
                        {openFaq === faqId ? <HiChevronUp className="h-5 w-5 shrink-0 text-gray-400" /> : <HiChevronDown className="h-5 w-5 shrink-0 text-gray-400" />}
                      </button>
                      {openFaq === faqId && <div className="border-t border-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-600">{faq.a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <section className="mt-16">
          <h2 className="mb-8 text-center text-lg font-semibold text-nepal-slate">Still need help? Contact us</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: HiPhone, title: "Call Us", desc: "+977-01-5970000", sub: "Sun-Fri, 9am-6pm NPT", action: "tel:+977015970000" },
              { icon: HiMail, title: "Email Us", desc: "help@staynp.com", sub: "We reply within 24 hours", action: "mailto:help@staynp.com" },
              { icon: HiChat, title: "Live Chat", desc: "Chat with our team", sub: "Available during business hours", action: "#" },
            ].map((c) => (
              <a key={c.title} href={c.action} className="card flex flex-col items-center p-6 text-center transition-all hover:-translate-y-1">
                <div className="mb-3 rounded-xl bg-nepal-crimson/10 p-3"><c.icon className="h-6 w-6 text-nepal-crimson" /></div>
                <h3 className="mb-1 text-sm font-semibold text-nepal-slate">{c.title}</h3>
                <p className="text-sm font-medium text-nepal-crimson">{c.desc}</p>
                <p className="mt-1 text-xs text-gray-400">{c.sub}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
