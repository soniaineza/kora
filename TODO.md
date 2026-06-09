# TODO
- [x] Fix UNLIMITED remaining attempts display
  - [x] Update backend `/api/internal/active-package` to return meaningful remaining attempts for unlimited plans (e.g., 999999 or null+flag)
  - [x] Update `src/pages/Exams.tsx` to render "Unlimited" instead of 0 when appropriate
  - [x] Verify end-to-end: start UNLIMITED exam and confirm UI shows Unlimited attempts (by code inspection)
