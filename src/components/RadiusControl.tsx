import Slider from '@react-native-community/slider';
import React from 'react';
import { Text, View } from 'react-native';
import { formatDistance, milesToKm, type DistanceUnit } from '../lib/geo';
import { colors } from '../theme';

export const MIN_RADIUS_MI = 1;
export const MAX_RADIUS_MI = 40;

/** Slider in the user's own unit; the app stores miles. */
export function RadiusControl({ radiusMi, unit, onChange }: { radiusMi: number; unit: DistanceUnit; onChange: (mi: number) => void }) {
  const factor = unit === 'km' ? milesToKm(1) : 1;
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{formatDistance(MIN_RADIUS_MI, unit)}</Text>
        <Text style={{ color: colors.ink, fontWeight: '700' }}>Up to {formatDistance(radiusMi, unit)} away</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{formatDistance(MAX_RADIUS_MI, unit)}</Text>
      </View>
      <Slider
        testID="radius-slider"
        accessibilityLabel="Pickup radius"
        minimumValue={MIN_RADIUS_MI * factor}
        maximumValue={MAX_RADIUS_MI * factor}
        step={1}
        value={radiusMi * factor}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
        onValueChange={(v) => onChange(Math.round(v) / factor)}
      />
    </View>
  );
}
