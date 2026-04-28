import React from 'react';
import {Alert, Image, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Button from '../components/Button';
import {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoPreview'>;

function PhotoPreviewScreen({navigation, route}: Props) {
  const {imageUri, fileName, type} = route.params;

  const handleAnalyzePlaceholder = () => {
    Alert.alert('Analysis coming next');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Photo Preview</Text>
        <Text style={styles.subtitle}>Review your outfit photo</Text>

        <Image source={{uri: imageUri}} style={styles.image} resizeMode="cover" />

        <Text style={styles.metaText}>File: {fileName ?? 'Unknown'}</Text>
        <Text style={styles.metaText}>Type: {type ?? 'Unknown'}</Text>

        <View style={styles.actions}>
          <Button
            label="Retake / Choose another"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
          <View style={styles.actionGap} />
          <Button label="Analyze outfit" onPress={handleAnalyzePlaceholder} />
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
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#D1D5DB',
  },
  image: {
    marginTop: 16,
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  metaText: {
    marginTop: 10,
    fontSize: 13,
    color: '#9CA3AF',
  },
  actions: {
    marginTop: 20,
  },
  actionGap: {
    height: 12,
  },
});

export default PhotoPreviewScreen;
