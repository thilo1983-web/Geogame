import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useHeading } from '../hooks/useHeading';
import type { Station } from '../types/game';
import { bearingDegrees, distanceMeters, formatDistance } from '../utils/geo';

interface CompassViewProps {
  station: Station;
  position: { latitude: number; longitude: number } | null;
  onClose: () => void;
}

export function CompassView({ station, position, onClose }: CompassViewProps) {
  const { heading, errorMessage } = useHeading();
  const rotation = useRef(new Animated.Value(0)).current;

  const distance = position ? distanceMeters(position, station) : null;
  const bearingToStation = position ? bearingDegrees(position, station) : null;
  const relativeBearing =
    bearingToStation !== null && heading !== null
      ? (bearingToStation - heading + 360) % 360
      : null;

  useEffect(() => {
    if (relativeBearing === null) return;
    Animated.timing(rotation, {
      toValue: relativeBearing,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [relativeBearing, rotation]);

  return (
    <View style={styles.container}>
      <Text style={styles.stationName}>{station.name}</Text>
      <Text style={styles.distance}>
        {distance !== null ? formatDistance(distance) : 'Standort wird ermittelt…'}
      </Text>

      <View style={styles.compassCircle}>
        {relativeBearing !== null ? (
          <Animated.Text
            style={[
              styles.arrow,
              {
                transform: [
                  {
                    rotate: rotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            ↑
          </Animated.Text>
        ) : (
          <Text style={styles.waiting}>Kompass wird kalibriert…</Text>
        )}
      </View>

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Zurück zur Karte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#fff',
  },
  stationName: {
    fontSize: 20,
    fontWeight: '700',
  },
  distance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2E6BE6',
  },
  compassCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: '#2E6BE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 96,
    color: '#2E6BE6',
  },
  waiting: {
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  error: {
    color: '#D32F2F',
  },
  closeButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  closeButtonText: {
    fontWeight: '600',
  },
});
