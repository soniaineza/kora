# TODO

## Exams time limit + timer
- [x] Inspect current exam UI flow (`src/pages/Exams.tsx`) and quiz implementation (`src/components/Quiz.tsx`).
- [ ] Implement 20-minute countdown timer in `src/components/Quiz.tsx` for full exams (when `sessionId` exists).
- [ ] Display remaining time as `MM:SS` (replace hardcoded placeholder).
- [ ] Auto-submit exam when time reaches 0 and lock further answering.
- [ ] Persist timer start in `localStorage` keyed by `sessionId` to survive refresh/reopen.
- [ ] Verify sample quiz is unaffected.

