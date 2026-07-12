import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { listGames } from '../../src/data/gameRepository';
import type { Game } from '../../src/types/game';
import { getErrorMessage } from '../../src/utils/errors';

export default function PlayerGameList() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    listGames()
      .then(setGames)
      .catch((err) => setErrorMessage(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(refresh);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Spiel auswählen' }} />

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={games}
          keyExtractor={(game) => game.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Noch keine Spiele vorhanden. Leg zuerst eins im Editor an.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gameRow}
              onPress={() => router.push(`/player/${item.id}`)}
            >
              <Text style={styles.gameName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  error: {
    color: '#D32F2F',
    padding: 16,
  },
  loading: {
    marginTop: 32,
  },
  list: {
    padding: 16,
    gap: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
  },
  gameRow: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 8,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
  },
});
