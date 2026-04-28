import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OutfitAI is ready</Text>
      <Text style={styles.subtitle}>
        API key is saved. Camera and outfit analysis will come next.
      </Text>

      <PrimaryButton
        label="Settings"
        onPress={() => navigation.navigate('Settings')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#0B0B0F',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
});

