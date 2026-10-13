import type { ImageSourcePropType } from 'react-native';
import type { Category } from './stores';
import { PRODUCTS } from './products';

/**
 * Version B, "Chroma": every piece is a cut-out (background removed from the Higgsfield
 * packshot, 600px WebP with alpha) set on its category's colour block, so the catalog reads
 * as a field of colour rather than a wall of gray tiles.
 */
export const PRODUCT_IMAGES: Record<string, ImageSourcePropType> = {
  'a-belt': require('../../assets/cutouts/a-belt.webp'),
  'a-silk-scarf': require('../../assets/cutouts/a-silk-scarf.webp'),
  'a-sunglasses': require('../../assets/cutouts/a-sunglasses.webp'),
  'b-denim': require('../../assets/cutouts/b-denim.webp'),
  'b-leather-pant': require('../../assets/cutouts/b-leather-pant.webp'),
  'b-pleated-skirt': require('../../assets/cutouts/b-pleated-skirt.webp'),
  'b-wide-trouser': require('../../assets/cutouts/b-wide-trouser.webp'),
  'd-column': require('../../assets/cutouts/d-column.webp'),
  'd-knit-midi': require('../../assets/cutouts/d-knit-midi.webp'),
  'd-slip': require('../../assets/cutouts/d-slip.webp'),
  'g-clutch': require('../../assets/cutouts/g-clutch.webp'),
  'g-crescent': require('../../assets/cutouts/g-crescent.webp'),
  'g-top-handle': require('../../assets/cutouts/g-top-handle.webp'),
  'g-tote': require('../../assets/cutouts/g-tote.webp'),
  'j-chain': require('../../assets/cutouts/j-chain.webp'),
  'j-hoops': require('../../assets/cutouts/j-hoops.webp'),
  'j-pearls': require('../../assets/cutouts/j-pearls.webp'),
  'o-biker': require('../../assets/cutouts/o-biker.webp'),
  'o-blazer': require('../../assets/cutouts/o-blazer.webp'),
  'o-boucle': require('../../assets/cutouts/o-boucle.webp'),
  'o-cashmere-coat': require('../../assets/cutouts/o-cashmere-coat.webp'),
  'o-trench': require('../../assets/cutouts/o-trench.webp'),
  's-ankle-boot': require('../../assets/cutouts/s-ankle-boot.webp'),
  's-loafer': require('../../assets/cutouts/s-loafer.webp'),
  's-sandal': require('../../assets/cutouts/s-sandal.webp'),
  's-slingback': require('../../assets/cutouts/s-slingback.webp'),
  's-sneaker': require('../../assets/cutouts/s-sneaker.webp'),
  't-cable-knit': require('../../assets/cutouts/t-cable-knit.webp'),
  't-cashmere-turtle': require('../../assets/cutouts/t-cashmere-turtle.webp'),
  't-knit-tank': require('../../assets/cutouts/t-knit-tank.webp'),
  't-poplin': require('../../assets/cutouts/t-poplin.webp'),
  't-silk-blouse': require('../../assets/cutouts/t-silk-blouse.webp'),
};

/** Colour block per category. */
export const CATEGORY_COLOR: Record<Category, string> = {
  Outerwear: '#FF4A1C', // tomato
  Tops: '#FFB3D1', // blush
  Dresses: '#FFC21A', // sun
  Bottoms: '#D5FF3F', // lime
  Shoes: '#2B3CFE', // cobalt (matches the pump clip)
  Bags: '#A99BFF', // lilac
  Jewelry: '#0E0E0E', // ink, so gold and pearls glow
  Accessories: '#D5FF3F',
};

/** Photo for a product id; undefined means the UI shows the emoji instead. */
export const productImage = (id: string) => PRODUCT_IMAGES[id];

export const productColor = (id: string): string | undefined => {
  const p = PRODUCTS.find((x) => x.id === id);
  return p ? CATEGORY_COLOR[p.category] : undefined;
};

/** Reverse lookup so any ProductPhoto can paint its own block from just the image. */
const BY_IMAGE = new Map<unknown, string>(Object.entries(PRODUCT_IMAGES).map(([id, img]) => [img, productColor(id)!]));
export const photoColor = (image?: ImageSourcePropType) => (image ? BY_IMAGE.get(image) : undefined);

/** Ink or white, whichever reads on the block. */
export const onColor = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return l > 0.6 ? '#0E0E0E' : '#FFFFFF';
};
