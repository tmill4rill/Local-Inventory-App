import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceMiles, formatDistance } from './geo';
import { generateSlots, makePickupCode, isOpenNow } from './pickup';
import { availabilityFor, buildListings, withinRadius, stockAt } from './inventory';
import { PRODUCTS } from '../data/products';
import { STORES } from '../data/stores';

const AUSTIN = { lat: 30.2672, lng: -97.7431 };

test('haversine: Austin to Dallas is roughly 182 miles', () => {
  const d = distanceMiles(AUSTIN, { lat: 32.7767, lng: -96.797 });
  assert.ok(d > 175 && d < 190, `got ${d}`);
});

test('haversine: same point is zero', () => {
  assert.equal(distanceMiles(AUSTIN, AUSTIN), 0);
});

test('formatDistance converts units and rounds', () => {
  assert.equal(formatDistance(0.84, 'mi'), '0.8 mi');
  assert.equal(formatDistance(10, 'km'), '16 km');
});

test('slots respect lead time and closing hour', () => {
  const now = new Date(2026, 9, 5, 17, 30); // 5:30pm, store closes 8pm
  const days = generateSlots({ open: 10, close: 20 }, now, 2, 2);
  // earliest today is 7:30pm -> first whole hour slot at/after is 8pm, which is closed, so none today
  assert.equal(days[0].label, 'Tomorrow');
  assert.equal(days[0].slots[0].label, '10am');
  assert.equal(days[0].slots.at(-1)?.label, '7pm');
});

test('slots today start after lead time', () => {
  const now = new Date(2026, 9, 5, 10, 10);
  const days = generateSlots({ open: 10, close: 20 }, now, 1, 2);
  assert.equal(days[0].label, 'Today');
  assert.equal(days[0].slots[0].label, '1pm'); // 12:10 -> next whole hour
});

test('isOpenNow', () => {
  assert.ok(isOpenNow({ open: 10, close: 20 }, new Date(2026, 9, 5, 12)));
  assert.ok(!isOpenNow({ open: 10, close: 20 }, new Date(2026, 9, 5, 20)));
});

test('pickup codes look right and avoid ambiguous characters', () => {
  for (let i = 0; i < 200; i++) {
    assert.match(makePickupCode(), /^LP-[A-HJKMNP-Z2-9]{5}$/);
  }
});

test('stock is deterministic and category-bound', () => {
  const tech = PRODUCTS.find((p) => p.category === 'Tech')!;
  const lumen = STORES.find((s) => s.id === 'lumen-atelier')!;
  assert.equal(stockAt(tech, lumen), 0);
  const home = STORES.find((s) => s.id === 'mason-vale')!;
  assert.equal(stockAt(PRODUCTS[0], home), stockAt(PRODUCTS[0], home));
});

test('brand stores only stock their own brand', () => {
  const studio = STORES.find((s) => s.id === 'orchard-domain')!;
  for (const p of PRODUCTS) {
    if (p.brand !== 'Orchard') assert.equal(stockAt(p, studio), 0);
  }
});

test('radius filter narrows availability; shrinking the radius never adds stores', () => {
  const laptop = PRODUCTS.find((p) => p.id === 'p-laptop')!;
  const all = availabilityFor(laptop, AUSTIN);
  const small = withinRadius(all, 5);
  const big = withinRadius(all, 40);
  assert.ok(small.length <= big.length);
  assert.ok(small.every((a) => a.distanceMi <= 5));
});

test('every product is findable somewhere within 40 miles of downtown', () => {
  const listings = buildListings(AUSTIN, 40);
  const missing = listings.filter((l) => l.inRadius.length === 0).map((l) => l.product.id);
  assert.deepEqual(missing, []);
});

test('store-type filter limits results', () => {
  const laptop = PRODUCTS.find((p) => p.id === 'p-laptop')!;
  const brand = withinRadius(availabilityFor(laptop, AUSTIN), 40, { storeType: 'brand' });
  assert.ok(brand.every((a) => a.store.type === 'brand'));
});
