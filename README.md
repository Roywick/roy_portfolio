# Roywick — Portfolio

Single-page portfolio built with React 19, Vite 6, Tailwind CSS 3 and Framer Motion.
Dark/light theme, typing hero, live GitHub stats, project filters and an EmailJS contact form.

## Run it in VS Code

```bash
npm install
npm run dev
```

Open http://localhost:5173. Build for production with `npm run build`.

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

## Contact form (EmailJS)

```bash
cp .env.example .env
```

Fill `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` and `VITE_EMAILJS_PUBLIC_KEY` from emailjs.com. Without them the form shows a message and points visitors to your email.

## Deploy

Vercel / Netlify: build command `npm run build`, output directory `dist`, and add the three `VITE_EMAILJS_*` variables.
