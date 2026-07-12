import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ensureAnonymousSession } from '../src/lib/supabase';
import { getErrorMessage } from '../src/utils/errors';

export default function RootLayout() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    ensureAnonymousSession()
      .then(() => setStatus('ready'))
      .catch((err) => {
        setErrorMessage(getErrorMessage(err));
        setStatus('error');
      });
  }, []);

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Verbindung fehlgeschlagen</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <Text style={styles.errorHint}>
          Prüfe .env (EXPO_PUBLIC_SUPABASE_URL / ANON_KEY) und ob "Anonymous Sign-Ins" in Supabase
          aktiviert ist.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerTitleAlign: 'center' }} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorMessage: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  errorHint: {
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
