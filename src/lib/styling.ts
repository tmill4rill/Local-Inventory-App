import { getProduct, PRODUCTS, type Occasion, type Product } from '../data/products';
import { getStore, type Category } from '../data/stores';
import type { Coord } from './geo';
import { availabilityFor, withinRadius, type StoreAvailability } from './inventory';

/* ---------- small deterministic helpers ---------- */

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded PRNG (mulberry32) so a day's suggestions stay put until something changes. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(list: T[], r: () => number): T | undefined => (list.length ? list[Math.floor(r() * list.length)] : undefined);

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Sunday-to-Saturday week containing the date. */
export function weekOf(d: Date): Date[] {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

/* ---------- weather (mock, deterministic per day and place) ---------- */

export type Weather = { tempF: number; highF: number; lowF: number; icon: string; label: string };

export function weatherFor(day: string, coord: Coord): Weather {
  const h = hash(`${day}|${coord.lat.toFixed(2)},${coord.lng.toFixed(2)}`);
  const month = Number(day.slice(5, 7));
  // Rough central-Texas seasonal curve; good enough for a demo forecast.
  const base = [58, 62, 70, 78, 85, 92, 96, 96, 90, 81, 70, 61][month - 1] ?? 75;
  const highF = base + ((h % 11) - 5);
  const lowF = highF - 14 - ((h >>> 4) % 6);
  const tempF = Math.round((highF + lowF) / 2 + 3);
  const sky = (h >>> 8) % 4;
  const icon = ['sunny-outline', 'partly-sunny-outline', 'cloudy-outline', 'rainy-outline'][sky];
  const label = ['Sunny', 'Partly cloudy', 'Cloudy', 'Showers'][sky];
  return { tempF, highF, lowF, icon, label };
}

/** Cold enough that the stylist reaches for coats and knits. */
export const isCold = (w: Weather) => w.lowF < 58 || w.label === 'Showers';

/* ---------- looks ---------- */

export type OccasionPreset = { key: Occasion; title: string; dress: string };

export const DAILY_OCCASIONS: OccasionPreset[] = [
  { key: 'work', title: 'Work Presentation', dress: 'Business professional' },
  { key: 'evening', title: 'Dinner Out', dress: 'Evening' },
  { key: 'weekend', title: 'Weekend Errands', dress: 'Casual' },
  { key: 'event', title: 'Gallery Opening', dress: 'Cocktail' },
];

/** Display order for a look, top to bottom, as in a collage. */
export const SLOT_ORDER: Category[] = ['Outerwear', 'Tops', 'Dresses', 'Bottoms', 'Shoes', 'Bags', 'Jewelry', 'Accessories'];

export type SuggestedLook = {
  /** Product ids in slot order. */
  items: string[];
  /** Store that has every piece, when one does: the whole look in a single stop. */
  oneStop?: string;
  total: number;
};

export type LookRequest = {
  occasion: Occasion;
  from: Coord;
  radiusMi: number;
  seed: string;
  cold?: boolean;
  maxTotal?: number;
  colors?: string[];
  /** Must include these pieces (e.g. "Style this item"). */
  anchor?: string[];
  /** Restrict to these ids (e.g. closet-only styling). Skips the stock requirement. */
  onlyFrom?: string[];
  /** Pieces already used elsewhere (e.g. earlier suggestions today); used only if nothing else fits. */
  avoid?: string[];
};

type Pool = { product: Product; stock: StoreAvailability[] };

function poolFor(req: LookRequest): Pool[] {
  const ids = req.onlyFrom ? new Set(req.onlyFrom) : undefined;
  return PRODUCTS.filter((p) => !ids || ids.has(p.id))
    .map((product) => ({ product, stock: req.onlyFrom ? [] : withinRadius(availabilityFor(product, req.from), req.radiusMi) }))
    .filter((p) => req.onlyFrom || p.stock.length > 0);
}

function fits(p: Product, req: LookRequest): boolean {
  if (!p.occasions.includes(req.occasion)) return false;
  if (!req.cold && p.warm) return false;
  return true;
}

function colorScore(p: Product, colors?: string[]): number {
  if (!colors?.length) return 0;
  return colors.some((c) => p.color.toLowerCase().includes(c)) ? 1 : 0;
}

/** Slots a look for this occasion needs, given a seeded coin flip for dress vs separates. */
function plan(req: LookRequest, r: () => number, anchors: Product[]): Category[] {
  const anchorCats = new Set(anchors.map((a) => a.category));
  const dress = anchorCats.has('Dresses')
    ? true
    : anchorCats.has('Tops') || anchorCats.has('Bottoms')
      ? false
      : req.occasion === 'event'
        ? r() < 0.8
        : req.occasion === 'evening'
          ? r() < 0.45
          : req.occasion === 'work'
            ? r() < 0.2
            : r() < 0.1;
  const slots: Category[] = dress ? ['Dresses'] : ['Tops', 'Bottoms'];
  slots.push('Shoes', 'Bags');
  if (req.cold || req.occasion === 'work' || anchorCats.has('Outerwear') || r() < 0.3) slots.push('Outerwear');
  if (anchorCats.has('Jewelry') || r() < 0.75) slots.push('Jewelry');
  if (anchorCats.has('Accessories') || (req.occasion !== 'event' && r() < 0.4)) slots.push('Accessories');
  return slots;
}

function order(ids: string[]): string[] {
  return [...ids].sort(
    (a, b) => SLOT_ORDER.indexOf(getProduct(a)!.category) - SLOT_ORDER.indexOf(getProduct(b)!.category),
  );
}

const sum = (ids: string[]) => ids.reduce((n, id) => n + (getProduct(id)?.price ?? 0), 0);

/**
 * Builds a look from what is on shelves within range. It first tries to fill every slot from
 * a single store so the whole outfit is one pickup, then falls back to nearest stock per piece.
 */
export function suggestLook(req: LookRequest): SuggestedLook | undefined {
  const pool = poolFor(req);
  const anchors = (req.anchor ?? []).map(getProduct).filter((p): p is Product => !!p);
  for (let attempt = 0; attempt < 12; attempt++) {
    const r = rng(hash(`${req.seed}#${req.occasion}#${attempt}`));
    const slots = plan(req, r, anchors);
    const chosen = new Map<Category, Product>();
    for (const a of anchors) chosen.set(a.category, a);

    const candidates = (cat: Category, storeId?: string) =>
      pool
        .filter((c) => c.product.category === cat && fits(c.product, req))
        .filter((c) => !storeId || c.stock.some((s) => s.store.id === storeId))
        .sort((a, b) => colorScore(b.product, req.colors) - colorScore(a.product, req.colors));

    const fill = (storeId?: string): Map<Category, Product> | undefined => {
      const look = new Map(chosen);
      for (const cat of slots) {
        if (look.has(cat)) continue;
        const all = candidates(cat, storeId);
        const fresh = all.filter((c) => !req.avoid?.includes(c.product.id));
        const list = fresh.length ? fresh : all;
        const top = list.filter((c) => colorScore(c.product, req.colors) === colorScore(list[0]?.product ?? ({} as Product), req.colors));
        const choice = pick(top.length ? top : list, r);
        if (!choice) {
          // Optional slots can be dropped; the core of the outfit cannot.
          if (['Outerwear', 'Jewelry', 'Accessories'].includes(cat)) continue;
          return undefined;
        }
        look.set(cat, choice.product);
      }
      return look;
    };

    // One-stop first: stores within range that stock every anchor.
    const storeIds = [
      ...new Set(pool.flatMap((p) => p.stock.map((s) => s.store.id))),
    ].filter((id) => anchors.every((a) => pool.find((p) => p.product.id === a.id)?.stock.some((s) => s.store.id === id)));
    const shuffled = storeIds.map((id) => ({ id, k: r() })).sort((a, b) => a.k - b.k).map((x) => x.id);

    let result: { look: Map<Category, Product>; oneStop?: string } | undefined;
    for (const id of shuffled) {
      const look = fill(id);
      if (look && look.size >= 4) {
        result = { look, oneStop: id };
        break;
      }
    }
    if (!result) {
      const look = fill();
      if (look) result = { look };
    }
    if (!result) continue;

    const items = order([...result.look.values()].map((p) => p.id));
    const total = sum(items);
    if (req.maxTotal && total > req.maxTotal) continue;
    return { items, oneStop: req.onlyFrom ? undefined : result.oneStop, total };
  }
  return undefined;
}

/**
 * Chooses a pickup store for each piece, keeping the number of stops low: repeatedly take the
 * store that covers the most remaining pieces, nearest first on ties.
 */
export function planPickups(items: string[], from: Coord, radiusMi: number): { storeId: string; items: string[] }[] {
  const avail = new Map(items.map((id) => [id, availabilityFor(getProduct(id)!, from)]));
  const remaining = new Set(items);
  const stops: { storeId: string; items: string[] }[] = [];
  while (remaining.size) {
    const tally = new Map<string, { n: number; d: number; items: string[] }>();
    for (const id of remaining) {
      const list = avail.get(id) ?? [];
      const inRange = withinRadius(list, radiusMi);
      for (const a of inRange.length ? inRange : list.slice(0, 1)) {
        const t = tally.get(a.store.id) ?? { n: 0, d: a.distanceMi, items: [] };
        t.n++;
        t.items.push(id);
        tally.set(a.store.id, t);
      }
    }
    const best = [...tally.entries()].sort((a, b) => b[1].n - a[1].n || a[1].d - b[1].d)[0];
    if (!best) break;
    stops.push({ storeId: best[0], items: best[1].items });
    best[1].items.forEach((id) => remaining.delete(id));
  }
  return stops;
}

/** One look per occasion for a day, each avoiding pieces the earlier ones already used. */
export function suggestDay(occasions: OccasionPreset[], base: Omit<LookRequest, 'occasion'>) {
  const used: string[] = [];
  return occasions.map((o) => {
    const look = suggestLook({ ...base, occasion: o.key, avoid: [...(base.avoid ?? []), ...used] });
    if (look) used.push(...look.items);
    return { ...o, look };
  });
}

export const storeName = (id?: string) => (id ? getStore(id)?.name : undefined);

/* ---------- stylist chat (local, keyword-based) ---------- */

const OCCASION_WORDS: [Occasion, RegExp][] = [
  ['event', /\b(wedding|gala|party|opening|event|cocktail|black[- ]tie|formal)\b/i],
  ['evening', /\b(dinner|date|drinks|night|evening|theat(er|re)|concert)\b/i],
  ['work', /\b(work|office|meeting|interview|presentation|business|client|professional)\b/i],
  ['weekend', /\b(weekend|brunch|casual|errands|coffee|travel|airport|day off|market)\b/i],
];

const COLOR_WORDS = ['black', 'white', 'ivory', 'cream', 'camel', 'stone', 'gold', 'brown', 'chocolate', 'charcoal', 'champagne', 'indigo', 'rust', 'cognac', 'butter', 'pearl', 'oatmeal'];

export type StylistMode = 'nearby' | 'closet';

export type StylistReply = { text: string; look?: SuggestedLook; occasion: Occasion };

function parseBudget(text: string): number | undefined {
  const m = text.match(/\$?\s?(\d+(?:[.,]\d+)?)\s?(k)?\b/i);
  if (!m || !/(under|below|less than|max|budget|\$)/i.test(text)) return undefined;
  const n = Number(m[1].replace(',', ''));
  return m[2] ? n * 1000 : n;
}

export function stylistReply(
  text: string,
  ctx: { from: Coord; radiusMi: number; cold: boolean; mode: StylistMode; closet: string[]; seed: string },
): StylistReply {
  const occasion = OCCASION_WORDS.find(([, re]) => re.test(text))?.[0] ?? 'work';
  const cold = /\b(cold|chilly|warm|cozy|winter|rain)\b/i.test(text) ? true : /\b(hot|summer|heat)\b/i.test(text) ? false : ctx.cold;
  const colors = COLOR_WORDS.filter((c) => new RegExp(`\\b${c}\\b`, 'i').test(text));
  const maxTotal = parseBudget(text);
  const named = PRODUCTS.filter((p) => text.toLowerCase().includes(p.name.toLowerCase())).map((p) => p.id);
  const base = { occasion, from: ctx.from, radiusMi: ctx.radiusMi, cold, colors, maxTotal, anchor: named, seed: `${ctx.seed}|${text}` };

  if (ctx.mode === 'closet') {
    if (ctx.closet.length < 3) {
      return { occasion, text: 'Your closet is a little light so far. Pick a few pieces up, or tap "I own this" on things you already have, and I can style from it.' };
    }
    const look = suggestLook({ ...base, maxTotal: undefined, onlyFrom: ctx.closet });
    return look
      ? { occasion, look, text: `Here is a ${occasionPhrase(occasion)} look from your closet.` }
      : { occasion, text: `I could not make a full ${occasionPhrase(occasion)} look from your closet yet. Try "Nearby" mode and I will fill the gaps from stores around you.` };
  }

  const look = suggestLook(base);
  if (!look) {
    return {
      occasion,
      text: maxTotal
        ? `Nothing within ${ctx.radiusMi} mi comes in under $${maxTotal.toLocaleString()} for that. Try a higher budget or a wider range.`
        : `I could not find a full look within ${ctx.radiusMi} mi. Try widening your range.`,
    };
  }
  const where = look.oneStop ? `Everything is at ${storeName(look.oneStop)}, so it's one stop.` : 'It comes from a couple of stores nearby.';
  const budget = maxTotal ? ` Total $${look.total.toLocaleString()}, under your $${maxTotal.toLocaleString()}.` : '';
  return { occasion, look, text: `Here is a ${occasionPhrase(occasion)} look on shelves near you. ${where}${budget}` };
}

function occasionPhrase(o: Occasion): string {
  return { work: 'polished work', evening: 'dinner-ready', weekend: 'relaxed weekend', event: 'cocktail' }[o];
}
