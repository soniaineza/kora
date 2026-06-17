# Kora — Package transparency & attempt accounting

## Implemented so far
- CORS + JSON parse fixes for OTP flow.
- Backend: JSON 404 fallback to prevent `Unexpected token '<'`.
- Frontend: avoids localhost loopback when `VITE_API_BASE` is missing.
- Vite dev proxy for `/api` and `/webhooks`.
- Quiz: countdown starts only after user clicks **Start Timer**.

## Current blocking gap (your requirements)
Package transparency + correct attempt consumption is **not yet fully implemented**.

## Remaining work (next)
### A) Database (Supabase)
1. Extend schema to support:
   - Package purchase record: **total_attempts, remaining_attempts, purchaseDate, expiryDate, status**
   - Audit trail per attempt usage: userId, packageId, examId, date, attemptConsumed=true

2. Keep multiple packages separate (no merging).

### B) Backend (Express)
3. FIFO + FIFO selection across multiple active purchases.
4. Expiry handling:
   - Expire only unused attempts for the expired purchase.
5. Critical: **decrement attempts only when exam is successfully submitted**.
   - Move deduction logic out of `/api/internal/start-exam`.

### C) API responses (for UI transparency)
6. Update `GET /api/internal/active-package` (or replace it) to return:
   - package name/key
   - total attempts
   - used attempts
   - remaining attempts
   - expiry date
   - status (active/expired)

7. Add an endpoint for attempt history (admin + user visibility if needed).

### D) UI (no redesign)
8. Update `src/pages/Exams.tsx` (start validation + warnings + transparency).
9. Update `src/pages/Packages.tsx` or dashboard page to show purchased package state.

## Order of implementation
1) Schema changes
2) Backend deduction + FIFO + audit trail
3) Update endpoints
4) Update UI
5) End-to-end testing: buy → webhook activate → start exam → submit → attempt decrement exactly once

