# Mitos — I4/I5 Rental Rebrand + Live Fleet Build v0.1

**Status:** SOURCE HARDENED / RUNTIME RE-TEST REQUIRED  
**Date:** 2026-08-21  
**Branch:** `feature/mitos-public-experience-v1`

## Scope

This slice closes two product seams without changing rental transaction authority:

1. keep the Mitos identity across the complete customer-facing frontend instead of falling back to the legacy BookCars header/footer or generic rental skin;
2. remove the parallel hard-coded fleet from `MitosHome` and source the landing fleet from the Rent A Car backend.

A runtime screenshot supplied on 2026-08-21 proved that a local Checkout build still displayed the recovered BookCars header. That evidence reopened the I4 branding gate and triggered a route/config hardening pass. The same feedback explicitly brought **Admin visible branding** into this rebrand pass; Admin business behavior remains untouched.

A later parity review found a separate regression: the new Mitos marketing header had removed recovered BookCars account/navigation behavior. That is now treated as an I4 continuity issue rather than an intentional simplification. Mitos must preserve the working customer authentication and authenticated management/navigation capabilities while changing visible identity.

The Agent, CRM and LaborSync remain outside this slice. Agent remains frozen until the final product layer.

## Authority preserved

```text
Mitos landing/public shell  -> presentation
GET /api/public-fleet/:size -> presentation-safe active-fleet projection
POST /api/frontend-cars/... -> date/location availability authority
checkout/payment/booking    -> existing Rent A Car authority
Admin                        -> existing operational behavior; visible brand only changed here
```

The public-fleet endpoint intentionally does not accept dates or locations and does not expose prices, license plates or supplier internals. It cannot be interpreted as proof that a vehicle is available for a requested rental period. Booking-state fields such as `fullyBooked` are therefore not used to decide whether an otherwise active fleet vehicle belongs in the landing catalog.

## Implemented

### I4 — Rent A Car -> Mitos customer rebrand

- `AppLayout` is the single customer-header authority and renders `MitosHeader`.
- the historical `frontend/src/components/Header.tsx` is now a no-op compatibility shim, so recovered page-level imports can neither resurrect BookCars nor duplicate the Mitos header.
- customer pages using the historical `Footer` resolve to `MitosFooter`.
- `MitosFooter` contains Mitos contact/social identity and legal/account navigation that works outside the landing.
- frontend document metadata is statically Mitos-branded.
- frontend `WEBSITE_NAME` is fixed to `MITOS RENT A CAR`; it no longer trusts a local `VITE_BC_WEBSITE_NAME=BookCars` value for visible identity.
- frontend `.env.example` and `.env.docker.example` now use the Mitos brand to prevent new local environments from reintroducing the old name.
- `mitos-rental-flow.css` carries the navy/blue/white Mitos presentation through checkout, confirmation, My Bookings, booking detail and customer authentication surfaces.
- sign-in and sign-up localized copy contains generic auth terminology, not a literal BookCars brand; their header identity comes from the global Mitos shell.

### I4A — Admin visible rebrand hardening

- Admin `WEBSITE_NAME` is fixed to `MITOS RENT A CAR` and exposes `ADMIN_NAME = MITOS ADMIN` for product identity.
- Admin document metadata/title is `MITOS ADMIN`.
- Admin header is visibly branded `MITOS ADMIN` (mobile: `MITOS`) and uses Mitos navy.
- Admin `.env.example` and `.env.docker.example` no longer seed `BookCars` as the visible website name.
- Admin routes, permissions, cars, bookings, users, pricing, scheduler and other operational behavior are unchanged.
- the recovered Admin hamburger/sidebar remains gated by authenticated Admin state; management navigation is not exposed as a public customer menu.

### I4B — Customer authentication/navigation parity restoration

The Mitos shell now restores the behavior that the recovered BookCars header already provided instead of reducing the product during the rebrand.

Public desktop header:

```text
MITOS
+ marketing navigation
+ Registrarse
+ Iniciar sesión
+ Buscar auto
```

Authenticated customer header:

```text
MITOS
+ notifications
+ Mis reservas
+ Mi cuenta
  ├── Configuración
  └── Cerrar sesión
+ Buscar auto
```

The Mitos drawer also restores the recovered customer routes:

```text
Inicio
Mis reservas          authenticated only
Proveedores           when enabled by configuration
Sedes
Nosotros
Preguntas frecuentes
Contacto
Privacidad
Términos
Cookies
```

On compact/mobile layouts, public `Registrarse` / `Iniciar sesión` actions move into the drawer, matching the recovered responsive behavior rather than disappearing.

No customer authentication endpoint, booking authority, payment behavior or rental state machine was changed.

### I5 — backend-driven Mitos landing fleet

- added `GET /api/public-fleet/:size`.
- endpoint returns active, non-coming-soon cars belonging to non-blacklisted suppliers; per-trip booking state is left to the availability flow.
- response is projected to presentation-safe fields only: `_id`, `name`, `image`, `type`, `gearbox`, `seats`, `doors`, `aircon`, `range`, `multimedia`.
- `CarService.getPublicFleet()` consumes the endpoint.
- `MitosHome` loads the fleet from backend and renders real CDN vehicle images when present.
- loading, empty and error states are explicit.
- no fake fallback vehicles are shown if the backend is unavailable or empty.
- removed hard-coded Yaris/Raize/Sedan fleet cards from the landing.
- removed static vehicle-price campaign claims from the landing.
- landing language says active fleet rather than inventing a non-existent `published` state.
- removed Agent references from the landing; Agent remains frozen until the final layer.

## Transactional protection

No behavioral change was made to:

```text
SearchForm handoff behavior
/search receiving contract
POST /api/frontend-cars availability calculation
rental price calculation
booking state transitions
checkout business rules
payment gateway logic
Admin operational/domain behavior
LaborSync
CRM
Agent runtime
```

## Runtime evidence and remaining gate

The 2026-08-21 Checkout screenshot is a **FAIL receipt for the prior local build**: it visibly rendered `BookCars`. Source has since been hardened, but that screenshot cannot be converted into PASS by code review alone.

The required next evidence is a fresh rebuild/retest of the current branch:

```text
Frontend identity + navigation audit
/                         -> MITOS
/search                   -> MITOS
/checkout                 -> MITOS
/checkout-session/:id     -> MITOS
/sign-in                  -> MITOS
/sign-up                  -> MITOS
/bookings                 -> MITOS
/booking                  -> MITOS
legal/support/account      -> MITOS shell
public desktop             -> Registrarse + Iniciar sesión visible
authenticated customer     -> notifications + Mis reservas + Mi cuenta
mobile/public              -> auth actions available in drawer
No visible BookCars        -> required

Admin identity + navigation audit
Admin browser title        -> MITOS ADMIN
Admin header               -> MITOS ADMIN / MITOS
authenticated Admin        -> hamburger/sidebar available
Admin management routes    -> preserved
No visible BookCars brand  -> required

I6 transaction proof
Mitos landing
-> GET /api/public-fleet/:size returns real/seed fleet
-> landing renders backend vehicles
-> choose location + dates
-> /search returns availability
-> select car
-> checkout
-> booking created
```

No runtime PASS is claimed yet. Keep PR Draft until fresh runtime/regression evidence is attached.
