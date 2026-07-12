import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CompassView } from '../../src/components/CompassView';
import { ScoreHeader } from '../../src/components/ScoreHeader';
import { StationMap } from '../../src/components/StationMap';
import { TaskModal } from '../../src/components/TaskModal';
import { getGame, listStations } from '../../src/data/gameRepository';
import { useGeofencing } from '../../src/hooks/useGeofencing';
import { useProgress } from '../../src/state/progressStore';
import type { Game, Station } from '../../src/types/game';

export default function PlayGame() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [compassStation, setCompassStation] = useState<Station | null>(null);

  const { completedStationIds, score, completeStation } = useProgress();
  const { position, activeStation, permissionDenied, errorMessage: geoError, closeActiveStation } =
    useGeofencing(stations, completedStationIds);

  useEffect(() => {
    Promise.all([getGame(gameId), listStations(gameId)])
      .then(([g, s]) => {
        setGame(g);
        setStations(s);
      })
      .catch((err) => setErrorMessage(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  if (errorMessage) {
    return <Text style={styles.error}>{errorMessage}</Text>;
  }

  const allCompleted = stations.length > 0 && completedStationIds.size === stations.length;
  const initialRegion =
    stations.length > 0
      ? { ...stations[0], latitudeDelta: 0.02, longitudeDelta: 0.02 }
      : { latitude: 52.520008, longitude: 13.404954, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  function handleNavigate() {
    if (!selectedStation) return;
    const { latitude, longitude } = selectedStation;
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
    const url =
      Platform.select({
        ios: `maps://?daddr=${latitude},${longitude}&dirflg=w`,
        android: `google.navigation:q=${latitude},${longitude}&mode=w`,
      }) ?? fallbackUrl;

    setSelectedStation(null);
    Linking.openURL(url).catch(() => Linking.openURL(fallbackUrl));
  }

  function handleCompass() {
    if (!selectedStation) return;
    setCompassStation(selectedStation);
    setSelectedStation(null);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: game?.name ?? 'Spielen' }} />

      <ScoreHeader score={score} completedCount={completedStationIds.size} totalCount={stations.length} />

      {permissionDenied && (
        <Text style={styles.warning}>
          Standortzugriff verweigert — Stationen können nicht automatisch erkannt werden.
        </Text>
      )}
      {geoError && <Text style={styles.warning}>{geoError}</Text>}

      {allCompleted && <Text style={styles.done}>🎉 Alle Stationen gelöst! Endpunktzahl: {score}</Text>}

      {compassStation ? (
        <CompassView
          station={compassStation}
          position={position}
          onClose={() => setCompassStation(null)}
        />
      ) : (
        <StationMap
          stations={stations}
          completedStationIds={completedStationIds}
          playerPosition={position}
          initialRegion={initialRegion}
          onStationPress={setSelectedStation}
        />
      )}

      <Modal
        visible={selectedStation !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedStation(null)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedStation(null)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{selectedStation?.name}</Text>
            <TouchableOpacity style={styles.sheetButton} onPress={handleNavigate}>
              <Text style={styles.sheetButtonText}>In Karten-App navigieren</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetButton} onPress={handleCompass}>
              <Text style={styles.sheetButtonText}>Kompassmodus</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setSelectedStation(null)}>
              <Text style={styles.sheetCancelText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TaskModal
        station={activeStation}
        onCorrectAnswer={(station) => {
          completeStation(station.id, station.points);
          closeActiveStation();
        }}
        onDismiss={closeActiveStation}
      />
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
    padding: 16,
  },
  warning: {
    color: '#B26A00',
    backgroundColor: '#FFF3E0',
    padding: 8,
    textAlign: 'center',
  },
  done: {
    backgroundColor: '#E8F5E9',
    color: '#1D8348',
    padding: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sheetButton: {
    backgroundColor: '#2E6BE6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sheetButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  sheetCancel: {
    padding: 12,
    alignItems: 'center',
  },
  sheetCancelText: {
    color: '#888',
    fontWeight: '600',
  },
});
