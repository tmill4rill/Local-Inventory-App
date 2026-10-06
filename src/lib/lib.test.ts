import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceMiles, formatDistance } from './geo';
import { generateSlots, makePickupCode, isOpenNow } from './pickup';
import { availabilityFor, buildListings, withinRadius, stockAt } from './inventory';
import { getProduct, PRODUCTS } from '../data/products';
import { DAILY_OCCASIONS, planPickups, stylistReply, suggestDay, suggestLook } from './styling';
import { getStore, STORES } from '../data/stores';

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
  const dress = PRODUCTS.find((p) => p.category === 'Dresses')!;
  const jewelBox = STORES.find((s) => s.id === 'jewel-box')!;
  assert.equal(stockAt(dress, jewelBox), 0);
  const mason = STORES.find((s) => s.id === 'mason-vale')!;
  assert.equal(stockAt(PRODUCTS[0], mason), stockAt(PRODUCTS[0], mason));
});

test('brand boutiques only stock their own house', () => {
  for (const store of STORES.filter((s) => s.brand)) {
    for (const p of PRODUCTS) if (p.brand !== store.brand) assert.equal(stockAt(p, store), 0);
  }
});

test('radius filter narrows availability; shrinking the radius never adds stores', () => {
  const coat = PRODUCTS.find((p) => p.id === 'o-trench')!;
  const all = availabilityFor(coat, AUSTIN);
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
  const coat = PRODUCTS.find((p) => p.id === 'o-trench')!;
  const dept = withinRadius(availabilityFor(coat, AUSTIN), 40, { storeType: 'department' });
  assert.ok(dept.every((a) => a.store.type === 'department'));
});

test('suggested looks are complete outfits from stock within range', () => {
  for (const occasion of ['work', 'evening', 'weekend', 'event'] as const) {
    const look = suggestLook({ occasion, from: AUSTIN, radiusMi: 10, seed: '2026-10-06' });
    assert.ok(look, `no ${occasion} look`);
    const cats = look.items.map((id) => getProduct(id)!.category);
    assert.ok(cats.includes('Dresses') || (cats.includes('Tops') && cats.includes('Bottoms')), `${occasion}: ${cats}`);
    assert.ok(cats.includes('Shoes'));
    assert.equal(new Set(cats).size, cats.length, 'one piece per slot');
    for (const id of look.items) {
      assert.ok(withinRadius(availabilityFor(getProduct(id)!, AUSTIN), 10).length > 0, `${id} not nearby`);
      if (look.oneStop) assert.ok(stockAt(getProduct(id)!, getStore(look.oneStop)!) > 0, `${id} not at one-stop store`);
    }
  }
});

test('looks are stable for the same day and respect budget and anchors', () => {
  const a = suggestLook({ occasion: 'work', from: AUSTIN, radiusMi: 10, seed: 'd1' });
  const b = suggestLook({ occasion: 'work', from: AUSTIN, radiusMi: 10, seed: 'd1' });
  assert.deepEqual(a, b);
  const cheap = suggestLook({ occasion: 'weekend', from: AUSTIN, radiusMi: 40, seed: 'x', maxTotal: 4000 });
  if (cheap) assert.ok(cheap.total <= 4000);
  const styled = suggestLook({ occasion: 'evening', from: AUSTIN, radiusMi: 40, seed: 'y', anchor: ['d-slip'] });
  assert.ok(styled?.items.includes('d-slip'));
});

test('warm pieces stay out of warm-weather looks', () => {
  for (let i = 0; i < 20; i++) {
    const look = suggestLook({ occasion: 'work', from: AUSTIN, radiusMi: 40, seed: `w${i}`, cold: false });
    assert.ok(look && look.items.every((id) => !getProduct(id)!.warm));
  }
});

test('pickup planning covers every piece with few stops', () => {
  const items = ['o-trench', 't-poplin', 'b-denim', 's-loafer', 'g-tote'];
  const stops = planPickups(items, AUSTIN, 10);
  assert.deepEqual(stops.flatMap((s) => s.items).sort(), [...items].sort());
  assert.ok(stops.length <= 3);
});

test('stylist reads occasion, budget and mode', () => {
  const ctx = { from: AUSTIN, radiusMi: 40, cold: false, mode: 'nearby' as const, closet: [], seed: 's' };
  assert.equal(stylistReply('something for dinner', ctx).occasion, 'evening');
  assert.equal(stylistReply('client meeting tomorrow', ctx).occasion, 'work');
  const r = stylistReply('weekend look under $3k', ctx);
  if (r.look) assert.ok(r.look.total <= 3000);
  assert.match(stylistReply('work', { ...ctx, mode: 'closet' }).text, /closet/i);
});

test("a day's suggestions mostly avoid repeating pieces", () => {
  const day = suggestDay(DAILY_OCCASIONS, { from: AUSTIN, radiusMi: 10, seed: '2026-10-06' });
  const ids = day.flatMap((d) => d.look?.items ?? []);
  const repeats = ids.length - new Set(ids).size;
  assert.ok(repeats <= 3, `too many repeats across the day: ${repeats}`);
});
