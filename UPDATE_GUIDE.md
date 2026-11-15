# Updating your existing frontend repo (FreeRein)

1. Open a terminal in your frontend repo folder and make a safety branch:  `git checkout -b updated-frontend`
2. Copy the contents of this zip **over** your repo folder (replace when asked). `node_modules` and `.git` are not included.
3. Install (one dependency was added: `axios`):  `npm install --legacy-peer-deps`
4. Make sure the backend is running on port 8080, then:  `npm run dev`  and open http://localhost:5173
   (dev server forwards `/api` to the backend; no CORS setup needed).
5. Landing page is `/`, login is `/login`. Demo logins (when the backend has SEED_DEMO_USERS=true):
   victim@freerein.demo / Demo@12345, counsellor@freerein.demo / Demo@12345, admin@freerein.demo / Admin@12345.
6. Production build pointing at your hosted backend:
   PowerShell:  `$env:VITE_API_URL="https://<your-backend>/api"; npm run build`
   then deploy `dist/`. On the backend set `CORS_ALLOWED_ORIGINS=https://<your-frontend-url>`.
   (On Netlify/Vercel/Render, set `VITE_API_URL` as an environment variable instead.)
7. Commit and push:  `git add -A && git commit -m "Connect frontend to backend API, fix landing/login" && git push`

Main files changed: src/api/*, src/lib/AuthContext.jsx, src/App.jsx, src/Layout.jsx, src/pages/{Login,Register,Landing,Cases,CaseDetail,Chat,EvidenceVault,Profile}.jsx,
vite.config.js, package.json, index.html, plus new Dockerfile, nginx.conf, .env.example, public/_redirects.
(Dockerfile/nginx.conf are optional; they expect a container named `backend`, so ignore them unless you use docker compose.)
