import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';

const OverviewPage = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Barangay Bunawan</Text>
      <Text style={styles.subtitle}>City of Iligan</Text>
      <Text style={styles.description}>
        Bunawan is a barangay in the city of Iligan. Its population as determined by the 2020 Census was 2,025. This represented 0.56% of the total population of Iligan.
      </Text>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#6366F1' }]}>
          <Text style={styles.statName}>Total Population</Text>
          <Text style={styles.statValue}>2,025</Text>
          <Text style={styles.statSubtitle}>[2020]</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#8B5CF6' }]}>
          <Text style={styles.statName}>Area</Text>
          <Text style={styles.statValue}>13.15 km²</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#EC4899' }]}>
          <Text style={styles.statName}>Population Density</Text>
          <Text style={styles.statValue}>153.9/km²</Text>
          <Text style={styles.statSubtitle}>[2020]</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
          <Text style={styles.statName}>Annual Population Change</Text>
          <Text style={styles.statValue}>1.9%</Text>
          <Text style={styles.statSubtitle}>[2015 → 2020]</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary Data</Text>
        <Text style={styles.summaryItem}>Type: Barangay</Text>
        <Text style={styles.summaryItem}>Island group: Mindanao</Text>
        <Text style={styles.summaryItem}>Region: Northern Mindanao (Region X)</Text>
        <Text style={styles.summaryItem}>City: Iligan</Text>
        <Text style={styles.summaryItem}>Postal code: 9200</Text>
        <Text style={styles.summaryItem}>Population (2020): 2,025</Text>
        <Text style={styles.summaryItem}>Coordinates: 8.3023, 124.3028 (8° 18' North, 124° 18' East)</Text>
        <Text style={styles.summaryItem}>Estimated elevation above sea level: 342.6 meters (1,124.0 feet)</Text>
      </View>

      <View style={styles.visionMissionContainer}>
        <Text style={styles.sectionTitle}>Vision</Text>
        <Text style={styles.sectionText}>
          Barangay Bunawan envisions a progressive, peaceful, and environmentally sustainable community where residents thrive in a safe and inclusive environment. 
          We aim to foster unity, economic growth, and social development while preserving our cultural heritage and natural resources.
        </Text>
        <Text style={styles.sectionTitle}>Mission</Text>
        <Text style={styles.sectionText}>
          Our mission is to provide transparent and efficient governance that empowers every resident of Barangay Bunawan. 
          We are committed to delivering quality public services, promoting sustainable livelihood programs, ensuring public safety, 
          and enhancing community welfare through active participation, innovation, and collaboration.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 16, color: '#ccc', textAlign: 'center', marginBottom: 24 },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { width: '48%', borderRadius: 8, padding: 16, marginBottom: 16 },
  statName: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statSubtitle: { color: '#ddd', fontSize: 12 },
  summaryContainer: { backgroundColor: 'rgba(55, 65, 81, 0.8)', borderRadius: 8, padding: 16, marginBottom: 24 },
  summaryTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' },
  summaryItem: { color: '#ddd', fontSize: 14, marginBottom: 6 },
  visionMissionContainer: { backgroundColor: 'rgba(55, 65, 81, 0.8)', borderRadius: 8, padding: 16, marginBottom: 24 },
  sectionTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' },
  sectionText: { color: '#ccc', fontSize: 14, textAlign: 'justify', marginBottom: 12 },
});

export default OverviewPage;
