import * as React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;
    navigation.navigate('PhotoPreview', { imageUri: result.assets[0].uri });
  }

  async function handleChooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to choose an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;
    navigation.navigate('PhotoPreview', { imageUri: result.assets[0].uri });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OutfitAI is ready</Text>
      <Text style={styles.subtitle}>
        API key is saved. Camera and outfit analysis will come next.
      </Text>

      <PrimaryButton
        label="Take photo"
        onPress={handleTakePhoto}
        style={styles.button}
      />
      <PrimaryButton
        label="Choose from library"
        onPress={handleChooseFromLibrary}
        variant="secondary"
        style={styles.button}
      />
      <PrimaryButton
        label="Settings"
        onPress={() => navigation.navigate('Settings')}
        variant="secondary"
        style={styles.settingsButton}
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
    marginTop: 10,
  },
  settingsButton: {
    marginTop: 18,
  },
});

