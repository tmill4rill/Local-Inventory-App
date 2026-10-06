import { useCallback } from 'react';
import { planPickups, storeName } from '../lib/styling';
import { useApp } from './AppState';

/**
 * Puts every piece of a look in the bag for pickup, grouped into as few store stops as possible.
 * Returns a sentence describing where everything will be.
 */
export function useReserveLook() {
  const { addToCart, place, radiusMi, cart } = useApp();
  return useCallback(
    (items: string[]) => {
      const already = new Set(cart.map((l) => l.productId));
      const todo = items.filter((id) => !already.has(id));
      const stops = planPickups(todo, place.coord, radiusMi);
      for (const s of stops) for (const id of s.items) addToCart(id, { type: 'pickup', storeId: s.storeId });
      const skipped = items.length - todo.length;
      const where =
        stops.length === 0
          ? 'Everything was already in your bag'
          : stops.length === 1
            ? `${todo.length} ${todo.length === 1 ? 'piece' : 'pieces'} reserved at ${storeName(stops[0].storeId)}`
            : `${todo.length} pieces reserved across ${stops.length} stores`;
      return skipped && stops.length ? `${where} (${skipped} already in your bag)` : where;
    },
    [addToCart, place, radiusMi, cart],
  );
}
