# Roywick — Portfolio

Single-page portfolio built with React 19, Vite 6, Tailwind CSS 3 and Framer Motion.
Dark/light theme, typing hero, live GitHub stats, project filters and an EmailJS contact form.

## Run it in VS Code

```bash
npm install
npm run dev
```

Open http://localhost:5173. Build for production with `npm run build`.

## Backend (Express + PostgreSQL)

The `server/` folder is a separate Node.js API. The site still works **without** it (it falls back to the static data in `src/data/`), but with it running you get:

| Feature | Endpoint |
|---|---|
| Contact form saved to PostgreSQL (rate limited, honeypot, validated) | `POST /api/contact` |
| Projects CRUD (public read, admin write) | `/api/projects` |
| Skills CRUD (public read, admin write) | `/api/skills` |
| Cached GitHub stats proxy | `GET /api/github/stats` |
| Profile, About, Education, Experience, photo and resume (editable in `/admin`) | `/api/site`, `/api/files` |
| Admin login (JWT, bcrypt) | `POST /api/auth/login` |
| Inbox for contact messages (admin) | `/api/messages` |

### Setup

1. Create a PostgreSQL database, e.g. `createdb portfolio`.
2. Configure and install the server (if you already ran `db:init` before, run it again to create the two new tables):
   ```bash
   cd server
   cp .env.example .env      # fill DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
   npm install
   npm run db:init           # creates the tables
   npm run db:seed           # creates the admin user and imports skills
   npm run dev               # API on http://localhost:5000
   ```
3. In another terminal, from the project root: `npm run dev`.
4. Open http://localhost:5173/admin, sign in, and add your real projects.

In dev, Vite proxies `/api` to port 5000. In production deploy `server/` (Render, Railway, Fly...) with a hosted PostgreSQL, set `CORS_ORIGIN` to your site URL, and set `VITE_API_URL` on the frontend to `https://your-api-host/api`.

Security notes: secrets live only in `server/.env` (git-ignored); passwords are bcrypt-hashed; all SQL is parameterised; login and contact endpoints are rate limited; helmet and CORS allow-list are enabled.

## Where to edit your content

Everything personal lives in `src/data/`:

| File | What it controls |
|---|---|
| `src/data/profile.js` | Name, typing titles, bio, location, email, WhatsApp, GitHub, **LinkedIn / Medium links**, languages, interests, education, experience |
| `src/data/skills.js` | Skill categories and percentage bars |
| `src/data/projects.js` | Project cards and filter tabs (**currently placeholders, replace them with your real GitHub projects**) |

LinkedIn and Medium are empty on purpose. When you paste a URL in `profile.js`, the LinkedIn icons appear automatically in the hero and footer.

## Files to put in `public/`

| File | Used for |
|---|---|
| `profile.jpg` | Your photo in the hero card (a letter monogram shows until you add it) |
| `resume.pdf` | The "Download Resume" button |
| `og-cover.png` | Social preview image (optional) |

## Contact form

With the backend running, messages go to PostgreSQL (read them in `/admin`). If the backend is unreachable, the form falls back to EmailJS:

```bash
cp .env.example .env
```

Fill `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` and `VITE_EMAILJS_PUBLIC_KEY` from emailjs.com. Without them the form shows a message and points visitors to your email.

## Deploy

Vercel / Netlify: build command `npm run build`, output directory `dist`, and add the three `VITE_EMAILJS_*` variables.
