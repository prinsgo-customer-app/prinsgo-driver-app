# PrinsGo Partner App — Phase 1

Built against the same `prinsgo-backend`, partner-side routes: `/api/driver/auth`, `/api/driver`,
`/api/driver/rides`, `/api/driver/parcels`.

## What's included
- Phone OTP login/registration (name, vehicle type, vehicle number)
- Dashboard: online/offline toggle, live location updates, nearby ride + parcel requests
- Ride flow: accept → arrived → start (customer OTP) → complete
- Parcel flow: accept → picked up → in transit → deliver (receiver OTP)
- Earnings screen (today/week/month + wallet balance)

## Missing Backend Dependencies
The backend endpoints required for the Worker / Service Partner integration are currently missing or malfunctioning:
- `GET /workers/jobs` (Returns 400 Resource not found - invalid ID)
- `GET /workers/me` (Returns 400 Resource not found - invalid ID)
- `POST /workers/jobs/:id/accept` (Not implemented)
- `POST /workers/jobs/:id/reject` (Not implemented)

As per the NON-NEGOTIABLE rules:
> 13. If the real backend endpoint is missing, DO NOT create a fake workaround. Clearly report the missing backend dependency.
> 30. If something cannot be completed because a real backend, database, API, credential, repository or dependency is missing, STOP at that point and clearly report exactly what is missing.

Therefore, the Worker Service onboarding and job lifecycle UI could not be built as it strictly relies on real production data from the backend, which is missing. The app has been successfully rebranded to "PrinsGo Partner" in preparation for these endpoints.

## Important: new partners need admin approval
A newly registered partner has `isApproved: false` and `documentStatus: 'pending'` by default.
They **cannot go online** until an admin approves them — this is enforced by the backend
(`toggleOnlineStatus` in `driverController.js`). So after registering a test partner, you'll need
to manually flip `isApproved: true` and `documentStatus: 'approved'` in MongoDB (Atlas UI) to test
the online/dashboard flow until the Admin Panel is built.

## Setup (same as customer app)
```bash
cd prinsgo-driver
npm install
npx expo start --clear
```
Or build a standalone APK the same way as the customer app:
```bash
eas build -p android --profile preview
```
(You'll likely need `eas build:configure` once inside this new project folder first.)

## Known limitation
Like the customer app, this shares the same Google Maps/Places API key — currently blocked by a
billing setup issue on the Google Cloud project. Nearby-request distance sorting still works fine
(uses haversine math, not Google APIs), but ride fare estimates on the customer side won't work
until billing is fixed.

## Not yet built (later)
- Document upload screen (Cloudinary) for KYC
- Ride/parcel history list
- Profile/settings screen
- Push notifications for new requests (currently polls every 8s)
- Worker flow (pending backend)
