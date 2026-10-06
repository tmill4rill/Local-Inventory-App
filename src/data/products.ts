import { PRODUCT_IMAGES } from './productImages';
import type { Category } from './stores';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  emoji: string;
  /** Product photo URL. The emoji stays as the fallback if it fails to load. */
  image?: string;
  tint: string;
  description: string;
  /** What the in-store handoff adds for this item, shown on the product page. */
  pickupPerk?: string;
};

export const CATEGORIES: Category[] = ['Tech', 'Fashion', 'Beauty', 'Home', 'Outdoors', 'Gifts'];

export const SHIPPING_FEE = 7.99;

export const PRODUCTS: Product[] = [
  { id: 'p-laptop', name: 'Slate 14 Laptop', brand: 'Orchard', category: 'Tech', price: 1299, emoji: '💻', tint: '#DCE6F2', description: 'Featherweight 14-inch laptop with an all-day battery and a studio-grade display.', pickupPerk: 'Specialist transfers your files and sets up your accounts at the Studio.' },
  { id: 'p-phone', name: 'Orchard Phone 9', brand: 'Orchard', category: 'Tech', price: 899, emoji: '📱', tint: '#E3DCF2', description: 'Pro-grade camera, two-day battery, and a titanium frame.', pickupPerk: 'Free case fitting and screen protector installed while you wait.' },
  { id: 'p-earbuds', name: 'Hush ANC Earbuds', brand: 'Sonar', category: 'Tech', price: 179, emoji: '🎧', tint: '#D9EBE4', description: 'Adaptive noise cancelling with a pocket-size charging case.', pickupPerk: 'Try three tip sizes and compare noise cancelling in the demo booth.' },
  { id: 'p-watch', name: 'Pulse Watch', brand: 'Orchard', category: 'Tech', price: 399, emoji: '⌚', tint: '#F2E1D9', description: 'Fitness and sleep tracking with a bright always-on display.', pickupPerk: 'Get your strap sized and a 15-minute setup walkthrough.' },
  { id: 'p-speaker', name: 'Drift Bluetooth Speaker', brand: 'Sonar', category: 'Tech', price: 129, emoji: '🔊', tint: '#E9E3D3', description: 'Waterproof, 18-hour speaker with surprisingly big sound.' },
  { id: 'p-trench', name: 'Waxed Trench Coat', brand: 'Harlow', category: 'Fashion', price: 340, emoji: '🧥', tint: '#EAD9C4', description: 'Water-resistant cotton trench with a removable liner.', pickupPerk: 'Try it on in a fitting suite — free sleeve hemming within the week.' },
  { id: 'p-sneakers', name: 'Court Leather Sneakers', brand: 'Marlow', category: 'Fashion', price: 148, emoji: '👟', tint: '#E8E8E4', description: 'Minimal full-grain leather sneakers that break in beautifully.', pickupPerk: 'Walk a lap in both sizes before you commit.' },
  { id: 'p-dress', name: 'Linen Wrap Dress', brand: 'Harlow', category: 'Fashion', price: 168, emoji: '👗', tint: '#F2D9DE', description: 'Breathable linen wrap dress in a flattering midi length.', pickupPerk: 'Complimentary hem while you have a coffee.' },
  { id: 'p-bag', name: 'Everyday Leather Tote', brand: 'Marlow', category: 'Fashion', price: 225, emoji: '👜', tint: '#E4D4C2', description: 'Structured tote with a zip pocket and room for a 14-inch laptop.' },
  { id: 'p-sunglasses', name: 'Tortoise Sunglasses', brand: 'Marlow', category: 'Fashion', price: 120, emoji: '🕶️', tint: '#D8D5CC', description: 'Polarized acetate frames in classic tortoise.', pickupPerk: 'Free fit adjustment so they sit right.' },
  { id: 'p-serum', name: 'Daylight Vitamin C Serum', brand: 'Lumen', category: 'Beauty', price: 62, emoji: '🧴', tint: '#F6E6C8', description: 'Brightening serum that layers under sunscreen.', pickupPerk: 'Patch-test and sample two textures at the sample bar.' },
  { id: 'p-foundation', name: 'Skin Tint Foundation', brand: 'Lumen', category: 'Beauty', price: 44, emoji: '💄', tint: '#F4DAD6', description: 'Buildable skin tint in 40 shades.', pickupPerk: 'Ten-minute shade match so you leave with the right one.' },
  { id: 'p-perfume', name: 'Cedar & Smoke Eau de Parfum', brand: 'Lumen', category: 'Beauty', price: 118, emoji: '🌫️', tint: '#E1DAD0', description: 'A woody, warm scent with a trace of bergamot.', pickupPerk: 'Smell it on skin and in the scent library before you take it.' },
  { id: 'p-diffuser', name: 'Stoneware Reed Diffuser', brand: 'Kiln & Thread', category: 'Home', price: 54, emoji: '🪔', tint: '#E6E0D6', description: 'Hand-glazed stoneware vessel with a fig-leaf scent.' },
  { id: 'p-blanket', name: 'Chunky Wool Throw', brand: 'Kiln & Thread', category: 'Home', price: 139, emoji: '🧶', tint: '#EBD5D1', description: 'Heavy hand-woven throw in oatmeal.', pickupPerk: 'Take it for a swatch test against your own sofa colour.' },
  { id: 'p-mugs', name: 'Glazed Mug Set (4)', brand: 'Kiln & Thread', category: 'Home', price: 76, emoji: '☕', tint: '#D8E4E2', description: 'Four wheel-thrown mugs in speckled glaze.', pickupPerk: 'Pick your own four glazes from the shelf.' },
  { id: 'p-lamp', name: 'Arc Table Lamp', brand: 'Hale', category: 'Home', price: 185, emoji: '💡', tint: '#F3E5C6', description: 'Brushed brass arc lamp with a linen shade.', pickupPerk: 'See it lit in a room setting.' },
  { id: 'p-tent', name: 'Two-Person Trail Tent', brand: 'Northwind', category: 'Outdoors', price: 289, emoji: '⛺', tint: '#D8E6D4', description: 'Three-season freestanding tent, 3 lb 14 oz.', pickupPerk: 'Staff pitch it for you once so you know the setup.' },
  { id: 'p-pack', name: '45L Trekking Pack', brand: 'Northwind', category: 'Outdoors', price: 219, emoji: '🎒', tint: '#E0D8C8', description: 'Adjustable-torso pack with a rain cover.', pickupPerk: 'Fitted with real weight to your frame.' },
  { id: 'p-boots', name: 'Ridge Hiking Boots', brand: 'Northwind', category: 'Outdoors', price: 198, emoji: '🥾', tint: '#E4D7C7', description: 'Waterproof leather boots with a grippy sole.', pickupPerk: 'Try on on the incline ramp and get free boot lacing.' },
  { id: 'p-bottle', name: 'Insulated Bottle 32oz', brand: 'Northwind', category: 'Outdoors', price: 38, emoji: '🧊', tint: '#D5E5EC', description: 'Keeps drinks cold for 24 hours.' },
  { id: 'p-candle', name: 'Fig & Amber Candle', brand: 'Lumen', category: 'Gifts', price: 36, emoji: '🕯️', tint: '#F3DFC9', description: 'Hand-poured soy candle with a 50-hour burn.', pickupPerk: 'Complimentary gift wrap at the lounge.' },
  { id: 'p-board', name: 'Walnut Serving Board', brand: 'Kiln & Thread', category: 'Gifts', price: 68, emoji: '🪵', tint: '#E3D2BE', description: 'Hand-oiled walnut board with a leather loop.', pickupPerk: 'Free monogram burned in while you wait.' },
  { id: 'p-plant', name: 'Fiddle Leaf Fig (Medium)', brand: 'Garden', category: 'Home', price: 59, emoji: '🌿', tint: '#D5E6D0', description: 'Healthy 3-foot fiddle leaf fig in a nursery pot.', pickupPerk: 'A care card and a minute with the plant doctor.' },
];

for (const p of PRODUCTS) p.image = PRODUCT_IMAGES[p.id];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
