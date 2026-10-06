import type { ImageSourcePropType } from 'react-native';

/**
 * Photoreal packshots generated with Higgsfield (GPT Image 2.5) on the same pale warm gray as
 * the app's tiles, after Alta's catalog. Bundled locally as 800x800 JPEGs.
 */
export const PRODUCT_IMAGES: Record<string, ImageSourcePropType> = {
  'o-cashmere-coat': require('../../assets/products/o-cashmere-coat.jpg'),
  'o-trench': require('../../assets/products/o-trench.jpg'),
  'o-biker': require('../../assets/products/o-biker.jpg'),
  'o-blazer': require('../../assets/products/o-blazer.jpg'),
  'o-boucle': require('../../assets/products/o-boucle.jpg'),
  't-silk-blouse': require('../../assets/products/t-silk-blouse.jpg'),
  't-cashmere-turtle': require('../../assets/products/t-cashmere-turtle.jpg'),
  't-poplin': require('../../assets/products/t-poplin.jpg'),
  't-knit-tank': require('../../assets/products/t-knit-tank.jpg'),
  't-cable-knit': require('../../assets/products/t-cable-knit.jpg'),
  'd-slip': require('../../assets/products/d-slip.jpg'),
  'd-column': require('../../assets/products/d-column.jpg'),
  'd-knit-midi': require('../../assets/products/d-knit-midi.jpg'),
  'b-wide-trouser': require('../../assets/products/b-wide-trouser.jpg'),
  'b-pleated-skirt': require('../../assets/products/b-pleated-skirt.jpg'),
  'b-denim': require('../../assets/products/b-denim.jpg'),
  'b-leather-pant': require('../../assets/products/b-leather-pant.jpg'),
  's-slingback': require('../../assets/products/s-slingback.jpg'),
  's-loafer': require('../../assets/products/s-loafer.jpg'),
  's-ankle-boot': require('../../assets/products/s-ankle-boot.jpg'),
  's-sneaker': require('../../assets/products/s-sneaker.jpg'),
  's-sandal': require('../../assets/products/s-sandal.jpg'),
  'g-top-handle': require('../../assets/products/g-top-handle.jpg'),
  'g-tote': require('../../assets/products/g-tote.jpg'),
  'g-crescent': require('../../assets/products/g-crescent.jpg'),
  'g-clutch': require('../../assets/products/g-clutch.jpg'),
  'j-hoops': require('../../assets/products/j-hoops.jpg'),
  'j-pearls': require('../../assets/products/j-pearls.jpg'),
  'j-chain': require('../../assets/products/j-chain.jpg'),
  'a-sunglasses': require('../../assets/products/a-sunglasses.jpg'),
  'a-silk-scarf': require('../../assets/products/a-silk-scarf.jpg'),
  'a-belt': require('../../assets/products/a-belt.jpg'),
};

/** Photo for a product id; undefined means the UI shows the emoji instead. */
export const productImage = (id: string) => PRODUCT_IMAGES[id];
