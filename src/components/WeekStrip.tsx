import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { dayKey } from '../lib/styling';
import type { Look } from '../state/AppState';
import { colors } from '../theme';
import { Thumb } from './ui';

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Week of looks, after Alta's calendar strip: each day shows the saved outfit (a stack of its
 * first pieces) or an empty silhouette; the selected day is underlined.
 */
export function WeekStrip({ days, selected, onSelect, looks }: { days: Date[]; selected: string; onSelect: (day: string) => void; looks: Look[] }) {
  const today = dayKey(new Date());
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {days.map((d) => {
        const key = dayKey(d);
        const look = looks.find((l) => l.day === key);
        const on = key === selected;
        return (
          <Pressable
            key={key}
            testID={`day-${key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${d.toDateString()}${look ? `, ${look.title}` : ', no look yet'}`}
            onPress={() => onSelect(key)}
            style={styles.day}
          >
            <Text style={[styles.dow, on && styles.on]}>{DOW[d.getDay()]}</Text>
            <Text style={[styles.num, on && styles.on, key === today && !on && { color: colors.ink }]}>{d.getDate()}</Text>
            <View style={styles.figure}>
              {look ? (
                <View style={styles.stack}>
                  {look.items.slice(0, 3).map((id) => (
                    <Thumb key={id} id={id} size={24} style={{ borderRadius: 3 }} />
                  ))}
                </View>
              ) : (
                <Ionicons name="body-outline" size={38} color={colors.faint} />
              )}
            </View>
            <View style={[styles.bar, on && { backgroundColor: colors.ink }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 8 },
  day: { flex: 1, alignItems: 'center', gap: 2 },
  dow: { fontSize: 10, color: colors.muted, letterSpacing: 0.5 },
  num: { fontSize: 13, color: colors.muted },
  on: { color: colors.ink, fontWeight: '700' },
  figure: { height: 78, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  stack: { gap: 2, alignItems: 'center' },
  bar: { height: 2, width: '70%', backgroundColor: 'transparent', marginTop: 4 },
});
