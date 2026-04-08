import Link from "next/link";
import { NEPAL_REGIONS } from "@/types";

export default function Footer() {
  return (
    <footer className="border-t border-nepal-gold-light/30 bg-white">
      <div className="border-b border-nepal-gold-light/20 bg-nepal-warm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h3 className="mb-3 text-sm font-semibold text-nepal-slate">Explore Nepal</h3>
          <div className="flex flex-wrap gap-2">
            {NEPAL_REGIONS.map((region) => (
              <Link key={region.id} href={`/properties?region=${region.id}`} className="rounded-full border border-nepal-gold-light/50 bg-white px-3 py-1.5 text-xs text-nepal-slate/70 transition-all hover:border-nepal-crimson hover:text-nepal-crimson">
                {region.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-nepal-slate">About StayNP</h4>
            <ul className="space-y-3">
              <li><Link href="/about#our-story" className="nav-link">Our Story</Link></li>
              <li><Link href="/about#how-it-works" className="nav-link">How it Works</Link></li>
              <li><Link href="/about#trust-safety" className="nav-link">Trust & Safety</Link></li>
              <li><Link href="/about#cancellation" className="nav-link">Cancellation Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-nepal-slate">For Hosts</h4>
            <ul className="space-y-3">
              <li><Link href="/host/new" className="nav-link">List Your Property</Link></li>
              <li><Link href="/host" className="nav-link">Host Dashboard</Link></li>
              <li><Link href="/hosting-guide" className="nav-link">Hosting Guide</Link></li>
              <li><Link href="/hosting-guide#verified-badge" className="nav-link">Verified Local Badge</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-nepal-slate">For Guests</h4>
            <ul className="space-y-3">
              <li><Link href="/properties" className="nav-link">Browse Stays</Link></li>
              <li><Link href="/auth/signup" className="nav-link">Create Account</Link></li>
              <li><Link href="/auth/login" className="nav-link">Log In</Link></li>
              <li><Link href="/help" className="nav-link">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-nepal-slate">Payment Partners</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-16 items-center justify-center rounded-md bg-green-600 text-xs font-bold text-white">eSewa</div>
                <span className="text-xs text-gray-500">Digital Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-16 items-center justify-center rounded-md bg-purple-600 text-xs font-bold text-white">Khalti</div>
                <span className="text-xs text-gray-500">Digital Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-16 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">Card</div>
                <span className="text-xs text-gray-500">Visa / Mastercard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nepal-crimson">
              <span className="text-sm font-bold text-white">स्</span>
            </div>
            <span className="text-sm font-semibold text-nepal-slate">Stay<span className="text-nepal-crimson">NP</span></span>
          </div>
          <p className="text-center text-xs text-gray-400">© {new Date().getFullYear()} StayNP. Made with ❤️ in Nepal. नेपालमा बनाइएको।</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-nepal-crimson transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-nepal-crimson transition-colors">Terms</Link>
            <Link href="/help" className="hover:text-nepal-crimson transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
