# Reframe Psychology Group - Clinical Platform

A full-stack, Next.js 14 and FastAPI application architecture specifically built as a "Microservices-Ready Monolith". Designed to power the clinical landing pages, mental wellness blog, and provide a secure Admin CMS for the clinical team of Reframe Psychology Group.

## 🏗️ Architecture & Tech Stack

This repository uses a monorepo file structure, decoupling the frontend user interfaces from the backend database APIs, orchestrated together via Docker.

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **CMS Editor:** TipTap (Rich Text WYSIWYG Editor)
- **Authentication:** NextAuth.js (JWT custom backend credentials)

### Backend
- **Framework:** Python FastAPI
- **Database:** PostgreSQL 16 (via asyncpg driver)
- **ORM:** SQLAlchemy 2.0 + Alembic (Migrations)
- **Security:** bcrypt password hashing + JWT Handlers

---

## 💻 Local Development Setup

To run this application locally and iterate on code, you will use the standard `docker-compose.yml`. This configuration automatically mounts your local source code into the containers so you get live-reloading (both Next.js HMR and Python Uvicorn reloading).

### Prerequisites
- Docker Desktop installed
- Node.js 20+ (for local CLI tooling)
- Python 3.11+ (for local virtual environments, optional)

### 1. Start the Infrastructure
From the root of the project, run:
```bash
docker compose up -d
```
This will spin up:
- `db`: The PostgreSQL Database on port `5433`
- `backend`: The FastAPI server on port `8000`
- `frontend`: The Next.js development server on port `3000`

### 2. View the App
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin) (Requires Login)

*Note: Due to the live-reloading mounts, changes made in `./frontend/src` or `./backend/app` will instantly reflect in the browser.*

---

## 🚀 Production Deployment (VPS / Self-Hosted)

When you are ready to put this application live on a server (like DigitalOcean, AWS, or Render), you should use the **Production configuration**. This configuration does NOT map local files. Instead, it securely compiles the Next.js app into a standalone Node server, optimizes FastAPI for single-worker performance, and sets up an enterprise-grade Caddy Reverse Proxy to automatically fetch `HTTPS` certificates.

### 1. Preparation
Before building, update the following files on your VPS with your actual production data:
- Re-open `docker-compose.prod.yml` and ensure `DATABASE_URL` matches your managed database (or leave as is if using the bundled one).
- Open `infrastructure/caddy/Caddyfile` and replace `your-domain-here.com` with your purchased domain name or VPS IP address.
- Leave `NEXT_PUBLIC_API_URL` empty when using the bundled Caddy proxy. The browser will call same-origin `/api/v1/...`, while server-rendered pages use `API_INTERNAL_URL=http://backend:8000`.

### 2. Launching Production
From the root of the project on your server:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Database Migrations
For the first time running in production, you must initialize the database schema:
```bash
# Exec into the backend container
docker compose -f docker-compose.prod.yml exec backend bash

# Run Alembic migrations
alembic upgrade head

# Exit the container
exit
```

---

## 🗄️ Core Features

1. **Authentication & RBAC**: Secure admin-only dashboard locking behind JWT roles (`ADMIN` vs `AUTHOR`). Authors cannot edit system Categories or other Author profiles.
2. **Dynamic Drag & Drop Media**: Image uploader configured in Next.js which seamlessly streams `multipart/form-data` to the FastAPI backend, securely hosted from a persistent Docker volume.
3. **Rich Text Headless CMS**: Built natively onto TipTap. Clinicians write their content locally in the dashboard, and `@tailwindcss/typography` securely parses the strict HTML directly onto the `/blog/[slug]` active routes.
4. **Resilient Zod Validation**: Every endpoint relies on bidirectional type-safety. FastAPI Pydantic schemas mirror Frontend Zod verification to prevent corrupt database inserts.
