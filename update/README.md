# Twebaze Arts — SRS v1.0 Implementation Package

This is the full implementation to bring your existing codebase in line with
`Systems_Requirements_Specification.docx`. Everything here is a **file for you
to create or paste over an existing one** — nothing has been touched in your
actual project. Work through this in order; each stage builds on the last.

---

## Stage 0 — Backup

Before touching anything: take a manual Supabase project backup (Database →
Backups) and commit/branch your current git state. This migration changes
your auth model and adds 12 tables.

---

## Stage 1 — Database (do this first)

Run **`sql/001_srs_v1_migration.sql`** in Supabase → SQL Editor. It's
idempotent (`if not exists` / `do $$...exception$$` throughout) so it's safe
to re-run if it fails partway.

After it runs:
1. In Supabase Storage, create a new **`documents`** bucket (public) — this is
   where generated PDF quotes are stored (FR-INQ-007). Your existing
   `artworks` bucket is reused as-is for images.
2. Manually clean up old artist accounts per the comment at the top of the
   migration (delete non-admin rows from `profiles`, delete their Supabase
   Auth users) — do this once you've confirmed you don't need their artwork
   data, since `artworks.artist_ref_id` now points at the new `artists` table,
   not at any user account.
3. Confirm you have exactly one row in `profiles` with `role = 'ADMIN'`. This
   is your one and only login going forward (BR-GEN-001).

---

## Stage 2 — Backend (`server/`)

### New dependency
Add to `server/package.json` (already reflected in the copy below) and run
`npm install`:
```
npm install pdfkit
```

### Files to DELETE
- `server/src/controllers/service.controller.js`
- `server/src/routes/service.routes.js`
- `server/src/middleware/requireRole.js` (no longer needed — see auth.js)

### Files to REPLACE (paste over existing)
| File | What changed |
|---|---|
| `server/package.json` | added `pdfkit` |
| `server/src/index.js` | mounts all new routers, drops `/api/services` |
| `server/src/middleware/auth.js` | simplified — no role branching |
| `server/src/controllers/auth.controller.js` | `register` removed |
| `server/src/routes/auth.routes.js` | `/register` route removed |
| `server/src/controllers/artwork.controller.js` | full rewrite for Module 1 |
| `server/src/routes/artwork.routes.js` | full rewrite |
| `server/src/controllers/admin.controller.js` | old artist-approval endpoints replaced with FR-ADM-004 analytics |
| `server/src/routes/admin.routes.js` | same |

### Files to CREATE (new)
- `server/src/middleware/optionalAuth.js`
- `server/src/controllers/artist.controller.js` + `routes/artist.routes.js`
- `server/src/controllers/inquiry.controller.js` + `routes/inquiry.routes.js`
- `server/src/controllers/commission.controller.js` + `routes/commission.routes.js`
- `server/src/controllers/project.controller.js` + `routes/project.routes.js`
- `server/src/controllers/class.controller.js` + `routes/class.routes.js`
- `server/src/controllers/testimonial.controller.js` + `routes/testimonial.routes.js`
- `server/src/controllers/blog.controller.js` + `routes/blog.routes.js`
- `server/src/controllers/payment.controller.js` + `routes/payment.routes.js`

`server/src/config/supabase.js` is unchanged — keep it as-is.

---

## Stage 3 — Frontend (`frontend/`)

### New dependencies
Add to `frontend/package.json` (already reflected below) and run `npm install`:
```
npm install react-markdown
npm install -D @tailwindcss/typography
```

### Files to DELETE
- `frontend/src/pages/Register.jsx`
- `frontend/src/pages/artist/` (entire folder: `Dashboard.jsx`, `MyArtworks.jsx`, `Overview.jsx`, `Profile.jsx`, `UploadArtwork.jsx`)
- `frontend/src/pages/Services.jsx` and any `services.api`/`useServices` references, if present — no SRS equivalent (closest replacements are Commissions and Classes)
- `frontend/src/components/WhatsAppButton.jsx` if unused elsewhere (direct WhatsApp deep-linking was replaced by the structured inquiry pipeline)

### Files to REPLACE (paste over existing)
| File | What changed |
|---|---|
| `frontend/package.json` | added `react-markdown`, `@tailwindcss/typography` |
| `frontend/tailwind.config.js` | registers the typography plugin (used by the blog post view) |
| `frontend/src/App.jsx` | full routing rewrite — no `/register`, no `/dashboard`, adds all new public + admin routes |
| `frontend/src/context/AuthContext.jsx` | `register` removed, adds 30-min idle logout (BR-ADM-001) |
| `frontend/src/components/layout/Navbar.jsx` | no register/artist-dashboard links |
| `frontend/src/components/ArtCard.jsx` | new artwork/artist/image data shape |
| `frontend/src/components/ViewInRoom.jsx` | new image/dimension fields (small patch, shown in full) |
| `frontend/src/pages/Gallery.jsx` | category/availability filters + search wired to the API |
| `frontend/src/pages/ArtworkDetail.jsx` | story field, structured inquiry form instead of raw WhatsApp link |
| `frontend/src/pages/auth/Login.jsx` | no "create account" link, redirects to `/admin` |
| `frontend/src/pages/admin/AdminDashboard.jsx` | now the FR-ADM-004 analytics page |

### Files to CREATE (new)
**API layer** (`frontend/src/api/`): `artist.api.js`, `auth.api.js`, `blog.api.js`,
`class.api.js`, `commission.api.js`, `inquiry.api.js`, `payment.api.js`,
`project.api.js`, `testimonial.api.js`, `admin.api.js` (all thin axios wrappers
around your existing `client.js`, which is unchanged)

**Shared components:**
- `frontend/src/components/InquiryForm.jsx`
- `frontend/src/components/TestimonialsSection.jsx` (optional — drop into `About.jsx`)
- `frontend/src/components/admin/AdminLayout.jsx`

**Public pages** (`frontend/src/pages/public/`):
`Artists.jsx`, `ArtistProfile.jsx`, `Classes.jsx`, `CommissionRequest.jsx`,
`Inquire.jsx`, `Blog.jsx`, `BlogPost.jsx`

**Admin pages** (`frontend/src/pages/admin/`):
`ManageArtworks.jsx`, `ManageArtists.jsx`, `InquiryQueue.jsx`,
`ManageCommissions.jsx`, `ManageProjects.jsx`, `ManageClasses.jsx`,
`ManageTestimonials.jsx`, `ManageBlog.jsx`, `PaymentLog.jsx`

`frontend/src/lib/supabase.js`, `frontend/src/api/client.js`, `About.jsx`, and
`ViewInRoom.jsx`'s room-background asset are all unchanged.

---

## Things intentionally left as follow-ups (not blocking)

- **Notification gateway** (email/WhatsApp on new inquiry, section 4.2
  "Communication Links") — `inquiry.controller.js` has a `TODO` marking where
  to add it once you've picked a provider (e.g. Resend, Twilio).
- **Artwork view-count tracking** for FR-ADM-004 — no tracking column exists
  yet; noted inline in `admin.controller.js`.
- **WebP auto-generation** on upload (NFR-PERF-002) — images currently upload
  as-is to Supabase Storage; a resize/convert step (e.g. via a Supabase Edge
  Function or `sharp` in the upload endpoint) is the next increment.
- `Material`, `Inventory`, `Exhibition`, `Partner` entities from the SRS's
  data model diagram have no functional requirements written for them
  anywhere in Section 6 — treated as future-phase and not built here.

---

## Suggested QA pass after pasting everything in

1. Log in as the admin → confirm `/register` and any old `/dashboard` routes
   are gone (404 or redirect).
2. Create an artist, then an artwork; confirm you can't publish it without an
   image + story (BR-ART-001).
3. Submit a public inquiry from an artwork page; confirm it lands in
   Admin → Inquiries as `NEW`.
4. Convert a commission-classified inquiry to a Commission, then promote it
   to a Project, move it through stages, and confirm it refuses to go to
   `COMPLETED` until you've logged a matching payment (BR-PRO-001).
5. Schedule a class with capacity 1, book it from the public page, confirm a
   second booking is rejected (VR-CLS-001).
6. Suspend an artist with a published artwork and confirm the artwork
   auto-unpublishes (BR-AST-001).
