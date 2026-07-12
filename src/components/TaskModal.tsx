import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { Station } from '../types/game';
import { playSuccessSound } from '../utils/sound';

interface TaskModalProps {
  station: Station | null;
  onCorrectAnswer: (station: Station) => void;
  onDismiss: () => void;
}

function isAnswerCorrect(answer: string, acceptedAnswers: string[]): boolean {
  const normalized = answer.trim().toLowerCase();
  return acceptedAnswers.some((accepted) => accepted.trim().toLowerCase() === normalized);
}

export function TaskModal({ station, onCorrectAnswer, onDismiss }: TaskModalProps) {
  const [answer, setAnswer] = useState('');
  const [showError, setShowError] = useState(false);

  if (!station || station.task.type !== 'question') {
    return null;
  }

  const task = station.task;

  function handleSubmit() {
    if (!station || station.task.type !== 'question') return;
    if (isAnswerCorrect(answer, station.task.acceptedAnswers)) {
      setAnswer('');
      setShowError(false);
      playSuccessSound();
      onCorrectAnswer(station);
    } else {
      setShowError(true);
    }
  }

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.stationName}>{station.name}</Text>
          <Text style={styles.prompt}>{task.prompt}</Text>
          <TextInput
            style={styles.input}
            value={answer}
            onChangeText={(text) => {
              setAnswer(text);
              setShowError(false);
            }}
            placeholder="Deine Antwort"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {showError && <Text style={styles.error}>Leider falsch, versuch es nochmal.</Text>}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Antworten</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.dismiss}>Später</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    gap: 12,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E6BE6',
    textTransform: 'uppercase',
  },
  prompt: {
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: {
    color: '#D32F2F',
  },
  submitButton: {
    backgroundColor: '#2E6BE6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  dismiss: {
    textAlign: 'center',
    color: '#888',
    padding: 8,
  },
});
