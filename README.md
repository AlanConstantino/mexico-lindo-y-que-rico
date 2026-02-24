# México Lindo Y Que Rico — Taco Catering Website

A modern, bilingual (English/Spanish) website for **México Lindo Y Que Rico**, a taco catering business serving the greater Los Angeles area for 20+ years.

## 🌮 Live Site

- **Current (old):** https://que.rico.catering
- **New (development):** `localhost:3000`

## 🏗️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** (App Router) | Framework — routing, SSR, API routes |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling — utility-first CSS |
| **next-intl** | Internationalization (English + Spanish) |
| **Supabase** | Database — bookings, settings |
| **Stripe** | Payment processing (Checkout) |
| **Resend** | Email notifications |
| **Recharts** | Admin dashboard charts |

## 🎨 Design

**Theme:** CDMX Cantina — authentic Mexico City vibes. Moody, warm, inviting.

**Color Palette:**
- Deep charcoal: `#2D2926` (backgrounds — cantera stone)
- Marigold: `#E8A935` (CTAs, accents — warm lighting)
- Terracotta: `#C45A3C` (secondary accent — colonial facades)
- Sage: `#7A8B6F` (subtle accent — herbs, nopales)
- Warm white: `#FAF5EF` (text, light elements — limestone walls)

**Fonts:**
- Headings: **Supermercado One** (Google Fonts)
- Body: **DM Sans** (next/font optimized)

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/              # Locale-prefixed pages (en/es)
│   │   ├── page.tsx           # Home — single-page scrolling site
│   │   ├── booking/
│   │   │   ├── page.tsx       # Multi-step booking form
│   │   │   ├── success/       # Post-payment success page
│   │   │   └── cancel/        # Payment cancelled page
│   │   ├── admin/
│   │   │   ├── page.tsx       # Admin dashboard (password protected)
│   │   │   └── settings/      # Admin settings page
│   │   └── layout.tsx         # Root layout with i18n provider
│   └── api/
│       ├── availability/      # GET — check date availability
│       ├── checkout/          # POST — create Stripe session + save booking
│       ├── webhook/           # POST — Stripe webhook (payment confirmation)
│       └── admin/
│           ├── auth/          # POST — admin login
│           ├── bookings/      # GET/PATCH — manage bookings
│           └── settings/      # GET/PUT — manage settings
├── components/
│   ├── Navbar.tsx             # Main site nav (sticky, scroll-aware, i18n)
│   ├── Hero.tsx               # Full-screen hero with parallax zoom
│   ├── About.tsx              # Business story + stats
│   ├── Menu.tsx               # Meat selection cards (8 options)
│   ├── Packages.tsx           # Pricing tiers (2hr/3hr service)
│   ├── Extras.tsx             # Add-on items with pricing
│   ├── Gallery.tsx            # Photo gallery grid
│   ├── Contact.tsx            # Contact info + CTA
│   ├── Footer.tsx             # Site footer
│   ├── booking/
│   │   ├── BookingForm.tsx    # Main booking form controller
│   │   └── steps/             # Individual booking steps
│   │       ├── DateStep.tsx
│   │       ├── PackageStep.tsx
│   │       ├── MeatStep.tsx
│   │       ├── ExtrasStep.tsx
│   │       ├── CustomerStep.tsx
│   │       └── ReviewStep.tsx
│   └── admin/
│       ├── AdminNav.tsx       # Admin navigation (hamburger on mobile)
│       ├── UpcomingEvents.tsx
│       └── charts/            # Recharts visualizations
│           ├── RevenueChart.tsx
│           ├── BookingsChart.tsx
│           ├── PopularMeatsChart.tsx
│           └── GuestDistributionChart.tsx
├── hooks/
│   └── useScrollReveal.ts     # Intersection Observer scroll animations
├── i18n/
│   ├── routing.ts             # Locale definitions (en, es)
│   ├── request.ts             # Server-side message loading
│   └── navigation.ts          # Locale-aware Link, useRouter
├── lib/
│   ├── supabase.ts            # Browser + server Supabase clients
│   ├── pricing.ts             # All pricing logic + types
│   └── notifications.ts       # Email notifications via Resend
└── middleware.ts               # Locale detection + URL prefixing
messages/
├── en.json                     # English translations
└── es.json                     # Spanish translations
supabase/
└── migrations/
    └── 001_initial.sql         # Database schema
```

## 💰 Pricing Structure

### 2-Hour Service
| Guests | Price |
|--------|-------|
| 25 | $395 |
| 50 | $495 |
| 75 | $595 |

### 3-Hour Service
| Guests | Price |
|--------|-------|
| 100 | $695 |
| 125 | $795 |
| 150 | $895 |
| 175 | $995 |
| 200 | $1,095 |

- **$40** for an extra hour
- Arrive 1 hour early for setup (doesn't count toward service time)

### Meats (choose 4)
Asada, Pastor, Chicken, Chorizo, Fish Fillet, Shrimp Fajitas, Veggies, Alambres

### Extras (each serves 40-50 people)
Rice ($40), Beans ($40), Quesadillas ($30), Jalapeños & Grilled Onions ($20), Fresh Guacamole & Chips ($40), Fresh Salsa & Chips ($40), Agua Fresca ($25), Salad ($30), Cheeseburgers ($4 each), Hot Dogs ($2 each)

## 🔧 Environment Variables

Create `.env.local` in the project root:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

# Resend (email notifications)
RESEND_API_KEY=re_...

# Admin
ADMIN_PASSWORD=queRico2024!
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the database migration
# Copy contents of supabase/migrations/001_initial.sql
# Paste into Supabase Dashboard → SQL Editor → Run

# Start dev server
npm run dev

# Start Stripe webhook forwarding (for local testing)
stripe login
stripe listen --forward-to localhost:3000/api/webhook
```

Visit **http://localhost:3000**

## 📱 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/en` or `/es` based on browser language |
| `/en` | English home page (single-page scrolling) |
| `/es` | Spanish home page |
| `/en/booking` | Multi-step booking form |
| `/en/booking/success` | Payment success page |
| `/en/booking/cancel` | Payment cancelled page |
| `/en/admin` | Admin dashboard (password: `queRico2024!`) |
| `/en/admin/settings` | Admin settings |

## 🔒 Admin Panel

- **URL:** `/en/admin` or `/es/admin`
- **Password:** Set via `ADMIN_PASSWORD` env var (default: `queRico2024!`)
- **Features:**
  - Dashboard with stats cards (revenue, bookings, upcoming events)
  - Charts: revenue over time, booking trends, popular meats, guest distribution
  - Bookings table with search, status filter, date range filter
  - Expand bookings to see full details
  - Confirm/cancel bookings
  - CSV export
  - Settings: max events/day, min notice days, notification email/phone

## 📧 Notifications

When a booking is confirmed (paid via Stripe), an email is sent to the owner via Resend with:
- Customer name, email, phone
- Event date, package type, guest count
- Meats selected, extras ordered
- Total amount

**Sender:** `onboarding@resend.dev` (can be upgraded to custom domain)
**Recipient:** `constantinoalan98@gmail.com` (configurable in admin settings)

## 🌐 Internationalization

- **Supported languages:** English (`en`), Spanish (`es`)
- **Adding a new language:** 
  1. Add locale code to `src/i18n/routing.ts` → `locales` array
  2. Create `messages/{locale}.json` with all translation keys
  3. Done — routing and middleware handle the rest
- **Language switcher:** In the navbar (EN/ES toggle)

## 📋 Booking System

**Flow:** Date → Package → Meats → Extras → Customer Info → Review & Pay

**Availability:**
- Max events per day: 3 (configurable in admin)
- Minimum notice: 3 days (configurable in admin)
- Past dates blocked
- Full dates blocked

**Payment:** Stripe Checkout (redirect to Stripe-hosted page)

**Database:** Supabase
- `bookings` table: all booking data + Stripe session ID + payment status
- `settings` table: configurable business rules

---

## 🗺️ Roadmap — What's Left

### To Go Live
- [ ] Deploy to Vercel
- [ ] Connect custom domain (`que.rico.catering`)
- [ ] Set up production Stripe webhook in Stripe dashboard
- [ ] Switch Stripe from test to live keys
- [ ] Verify email sender domain in Resend

### Nice-to-Haves
- [ ] Twilio SMS notifications to owner
- [x] Customer confirmation email (they get one too)
- [ ] Google Calendar integration
- [ ] Reviews/testimonials section
- [ ] SEO (Open Graph tags, sitemap.xml)
- [ ] Analytics (Google Analytics or Plausible)

## 📞 Business Info

- **Business:** México Lindo Y Que Rico
- **Service:** Taco catering for events (25-200+ guests)
- **Area:** Greater Los Angeles
- **Experience:** 20+ years
- **Phone:** (562) 235-9361 / (562) 746-3998
- **Tagline:** "Aquí la panza es primero."
- **Payments accepted:** Cash, Zelle, CashApp, Venmo + now Stripe (online)

## 📂 Original Source

The original (old) website source code is at:
`/Volumes/Sandisk_2TB/code/mexico-lindo-y-que-rico`
