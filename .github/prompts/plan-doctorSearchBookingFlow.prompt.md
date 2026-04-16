## Plan: Doctor Search and Booking Flow

Build a three-screen patient appointment journey using existing React Router and authenticated Axios setup: search doctors on `/doctors`, open selected doctor on `/doctors/:doctorId` with date/type/slot booking, then navigate to a confirmation UI after successful booking (including idempotent retries). Reuse existing UI primitives and service layer, add a dedicated appointments service module, and keep route state URL-driven where possible.

**Steps**
1. Phase 1: Routing and app shell
1. Update `/Users/yasindu/medstream-frontend/src/App.jsx` to replace the placeholder button with route definitions for `/doctors`, `/doctors/:doctorId`, and a confirmation route (`/doctors/confirmation`).
1. Add a shared lightweight top navigation layout component under `/Users/yasindu/medstream-frontend/src/components` and wrap all three screens with it to match provided wireframes. *parallel with step 2.1 once route contracts are agreed*

2. Phase 2: API service and data contracts
1. Create `/Users/yasindu/medstream-frontend/src/services/appointments.js` with typed-by-shape helpers:
   - `searchDoctors(params)` -> `GET /appointments/doctors/search`
   - `getDoctorProfile(doctorId, date?)` -> `GET /appointments/doctors/{doctor_id}/profile`
   - `bookAppointment(payload, idempotencyKey)` -> `POST /appointments/appointments/book` with `X-Idempotency-Key` header
1. Keep all calls using existing default export from `/Users/yasindu/medstream-frontend/src/services/api.js` so auth headers and refresh behavior remain centralized.
1. Add request/response normalization utilities in `/Users/yasindu/medstream-frontend/src/lib` for:
   - date formatting (`YYYY-MM-DD` for API)
   - time label rendering (`HH:mm` to human-readable)
   - idempotency key generation (UUID-like/random string) stable for one booking attempt session.

3. Phase 3: Doctors search screen (`/doctors`)
1. Create `/Users/yasindu/medstream-frontend/src/pages/DoctorsPage.jsx` implementing:
   - search/filter controls (specialty, date, consultation type, optional clinic)
   - loading/empty/error states
   - doctor result cards including clinic, fee, and available slot summary
   - click action navigating to `/doctors/:doctorId` with selected date/type/clinic in query params.
1. Handle API empty-state contract: show a polished no-results panel when `results` is empty or `empty_state` is true; do not treat as error.
1. Preserve query params in URL so refresh/back retains filters. *depends on step 1.1 and 2.1*

4. Phase 4: Doctor profile + slot booking (`/doctors/:doctorId`)
1. Create `/Users/yasindu/medstream-frontend/src/pages/DoctorBookingPage.jsx` to load doctor profile by `doctorId` and selected date.
1. Render:
   - doctor profile section (name, bio, experience, clinic)
   - consultation type selector constrained by clinic availability
   - slot grid from returned `available_slots`
   - booking summary card with selected doctor/date/time/type and fee.
1. Generate idempotency key when page initializes booking context (or first selection) and keep it stable until success/failure resolution.
1. On confirm booking:
   - call `bookAppointment`
   - on `201` success (including idempotent message variant), navigate to confirmation route passing payload/response via router state and/or encoded params
   - on `409`, show alert/toast and refresh profile/slots for current date
   - on `422`, show alert/toast with consultation-type mismatch message
   - on other failures, show generic retry error.

5. Phase 5: Confirmation screen
1. Create `/Users/yasindu/medstream-frontend/src/pages/BookingConfirmationPage.jsx` with the third-wireframe layout: success headline, appointment summary, and actions.
1. Source displayed values primarily from booking API response (`appointment_id`, doctor, clinic, date/time, type, status/payment_status, fee/message).
1. Add guard behavior: if page is opened without booking state, redirect to `/doctors` with user-friendly notice.

6. Phase 6: Styling and responsiveness
1. Add feature-specific styles in page-local class structures (Tailwind utility-first) and remove dependency on starter `App.css` patterns that constrain root width.
1. Ensure desktop/mobile behavior for all three screens (stacking cards, slot grids, action buttons) and visual consistency with current theme tokens in `/Users/yasindu/medstream-frontend/src/index.css`.

7. Phase 7: Validation
1. Run lint (`npm run lint`) and resolve introduced violations.
1. Manual checks:
   - `/doctors` loads and filters trigger API with expected query params
   - selecting doctor opens `/doctors/:doctorId` and loads profile/slots
   - successful booking navigates to confirmation UI
   - simulate `409` and `422` to verify exact UX handling
   - retry duplicate booking with same idempotency key behaves as success path.

**Relevant files**
- `/Users/yasindu/medstream-frontend/src/App.jsx` — replace placeholder with route tree and layout wrappers.
- `/Users/yasindu/medstream-frontend/src/main.jsx` — retain BrowserRouter/Toaster; only adjust if route-level providers become needed.
- `/Users/yasindu/medstream-frontend/src/services/api.js` — reused auth + refresh interceptor behavior (no major logic changes expected).
- `/Users/yasindu/medstream-frontend/src/services/appointments.js` — new doctor search/profile/booking API methods and error surface.
- `/Users/yasindu/medstream-frontend/src/pages/DoctorsPage.jsx` — search list UI and filter/query synchronization.
- `/Users/yasindu/medstream-frontend/src/pages/DoctorBookingPage.jsx` — doctor detail, slot selection, booking action.
- `/Users/yasindu/medstream-frontend/src/pages/BookingConfirmationPage.jsx` — post-booking success UI.
- `/Users/yasindu/medstream-frontend/src/components/...` — shared patient portal header and reusable appointment card atoms if extracted.
- `/Users/yasindu/medstream-frontend/src/lib/utils.js` or new `/Users/yasindu/medstream-frontend/src/lib/appointment-utils.js` — idempotency/date/time helpers.
- `/Users/yasindu/medstream-frontend/src/App.css` — remove starter template styles that conflict with full-width app layout.

**Verification**
1. `npm run lint`
1. Run app with `npm run dev` and validate flows against wireframes at `/doctors`, `/doctors/:doctorId`, and confirmation route.
1. Inspect network calls for exact endpoint/path/query/header usage:
   - `GET /appointments/doctors/search`
   - `GET /appointments/doctors/{doctor_id}/profile?date=YYYY-MM-DD`
   - `POST /appointments/appointments/book` with `X-Idempotency-Key`.
1. Force backend responses for `409` and `422` and confirm UI messages and slot-refresh behavior.
1. Confirm browser back/forward preserves search filter state and selected date/type when possible.

**Decisions**
- Use `/doctors/:doctorId` for the second screen (confirmed).
- JWT is already set in-memory via `setAccessToken()`; do not add new token persistence in this task.
- Assume `VITE_API_URL` points to gateway base URL and keep service calls relative.
- Included scope: UI + routing + API integration for AS-01 to AS-03.
- Excluded scope: payment completion workflow and authenticated login implementation.

**Further Considerations**
1. Confirmation path naming: keep `/doctors/confirmation` for simplicity, or switch to `/appointments/:appointmentId/confirmed` if deep-linking is required soon.
2. Clinic selection behavior: if profile returns multiple clinics, default to first with slots or require explicit clinic selection before enabling confirm.
3. Data source for appointment history/recommended follow-up sections shown in wireframe: implement static placeholders now unless backend endpoints are provided.