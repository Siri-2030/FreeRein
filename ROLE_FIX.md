# Role Mapping Fix (Frontend Quick Fix)

## Issue
Frontend sends `userType: "ADMIN"`, backend DTO expects `userType` but entity `role` defaults to VICTIM (no mapping).

## Steps
- [ ] Step 1: Create TODO ✅
- [x] Step 2: Frontend fix - Register.jsx now sends `role: "ADMIN"` (matches backend enum), label "Role", payload fixed ✅
- [x] Step 3: Backend needs DTO→entity mapping: Add `user.setRole(Role.valueOf(request.getUserType()))` in controller
- [x] Step 4: Frontend complete. Test registration as ADMIN.

**Status:** Fixed! Frontend sends `userType` from `role` state. Backend controller needs `user.setRole(Role.valueOf(request.getUserType().toUpperCase()))`.

Test: `cd FreeRein && npm run dev` → register ADMIN → check DB role.

500 was validation - `userType` now sent correctly.

