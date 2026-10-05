import * as Location from 'expo-location';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RadiusControl } from '../../src/components/RadiusControl';
import { Button, Card, Chip, Label } from '../../src/components/ui';
import { DEFAULT_PLACE, useApp } from '../../src/state/AppState';
import { colors, type } from '../../src/theme';

export default function Profile() {
  const { place, setPlace, radiusMi, setRadiusMi, unit, setUnit, resetDemo } = useApp();
  const [locNote, setLocNote] = useState<string | null>(null);

  const useMyLocation = async () => {
    setLocNote('Locating…');
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setLocNote('Location permission was declined. Staying on the default area.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setPlace({ label: 'Current location', coord: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
      setLocNote('Using your current location. Note: demo stores are all around Austin, TX.');
    } catch {
      setLocNote("Couldn't get your location. Staying on the default area.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
      <Card style={{ gap: 10 }}>
        <Label>How far will you go?</Label>
        <Text style={type.body}>Only stores inside this range show up for pickup.</Text>
        <RadiusControl radiusMi={radiusMi} unit={unit} onChange={setRadiusMi} />
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          <Chip testID="unit-mi" label="Miles" selected={unit === 'mi'} onPress={() => setUnit('mi')} />
          <Chip testID="unit-km" label="Kilometers" selected={unit === 'km'} onPress={() => setUnit('km')} />
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <Label>Pickup area</Label>
        <Text style={[type.h2]}>{place.label}</Text>
        <Button variant="secondary" icon="locate-outline" label="Use my current location" onPress={useMyLocation} />
        {place.label !== DEFAULT_PLACE.label ? <Button variant="ghost" label="Back to Downtown Austin" onPress={() => setPlace(DEFAULT_PLACE)} /> : null}
        {locNote ? <Text style={styles.note}>{locNote}</Text> : null}
      </Card>

      <Card style={{ gap: 10 }}>
        <Label>Demo</Label>
        <Text style={type.small}>Store inventory is sample data. Resetting clears your bag and pickups.</Text>
        <Button variant="secondary" label="Reset demo data" onPress={resetDemo} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ note: { fontSize: 13, color: colors.muted } });
