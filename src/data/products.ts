import type { Category } from './stores';

export type Occasion = 'work' | 'evening' | 'weekend' | 'event';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  color: string;
  price: number;
  /** Original price when the piece is marked down. */
  compareAt?: number;
  /** Occasions the stylist reaches for this piece. */
  occasions: Occasion[];
  /** Pieces that only make sense when it's cold, e.g. heavy coats and knits. */
  warm?: boolean;
  emoji: string;
  tint: string;
  description: string;
  /** What the in-store handoff adds for this item, shown on the product page. */
  pickupPerk?: string;
};

export const CATEGORIES: Category[] = ['Outerwear', 'Tops', 'Dresses', 'Bottoms', 'Shoes', 'Bags', 'Jewelry', 'Accessories'];

export const OCCASION_LABEL: Record<Occasion, string> = {
  work: 'Work',
  evening: 'Evening',
  weekend: 'Weekend',
  event: 'Event',
};

export const SHIPPING_FEE = 25;

const W: Occasion[] = ['work'];
const E: Occasion[] = ['evening'];
const K: Occasion[] = ['weekend'];

export const PRODUCTS: Product[] = [
  // Outerwear
  { id: 'o-cashmere-coat', name: 'Double-Faced Cashmere Coat', brand: 'Maison Ardent', category: 'Outerwear', color: 'Camel', price: 2890, occasions: [...W, ...E, ...K], warm: true, emoji: '🧥', tint: '#E8D9C3', description: 'Unlined double-faced cashmere with dropped shoulders and a long, easy line.', pickupPerk: 'Sleeves and hem marked in the fitting suite; finished within the week.' },
  { id: 'o-trench', name: 'Gabardine Trench', brand: 'Calder & Wren', category: 'Outerwear', color: 'Stone', price: 1950, occasions: [...W, ...K], emoji: '🧥', tint: '#E6DCC8', description: 'Cotton gabardine trench with storm flap, horn buttons and a self-tie belt.', pickupPerk: 'Try it over what you are wearing; free sleeve hemming.' },
  { id: 'o-biker', name: 'Lambskin Biker Jacket', brand: 'Okoro Studio', category: 'Outerwear', color: 'Black', price: 3200, compareAt: 3900, occasions: [...E, ...K], emoji: '🧥', tint: '#D9D9D9', description: 'Buttery lambskin with an asymmetric zip, belted waist and silver hardware.', pickupPerk: 'Leather care kit and a fit check with the studio tailor.' },
  { id: 'o-blazer', name: 'Double-Breasted Wool Blazer', brand: 'Sabine Roux', category: 'Outerwear', color: 'Black', price: 1480, occasions: [...W, ...E], emoji: '🧥', tint: '#DADADA', description: 'Sharp-shouldered wool blazer with peak lapels and a nipped waist.', pickupPerk: 'Sleeve length adjusted on the spot.' },
  { id: 'o-boucle', name: 'Bouclé Tweed Jacket', brand: 'Vell', category: 'Outerwear', color: 'Ivory', price: 2350, occasions: [...W, 'event'], emoji: '🧥', tint: '#EFEAE0', description: 'Cropped bouclé tweed jacket with fringed edges and gilt buttons.' },
  // Tops
  { id: 't-silk-blouse', name: 'Silk Charmeuse Blouse', brand: 'Vell', category: 'Tops', color: 'Ivory', price: 690, occasions: [...W, ...E], emoji: '👚', tint: '#F1ECE2', description: 'Fluid silk charmeuse with a soft collar and covered buttons.' },
  { id: 't-cashmere-turtle', name: 'Cashmere Turtleneck', brand: 'Atelier Nord', category: 'Tops', color: 'Black', price: 890, occasions: [...W, ...E, ...K], warm: true, emoji: '🧶', tint: '#DCDCDC', description: 'Fine-gauge cashmere turtleneck that layers under everything.' },
  { id: 't-poplin', name: 'Cotton Poplin Shirt', brand: 'Calder & Wren', category: 'Tops', color: 'White', price: 420, occasions: [...W, ...K], emoji: '👔', tint: '#F2F2F2', description: 'Crisp oversized poplin shirt with a curved hem.' },
  { id: 't-knit-tank', name: 'Ribbed Knit Tank', brand: 'Okoro Studio', category: 'Tops', color: 'Cream', price: 310, occasions: [...K, ...E], emoji: '🎽', tint: '#F3EEE3', description: 'Close-fitting rib tank in a silk-cotton blend.' },
  { id: 't-cable-knit', name: 'Cable Cashmere Crewneck', brand: 'Atelier Nord', category: 'Tops', color: 'Oatmeal', price: 1150, occasions: [...K, ...W], warm: true, emoji: '🧶', tint: '#E9E1D3', description: 'Chunky cable-knit cashmere with a relaxed body.', pickupPerk: 'Feel three cashmere weights side by side before you choose.' },
  // Dresses
  { id: 'd-slip', name: 'Bias-Cut Silk Slip Dress', brand: 'Sabine Roux', category: 'Dresses', color: 'Champagne', price: 1290, occasions: [...E, 'event'], emoji: '👗', tint: '#EFE4D2', description: 'Bias-cut silk satin with fine straps and a midi hem.', pickupPerk: 'Hem pinned to your heel height in the fitting suite.' },
  { id: 'd-column', name: 'Crepe Column Gown', brand: 'Maison Ardent', category: 'Dresses', color: 'Black', price: 3400, occasions: ['event', ...E], emoji: '👗', tint: '#D6D6D6', description: 'Floor-length crepe column with a sculpted one-shoulder neckline.', pickupPerk: 'Private fitting with a stylist and complimentary steaming.' },
  { id: 'd-knit-midi', name: 'Fine-Knit Midi Dress', brand: 'Vell', category: 'Dresses', color: 'Chocolate', price: 980, compareAt: 1250, occasions: [...W, ...K], warm: true, emoji: '👗', tint: '#E2D5C8', description: 'Body-skimming fine knit with long sleeves and a funnel neck.' },
  // Bottoms
  { id: 'b-wide-trouser', name: 'Wool Wide-Leg Trousers', brand: 'Sabine Roux', category: 'Bottoms', color: 'Charcoal', price: 780, occasions: [...W, ...E], emoji: '👖', tint: '#DEDEDE', description: 'High-waisted wool trousers with front pleats and a pooling hem.', pickupPerk: 'Hemmed to your shoes while you wait.' },
  { id: 'b-pleated-skirt', name: 'Pleated Satin Midi Skirt', brand: 'Vell', category: 'Bottoms', color: 'Black', price: 890, occasions: [...E, ...W], emoji: '👗', tint: '#D9D9D9', description: 'Knife-pleated satin midi skirt that moves when you walk.' },
  { id: 'b-denim', name: 'Straight-Leg Selvedge Jeans', brand: 'Okoro Studio', category: 'Bottoms', color: 'Indigo', price: 360, occasions: [...K], emoji: '👖', tint: '#D8DEE6', description: 'Rigid selvedge denim in a clean straight leg.', pickupPerk: 'Free chain-stitch hemming in the studio.' },
  { id: 'b-leather-pant', name: 'Leather Straight Pants', brand: 'Okoro Studio', category: 'Bottoms', color: 'Black', price: 1850, occasions: [...E, ...K], emoji: '👖', tint: '#D5D5D5', description: 'Supple leather trousers with a straight, ankle-grazing leg.' },
  // Shoes
  { id: 's-slingback', name: 'Pointed Slingback Pumps', brand: 'Maison Ardent', category: 'Shoes', color: 'Black patent', price: 850, occasions: [...W, ...E, 'event'], emoji: '👠', tint: '#DCDCDC', description: 'Patent slingbacks on a slim 70mm heel.', pickupPerk: 'Walk the salon in two sizes before you decide.' },
  { id: 's-loafer', name: 'Leather Penny Loafers', brand: 'Calder & Wren', category: 'Shoes', color: 'Black', price: 790, occasions: [...W, ...K], emoji: '👞', tint: '#DBDBDB', description: 'Polished calf loafers on a lightly lugged sole.' },
  { id: 's-ankle-boot', name: 'Suede Ankle Boots', brand: 'Sabine Roux', category: 'Shoes', color: 'Chocolate', price: 1190, occasions: [...W, ...K, ...E], warm: true, emoji: '👢', tint: '#E1D4C6', description: 'Soft suede ankle boots with an almond toe and block heel.' },
  { id: 's-sneaker', name: 'Low Leather Sneakers', brand: 'Atelier Nord', category: 'Shoes', color: 'White', price: 590, occasions: [...K], emoji: '👟', tint: '#EEEEEE', description: 'Minimal Italian leather sneakers with a slim cupsole.', pickupPerk: 'Try both sizes on the salon runway.' },
  { id: 's-sandal', name: 'Strappy Heeled Sandals', brand: 'Vell', category: 'Shoes', color: 'Gold', price: 820, occasions: [...E, 'event'], emoji: '👡', tint: '#EFE5CF', description: 'Barely-there metallic straps on an 85mm heel.' },
  // Bags
  { id: 'g-top-handle', name: 'Structured Top-Handle Bag', brand: 'Maison Ardent', category: 'Bags', color: 'Black', price: 3600, occasions: [...W, ...E, 'event'], emoji: '👜', tint: '#D8D8D8', description: 'Box-calf top-handle bag with a detachable strap.', pickupPerk: 'Complimentary monogram and dust bag at the boutique.' },
  { id: 'g-tote', name: 'Grained Leather Tote', brand: 'Calder & Wren', category: 'Bags', color: 'Cognac', price: 2150, occasions: [...W, ...K], emoji: '👜', tint: '#E8D6C2', description: 'Roomy grained-leather tote that fits a laptop.' },
  { id: 'g-crescent', name: 'Soft Crescent Shoulder Bag', brand: 'Okoro Studio', category: 'Bags', color: 'Butter', price: 2900, compareAt: 3400, occasions: [...K, ...E], emoji: '👝', tint: '#F1E8CF', description: 'Slouchy crescent bag in supple nappa leather.' },
  { id: 'g-clutch', name: 'Satin Evening Clutch', brand: 'Sabine Roux', category: 'Bags', color: 'Champagne', price: 1100, occasions: [...E, 'event'], emoji: '👛', tint: '#EFE6D6', description: 'Satin frame clutch with a slim chain.' },
  // Jewelry
  { id: 'j-hoops', name: 'Gold Dome Hoops', brand: 'Vell', category: 'Jewelry', color: 'Gold', price: 640, occasions: [...W, ...E, ...K, 'event'], emoji: '💛', tint: '#F1E6C8', description: 'Chunky 18k gold-plated dome hoops.' },
  { id: 'j-pearls', name: 'Freshwater Pearl Necklace', brand: 'Maison Ardent', category: 'Jewelry', color: 'Pearl', price: 1350, occasions: [...W, 'event'], emoji: '📿', tint: '#F2EFE8', description: 'Hand-knotted freshwater pearls with a gold clasp.', pickupPerk: 'Length adjusted by the in-house jeweler.' },
  { id: 'j-chain', name: 'Gold Link Chain Necklace', brand: 'Vell', category: 'Jewelry', color: 'Gold', price: 980, occasions: [...E, ...K], emoji: '⛓️', tint: '#F0E4C4', description: 'Heavy paperclip-link chain in 18k gold vermeil.' },
  // Accessories
  { id: 'a-sunglasses', name: 'Acetate Cat-Eye Sunglasses', brand: 'Okoro Studio', category: 'Accessories', color: 'Black', price: 460, occasions: [...K, ...W], emoji: '🕶️', tint: '#DADADA', description: 'Bold black acetate cat-eye frames with dark lenses.', pickupPerk: 'Free fit adjustment so they sit right.' },
  { id: 'a-silk-scarf', name: 'Silk Twill Scarf', brand: 'Maison Ardent', category: 'Accessories', color: 'Rust', price: 420, occasions: [...W, ...K], emoji: '🧣', tint: '#ECD9CB', description: 'Hand-rolled silk twill square in rust and cream.' },
  { id: 'a-belt', name: 'Leather Belt, Gold Buckle', brand: 'Calder & Wren', category: 'Accessories', color: 'Brown', price: 490, occasions: [...W, ...K], emoji: '➰', tint: '#E3D3C3', description: 'Smooth calf belt with a sculpted gold buckle.' },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort();
