import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

export type PreviewVideoProps = {
  /** H.264 MP4 (iOS / Android, and Safari on web). */
  source: number;
  /** VP9 WebM, used first on web where it is the most widely decodable format. */
  webm?: number;
  poster: ImageSourcePropType;
  paused?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Looping, muted product preview (Higgsfield clip). The poster sits underneath until the first
 * frame is ready, so there's never a blank tile; `paused` freezes it.
 */
export function PreviewVideo({ source, poster, paused, style, testID }: PreviewVideoProps) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status }) => status === 'readyToPlay' && setReady(true));
    return () => sub.remove();
  }, [player]);
  useEffect(() => {
    paused ? player.pause() : player.play();
  }, [paused, player]);
  return (
    <View style={[{ overflow: 'hidden' }, style]} testID={testID}>
      <Image source={poster} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
      <VideoView player={player} style={[StyleSheet.absoluteFill, { opacity: ready ? 1 : 0 }]} contentFit="cover" nativeControls={false} allowsPictureInPicture={false} />
    </View>
  );
}
