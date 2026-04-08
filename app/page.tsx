import Image from "next/image";
import Link from "next/link";
import { HiStar, HiShieldCheck, HiCurrencyDollar, HiLocationMarker, HiUserGroup, HiHeart } from "react-icons/hi";
import { MdVerified, MdTempleHindu } from "react-icons/md";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import { NEPAL_REGIONS } from "@/types";

export default function HomePage() {
  const featuredProperties = MOCK_PROPERTIES.slice(0, 4);

  return (
    <div className="nepal-pattern-overlay">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-mountain-gradient">
        <div className="absolute inset-0 bg-black/20" />

        {/* Decorative mountains silhouette (CSS-based) */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 200"
            className="w-full text-nepal-sand"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,160 L60,150 C120,140,240,120,360,110 C480,100,600,100,720,115 C840,130,960,160,1080,155 C1200,150,1320,110,1380,90 L1440,70 L1440,200 L0,200 Z"
            />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-20 sm:px-6 md:pb-40 md:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="text-sm text-white/90">🇳🇵</span>
              <span className="text-sm font-medium text-white/90">
                नमस्ते! Welcome to Nepal
              </span>
            </div>

            <h1 className="mb-6 font-heading text-4xl font-bold text-white md:text-6xl lg:text-7xl">
              Discover Nepal,
              <br />
              <span className="text-nepal-gold-light">Stay Local</span>
            </h1>

            <p className="mb-10 text-lg text-white/80 md:text-xl">
              From ancient temples in Kathmandu to mountain lodges near Everest
              — find your perfect stay with authentic Nepali hospitality.
            </p>

            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="-mt-6 relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-nepal md:grid-cols-4 md:gap-6 md:p-6">
          {[
            { number: "2,500+", label: "Verified Stays", icon: HiShieldCheck },
            { number: "75", label: "Districts Covered", icon: HiLocationMarker },
            { number: "50,000+", label: "Happy Guests", icon: HiUserGroup },
            { number: "4.8", label: "Average Rating", icon: HiStar },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-1 h-6 w-6 text-nepal-crimson" />
              <p className="text-xl font-bold text-nepal-slate md:text-2xl">
                {stat.number}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Explore by Region */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="section-title mb-3">
            Explore <span className="gradient-text">Nepal</span> by Region
          </h2>
          <p className="mx-auto max-w-2xl text-gray-500">
            From the plains of Terai to the peaks of the Himalayas, discover
            stays in every corner of Nepal
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NEPAL_REGIONS.map((region, index) => (
            <Link
              key={region.id}
              href={`/properties?region=${region.id}`}
              className={`group relative overflow-hidden rounded-2xl ${
                index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
            >
              <div
                className={`relative ${
                  index === 0 ? "aspect-[16/9] sm:aspect-square" : "aspect-[16/9]"
                } overflow-hidden`}
              >
                <Image
                  src={region.image_url}
                  alt={region.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                  <span className="text-xs font-medium text-white">
                    {region.property_count} stays
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="mb-1 text-xs font-medium text-nepal-gold-light">
                    {region.nepali_name}
                  </p>
                  <h3
                    className={`font-heading font-bold text-white ${
                      index === 0 ? "text-2xl md:text-3xl" : "text-lg"
                    }`}
                  >
                    {region.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    {region.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Stays */}
      <section className="bg-nepal-warm py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="section-title mb-2">Featured Stays</h2>
              <p className="text-gray-500">
                Hand-picked properties loved by travelers
              </p>
            </div>
            <Link
              href="/properties"
              className="hidden text-sm font-semibold text-nepal-crimson transition-colors hover:text-nepal-crimson-dark md:block"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/properties" className="btn-secondary">
              View All Stays
            </Link>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="section-title mb-3">Find Your Kind of Stay</h2>
          <p className="text-gray-500">
            Every type of accommodation for every kind of traveler
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              type: "Homestay",
              nepali: "गृहवास",
              desc: "Live with local families, share meals, and experience authentic Nepali life",
              emoji: "🏡",
              count: 420,
            },
            {
              type: "Lodge",
              nepali: "लज",
              desc: "Comfortable lodges on trekking routes and scenic locations",
              emoji: "🏔️",
              count: 380,
            },
            {
              type: "Guest House",
              nepali: "अतिथि गृह",
              desc: "Budget-friendly stays in the heart of towns and cities",
              emoji: "🏠",
              count: 650,
            },
            {
              type: "Boutique Hotel",
              nepali: "बुटिक होटल",
              desc: "Luxury meets local — curated design with Nepali soul",
              emoji: "✨",
              count: 120,
            },
            {
              type: "Heritage Stay",
              nepali: "विरासत बास",
              desc: "Sleep in history — restored palaces, temples, and old trading houses",
              emoji: "🛕",
              count: 85,
            },
            {
              type: "Mountain Retreat",
              nepali: "हिमाल विश्राम",
              desc: "Disconnect and recharge in the lap of the Himalayas",
              emoji: "⛰️",
              count: 95,
            },
          ].map((item) => (
            <Link
              key={item.type}
              href={`/properties?type=${item.type.toLowerCase().replace(/ /g, "-")}`}
              className="card group p-6 transition-all hover:-translate-y-1"
            >
              <div className="mb-3 text-3xl">{item.emoji}</div>
              <p className="mb-1 text-xs font-medium text-nepal-gold-dark">
                {item.nepali}
              </p>
              <h3 className="mb-2 text-lg font-semibold text-nepal-slate group-hover:text-nepal-crimson transition-colors">
                {item.type}
              </h3>
              <p className="mb-3 text-sm text-gray-500">{item.desc}</p>
              <p className="text-xs font-medium text-nepal-crimson">
                {item.count} properties →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why StayNP */}
      <section className="bg-nepal-warm py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="section-title mb-3">
              Why <span className="gradient-text">StayNP</span>?
            </h2>
            <p className="mx-auto max-w-2xl text-gray-500">
              Built for Nepal, by Nepal. Every feature designed for the unique
              needs of travelers and hosts in our beautiful country.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MdVerified,
                title: "Verified Local Hosts",
                description:
                  "Every host goes through KYC verification with Nagarikta or business license. Trust is our foundation.",
              },
              {
                icon: HiCurrencyDollar,
                title: "Pay with eSewa & Khalti",
                description:
                  "No international cards needed. Pay seamlessly with Nepal's most popular digital wallets.",
              },
              {
                icon: HiLocationMarker,
                title: "Pin-Drop Locations",
                description:
                  "No confusing addresses. Hosts drop a pin on the map so you know exactly where you're going.",
              },
              {
                icon: MdTempleHindu,
                title: "Cultural Experiences",
                description:
                  "Not just a bed — get authentic cultural immersion with local cooking, festivals, and traditions.",
              },
              {
                icon: HiHeart,
                title: "Community First",
                description:
                  "95% of your payment goes directly to local hosts. Tourism that actually helps communities.",
              },
              {
                icon: HiShieldCheck,
                title: "SMS Confirmations",
                description:
                  "Get instant booking confirmations via SMS. Works everywhere, even without internet.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-nepal"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-nepal-crimson/10">
                  <feature.icon className="h-6 w-6 text-nepal-crimson" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-nepal-slate">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-mountain-gradient py-20">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-heading text-3xl font-bold text-white md:text-5xl">
            Share Your Home with the World
          </h2>
          <p className="mb-8 text-lg text-white/80">
            Join thousands of Nepali hosts earning income while sharing their
            culture. List your property in minutes.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/host/new" className="btn-gold text-base">
              Start Hosting →
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-white/80 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
            >
              Learn more about hosting
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
