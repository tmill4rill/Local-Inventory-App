# LocalPick

Shop it online. Go get it in person.

A mobile app (iOS / Android / web, built with Expo + React Native) for **high-end fashion that is on the
shelves of boutiques and department stores near you**. It works like a personal stylist, after the Alta app:
it suggests outfits for your day, but builds them only from pieces you can go and pick up in person, ideally
all from one store.

## What's in it

| Idea | How it works |
| --- | --- |
| **Today** | A week strip of your planned looks, the day's weather, and suggested looks for work, dinner, weekend and events, built from nearby stock. Looks you can collect in one stop say so. Save a look to any day, or reserve every piece for pickup in one tap. |
| **Look builder** | Dark outfit editor (after Alta's): pick a piece per slot from nearby stock or your closet, hide slots, choose the day, then save or reserve. "Style this item" on a product opens it around that piece. |
| **Stylist** | "How can I style you?" chat. Reads occasion, colours and budget from your message and answers with a look from nearby stock or from your closet. It runs on the device (keyword rules over the catalog), not a language model. |
| **Closet, Wishlist, Looks** | Picked-up pieces land in your closet automatically; "I own this" adds anything else. Heart pieces to keep them in the wishlist. |
| **Local-only inventory** | Shop shows only items stocked within your range (1-40 mi or km), with stock levels, range levels with item counts, and filters for category, store type, open now and pickup perks. |
| **Pickup first** | Reserve for pickup is free and primary; insured shipping is secondary. Hourly slots within store hours, a ticket-style pickup code, status tracking, and an invite to bring a friend. |

The catalog is 32 pieces from fictional houses (Maison Ardent, Calder & Wren, Okoro Studio, Sabine Roux,
Vell, Atelier Nord). Product photos were generated with Higgsfield (GPT Image 2.5) as unbranded packshots on
the same pale warm gray as the app's tiles, and are bundled in `assets/products/`.

## Run it

```bash
npm install
npx expo start          # scan the QR code with Expo Go, or press i / a / w
```

## Test it

```bash
npm run typecheck       # tsc
npm test                # unit tests: distance, radius, pickup slots, inventory, look building, stylist parsing

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
