import type { Coord } from '../lib/geo';
import type { Hours } from '../lib/pickup';

export type Category = 'Outerwear' | 'Tops' | 'Dresses' | 'Bottoms' | 'Shoes' | 'Bags' | 'Jewelry' | 'Accessories';
export type StoreType = 'mall' | 'department' | 'brand' | 'specialty';

export const STORE_TYPE_LABEL: Record<StoreType, string> = {
  mall: 'Mall',
  department: 'Department store',
  brand: 'Brand store',
  specialty: 'Specialty shop',
};

const ALL: Category[] = ['Outerwear', 'Tops', 'Dresses', 'Bottoms', 'Shoes', 'Bags', 'Jewelry', 'Accessories'];

export type Store = {
  id: string;
  name: string;
  type: StoreType;
  area: string;
  address: string;
  coord: Coord;
  hours: Hours;
  categories: Category[];
  /** Brand boutiques only carry their own house. */
  brand?: string;
  /** The in-person moment that makes picking up worth the trip. */
  experience: { title: string; detail: string; icon: string };
  perks: string[];
};

export const STORES: Store[] = [
  {
    id: 'mason-vale', name: 'Mason & Vale', type: 'department', area: 'Downtown', address: '600 Congress Ave',
    coord: { lat: 30.269, lng: -97.7436 }, hours: { open: 10, close: 20 }, categories: ALL,
    experience: { title: 'Private fitting suite', detail: 'A stylist has your pieces waiting in a fitting suite and pulls alternatives in your size.', icon: 'shirt-outline' },
    perks: ['Complimentary alterations', 'Champagne bar', 'Personal shopper on call'],
  },
  {
    id: 'maison-ardent', name: 'Maison Ardent Boutique', type: 'brand', brand: 'Maison Ardent', area: '2nd Street District', address: '301 W 2nd St',
    coord: { lat: 30.2647, lng: -97.7469 }, hours: { open: 11, close: 19 }, categories: ALL,
    experience: { title: 'Salon appointment', detail: 'Your order is presented in the salon with a client advisor, and monogramming is done while you wait.', icon: 'diamond-outline' },
    perks: ['Monogramming', 'Leather care for life'],
  },
  {
    id: 'jewel-box', name: 'The Jewel Box', type: 'specialty', area: 'Downtown', address: '214 W 4th St',
    coord: { lat: 30.2655, lng: -97.7483 }, hours: { open: 11, close: 19 }, categories: ['Jewelry', 'Accessories', 'Bags'],
    experience: { title: "Jeweler's bench", detail: 'Necklaces sized and clasps checked at the bench before you take them home.', icon: 'sparkles-outline' },
    perks: ['Free resizing', 'Gift wrapping'],
  },
  {
    id: 'okoro-studio', name: 'Okoro Studio', type: 'brand', brand: 'Okoro Studio', area: 'South Congress', address: '1410 S Congress Ave',
    coord: { lat: 30.2481, lng: -97.7504 }, hours: { open: 10, close: 19 }, categories: ALL,
    experience: { title: 'Studio tailor', detail: 'Denim chain-stitch hemming and leather fit checks with the in-house tailor.', icon: 'cut-outline' },
    perks: ['Chain-stitch hemming', 'Leather care kit'],
  },
  {
    id: 'salon-zilker', name: 'The Shoe Salon', type: 'specialty', area: 'Zilker', address: '2200 Barton Springs Rd',
    coord: { lat: 30.2639, lng: -97.7701 }, hours: { open: 10, close: 19 }, categories: ['Shoes', 'Bags'],
    experience: { title: 'Salon try-on', detail: 'Walk the salon runway in two sizes; stretching and heel caps done on site.', icon: 'footsteps-outline' },
    perks: ['Free stretching', 'Heel cap service'],
  },
  {
    id: 'domain-collection', name: 'The Domain Collection', type: 'mall', area: 'North Austin', address: '11410 Century Oaks Terrace',
    coord: { lat: 30.4021, lng: -97.7251 }, hours: { open: 10, close: 21 }, categories: ALL,
    experience: { title: 'Concierge pickup', detail: 'Skip the lot: your bags are held at the concierge desk with a coffee on us.', icon: 'cafe-outline' },
    perks: ['Free valet for pickups', 'Food hall'],
  },
  {
    id: 'barton-square', name: 'Barton Creek Square', type: 'mall', area: 'Southwest Austin', address: '2901 S Capital of Texas Hwy',
    coord: { lat: 30.2603, lng: -97.8077 }, hours: { open: 10, close: 21 }, categories: ['Outerwear', 'Tops', 'Bottoms', 'Shoes', 'Accessories', 'Jewelry'],
    experience: { title: 'Concierge pickup', detail: 'Your order waits at Guest Services; browse while we bring it out.', icon: 'cafe-outline' },
    perks: ['Guest Services pickup', 'Café'],
  },
  {
    id: 'hale-westlake', name: "Hale's Department Store", type: 'department', area: 'Westlake', address: '3300 Bee Caves Rd',
    coord: { lat: 30.2937, lng: -97.8032 }, hours: { open: 10, close: 19 }, categories: ALL,
    experience: { title: 'Wardrobe consult', detail: 'Bring a photo of an outfit; a stylist builds around what you are picking up.', icon: 'color-palette-outline' },
    perks: ['Tailor on site', 'Event dressing'],
  },
  {
    id: 'cedar-market', name: 'Cedar Park Marketplace', type: 'mall', area: 'Cedar Park', address: '1400 E Whitestone Blvd',
    coord: { lat: 30.5052, lng: -97.8203 }, hours: { open: 10, close: 20 }, categories: ['Outerwear', 'Tops', 'Bottoms', 'Shoes', 'Bags', 'Accessories'],
    experience: { title: 'Curbside or concierge', detail: 'Pick up at the concierge or have it brought to your car.', icon: 'car-outline' },
    perks: ['Curbside handoff', 'EV charging'],
  },
  {
    id: 'rock-grove', name: 'Rock Grove Premium Outlets', type: 'mall', area: 'Round Rock', address: '4401 N I-35',
    coord: { lat: 30.5403, lng: -97.6818 }, hours: { open: 10, close: 20 }, categories: ALL,
    experience: { title: 'Outlet concierge', detail: 'Pickup includes a VIP coupon book for the rest of the outlet.', icon: 'pricetags-outline' },
    perks: ['VIP coupon book', 'Lounge'],
  },
];

export const getStore = (id: string) => STORES.find((s) => s.id === id);
