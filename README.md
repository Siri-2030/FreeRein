# FreeRein Full Stack App

## Setup
1. **Backend** (FreeRein--Backend): `cd FreeRein--Backend && mvnw spring-boot:run`
   - Runs on http://localhost:8080/api
   - Swagger: http://localhost:8080/swagger-ui.html
   - DB: MySQL FreeRein_db (update application.properties)

2. **Frontend** (FreeRein): `cd FreeRein && npm install && npm run dev`
   - Runs on http://localhost:5173
   - /api calls auto-proxy to backend 8080/api

## Connection
- Vite proxy configured for seamless API calls.
- Old backend (FreeRein-backend) deprecated.

## Test
Open frontend, perform API actions (login/register) – check Network tab.

