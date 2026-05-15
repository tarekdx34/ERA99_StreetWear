# QUTB Production Audit Report (Deep, Strict)

**Date:** 2026-05-05  
**Audited stack:** Next.js App Router + NextAuth + Prisma/PostgreSQL + API routes in Next.js

## Audit method and proof standard

This report is evidence-based from direct code inspection and command output in this repository.  
No behavior is marked “working” unless verified by code path and/or command result.

**Baseline command evidence**
- `npm run lint` **passes with warnings** (not clean):
  - `scripts/cleanup.js` (`@typescript-eslint/no-require-imports`)
  - `src/app/account/orders/page.tsx` (`no-explicit-any`)
  - `src/app/account/page.tsx` (`no-explicit-any`)
- `npm run test` **passes**: 9/9 tests.
- `npm run build` **passes** on Next.js 16.2.3.

---

## Production Readiness Score: **58 / 100**

**Why not higher:** there are multiple **security-critical** access-control issues, broken authenticated mutation flows (CSRF mismatch), and checkout/inventory integrity risks that can create data drift under real traffic.

---

## 1) CRITICAL issues (must fix before scale)

| ID | Severity | Issue | Evidence | Impact |
|---|---|---|---|---|
| C-01 | Critical | Admin boundary is role-blind in middleware | `middleware.ts` only checks token presence for `/admin` and `/api/admin`; no role validation | Shopper-authenticated tokens can pass admin gate |
| C-02 | Critical | Admin API guards do not enforce `role === admin` | Repeated `ensureAdmin()` pattern in `/api/admin/**` checks session + sessionVersion only | Privilege escalation risk across admin APIs |
| C-03 | Critical | Sensitive secrets are exposed through admin settings API if C-01/C-02 exploited | `/api/admin/settings` returns settings including `cloudinaryUrl`, `telegramBotToken` (`src/lib/admin-settings.ts`) | Secret leakage and account compromise blast radius |
| C-04 | Critical | `/admin/print-orders` route returns full order PII without explicit auth check | `src/app/admin/print-orders/route.ts` directly queries and renders customer data | PII exposure under broken admin boundary |
| C-05 | Critical | CSRF-protected cart/account mutations are called without CSRF token in key client flow | `cart-context.tsx` uses plain `fetch` for `/api/cart*` writes; server routes require `requireCsrf` | Authenticated cart sync silently fails and can desync UI/server state |
| C-06 | Critical | Claim-order flow contract mismatch breaks one account flow | `/api/account/claim-order` expects `{orderId, token}`; `account-orders-client.tsx` sends `{orderId, phone}` | Guest order linking fails on `/account/orders` |
| C-07 | Critical | Inventory reservation is not transactionally coupled to order write | `/api/orders` uses DB transaction but `reserveInventoryForOrder()` mutates JSON settings outside tx context | Stock/order inconsistency on partial failures |
| C-08 | Critical | No inventory release on cancel/payment-failed transitions | `releaseInventoryForOrder()` exists but not wired in admin status update routes | Permanent stock drift / overselling risk |
| C-09 | Critical | Online payment path is non-operational in production code path | `/api/create-payment` returns 503; callbacks are acknowledgement stubs | No real online payment completion path |
| C-10 | Critical | In-memory rate limiter is non-distributed | `src/lib/rate-limit.ts` uses process-local in-memory map | Weak abuse protection under multi-instance/serverless scale |
| C-11 | Critical | Deployment doc points to nonexistent Paymob webhook path | `Documentation/production-deployment-guide.md` references `/api/paymob/webhook`; code has `/api/paymob/callback` | Production payment callback misconfiguration risk |

---

## 2) High-impact improvements

1. Replace ad-hoc admin checks with one shared RBAC guard (`requireAdminRole`) used by middleware, layouts, and all admin routes.
2. Normalize catalog/inventory from JSON-in-`Setting` to relational tables (`Product`, `Variant`, `InventoryLedger`) with row-level locking.
3. Add robust order state machine transitions with inventory side effects (reserve/release) and idempotency keys.
4. Add distributed rate limiting (Redis/Upstash) for auth/order/track/claim endpoints.
5. Unify analytics pipeline: dedupe page views, guarantee conversion events (`begin_checkout`, `add_payment_info`, `purchase`) exactly once.
6. Expand error/loading coverage with route-level `error.tsx` and `not-found.tsx` on storefront-critical routes.
7. Move major `<img>` usage to `next/image` and improve media loading strategy for LCP.
8. Add CI/CD checks (lint/test/build + typecheck + security scan) and environment validation at startup.
9. Add production observability (health endpoint, structured logs, error reporting, latency dashboards, alerts).

---

## 3) Nice-to-have upgrades

1. Dedicated `/cart` page (currently drawer-only flow).
2. Saved carts/wishlist and back-in-stock notifications.
3. RUM dashboards for Core Web Vitals by route/device/country.
4. A/B-ready event taxonomy for merchandising and landing page experiments.
5. Lifecycle emails and post-purchase growth automations.

---

## 4) Category-by-category deep audit

## 4.1 Product & User Flow

### Findings
- **No dedicated cart route** (`/cart`) exists; cart is drawer-only.
- Product → add to cart → checkout exists, but authenticated cart sync reliability is broken by missing CSRF headers in key client writes.
- Guest order linking has split behavior:
  - `/account` page supports token-based claim correctly.
  - `/account/orders` claim form uses incompatible payload.
- Order tracking flow exists (`/track-order`, `/api/orders/track`) and returns full order details when `orderNumber + phone` match.

### Edge-case coverage status
- Empty cart: handled client-side in checkout validation.
- Out-of-stock: checked in `resolveOrderPricingAndItems`.
- Failed payment: no real online payment flow, callbacks are stubs.
- Mid-checkout refresh: no idempotency key or draft checkout session; resilience is limited.

**Evidence status:** PROVEN.

---

## 4.2 Database & Backend (PostgreSQL)

### Schema quality
- Core relational entities exist (`User`, `Order`, `Cart`, `CartItem`, `Address`, tokens, analytics).
- `Order.items` is JSON, not normalized.
- Catalog and inventory are persisted as JSON in `Setting` (`catalog_products_v3`), not relational.

### Scaling and integrity concerns
- Inventory mutations are JSON blob rewrites, not row-level updates.
- Reservation and order create are not atomically linked.
- No inventory release wiring on cancel/payment-failed.
- Some analytics/admin computations scan large datasets into memory.
- `AnalyticsEvent.productId` is `Int?` while product IDs in app are string-like IDs; type-model mismatch risk.

**Evidence status:** PROVEN.

---

## 4.3 Frontend (Next.js App Router)

### Structure and rendering
- Componentization is generally modular (shop/product/cart/account/admin).
- Heavy client-side surface for commerce flows; route-level resiliency is sparse.
- Route coverage gaps:
  - `loading.tsx`: only found on `/shop`
  - `error.tsx`: only found in admin panel
  - `not-found.tsx`: none app-level custom page found

### Image/perf patterns
- Significant use of raw `<img>` in core storefront/admin components.
- `next/image` import appears minimally used.

**Evidence status:** PROVEN.

---

## 4.4 Performance

### What is proven
- Build succeeds, route graph is complete, but no empirical CWV telemetry is present in repo.
- Large dependencies are present (three.js/react-three/tiptap/recharts/framer-motion), increasing bundle risk.
- Repeated client event hooks and rendering-heavy components may increase INP on lower-end devices.

### Not proven from repo alone
- Real LCP/CLS/INP in production by geography/device.
- CDN/cache hit rates and DB response p95/p99.

**Evidence status:** PARTIALLY PROVEN.

---

## 4.5 Analytics & Tracking

### Findings
- GA gate is consent-aware and uses `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- Meta pixel is consent-aware and includes page tracking.
- Pageview duplication risk:
  - Global `RouteTracking` sends `page_view`.
  - `shop-client` also emits `page_view` on params/path changes.
- Conversion API endpoint exists (`/api/analytics/meta-event`) and logs events, but end-to-end dedup/coverage discipline is not fully enforced.
- Docs/env naming drift exists (`NEXT_PUBLIC_GA_ID` in docs vs `NEXT_PUBLIC_GA_MEASUREMENT_ID` in code).

**Evidence status:** PROVEN.

---

## 4.6 Security

### Critical security posture
- RBAC is the main systemic weakness (admin access control by token/session-version, not role).
- Secret exposure risk is amplified by weak admin boundary.
- PII print endpoint route has no explicit auth check.
- CSRF middleware is implemented correctly, but client integration is inconsistent in important flows.

### Additional observations
- Password hashing and validation are present (`bcrypt`), token signing uses `NEXTAUTH_SECRET`.
- Enumeration-safe responses are used in some auth flows (forgot-password/check-email style generic messages).

**Evidence status:** PROVEN.

---

## 4.7 E-commerce Logic

### Findings
- Cart/add/remove/update APIs exist with stock checks.
- Checkout re-prices server-side (`resolveOrderPricingAndItems`) which is good.
- Inventory lifecycle is incomplete (reserve path exists; release path not wired).
- Payment lifecycle is incomplete for online flow.

**Evidence status:** PROVEN.

---

## 4.8 Edge Cases & Failures

| Scenario | Current behavior | Risk |
|---|---|---|
| Payment fails | Callback endpoints do not process state transitions | Orders/stock/payment state divergence |
| API fails during cart sync | Client optimistic updates may rollback inconsistently due CSRF misses | Hidden state mismatch |
| DB slow/high latency | No circuit breaker/queueing/backpressure strategy visible | Request timeout and degraded UX |
| User refresh mid-checkout | No draft/idempotency checkout session model | Duplicate submits or abandoned states |

**Evidence status:** PROVEN (from code paths), runtime load behavior is PARTIALLY PROVEN.

---

## 4.9 Deployment & DevOps

### Findings
- No CI workflows found in repository (`.github/workflows` absent).
- No health endpoint found.
- No built-in APM/error monitoring integration found (Sentry/Datadog absent).
- Deployment guide has incorrect webhook path and GA env key mismatch.

**Evidence status:** PROVEN.

---

## 5) Step-by-step action plan (strict remediation order)

1. **Lock admin access immediately**
   - Enforce role check in middleware, admin layout, and all `/api/admin/**` guards.
   - Centralize guard helper; remove duplicated weak `ensureAdmin()` implementations.

2. **Stop secret and PII exposure paths**
   - Add explicit authz to `src/app/admin/print-orders/route.ts`.
   - Split admin settings response into safe/public/admin-secret scopes.
   - Mask sensitive values in UI and avoid returning raw tokens by default.

3. **Fix CSRF integration end-to-end**
   - Replace plain fetch calls in authenticated cart and reorder flows with `csrfFetch`.
   - Add regression tests for authenticated cart write operations.

4. **Fix claim-order contract mismatch**
   - Standardize on token-based claim payload everywhere.
   - Update `/account/orders` claim UI and validation copy (order number vs numeric ID).

5. **Make inventory operations atomic and reversible**
   - Move inventory reservation/release into relational DB operations within one transaction.
   - Trigger release on `cancelled` and `payment_failed`.
   - Add idempotency guards on status transitions.

6. **Decide payment production mode**
   - Either fully implement online payment create+callback verification+state transition, or hard-disable online options in UX/docs/admin.
   - Fix deployment docs to actual callback route names.

7. **Harden rate limiting for scale**
   - Replace in-memory limiter with distributed storage.
   - Add route-specific keys and alerting on spikes.

8. **Close analytics quality gaps**
   - Remove duplicate page_view emission.
   - Enforce a single event taxonomy and dedup keys.
   - Validate GA/Meta event parity across product/cart/checkout/purchase flows.

9. **Improve frontend resilience**
   - Add `loading.tsx`, `error.tsx`, and `not-found.tsx` where missing for storefront routes.
   - Add explicit API failure UI states (not just silent catches).

10. **Performance hardening**
   - Replace critical `<img>` with `next/image`.
   - Lazy-load heavy client-only modules where possible.
   - Introduce route-level bundle budgets.

11. **Ops and observability**
   - Add CI workflow (lint/test/build/typecheck).
   - Add `/api/health` and structured error logging.
   - Add production monitoring + alerts (errors, latency, failed orders, stock anomalies).

12. **Verification gate before traffic scale**
   - Run security regression checklist (RBAC/CSRF/PII).
   - Run checkout/inventory consistency tests under concurrency.
   - Run synthetic payment callback tests and incident drills.

---

## 6) Final verdict

The project is a strong foundation with working build/tests and broad feature coverage, but it is **not yet safely production-hardened for scale** due to access control flaws, inventory integrity risks, and inconsistent mutation security wiring.  
Address the critical block list first; then proceed with performance/analytics/ops hardening.

