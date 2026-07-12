import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getGame, listStations } from '../../../src/data/gameRepository';
import { StationMap } from '../../../src/components/StationMap';
import type { Game, Station } from '../../../src/types/game';
import { getErrorMessage } from '../../../src/utils/errors';

const DEFAULT_REGION = {
  latitude: 52.520008,
  longitude: 13.404954,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function EditorGameDetail() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCoordinate, setPendingCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([getGame(gameId), listStations(gameId)])
      .then(([g, s]) => {
        setGame(g);
        setStations(s);
      })
      .catch((err) => setErrorMessage(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [gameId]);

  useFocusEffect(refresh);

  const initialRegion =
    stations.length > 0
      ? { ...stations[0], latitudeDelta: 0.02, longitudeDelta: 0.02 }
      : DEFAULT_REGION;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: game?.name ?? 'Spiel' }} />

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <>
          <StationMap
            stations={stations}
            initialRegion={initialRegion}
            pendingMarker={pendingCoordinate}
            onMapPress={setPendingCoordinate}
            onStationPress={(station) =>
              router.push(`/editor/${gameId}/station/${station.id}`)
            }
          />

          {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

          {pendingCoordinate && (
            <TouchableOpacity
              style={styles.addStationButton}
              onPress={() =>
                router.push({
                  pathname: `/editor/${gameId}/station/new`,
                  params: {
                    latitude: String(pendingCoordinate.latitude),
                    longitude: String(pendingCoordinate.longitude),
                  },
                })
              }
            >
              <Text style={styles.addStationButtonText}>Station hier anlegen</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>
            Tippe auf die Karte, um eine neue Station zu platzieren. Tippe auf eine bestehende
            Station, um sie zu bearbeiten.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    marginTop: 32,
  },
  error: {
    color: '#D32F2F',
    padding: 12,
  },
  addStationButton: {
    position: 'absolute',
    bottom: 72,
    left: 16,
    right: 16,
    backgroundColor: '#2E6BE6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addStationButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  hint: {
    padding: 12,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});
