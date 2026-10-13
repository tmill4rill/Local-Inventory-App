import type { ImageSourcePropType } from 'react-native';

/**
 * Looping preview clips for product pages and hero tiles, generated with Higgsfield
 * (Seedance 1.5 Pro, image-to-video from the product's own packshot), trimmed and cross-faded
 * into a seamless ~3.4 s loop and bundled as small silent 480px MP4s.
 * Add an entry per product as more clips are generated; everything else falls back to the photo.
 */
export type ProductClip = { video: number; poster: ImageSourcePropType };

export const PRODUCT_CLIPS: Record<string, ProductClip> = {};

export const productClip = (id: string): ProductClip | undefined => PRODUCT_CLIPS[id];
