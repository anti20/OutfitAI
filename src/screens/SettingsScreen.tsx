import * as React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { validateOpenAIKey } from '../services/openai';
import { clearOpenAIApiKey, getOpenAIApiKey, setOpenAIApiKey } from '../storage/apiKeyStorage';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'> & {
  hasApiKey: boolean;
  onKeySaved: () => void;
  onKeyCleared: () => void;
};

export function SettingsScreen({ navigation, hasApiKey, onKeySaved, onKeyCleared }: Props) {
  const [apiKey, setApiKey] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [messageType, setMessageType] = React.useState<'error' | 'success' | null>(null);
  const canGoBack = navigation.canGoBack();

  React.useEffect(() => {
    let active = true;
    (async () => {
      const existing = await getOpenAIApiKey();
      if (!active) return;
      setApiKey(existing ?? '');
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSave() {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setMessageType('error');
      setMessage('Please enter an API key');
      return;
    }

    try {
      setBusy(true);
      setMessage(null);
      setMessageType(null);

      const validation = await validateOpenAIKey(trimmed);
      if (!validation.ok) {
        setMessageType('error');
        setMessage(validation.error);
        return;
      }

      await setOpenAIApiKey(trimmed);
      setApiKey(trimmed);
      onKeySaved();
      setMessageType('success');
      setMessage('Key validated and saved');
    } catch (_e) {
      setMessageType('error');
      setMessage('Could not save the API key. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    try {
      setBusy(true);
      await clearOpenAIApiKey();
      setApiKey('');
      onKeyCleared();
      setMessageType(null);
      setMessage(null);
      Alert.alert('Cleared', 'Saved API key removed.');
    } catch (e) {
      Alert.alert('Clear failed', 'Could not clear the API key. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.status}>
          Status: {hasApiKey ? 'Key saved' : 'No key saved'}
        </Text>

        <Text style={styles.label}>OpenAI API key</Text>
        <TextInput
          value={apiKey}
          onChangeText={(value) => {
            setApiKey(value);
            if (message) {
              setMessage(null);
              setMessageType(null);
            }
          }}
          placeholder="sk-..."
          placeholderTextColor="rgba(255,255,255,0.35)"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          editable={!busy}
          style={styles.input}
        />

        {message ? (
          <Text style={[styles.message, messageType === 'error' ? styles.error : styles.success]}>
            {message}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={busy ? 'Validating…' : 'Validate & Save'}
            onPress={handleSave}
            disabled={busy}
            style={styles.action}
          />
          <PrimaryButton
            label="Clear"
            onPress={handleClear}
            disabled={busy}
            variant="danger"
            style={styles.action}
          />
        </View>

        {canGoBack ? (
          <PrimaryButton
            label="Back"
            onPress={() => navigation.goBack()}
            disabled={busy}
            variant="secondary"
          />
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#0B0B0F',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  status: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 14,
  },
  message: {
    fontSize: 13,
    marginBottom: 12,
  },
  error: {
    color: '#F87171',
  },
  success: {
    color: '#4ADE80',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  action: {
    flex: 1,
  },
});

