import type { ImageSourcePropType } from 'react-native';

/**
 * Looping preview clips for product pages and hero tiles, generated with Higgsfield
 * (Seedance 1.5 Pro, image-to-video from the product's own packshot), trimmed and cross-faded
 * into a seamless ~3.4 s loop and bundled as small silent 480px MP4s (plus VP9 WebM for the web build).
 * Add an entry per product as more clips are generated; everything else falls back to the photo.
 */
export type ProductClip = { video: number; webm?: number; poster: ImageSourcePropType; label: string };

export const PRODUCT_CLIPS: Record<string, ProductClip> = {
  // Slow 360° turntable with a light sweep; background matched to the app's tile gray.
  'g-top-handle': {
    video: require('../../assets/clips/atelier-bag.mp4'),
    webm: require('../../assets/clips/atelier-bag.webm'),
    poster: require('../../assets/clips/atelier-bag.jpg'),
    label: '360°',
  },
};

export const productClip = (id: string): ProductClip | undefined => PRODUCT_CLIPS[id];

/** The piece Today features in its "in the round" tile. */
export const FEATURED_CLIP_ID = 'g-top-handle';
