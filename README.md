# LocalPick

Shop it online. Go get it in person.

A mobile shopping app (iOS / Android / web, built with Expo + React Native) that shows **only inventory
on the shelves of stores near you**. Instead of shipping to a doorstep, the checkout nudges you to
*reserve online and pick up in person* — because the store visit is the experience: a stylist fitting, a
guided device setup, a shade match, a trail-pack fit.

## What's in the MVP

| Idea | How it works |
| --- | --- |
| **Local-only inventory** | Discover shows items stocked at stores within your range, nearest store first, with stock levels ("Only 2 left"). |
| **Set how far you'll go** | Pickup radius slider (1–40 mi, or km) on Discover and in *Me*. Items beyond it are hidden, with a one-tap "Extend to N mi" nudge. Filter by store type: mall, department store, brand store, specialty shop. |
| **Elevated in-store moment** | Every store has a signature experience, and many products have a "pickup perk" (free hemming, setup session, shade match…) shown on the product page and at checkout. |
| **Pickup, not shipping** | Reserve for pickup is the primary action and is free. Ship-to-me is available as the secondary option (+$7.99). Pick an hourly time slot within store hours. |
| **Pickup code** | Each order gets a ticket-style code (`LP-XXXXX`), directions, and a status tracker. |
| **Go with a friend** | After ordering, pick friends and send an invite (store, time, address, code) through the native share sheet — or the clipboard on web. |

## Run it

```bash
npm install
npx expo start          # scan the QR code with Expo Go, or press i / a / w
```

## Test it

```bash
npm run typecheck       # tsc
npm test                # unit tests: distance, radius filtering, pickup slots, inventory rules

npx expo export --platform web
node e2e/smoke.mjs [screenshotDir]   # drives the full journey in headless Chromium (phone viewport)
```

The e2e script expects Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; override with `CHROMIUM_PATH`.

## Project layout

```
app/                  expo-router screens (tabs: Discover, Stores, Cart, Pickups, Me; plus product, store, checkout, order)
src/data/             sample stores and products (fictional brands, Austin TX area)
src/lib/geo.ts        haversine distance, unit formatting
src/lib/inventory.ts  mock per-store stock feed + radius filtering
src/lib/pickup.ts     pickup time slots, open hours, pickup codes
src/lib/share.ts      friend-invite message + share sheet
src/state/AppState.tsx  settings, cart, orders — persisted with AsyncStorage
```

## What's mocked (and what a real version needs)

- **Inventory** is a deterministic sample feed in `src/lib/inventory.ts`. A real app needs store/POS inventory
  APIs or a retailer integration — the single seam to replace is `stockAt`.
- **Payments** are not taken; checkout is a demo. Plug in Stripe/Apple Pay at `app/checkout.tsx`.
- **Order status** is advanced by hand with the "Advance (demo)" button. A real app gets it from the store.
- **Friends** are a hard-coded list; invites go out as plain share text (`localpick://order/CODE` is a placeholder
  deep link, not yet handled). A real version needs accounts, contacts, and a shared "join this pickup" view.
- **Location** defaults to downtown Austin; "Use my current location" works but the sample stores are all in
  Central Texas.
- No backend, accounts, or push notifications yet.
