import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { PreviewVideoProps } from './PreviewVideo';

/** Bundled asset -> URL on web (Metro gives either a string or { uri }). */
const url = (a: unknown): string | undefined => (typeof a === 'string' ? a : (a as { uri?: string } | undefined)?.uri);

/**
 * Web version: a plain <video> with WebM first and MP4 second, so it plays in Chrome, Firefox,
 * Edge and Safari. Muted + playsInline lets it autoplay; the poster covers loading.
 */
export function PreviewVideo({ source, webm, poster, paused, style, testID }: PreviewVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused]);
  const posterUrl = url(Image.resolveAssetSource?.(poster as number) ?? poster);
  return (
    <View style={[{ overflow: 'hidden' }, style]} testID={testID}>
      <Image source={poster} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
      {React.createElement(
        'video',
        {
          ref,
          autoPlay: !paused,
          loop: true,
          muted: true,
          playsInline: true,
          preload: 'auto',
          poster: posterUrl,
          'aria-hidden': true,
          style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
        },
        webm ? React.createElement('source', { src: url(webm), type: 'video/webm' }) : null,
        React.createElement('source', { src: url(source), type: 'video/mp4' }),
      )}
    </View>
  );
}
