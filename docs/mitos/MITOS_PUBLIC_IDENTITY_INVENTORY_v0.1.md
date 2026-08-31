# Mitos Public Identity Inventory v0.1

**Status:** R1 COMPLETE / REBRAND TARGETS IDENTIFIED  
**Date:** 2026-08-19  
**Branch:** `feature/mitos-public-experience-v1`

## Purpose

Identify public-facing identity, copy, assets and defaults that must be classified before replacing the generic/Gallo-demo public shell with Mitos.

Classification:

```text
KEEP FUNCTION
REBRAND PRESENTATION
REMOVE GENERIC CLAIM
VERIFY BEFORE CLAIM
```

## 1. Router / public journey

`frontend/src/App.tsx` already keeps the main public and transactional journey under one React Router application:

```text
/                  Home
/search            Search
/checkout          Checkout
/checkout-session  Checkout session
/bookings          Booking history
/booking           Booking detail
```

Decision:

```text
KEEP FUNCTION
```

No separate Mitos marketing application is required to obtain a coherent same-site journey.

## 2. Current Home

`frontend/src/pages/Home.tsx` currently contains:

- generic cover video (`cover.mp4`);
- localized generic rental title/cover copy;
- existing real `SearchForm`;
- generic Why/service sections;
- supplier carousel;
- destinations/location content;
- Mini/Midi/Maxi car-size presentation;
- hardcoded demo hourly/day prices for Mini/Midi/Maxi;
- Gallo Autos image used as Leaflet map marker;
- FAQ/footer composition.

Classification:

```text
SearchForm                 KEEP FUNCTION
location/destination data  KEEP FUNCTION / redesign presentation
map capability             KEEP FUNCTION
supplier functionality     REVIEW — likely hide for Mitos direct brand
cover video                REBRAND PRESENTATION
Why/services copy          REMOVE / replace with verified Mitos copy
Mini/Midi/Maxi demo prices REMOVE FROM HOME AUTHORITY
Gallo map icon             REBRAND
Home structure             REPLACE with Mitos landing structure
```

## 3. Generic Home claims

`frontend/src/lang/home.ts` contains claims in multiple languages including:

```text
24-hour roadside assistance
no hidden charges
premium/distinctive fleet
unlimited mileage
flexible pickup/drop-off
excellent / unbeatable prices
instant booking
24/7 customer support
international-airport availability language
```

Classification:

```text
REMOVE GENERIC CLAIM
or
VERIFY BEFORE CLAIM
```

Do not transfer these to Mitos simply because the code already renders them.

Mitos public evidence may provide safer replacement language such as:

```text
MITOS RENT A CAR
Alquila fácil, viaja seguro.
travel / freedom / mobility
WhatsApp-led contact
publicly advertised Toyota Yaris / Toyota Raize references
```

Current promotional price evidence remains historical/campaign context, not permanent current pricing authority.

## 4. Environment identity defaults

`frontend/src/config/env.config.ts` currently defaults to:

```text
WEBSITE_NAME = BookCars
DEFAULT_LANGUAGE = en
BASE_CURRENCY = USD
PAYMENT_GATEWAY = stripe unless configured
```

It supports `PEN` among currencies and multiple payment gateways.

Classification:

```text
WEBSITE_NAME default       REBRAND
DEFAULT_LANGUAGE           REVIEW for Mitos Peru
BASE_CURRENCY              VERIFY commercial/runtime requirement
payment gateway            KEEP CONFIGURABLE / do not rebrand as policy
```

Brand name must not remain dependent on a generic `BookCars` fallback for the Mitos deployment.

## 5. Header

`frontend/src/components/Header.tsx` renders:

```text
env.WEBSITE_NAME as logo text
side menu
bookings
locations
about
privacy / ToS / FAQ / contact
language selector
currency selector
sign-in / sign-up
notifications/account state
```

Classification:

```text
navigation/auth behaviors  KEEP FUNCTION
logo text                   REBRAND PRESENTATION
header visual language     REBRAND PRESENTATION
currency/language behavior KEEP FUNCTION / UX review
public nav hierarchy       REDESIGN for Mitos
```

The Mitos Home should feel marketing-led while signed-in transactional functions remain reachable.

## 6. Footer

`frontend/src/components/Footer.tsx` currently contains:

- `env.WEBSITE_NAME` text brand;
- corporate/rental/support links;
- contact email from environment;
- generic Facebook/X/LinkedIn/Instagram destinations;
- newsletter;
- payment-gateway logo;
- copyright strings.

Classification:

```text
brand                       REBRAND
Instagram                   REPLACE with @mitosrentacar destination
Facebook/X/LinkedIn         REMOVE or verify
contact email               VERIFY
newsletter                  REVIEW product need
payment presentation        KEEP only when runtime/payment truth requires it
legal links                 KEEP FUNCTION / copy review
```

Known current Mitos public contact:

```text
WhatsApp / phone: +51 941 368 086
Instagram: @mitosrentacar
publicized domain: www.mitosrentacar.com
```

## 7. Mitos public foundation to introduce

Recommended single public brand source:

```text
name                 MITOS RENT A CAR
tagline              Alquila fácil, viaja seguro.
phoneWhatsapp        +51 941 368 086
instagramHandle      @mitosrentacar
publicizedDomain     www.mitosrentacar.com
market               Lima / Perú
```

Visual evidence:

```text
white / deep blue
bright blue backgrounds
black support
stylized vehicle logo
vehicle-led imagery
road / city / travel imagery
```

Exact vector logo and exact design tokens remain to be sourced/normalized.

## 8. Rebrand priorities

```text
P0  Home + logo + public brand source
P0  preserve SearchForm behavior
P0  remove demo hardcoded Home prices
P0  remove unsupported generic claims

P1  Mitos navigation/footer
P1  featured vehicle/promo presentation
P1  consistent Search/results funnel branding

P2  checkout/booking continuity polish
P2  Agent launcher seam
```

## 9. R1 gate

```text
Public route continuity identified   ✅
Generic Home identity identified     ✅
Unsafe generic claims identified     ✅
Demo pricing identified              ✅
Header/Footer rebrand targets         ✅
Mitos known public identity mapped    ✅

R1 IDENTITY INVENTORY                 ✅ COMPLETE
R2 BRAND FOUNDATION                   ← NEXT
INTERACTION / SURFACE DESIGN          ← PARALLEL NEXT
BUILD                                 ⛔ until design slice frozen
```
