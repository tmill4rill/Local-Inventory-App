import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getProduct, SHIPPING_FEE } from '../data/products';
import type { Coord, DistanceUnit } from '../lib/geo';
import { makePickupCode } from '../lib/pickup';

export type Fulfillment = { type: 'pickup'; storeId: string } | { type: 'ship' };

export type CartLine = { id: string; productId: string; qty: number; fulfillment: Fulfillment };

export type OrderStatus = 'placed' | 'ready' | 'picked_up' | 'shipped';

export type Order = {
  id: string;
  code: string;
  createdAt: string;
  status: OrderStatus;
  fulfillment: Fulfillment;
  slotISO?: string;
  lines: { productId: string; qty: number; price: number }[];
  total: number;
  invited: string[];
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Being prepared',
  ready: 'Ready for pickup',
  picked_up: 'Picked up',
  shipped: 'Shipped',
};

export type Place = { label: string; coord: Coord };

export const DEFAULT_PLACE: Place = { label: 'Downtown Austin', coord: { lat: 30.2672, lng: -97.7431 } };

export const FRIENDS = [
  { id: 'maya', name: 'Maya', emoji: '🧑🏽‍🎤' },
  { id: 'jordan', name: 'Jordan', emoji: '🧑🏻‍💻' },
  { id: 'sam', name: 'Sam', emoji: '🧑🏿‍🍳' },
  { id: 'priya', name: 'Priya', emoji: '👩🏽‍🔬' },
  { id: 'leo', name: 'Leo', emoji: '🧑🏼‍🎨' },
];

type Persisted = {
  radiusMi: number;
  unit: DistanceUnit;
  place: Place;
  cart: CartLine[];
  orders: Order[];
};

const INITIAL: Persisted = { radiusMi: 10, unit: 'mi', place: DEFAULT_PLACE, cart: [], orders: [] };
const STORAGE_KEY = 'localpick:v1';

export type PlaceOrderInput = {
  groups: { fulfillment: Fulfillment; slotISO?: string; lines: CartLine[] }[];
};

type Ctx = Persisted & {
  ready: boolean;
  cartCount: number;
  setRadiusMi: (mi: number) => void;
  setUnit: (u: DistanceUnit) => void;
  setPlace: (p: Place) => void;
  addToCart: (productId: string, fulfillment: Fulfillment, qty?: number) => void;
  setQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  placeOrders: (input: PlaceOrderInput) => Order[];
  toggleInvite: (orderId: string, friendId: string) => void;
  advanceOrder: (orderId: string) => void;
  resetDemo: () => void;
};

const AppContext = createContext<Ctx | null>(null);

const sameFulfillment = (a: Fulfillment, b: Fulfillment) =>
  a.type === b.type && (a.type === 'ship' || (b.type === 'pickup' && a.storeId === b.storeId));

const uid = () => Math.random().toString(36).slice(2, 10);

export function lineTotal(line: { productId: string; qty: number }): number {
  return (getProduct(line.productId)?.price ?? 0) * line.qty;
}

export function groupTotal(fulfillment: Fulfillment, lines: { productId: string; qty: number }[]): number {
  const items = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  return items + (fulfillment.type === 'ship' ? SHIPPING_FEE : 0);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(INITIAL);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...INITIAL, ...(JSON.parse(raw) as Partial<Persisted>) });
      } catch {
        // Corrupt or unavailable storage: start fresh.
      } finally {
        hydrated.current = true;
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const patch = useCallback((fn: (s: Persisted) => Persisted) => setState(fn), []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      cartCount: state.cart.reduce((n, l) => n + l.qty, 0),
      setRadiusMi: (radiusMi) => patch((s) => ({ ...s, radiusMi })),
      setUnit: (unit) => patch((s) => ({ ...s, unit })),
      setPlace: (place) => patch((s) => ({ ...s, place })),
      addToCart: (productId, fulfillment, qty = 1) =>
        patch((s) => {
          const existing = s.cart.find((l) => l.productId === productId && sameFulfillment(l.fulfillment, fulfillment));
          const cart = existing
            ? s.cart.map((l) => (l === existing ? { ...l, qty: Math.min(9, l.qty + qty) } : l))
            : [...s.cart, { id: uid(), productId, qty, fulfillment }];
          return { ...s, cart };
        }),
      setQty: (lineId, qty) =>
        patch((s) => ({
          ...s,
          cart: qty <= 0 ? s.cart.filter((l) => l.id !== lineId) : s.cart.map((l) => (l.id === lineId ? { ...l, qty: Math.min(9, qty) } : l)),
        })),
      removeLine: (lineId) => patch((s) => ({ ...s, cart: s.cart.filter((l) => l.id !== lineId) })),
      placeOrders: ({ groups }) => {
        const orders: Order[] = groups.map((g) => ({
          id: uid(),
          code: makePickupCode(),
          createdAt: new Date().toISOString(),
          status: g.fulfillment.type === 'ship' ? 'shipped' : 'placed',
          fulfillment: g.fulfillment,
          slotISO: g.slotISO,
          lines: g.lines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            price: getProduct(l.productId)?.price ?? 0,
          })),
          total: groupTotal(g.fulfillment, g.lines),
          invited: [],
        }));
        const orderedIds = new Set(groups.flatMap((g) => g.lines.map((l) => l.id)));
        patch((s) => ({
          ...s,
          cart: s.cart.filter((l) => !orderedIds.has(l.id)),
          orders: [...orders, ...s.orders],
        }));
        return orders;
      },
      toggleInvite: (orderId, friendId) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, invited: o.invited.includes(friendId) ? o.invited.filter((f) => f !== friendId) : [...o.invited, friendId] }
              : o,
          ),
        })),
      advanceOrder: (orderId) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId && o.status === 'placed' ? { ...o, status: 'ready' } : o.id === orderId && o.status === 'ready' ? { ...o, status: 'picked_up' } : o,
          ),
        })),
      resetDemo: () => setState({ ...INITIAL }),
    }),
    [state, ready, patch],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
