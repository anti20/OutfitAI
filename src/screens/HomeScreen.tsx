import React from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import Button from '../components/Button';
import {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function HomeScreen({navigation}: Props) {
  const handleImagePickerResult = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert(
        'Unable to open image picker',
        response.errorMessage ?? 'Please try again.',
      );
      return;
    }

    const selectedAsset = response.assets?.[0];
    const imageUri = selectedAsset?.uri;

    if (!imageUri) {
      Alert.alert('No image selected', 'Please choose a valid photo and try again.');
      return;
    }

    navigation.navigate('PhotoPreview', {
      imageUri,
      fileName: selectedAsset.fileName,
      type: selectedAsset.type,
    });
  };

  const handleTakePhoto = async () => {
    const response = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    });

    handleImagePickerResult(response);
  };

  const handleChooseFromLibrary = async () => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    });

    handleImagePickerResult(response);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.settingsPill}
          onPress={() => navigation.navigate('Settings')}
          hitSlop={8}>
          <Text style={styles.settingsPillText}>Settings</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>OutfitAI</Text>
        <Text style={styles.subtitle}>OutfitAI is ready</Text>

        <View style={styles.actions}>
          <Button label="Take photo" onPress={handleTakePhoto} />
          <View style={styles.actionGap} />
          <Button
            label="Choose from library"
            onPress={handleChooseFromLibrary}
            variant="secondary"
          />
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
    paddingTop: 56,
    justifyContent: 'flex-start',
  },
  topBar: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  settingsPill: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  settingsPillText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginTop: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#F9FAFB',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  actions: {
    marginTop: 28,
  },
  actionGap: {
    height: 12,
  },
});

export default HomeScreen;
