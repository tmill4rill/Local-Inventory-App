import { PRODUCTS, type Product } from '../data/products';
import { STORES, STORE_TYPE_LABEL, type Store, type StoreType } from '../data/stores';
import { distanceMiles, type Coord } from './geo';

/** Deterministic string hash so mock stock stays stable between launches. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function eligible(product: Product, store: Store): boolean {
  if (!store.categories.includes(product.category)) return false;
  if (store.brand && product.brand !== store.brand) return false;
  return true;
}

/**
 * Mock inventory feed. A store only stocks categories it carries (brand stores only their
 * own brand), and roughly two thirds of eligible products are on its shelves. Each product
 * also has one deterministic "anchor" store that always has it, so nothing is unfindable.
 */
export function stockAt(product: Product, store: Store): number {
  if (!eligible(product, store)) return 0;
  const anchor = STORES.filter((s) => eligible(product, s)).sort(
    (a, b) => hash(`${product.id}#${a.id}`) - hash(`${product.id}#${b.id}`),
  )[0];
  const h = hash(`${product.id}@${store.id}`);
  if (anchor?.id !== store.id && h % 3 === 0) return 0;
  return 1 + ((h >>> 4) % 6);
}

export type StoreAvailability = {
  store: Store;
  distanceMi: number;
  stock: number;
};

export type AvailabilityFilter = { storeType?: StoreType | 'all' };

/** All stores stocking the product, nearest first — including ones outside the radius. */
export function availabilityFor(product: Product, from: Coord): StoreAvailability[] {
  return STORES.map((store) => ({
    store,
    distanceMi: distanceMiles(from, store.coord),
    stock: stockAt(product, store),
  }))
    .filter((a) => a.stock > 0)
    .sort((a, b) => a.distanceMi - b.distanceMi);
}

export function withinRadius(list: StoreAvailability[], radiusMi: number, filter: AvailabilityFilter = {}) {
  return list.filter(
    (a) => a.distanceMi <= radiusMi && (!filter.storeType || filter.storeType === 'all' || a.store.type === filter.storeType),
  );
}

export type ProductListing = {
  product: Product;
  inRadius: StoreAvailability[];
  /** Nearest store carrying it anywhere, so we can tell the user how far to extend. */
  nearestAnywhere?: StoreAvailability;
};

export function buildListings(from: Coord, radiusMi: number, filter: AvailabilityFilter = {}): ProductListing[] {
  return PRODUCTS.map((product) => {
    const all = availabilityFor(product, from);
    return { product, inRadius: withinRadius(all, radiusMi, filter), nearestAnywhere: all[0] };
  });
}

export const storeTypeLabel = (type: StoreType) => STORE_TYPE_LABEL[type];

export function productsAtStore(store: Store): Product[] {
  return PRODUCTS.filter((p) => stockAt(p, store) > 0);
}
