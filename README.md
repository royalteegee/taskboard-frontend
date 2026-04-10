# DevOps Taskboard — Frontend 🖥️

A React frontend for the DevOps Taskboard app, built with **Vite**.
This is the frontend service only. The backend lives in a separate repository and must be running before you start this.

---

## Project Structure

```
frontend/
├── package.json
├── vite.config.js
├── index.html
├── .env.example
└── src/
    ├── main.jsx
    ├── index.css
    └── App.jsx
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher → check with `node -v`
- [npm](https://npmjs.com/) v9 or higher → check with `npm -v`
- ⚠️ The **backend must be running first** before starting the frontend

---

## Setup & Running

### Step 1 — Clone the repository

```bash
git clone https://github.com/<your-username>/taskboard-frontend.git
cd taskboard-frontend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and confirm the value:

```env
VITE_API_URL=http://localhost:5000
```

> ⚠️ `VITE_API_URL` must match exactly where your backend is running. If the backend is on a different port, update this value accordingly.

### Step 4 — Start the dev server

```bash
npm run dev
```

You should see:

```
  VITE ready in ...ms

  ➜  Local:   http://localhost:5173/
```

Open [http://localhost:5173](http://localhost:5173) in your browser. 🎉

> If you see a **"Cannot reach backend"** error in the app, it means the backend is not running. Start it first — see the backend repository.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Build for production (outputs to `/dist`) |
| `npm run preview` | Preview the production build locally |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `Cannot reach backend` banner | Backend not running | Start the backend first |
| `VITE_API_URL is undefined` | Missing `.env` file | Run `cp .env.example .env` |
| Blank page in browser | Build/import error | Check browser console for details |
| `Cannot find module` | Dependencies not installed | Run `npm install` |

---

## Related Repository

- 🛠️ Backend → [taskboard-backend](https://github.com/<your-username>/taskboard-backend)

---

## Next Step — Dockerize It

Once both services are running locally, the next challenge is to write a `Dockerfile` for this service and connect it with the backend using `docker-compose.yml`.