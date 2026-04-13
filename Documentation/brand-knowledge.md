# ERA 99 / Brand Knowledge

Last updated: 2026-04-13

## Brand Identity

- Brand name used across the storefront: **ERA 99**.
- Alternate naming seen in repository/context:
  - \*\*\*\* (from repo name and Arabic references).
  - **ERA99** (README footer note).
- Arabic references used in branding:
  - \*\*\*\* (, axis/pole/fixed center).
  - \*\*\*\* (Arabic rendering of ERA 99).
- Core symbolic concept: **The Axis / Fixed Point**.
- Core recurring line: **"This is the era."**
- Positioning language repeatedly used:
  - Not trend-driven.
  - Not algorithm-chasing.
  - Focused on confidence, identity, and consistency.

## Origin Story (As Written in Product Copy)

- ERA 99 is described as born from a father-son conversation.
- Founder background narrative:
  - Father spent 15 years in Egyptian factories as an External Operations Manager.
  - Deep production/supplier/fabric knowledge was redirected into building their own brand.
- Brand place of origin: **Alexandria, Egypt**.
- Claimed product development cycle for early shirt:
  - 6 months of sampling, washing, and wear testing.
- Story framing says the brand is a "position" rather than a casual launch.

## Meaning of "" in Brand Narrative

- is framed as:
- Spiritual axis in Sufi context.
- Orientation pole in physics context.
- Brand interpretation: Alexandria is the axis everything in the brand points back to.

## Product Direction

- Core category currently implemented: **heavyweight boxy-fit t-shirts**.
- Main specifications repeatedly present in product and story copy:
  - 220 GSM heavyweight cotton variants.
  - Boxy / oversized silhouettes.
  - Dropped shoulders or structured drape depending on SKU.
- Size grid used in code: **S, M, L, XL, XXL**.
- Price points found in static catalog seed:
  - 450 EGP (boxy tee variants).
  - 520 EGP (raw tee variant).
- Collections in default catalog config:
  - Drop 001
  - Drop 002

## Current Drop / Campaign Language

- "99" is a core code motif.
- Repeated lines include:
  - "99 — DROP 001"
  - "99 — THE FIRST DROP"
  - "99 IS LIVE"
  - "NINETY NINE"
- Metadata and copy include references like:
  - "ERA 99 99 — Alexandria streetwear"
  - "Heavyweight boxy fit t-shirts from Alexandria, Egypt."

## Visual / Creative Direction (From UI Copy and Structure)

- Color/world tone in UI and copy:
  - Black/ink backgrounds.
  - Ash/off-white text.
  - Dark red accent used for urgency and highlights.
- Hero/campaign communication style:
  - Minimal, declarative, statement-heavy copy.
  - High contrast and strong typographic identity.
- Visual assets currently shown via image set in public images folder.

## Audience & Brand Voice

- Intended audience as described in copy:
  - People "who already know who they are".
  - People who value fit/fabric/construction over loud graphics.
  - Customers aligned with self-possession, not external validation.
- Voice characteristics:
  - Assertive.
  - Editorial/manifesto-like.
  - Locally rooted (Alexandria) but globally legible.

## Commerce & Customer Experience

- Currency: **EGP**.
- Checkout supports:
  - Cash on Delivery (COD).
  - Online card payment via Paymob (Visa/Mastercard).
- Delivery logic currently coded:
  - Alexandria: free delivery and faster window (1-2 days shown in checkout).
  - Other governorates: paid standard delivery (2-5 business days in checkout copy).
- Base delivery fee in checkout file: 75 EGP.
- Admin defaults also include governorate fee presets:
  - Alexandria: 0
  - Cairo: 70
  - Giza: 70
  - Other: 90
  - (This differs from checkout hardcoded base fee and should be treated as implementation divergence.)

## Channels & Contact Surface

- Instagram handle displayed in landing page: **@ERA99CO**.
- Email sender identity in auth emails:
  - From: "ERA 99 <noreply@era99.co>"
- Admin WhatsApp notifications exist for new orders via Twilio integration.
- WhatsApp order alert format includes order code prefix style:
  - #ERA-00001 format (derived from order ID padding).

## Storefront / Navigation Structure

- Public top-level user journeys observed:
  - Home
  - Shop
  - Story
  - Product details
  - Cart drawer
  - Checkout
  - Order confirmation
  - Auth and Account pages
- Footer/landing includes placeholders for:
  - Contact
  - Size Guide
  - Email join form

## Operations & Admin Capabilities (Brand-Relevant)

- Admin-facing capabilities present in project structure:
  - Orders
  - Products
  - Customers
  - Analytics
  - Activity feed
  - Security/2FA setup
  - Settings (announcement strip, maintenance mode, notifications, delivery fees)
- Announcement strip text can be centrally configured and is brand-heavy.
- Maintenance mode includes branded fallback screen.

## Analytics / Tracking Signals

- Event hooks include GA-style and Meta Pixel tracking for:
  - begin_checkout
  - add_shipping_info
  - add_payment_info
  - search
  - cart and checkout behavior
- Indicates performance-marketing readiness for drops/campaign monitoring.

## Brand Constants You Are Reusing Consistently

- ERA 99 wordmark.
- 99 code.
- Axis/fixed-point philosophy.
- Alexandria as origin and identity anchor.
- Heavyweight boxy t-shirt focus.
- Monochrome + red-accent aesthetic language.

## Inconsistencies / Gaps Worth Noting

- README is still mostly Next.js boilerplate and does not document brand clearly.
- Delivery fee values differ between checkout implementation and admin default settings.
- Some social/contact links in landing/footer are placeholders.
- There are two landing implementations in the codebase, suggesting iteration or legacy path.
- The exact legal brand name (registered entity) is not present in checked files.

## Practical One-Paragraph Brand Summary

ERA 99 () is an Alexandria-rooted streetwear label built around the idea of the axis: a fixed point in a constantly moving culture. The brand identity is anchored in heavyweight, boxy essentials (especially 220 GSM tees), the recurring code "99," and a confident anti-trend voice focused on fabric, fit, and conviction over noise. Its storefront and storytelling consistently position the brand as locally grounded, family-built, and production-aware, while commerce operations already support Egyptian delivery logistics, COD/online payment, and marketing telemetry for scalable drop-based growth.
