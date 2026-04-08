# StayNP — Discover Nepal, Stay Local 🇳🇵

**Nepal's own Airbnb.** A full-stack accommodation booking platform built for Nepal — with eSewa/Khalti payments, KYC-verified hosts, SMS confirmations, and authentic Nepali hospitality.

> नेपालमा बस्नुहोस् — *Stay in Nepal*

---

## Screenshots

### Homepage
The hero section with search, region explorer with real Nepal photos, featured stays, and property type browser.

![Homepage](screenshots/homepage.png)

### Property Listings
Browse all stays with search bar, filters (type, price, amenities), sorting, and property cards with image carousels.

![Properties](screenshots/properties.png)

### Property Detail
Full photo gallery, host info, amenities, location, reviews, and booking widget with date/guest selection.

![Property Detail](screenshots/property-detail.png)

### Login
Nepal phone OTP verification (validates 97/98 prefix, detects NTC/Ncell) and email login with verification code.

![Login](screenshots/login.png)

### Signup
Multi-step registration with phone verification, password strength meter, and terms acceptance.

![Signup](screenshots/signup.png)

### Booking & Payment
Complete booking flow with contact validation, payment method selection (eSewa, Khalti, Card), price breakdown, and confirmation.

![Booking](screenshots/booking.png)

### Host Dashboard
Manage listings, accept/reject bookings, track earnings, and upload KYC documents for verification.

![Host Dashboard](screenshots/host-dashboard.png)

### Create New Listing
5-step property creation with photo upload (gallery + camera), drag & drop, amenity selection, and pricing.

![Create Listing](screenshots/host-new.png)

---

## What is StayNP?

StayNP connects travelers with verified local stays across all 75 districts of Nepal. From heritage homes in Bhaktapur to mountain lodges near Everest, we make it easy to discover authentic Nepali accommodations.

**Why StayNP over Airbnb?**
- Pay with **eSewa & Khalti** — no international cards needed
- **KYC-verified hosts** with Nagarikta/Business License verification
- **SMS booking confirmations** — works even without internet
- Prices in **NPR (Nepali Rupees)** with transparent 5% service fee
- Hosts keep **95%** of every booking
- Nepal phone number login with **OTP verification**

---

## Features

### For Guests
- **Search & Filter** — Browse stays by region, district, property type, price, and amenities
- **Real Photos** — Image carousel with full-screen gallery modal
- **Instant Booking** — Select dates, guests, and pay securely
- **Multiple Payment Methods** — eSewa, Khalti, Credit/Debit Card, Bank Transfer
- **Phone Login** — Nepal mobile number (NTC/Ncell) with OTP verification
- **Email Login** — With email verification code
- **Wishlist** — Save favorite properties
- **Reviews** — Read reviews from verified guests

### For Hosts
- **Easy Listing** — 5-step property creation with photo upload (gallery + camera)
- **Host Dashboard** — Manage listings, bookings, earnings
- **Accept/Reject Bookings** — Full booking management
- **KYC Verification** — Upload Nagarikta or Business License for Verified Local badge
- **Earnings Tracker** — See total and monthly earnings
- **Listing Controls** — Activate, deactivate, edit, or delete listings

### Security & Validation
- **Nepal phone validation** — Only valid 97/98 prefix, 10-digit numbers accepted
- **Carrier detection** — Automatically detects NTC, Ncell
- **Password strength meter** — Real-time scoring with suggestions
- **Email validation** — Blocks disposable email domains
- **Input sanitization** — XSS prevention on all user inputs
- **Rate limiting** — Prevents brute-force OTP/login attempts
- **Image validation** — File type (JPG/PNG/WebP) and size (10MB) checks

### All Pages
| Page | Description |
|------|-------------|
| `/` | Homepage with hero, region explorer, featured stays, property types |
| `/properties` | Browse all stays with search, filters, and sorting |
| `/properties/[id]` | Property detail with gallery, reviews, booking widget |
| `/auth/login` | Phone OTP + Email verification login |
| `/auth/signup` | Multi-step signup with phone verification & password strength |
| `/booking/[id]` | Booking flow with payment selection and confirmation |
| `/host` | Host dashboard with stats, listings, bookings management |
| `/host/new` | 5-step property listing creation |
| `/about` | About StayNP with mission, how it works, trust & safety |
| `/help` | Help center with searchable FAQ (25+ questions, 6 categories) |
| `/hosting-guide` | Complete hosting guide with earnings estimates |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS with custom Nepali theme |
| **UI** | React 19, react-icons, react-hot-toast |
| **Backend** | Supabase (Auth, Database, Storage) |
| **Payments** | eSewa API, Khalti API |
| **SMS** | AakashSMS API |
| **Fonts** | Inter, Playfair Display |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/Diwakarmahatosudi/staynp.git
cd staynp

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase, payment, and SMS credentials

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
ESEWA_MERCHANT_CODE=your_esewa_merchant_code
ESEWA_SECRET_KEY=your_esewa_secret
KHALTI_SECRET_KEY=your_khalti_secret
AAKASH_SMS_TOKEN=your_aakash_sms_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# The schema is in supabase/schema.sql
# It creates tables for profiles, properties, bookings, reviews
# with Row Level Security policies and booking conflict triggers
```

---

## Project Structure

```
staynp/
├── app/                         # Next.js App Router pages
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx               # Root layout with Navbar, Footer, Toaster
│   ├── globals.css              # Tailwind + custom Nepali theme
│   ├── about/                   # About page
│   ├── help/                    # Help center with FAQ
│   ├── hosting-guide/           # Hosting guide
│   ├── privacy/                 # Privacy policy
│   ├── terms/                   # Terms of service
│   ├── auth/                    # Login, Signup, OAuth callback
│   ├── properties/              # Property listing & detail
│   ├── booking/                 # Booking & payment flow
│   ├── host/                    # Host dashboard & new listing
│   └── api/                     # API routes (booking, payment, SMS)
├── components/                  # Reusable React components
├── lib/                         # Utilities (validation, payments, SMS)
├── types/                       # TypeScript interfaces & constants
├── supabase/                    # Database schema
└── screenshots/                 # Website screenshots
```

---

## Design Theme

Custom Tailwind color palette inspired by Nepal:

| Color | Hex | Usage |
|-------|-----|-------|
| Nepal Crimson | `#C41E3A` | Primary buttons, accents, logo |
| Nepal Gold | `#D4A574` | Decorative elements, badges |
| Nepal Forest | `#2D6A4F` | Success states, verified badges |
| Nepal Mountain | `#1E3A5F` | Dark backgrounds, gradients |
| Nepal Sand | `#FAF7F2` | Page backgrounds |

---

## Author

**Diwakar Mahato Sudi**

---

<p align="center">
  Made with ❤️ in Nepal<br/>
  <strong>नेपालमा बनाइएको</strong>
</p>
