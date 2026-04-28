import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoPreview'>;

export function PhotoPreviewScreen({ navigation, route }: Props) {
  const { imageUri } = route.params;

  function handleAnalyze() {
    console.log('Analyze outfit pressed for image:', imageUri);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photo preview</Text>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

      <View style={styles.actions}>
        <PrimaryButton
          label="Retake"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.action}
        />
        <PrimaryButton
          label="Analyze outfit"
          onPress={handleAnalyze}
          style={styles.action}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  image: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#1F2937',
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
  },
});

