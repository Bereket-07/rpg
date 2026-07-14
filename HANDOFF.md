# RPG Tamera — Session Handoff

## Project
**Reframe Psychology Group** — Next.js 14 App Router + FastAPI + PostgreSQL, deployed on DigitalOcean.

- **New droplet IP**: `146.190.162.115`
- **Live URL**: `https://146.190.162.115.nip.io`
- **Server project path**: `/opt/rpgproject/`
- **GitHub remotes**: `origin` (personal) + `company` (EromoVentures org)
- **Workspace folder**: `D:\desktop\work\EromoVentures Projects\rpg-tamera`
- **Backend folder**: `D:\desktop\work\EromoVentures Projects\rpg-tamera\backend`

---

## Architecture

| Layer | Detail |
|---|---|
| Frontend | Next.js 14 App Router, `(client)` and `(admin)` route groups, port 3006 |
| Backend | FastAPI, port 8006 |
| Database | PostgreSQL (Docker) |
| SSL/Proxy | System-level Caddy at `/opt/caddy/Caddyfile` (NOT Docker Caddy) |
| Deployment | `docker-compose.prod.yml` — 3 services: frontend, backend, db |

---

## Admin Credentials
- **URL**: `https://146.190.162.115.nip.io/admin`
- **Email**: `admin@reframe.com`
- **Password**: `password123`
- **How to reset if DB wiped**: `docker exec -it rpgproject-backend-1 python seed_user.py`

---

## What Was Completed This Session

### ✅ Deployment
- Migrated from old droplet (164.92.127.224) to new droplet (146.190.162.115)
- Removed Docker Caddy from `docker-compose.prod.yml` (system Caddy owns 80/443)
- Updated `/opt/caddy/Caddyfile` with new nip.io domain block
- App is live and working

### ✅ Admin Login
- DB was wiped by `down -v`; re-seeded via `seed_user.py`

### ✅ Specialty Cards — Team Profile Page
- File: `frontend/src/app/(client)/team/[slug]/page.tsx`
- Dynamic grid: ≤4 cards → 2-col, >4 cards → 3-col
- Card titles are italic (`font-serif font-semibold italic`)
- Anat Cohen's static data updated from 2 → 4 specialties

### ✅ Specialty Images
- Files: `frontend/src/app/(client)/specialties/page.tsx` and `[id]/page.tsx`
- All 7 images updated to: `/assets/Specialties Section_Selected Images/cards/[name].png`

### ✅ Specialty Detail Page Layout (LAST CHANGE — verify on refresh)
- File: `frontend/src/app/(client)/specialties/[id]/page.tsx`
- Layout changed from broken 12-col grid to **flexbox**:
  - Text column: `lg:w-[46%] shrink-0` (fixed 46%)
  - Image column: `flex-1` (fills remaining ~54%)
  - Gap: `gap-10 lg:gap-16`
- Desired look: narrower text on left, wider image on right — should now match the reference screenshot

---

## Pending / Remaining Tasks

1. **Verify specialty detail page layout** — user was iterating on this when session ended. Load localhost and compare to desired screenshot (narrower text left, wider image right).

2. **Deploy all changes to production**
   ```bash
   # On local machine first:
   git push origin main
   git push company main
   # Then on server:
   cd /opt/rpgproject
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. **Google OAuth** — update Authorized Origins + Redirect URIs to include `https://146.190.162.115.nip.io`

4. **Privacy Policy page** — waiting for text from Tamara/Anat

5. **Homepage responsive** — mockup was approved but not implemented in Next.js yet

6. **Other admin pages UI** — Articles, Newsletter, Clinicians, Settings pages still use old styling

---

## Key Files

```
frontend/src/app/(client)/
  specialties/page.tsx          ← specialty listing page (grid of 7 cards)
  specialties/[id]/page.tsx     ← specialty detail page (text + image layout)
  team/page.tsx                 ← team listing + STATIC_TEAM_MEMBERS (Anat's data here)
  team/[slug]/page.tsx          ← individual therapist profile page

frontend/public/assets/
  Specialties Section_Selected Images/cards/   ← 7 specialty images

backend/
  seed_user.py                  ← re-creates admin user

/opt/rpgproject/
  docker-compose.prod.yml       ← prod deploy (3 services, no Caddy)

/opt/caddy/Caddyfile            ← system Caddy SSL config
```

---

## SimplePractice
- Widgets are domain-locked — "Contact your practitioner" error on localhost is **expected and normal**
- Scope ID: `64787fd5-84f6-42ba-9955-816d91404e11`
- App ID: `7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b`
- Per-clinician IDs in `team/[slug]/page.tsx` → `CLINICIAN_SP_IDS`
