# México Lindo Y Que Rico — Full Site Revamp

## Brand
- Business: México Lindo Y Que Rico — taco catering in greater LA area, 20+ years
- Tagline: "Aquí la panza es primero."
- Bilingual: English + Spanish
- Phone: (562) 235-9361, (562) 746-3998

## Color Palette — "CDMX Cantina"
- Deep navy/black: `#1B1F2A` (backgrounds, moody cantina vibes)
- Warm amber/gold: `#D4A24E` (accents, CTAs, highlights)
- Rich terracotta: `#B85C3A` (secondary accent, warmth)
- Cream/off-white: `#F5F0E8` (text, light backgrounds)
- Deep teal: `#2A6B5E` (accent, azulejo tile vibes)

## Typography
- Headings: Supermercado One (keep from original)
- Body: Something more refined (suggest Inter, DM Sans, or similar)

## Design Vibe
- CDMX / Distrito Federal authentic Mexican
- Moody, warm, slightly upscale but inviting
- Roma Norte cantina aesthetic
- Colonial architecture, candlelit, Art Deco touches
- Mobile-first, responsive

## Pages
1. **Home** — Hero with background image, tagline, CTA to book
2. **Services/Pricing** — Service tiers with pricing tables
3. **Booking** — Full booking flow with date picker, service selection, meat choices, extras
4. **Gallery** — Photos and videos
5. **Contact** — Phone numbers, location info

## Pricing Structure

### 2-Hour Service
| People | Price |
|--------|-------|
| 25     | $395  |
| 50     | $495  |
| 75     | $595  |

### 3-Hour Service
| People | Price |
|--------|-------|
| 100    | $695  |
| 125    | $795  |
| 150    | $895  |
| 175    | $995  |
| 200    | $1,095|

- $40 for extra hour
- Arrive 1 hour early (doesn't count toward service hours)

## Services Included
- Tortillas (Corn)
- Red Hot Sauce, Green Hot Sauce
- Radishes, Onion & Cilantro, Lemons
- Plates & Napkins
- Forks with Rice and Beans
- Cups and Ice with Aguas Frescas

## Meats (choose 4)
- Asada, Pastor, Chicken, Chorizo, Fish Fillet, Shrimp Fajitas, Veggies, Alambres

## Extras (each feeds 40-50 people)
| Item | Price |
|------|-------|
| Rice | $40 |
| Beans | $40 |
| Quesadillas (Flour Tortilla) | $30 |
| Jalapeños & Grilled Onions | $20 |
| Fresh Guacamole & Chips | $40 |
| Fresh Salsa & Chips | $40 |
| Agua Fresca (Horchata, Jamaica, Lemon, Pineapple, Tamarindo, Melon) | $25 |
| Salad | $30 |
| Cheeseburgers | $4 each |
| Hot Dogs | $2 each |

## Booking System
- Date picker with availability
- Daily event capacity: 3 (configurable in DB/env)
- Minimum notice period: 3 days (configurable)
- Select service tier (2hr/3hr) + guest count
- Select 4 meats
- Optional extras with quantities
- Auto-calculate total price
- Supabase for database

## Payments
- Stripe Checkout (redirect to Stripe-hosted page)
- Calculate total from service + extras

## Notifications (on new booking)
- Email to: constantinoalan98@gmail.com
- SMS to: 562-688-7250
- Twilio for SMS

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- Supabase (database)
- Stripe (payments)
- Twilio (SMS notifications)
- Vercel (hosting)

## Existing Assets
- Images: spread.jpg, tacos.jpg (from current site at https://que.rico.catering)
- Videos: IMG_1391.mp4, IMG_1499.mp4
- Language icon SVG

## Current Site
- Source: https://que.rico.catering
- Has Spanish version (es.index.html)
