import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

function formatValue(value: string): string {
  return value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function ResultScreen({ navigation, route }: Props) {
  const { analysis } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Outfit Analysis</Text>
        <Text style={styles.subtitle}>Quick stylist feedback</Text>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Verdict</Text>
          <Text style={styles.metricValue}>
            {formatValue(analysis.verdict)}
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Outfit type</Text>
          <Text style={styles.metricValue}>
            {formatValue(analysis.outfitType)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recommended for</Text>
        <View style={styles.chipRow}>
          {analysis.recommendedFor.map(item => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Color matching</Text>
          <Text style={styles.metricValue}>
            {formatValue(analysis.colorMatching)}
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Style consistency</Text>
          <Text style={styles.metricValue}>
            {formatValue(analysis.styleConsistency)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Explanation</Text>
        <Text style={styles.bodyText}>{analysis.explanation}</Text>

        <Text style={styles.sectionTitle}>Suggestions</Text>
        {analysis.suggestions.length > 0 ? (
          analysis.suggestions.map(suggestion => (
            <Text key={suggestion} style={styles.bodyText}>
              - {suggestion}
            </Text>
          ))
        ) : (
          <Text style={styles.bodyText}>No changes needed.</Text>
        )}

        <View style={styles.actions}>
          <Button
            label="Analyze another outfit"
            onPress={() => navigation.popToTop()}
          />
          <View style={styles.actionGap} />
          <Button
            label="Settings"
            variant="secondary"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0B1020',
    paddingHorizontal: 20,
    paddingVertical: 24,
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
    marginTop: 6,
    fontSize: 14,
    color: '#9CA3AF',
  },
  metricBox: {
    marginTop: 12,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricValue: {
    marginTop: 4,
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 16,
    color: '#F9FAFB',
    fontWeight: '700',
    fontSize: 15,
  },
  chipRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#172033',
    borderWidth: 1,
    borderColor: '#2A3448',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  bodyText: {
    marginTop: 8,
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 20,
  },
  actionGap: {
    height: 12,
  },
});

export default ResultScreen;
