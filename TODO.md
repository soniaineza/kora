## i18n “rw everywhere?” migration

### Plan
- Replace hardcoded UI strings and `language === 'rw' ? ... : ...` branches with `t.*` usage.
- Add missing `rw` translation keys to `src/locales/rw.json` (and mirror in `en`/`fr` only if needed).

### Steps
1. Inspect i18n usage in target files (`src/pages/Exams.tsx`, `src/pages/Login.tsx`, `src/pages/Packages.tsx`, `src/components/Quiz.tsx`).
2. Add required translation keys to `src/locales/rw.json`.
3. Update target files to use translations (`t.*`) instead of hardcoded text/conditionals.
4. Run typecheck/build to ensure no missing keys/TS errors.

### Progress
- Step 1: complete (identified hardcoded/conditional strings in Exams/Login/Packages/Quiz).
- Step 2: blocked (editing `src/locales/rw.json` via exact-string diff failed due to encoding mismatch; need a full-file rewrite).
- Step 3: pending.
- Step 4: pending.

Notes
- Tooling limitation: `edit_file` requires an exact old-string match; current `rw.json` contains escaped unicode sequences that make exact matching brittle.

