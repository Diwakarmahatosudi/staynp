"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { HiMenu, HiX, HiUserCircle, HiGlobe, HiTranslate } from "react-icons/hi";
import { MdOutlineExplore } from "react-icons/md";
import toast from "react-hot-toast";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [lang, setLang] = useState("English");
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsLangOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const switchLang = (l: string) => {
    setLang(l);
    setIsLangOpen(false);
    toast.success(`Language switched to ${l}`);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-nepal-gold-light/30 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nepal-crimson">
              <span className="text-lg font-bold text-white">स्</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-nepal-slate">
                Stay<span className="text-nepal-crimson">NP</span>
              </span>
              <span className="hidden text-[10px] text-nepal-gold-dark sm:block">
                नेपालमा बस्नुहोस्
              </span>
            </div>
          </Link>

          <div className="hidden md:flex">
            <Link
              href="/properties"
              className="flex items-center gap-3 rounded-full border border-gray-200 px-6 py-2.5 shadow-sm transition-all hover:shadow-md"
            >
              <span className="text-sm font-medium">Anywhere in Nepal</span>
              <span className="h-6 w-px bg-gray-200" />
              <span className="text-sm text-gray-500">Any week</span>
              <span className="h-6 w-px bg-gray-200" />
              <span className="text-sm text-gray-400">Add guests</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nepal-crimson">
                <MdOutlineExplore className="h-4 w-4 text-white" />
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/host/new"
              className="hidden text-sm font-medium text-nepal-slate/70 transition-colors hover:text-nepal-crimson md:block"
            >
              Become a Host
            </Link>

            <div ref={langRef} className="relative hidden md:block">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="rounded-full p-2 transition-colors hover:bg-gray-100"
              >
                <HiGlobe className="h-5 w-5 text-nepal-slate/60" />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                  {["English", "नेपाली"].map((l) => (
                    <button
                      key={l}
                      onClick={() => switchLang(l)}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-nepal-sand ${lang === l ? "font-semibold text-nepal-crimson" : "text-nepal-slate/70"}`}
                    >
                      {l === "English" ? "🇬🇧 " : "🇳🇵 "}{l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 p-1.5 pl-3 transition-all hover:shadow-md"
              >
                <HiMenu className="h-4 w-4 text-nepal-slate/60" />
                <HiUserCircle className="h-8 w-8 text-nepal-slate/40" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                  <Link href="/auth/login" className="block px-4 py-2.5 text-sm font-semibold text-nepal-slate hover:bg-nepal-sand">
                    Log in
                  </Link>
                  <Link href="/auth/signup" className="block px-4 py-2.5 text-sm text-nepal-slate/70 hover:bg-nepal-sand">
                    Sign up
                  </Link>
                  <hr className="my-2 border-gray-100" />
                  <Link href="/host/new" className="block px-4 py-2.5 text-sm text-nepal-slate/70 hover:bg-nepal-sand">
                    Host your property
                  </Link>
                  <Link href="/host" className="block px-4 py-2.5 text-sm text-nepal-slate/70 hover:bg-nepal-sand">
                    Host dashboard
                  </Link>
                  <Link href="/properties" className="block px-4 py-2.5 text-sm text-nepal-slate/70 hover:bg-nepal-sand">
                    Explore stays
                  </Link>
                  <Link href="/about" className="block px-4 py-2.5 text-sm text-nepal-slate/70 hover:bg-nepal-sand">
                    About StayNP
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
            >
              {isMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <Link href="/properties" className="flex w-full items-center gap-3 rounded-full border border-gray-200 px-4 py-2.5 shadow-sm">
            <MdOutlineExplore className="h-5 w-5 text-nepal-crimson" />
            <div className="flex-1">
              <p className="text-sm font-medium">Where in Nepal?</p>
              <p className="text-xs text-gray-400">Any week · Add guests</p>
            </div>
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {[
              { href: "/properties", label: "Explore Stays" },
              { href: "/auth/login", label: "Log in" },
              { href: "/auth/signup", label: "Sign up" },
              { href: "/host", label: "Host Dashboard" },
              { href: "/host/new", label: "Become a Host", accent: true },
              { href: "/about", label: "About StayNP" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-nepal-sand ${item.accent ? "text-nepal-crimson" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
