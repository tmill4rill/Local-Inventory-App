import type { ImageSourcePropType } from 'react-native';

/**
 * Looping preview clips for product pages and hero tiles, generated with Higgsfield
 * (Seedance 1.5 Pro, image-to-video from the product's own packshot), trimmed and cross-faded
 * into a seamless ~3.4 s loop and bundled as small silent 480px MP4s (plus VP9 WebM for the web build).
 * Add an entry per product as more clips are generated; everything else falls back to the photo.
 */
export type ProductClip = { video: number; webm?: number; poster: ImageSourcePropType; label: string; bg: string };

export const PRODUCT_CLIPS: Record<string, ProductClip> = {
  // The pumps float and turn; the clip is gradient-mapped so its ground is exactly the shoe block's cobalt.
  's-slingback': {
    video: require('../../assets/clips/chroma-pumps.mp4'),
    webm: require('../../assets/clips/chroma-pumps.webm'),
    poster: require('../../assets/clips/chroma-pumps.jpg'),
    label: 'In motion',
    bg: '#2B3CFE',
  },
};

export const productClip = (id: string): ProductClip | undefined => PRODUCT_CLIPS[id];

/** The piece Today features as "Piece of the day". */
export const FEATURED_CLIP_ID = 's-slingback';
