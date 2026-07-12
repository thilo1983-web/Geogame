import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { createGame, listGames } from '../../src/data/gameRepository';
import type { Game } from '../../src/types/game';
import { getErrorMessage } from '../../src/utils/errors';

export default function EditorGameList() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGameName, setNewGameName] = useState('');
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    listGames()
      .then(setGames)
      .catch((err) => setErrorMessage(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(refresh);

  async function handleCreate() {
    const name = newGameName.trim();
    if (!name) return;
    setCreating(true);
    setErrorMessage(null);
    try {
      const game = await createGame({ name });
      setGames((prev) => [game, ...prev]);
      setNewGameName('');
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Editor' }} />

      <View style={styles.newGameRow}>
        <TextInput
          style={styles.input}
          placeholder="Name des neuen Spiels"
          value={newGameName}
          onChangeText={setNewGameName}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreate}
          disabled={creating || newGameName.trim().length === 0}
        >
          <Text style={styles.addButtonText}>{creating ? '...' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={games}
          keyExtractor={(game) => game.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Noch keine Spiele angelegt.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gameRow}
              onPress={() => router.push(`/editor/${item.id}`)}
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
  newGameRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  addButton: {
    width: 48,
    borderRadius: 8,
    backgroundColor: '#2E6BE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  error: {
    color: '#D32F2F',
    paddingHorizontal: 16,
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
