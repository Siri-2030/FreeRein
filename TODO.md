# Frontend-Backend Connection & API Bugs Fix

## API Folder Bugs Fixed
- [x] Fixed client.js baseURL to 'http://localhost:8080' (path alignment)
- [x] Standardized token handling
- [x] Fixed auth.js isAuthenticated me() reference to authApi.me()

## Remaining
- [ ] Fix entities.js paths for backend /entities/users (special case for 'User')
- [ ] Update backend CORS to include localhost:5173
- [ ] Test register/login

## Test Commands
cd FreeRein--Backend && mvn spring-boot:run
cd ../FreeRein && npm run dev
Test http://localhost:5173/register

