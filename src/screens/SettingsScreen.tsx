import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Button from '../components/Button';
import {validateOpenAIKey} from '../services/openai';
import {
  clearOpenAIKey,
  getOpenAIKey,
  saveOpenAIKey,
} from '../storage/openAIKeyStorage';
import {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'> & {
  isRequiredSetup: boolean;
  onKeySaved: () => void;
  onKeyCleared: () => void;
};

function SettingsScreen({isRequiredSetup, navigation, onKeySaved, onKeyCleared}: Props) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [statusText, setStatusText] = useState('No key saved');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const loadStatus = async () => {
      const existingKey = await getOpenAIKey();
      setStatusText(existingKey ? 'Key saved' : 'No key saved');
      setApiKey(existingKey ?? '');
    };

    loadStatus();
  }, []);

  const handleValidateAndSave = async () => {
    setIsValidating(true);
    setErrorText('');

    const validation = await validateOpenAIKey(apiKey);

    if (!validation.valid) {
      setStatusText('No key saved');
      setErrorText(validation.error ?? 'Validation failed.');
      setIsValidating(false);
      return;
    }

    await saveOpenAIKey(apiKey.trim());
    setStatusText('Key saved');
    setIsValidating(false);
    onKeySaved();

    if (!isRequiredSetup && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleClear = async () => {
    await clearOpenAIKey();
    setApiKey('');
    setStatusText('No key saved');
    setErrorText('');
    onKeyCleared();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Settings</Text>
          {!isRequiredSetup ? (
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              hitSlop={8}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.description}>Add your OpenAI API key</Text>

        <TextInput
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="sk-..."
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          style={styles.input}
        />

        <Text style={styles.status}>{statusText}</Text>
        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

        <View style={styles.actions}>
          <Button
            label="Validate & Save"
            onPress={handleValidateAndSave}
            loading={isValidating}
            disabled={!apiKey.trim()}
          />
          <View style={styles.actionGap} />
          <Button label="Clear" onPress={handleClear} variant="secondary" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  cancelButtonText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    marginTop: 8,
    fontSize: 16,
    color: '#D1D5DB',
  },
  input: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#F9FAFB',
    backgroundColor: '#0F172A',
    fontSize: 16,
  },
  status: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  error: {
    marginTop: 6,
    color: '#FCA5A5',
    fontSize: 14,
  },
  actions: {
    marginTop: 20,
  },
  actionGap: {
    height: 12,
  },
});

export default SettingsScreen;
