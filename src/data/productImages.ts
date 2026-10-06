import type { ImageSourcePropType } from 'react-native';

/**
 * Photoreal product shots generated with Higgsfield (GPT Image 2.5), shot on black to sit on the
 * app's dark floor. Bundled locally (800×800 JPEG) so they work offline and don't depend on a CDN.
 */
export const PRODUCT_IMAGES: Record<string, ImageSourcePropType> = {
  'p-laptop': require('../../assets/products/p-laptop.jpg'),
  'p-phone': require('../../assets/products/p-phone.jpg'),
  'p-earbuds': require('../../assets/products/p-earbuds.jpg'),
  'p-watch': require('../../assets/products/p-watch.jpg'),
  'p-speaker': require('../../assets/products/p-speaker.jpg'),
  'p-trench': require('../../assets/products/p-trench.jpg'),
  'p-sneakers': require('../../assets/products/p-sneakers.jpg'),
  'p-dress': require('../../assets/products/p-dress.jpg'),
  'p-bag': require('../../assets/products/p-bag.jpg'),
  'p-sunglasses': require('../../assets/products/p-sunglasses.jpg'),
  'p-serum': require('../../assets/products/p-serum.jpg'),
  'p-foundation': require('../../assets/products/p-foundation.jpg'),
  'p-perfume': require('../../assets/products/p-perfume.jpg'),
  'p-diffuser': require('../../assets/products/p-diffuser.jpg'),
  'p-blanket': require('../../assets/products/p-blanket.jpg'),
  'p-mugs': require('../../assets/products/p-mugs.jpg'),
  'p-lamp': require('../../assets/products/p-lamp.jpg'),
  'p-tent': require('../../assets/products/p-tent.jpg'),
  'p-pack': require('../../assets/products/p-pack.jpg'),
  'p-boots': require('../../assets/products/p-boots.jpg'),
  'p-bottle': require('../../assets/products/p-bottle.jpg'),
  'p-candle': require('../../assets/products/p-candle.jpg'),
  'p-board': require('../../assets/products/p-board.jpg'),
  'p-plant': require('../../assets/products/p-plant.jpg'),
};

/** Photo for a product id; undefined means the UI shows the emoji instead. */
export const productImage = (id: string) => PRODUCT_IMAGES[id];
