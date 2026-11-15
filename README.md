# FreeRein

## Project Overview

FreeRein is a safety and support platform designed to help victims access resources, manage safety plans, communicate with counsellors, and securely manage evidence.

## Technology Stack

- React
- Vite
- JavaScript
- Tailwind CSS

## Frontend Setup

### 1. Clone the repository

```bash
git clone https://github.com/Siri-2030/FreeRein.git
cd FreeRein
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file using `.env.example` as a reference.

Configure `VITE_API_URL` with the backend API base URL.

### 4. Start the development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

## Backend

The backend is maintained in a separate repository:

Repository: https://github.com/Siri-2030/FreeRein--BackendRepo

Production API: https://freerein-backendrepo.onrender.com/

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

## Important

Do not commit `.env` files or private credentials to GitHub.