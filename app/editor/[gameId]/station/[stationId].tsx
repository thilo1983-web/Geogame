import Slider from '@react-native-community/slider';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { PositionPicker } from '../../../../src/components/PositionPicker';
import {
  createStation,
  deleteStation,
  getStation,
  listStations,
  updateStation,
} from '../../../../src/data/gameRepository';
import type { TaskType } from '../../../../src/types/game';
import { getErrorMessage } from '../../../../src/utils/errors';

const DISABLED_TASK_TYPES: { type: TaskType; label: string }[] = [
  { type: 'multiple_choice', label: 'Multiple Choice' },
  { type: 'qr_code', label: 'QR-Code' },
  { type: 'photo', label: 'Foto' },
];

export default function StationForm() {
  const { gameId, stationId, latitude, longitude } = useLocalSearchParams<{
    gameId: string;
    stationId: string;
    latitude?: string;
    longitude?: string;
  }>();
  const router = useRouter();
  const isNew = stationId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [coordinate, setCoordinate] = useState({
    latitude: latitude ? parseFloat(latitude) : 52.520008,
    longitude: longitude ? parseFloat(longitude) : 13.404954,
  });
  const [name, setName] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(30);
  const [points, setPoints] = useState('10');
  const [prompt, setPrompt] = useState('');
  const [acceptedAnswersText, setAcceptedAnswersText] = useState('');
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (isNew) {
      listStations(gameId)
        .then((stations) => setOrder(stations.length))
        .catch(() => undefined);
      return;
    }

    getStation(stationId)
      .then((station) => {
        setCoordinate({ latitude: station.latitude, longitude: station.longitude });
        setName(station.name);
        setRadiusMeters(station.radiusMeters);
        setPoints(String(station.points));
        setOrder(station.order);
        if (station.task.type === 'question') {
          setPrompt(station.task.prompt);
          setAcceptedAnswersText(station.task.acceptedAnswers.join(', '));
        }
      })
      .catch((err) => setErrorMessage(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [gameId, stationId, isNew]);

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedPrompt = prompt.trim();
    const acceptedAnswers = acceptedAnswersText
      .split(',')
      .map((answer) => answer.trim())
      .filter((answer) => answer.length > 0);
    const pointsValue = parseInt(points, 10);

    if (!trimmedName || !trimmedPrompt || acceptedAnswers.length === 0 || Number.isNaN(pointsValue)) {
      setErrorMessage('Bitte Name, Frage, mindestens eine Antwort und Punkte ausfüllen.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      if (isNew) {
        await createStation({
          gameId,
          name: trimmedName,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          radiusMeters,
          points: pointsValue,
          order,
          task: { type: 'question', prompt: trimmedPrompt, acceptedAnswers },
        });
      } else {
        await updateStation({
          id: stationId,
          gameId,
          name: trimmedName,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          radiusMeters,
          points: pointsValue,
          order,
          task: { type: 'question', prompt: trimmedPrompt, acceptedAnswers },
        });
      }
      router.back();
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert('Station löschen?', 'Diese Aktion kann nicht rückgängig gemacht werden.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteStation(stationId);
            router.back();
          } catch (err) {
            setErrorMessage(getErrorMessage(err));
          }
        },
      },
    ]);
  }

  if (loading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: isNew ? 'Neue Station' : 'Station bearbeiten' }} />

      <PositionPicker coordinate={coordinate} radiusMeters={radiusMeters} onChange={setCoordinate} />

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="z.B. Brandenburger Tor" />

      <Text style={styles.label}>Radius: {radiusMeters} m</Text>
      <Slider
        minimumValue={5}
        maximumValue={200}
        step={5}
        value={radiusMeters}
        onValueChange={setRadiusMeters}
      />

      <Text style={styles.label}>Aufgabentyp</Text>
      <View style={styles.taskTypeRow}>
        <View style={[styles.taskTypeChip, styles.taskTypeChipActive]}>
          <Text style={styles.taskTypeChipTextActive}>Frage</Text>
        </View>
        {DISABLED_TASK_TYPES.map(({ type, label }) => (
          <View key={type} style={styles.taskTypeChip}>
            <Text style={styles.taskTypeChipText}>{label} (bald)</Text>
          </View>
        ))}
      </View>

      <Text style={styles.label}>Frage</Text>
      <TextInput
        style={styles.input}
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Was ist die Antwort auf..."
        multiline
      />

      <Text style={styles.label}>Akzeptierte Antworten (kommagetrennt)</Text>
      <TextInput
        style={styles.input}
        value={acceptedAnswersText}
        onChangeText={setAcceptedAnswersText}
        placeholder="Antwort1, Antwort2"
      />

      <Text style={styles.label}>Punkte</Text>
      <TextInput
        style={styles.input}
        value={points}
        onChangeText={setPoints}
        keyboardType="numeric"
      />

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Speichern...' : 'Speichern'}</Text>
      </TouchableOpacity>

      {!isNew && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Station löschen</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 48,
  },
  loading: {
    marginTop: 32,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  taskTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskTypeChip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  taskTypeChipActive: {
    backgroundColor: '#2E6BE6',
    borderColor: '#2E6BE6',
  },
  taskTypeChipText: {
    color: '#999',
  },
  taskTypeChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  error: {
    color: '#D32F2F',
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: '#2E6BE6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
});
