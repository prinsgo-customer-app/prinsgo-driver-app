# PrinsGo Driver App — Phase 1

Built against the same `prinsgo-backend`, driver-side routes: `/api/driver/auth`, `/api/driver`,
`/api/driver/rides`, `/api/driver/parcels`.

## What's included
- Phone OTP login/registration (name, vehicle type, vehicle number)
- Dashboard: online/offline toggle, live location updates, nearby ride + parcel requests
- Ride flow: accept → arrived → start (customer OTP) → complete
- Parcel flow: accept → picked up → in transit → deliver (receiver OTP)
- Earnings screen (today/week/month + wallet balance)

## Important: new drivers need admin approval
A newly registered driver has `isApproved: false` and `documentStatus: 'pending'` by default.
They **cannot go online** until an admin approves them — this is enforced by the backend
(`toggleOnlineStatus` in `driverController.js`). So after registering a test driver, you'll need
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
