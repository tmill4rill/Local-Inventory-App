import type { Coord } from '../lib/geo';
import type { Hours } from '../lib/pickup';

export type Category = 'Tech' | 'Fashion' | 'Beauty' | 'Home' | 'Outdoors' | 'Gifts';
export type StoreType = 'mall' | 'department' | 'brand' | 'specialty';

export const STORE_TYPE_LABEL: Record<StoreType, string> = {
  mall: 'Mall',
  department: 'Department store',
  brand: 'Brand store',
  specialty: 'Specialty shop',
};

export type Store = {
  id: string;
  name: string;
  type: StoreType;
  area: string;
  address: string;
  coord: Coord;
  hours: Hours;
  categories: Category[];
  /** The in-person moment that makes picking up worth the trip. */
  experience: { title: string; detail: string; icon: string };
  perks: string[];
};

export const STORES: Store[] = [
  {
    id: 'mason-vale',
    name: 'Mason & Vale',
    type: 'department',
    area: 'Downtown',
    address: '600 Congress Ave',
    coord: { lat: 30.269, lng: -97.7436 },
    hours: { open: 10, close: 20 },
    categories: ['Fashion', 'Beauty', 'Home', 'Gifts'],
    experience: {
      title: 'Personal stylist fitting',
      detail: 'A stylist has your order waiting in a private fitting suite and will pull alternatives.',
      icon: 'shirt-outline',
    },
    perks: ['Complimentary alterations', 'Gift wrapping lounge', 'Café on 2'],
  },
  {
    id: 'lumen-atelier',
    name: 'Lumen Beauty Atelier',
    type: 'specialty',
    area: 'Downtown',
    address: '214 W 4th St',
    coord: { lat: 30.2655, lng: -97.7483 },
    hours: { open: 11, close: 19 },
    categories: ['Beauty', 'Gifts'],
    experience: {
      title: 'Shade-match consult',
      detail: 'Ten minutes with an artist to match your tone and try before you take it home.',
      icon: 'color-palette-outline',
    },
    perks: ['Free sample bar', 'Scent library'],
  },
  {
    id: 'kiln-thread',
    name: 'Kiln & Thread Home',
    type: 'specialty',
    area: 'South Congress',
    address: '1410 S Congress Ave',
    coord: { lat: 30.2481, lng: -97.7504 },
    hours: { open: 10, close: 18 },
    categories: ['Home', 'Gifts'],
    experience: {
      title: 'Touch-and-feel table',
      detail: 'See the glaze, feel the weave, and have it styled with your own paint swatch.',
      icon: 'hand-left-outline',
    },
    perks: ['Pottery studio viewing', 'Local maker shelf'],
  },
  {
    id: 'northwind',
    name: 'Northwind Outfitters',
    type: 'specialty',
    area: 'Zilker',
    address: '2200 Barton Springs Rd',
    coord: { lat: 30.2639, lng: -97.7701 },
    hours: { open: 9, close: 20 },
    categories: ['Outdoors', 'Fashion'],
    experience: {
      title: 'Pack fit & gear check',
      detail: 'Staff load your pack with real weight and adjust it to your frame in the store.',
      icon: 'bonfire-outline',
    },
    perks: ['Trail map wall', 'Free boot lacing'],
  },
  {
    id: 'orchard-domain',
    name: 'Orchard Studio — The Domain',
    type: 'brand',
    area: 'North Austin',
    address: '11410 Century Oaks Terrace',
    coord: { lat: 30.4018, lng: -97.7246 },
    hours: { open: 10, close: 21 },
    categories: ['Tech'],
    experience: {
      title: 'Guided setup session',
      detail: 'A specialist unboxes and sets up your device with you, and transfers your data on the spot.',
      icon: 'sparkles-outline',
    },
    perks: ['Free engraving', 'Hands-on workshops'],
  },
  {
    id: 'domain-collection',
    name: 'The Domain Collection',
    type: 'mall',
    area: 'North Austin',
    address: '11410 Century Oaks Terrace',
    coord: { lat: 30.4021, lng: -97.7251 },
    hours: { open: 10, close: 21 },
    categories: ['Fashion', 'Beauty', 'Tech', 'Gifts', 'Home'],
    experience: {
      title: 'Concierge pickup',
      detail: 'Skip the lot — your bags are held at the concierge desk with a coffee on us.',
      icon: 'cafe-outline',
    },
    perks: ['Free valet for pickups', 'Food hall', 'Gift concierge'],
  },
  {
    id: 'barton-square',
    name: 'Barton Creek Square',
    type: 'mall',
    area: 'Southwest Austin',
    address: '2901 S Capital of Texas Hwy',
    coord: { lat: 30.2603, lng: -97.8077 },
    hours: { open: 10, close: 21 },
    categories: ['Fashion', 'Beauty', 'Tech', 'Outdoors', 'Gifts'],
    experience: {
      title: 'Concierge pickup',
      detail: 'Your order is held at Guest Services; browse the stores while we bring it out.',
      icon: 'cafe-outline',
    },
    perks: ['Kids play area', 'Food court'],
  },
  {
    id: 'hale-westlake',
    name: "Hale's Department Store",
    type: 'department',
    area: 'Westlake',
    address: '3300 Bee Caves Rd',
    coord: { lat: 30.2937, lng: -97.8032 },
    hours: { open: 10, close: 19 },
    categories: ['Fashion', 'Home', 'Beauty', 'Gifts'],
    experience: {
      title: 'Home design table',
      detail: 'Bring a photo of your room; a designer will help you pair what you picked up.',
      icon: 'home-outline',
    },
    perks: ['Bridal registry', 'Tailor on site'],
  },
  {
    id: 'cedar-market',
    name: 'Cedar Park Marketplace',
    type: 'mall',
    area: 'Cedar Park',
    address: '1400 E Whitestone Blvd',
    coord: { lat: 30.5052, lng: -97.8203 },
    hours: { open: 10, close: 20 },
    categories: ['Fashion', 'Outdoors', 'Home', 'Gifts'],
    experience: {
      title: 'Curbside or concierge',
      detail: 'Pick up at the concierge or have it brought to your car — your choice at arrival.',
      icon: 'car-outline',
    },
    perks: ['Weekend farmers market', 'EV charging'],
  },
  {
    id: 'garden-pflug',
    name: 'Pflugerville Home & Garden',
    type: 'specialty',
    area: 'Pflugerville',
    address: '16000 Impact Way',
    coord: { lat: 30.4394, lng: -97.62 },
    hours: { open: 9, close: 18 },
    categories: ['Home', 'Outdoors'],
    experience: {
      title: 'Greenhouse walk-through',
      detail: 'Your order comes with a guided stroll through the greenhouse and a care card.',
      icon: 'leaf-outline',
    },
    perks: ['Free plant care clinic', 'Seasonal workshops'],
  },
  {
    id: 'rock-grove',
    name: 'Rock Grove Outlets',
    type: 'mall',
    area: 'Round Rock',
    address: '4401 N I-35',
    coord: { lat: 30.5403, lng: -97.6818 },
    hours: { open: 10, close: 20 },
    categories: ['Fashion', 'Outdoors', 'Home', 'Beauty'],
    experience: {
      title: 'Outlet concierge',
      detail: 'Pickup includes a bonus coupon book for the other stores in the outlet.',
      icon: 'pricetags-outline',
    },
    perks: ['Extra outlet coupons', 'Food trucks'],
  },
  {
    id: 'orchard-san-marcos',
    name: 'Orchard Studio — San Marcos',
    type: 'brand',
    area: 'San Marcos',
    address: '3939 S I-35',
    coord: { lat: 29.8833, lng: -97.9414 },
    hours: { open: 10, close: 20 },
    categories: ['Tech'],
    experience: {
      title: 'Guided setup session',
      detail: 'A specialist unboxes and sets up your device with you, and transfers your data on the spot.',
      icon: 'sparkles-outline',
    },
    perks: ['Free engraving', 'Student workshop'],
  },
];

export const getStore = (id: string) => STORES.find((s) => s.id === id);
