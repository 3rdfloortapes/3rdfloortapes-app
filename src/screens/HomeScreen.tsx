import React, { useEffect, useState } from 'react';
import { Image, View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchCollections } from '../api/shopify';

export default function HomeScreen({ navigation }: any) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections(24).then(setCollections).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}><Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.storeName}>3RD FLOOR{'\n'}TAPES</Text>
        
      </View>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>📦 Flat-rate $6.50 on $20+ · Free shipping on $75+ · Ships worldwide</Text>
      </View>
      <Text style={styles.sectionLabel}>BROWSE BY GENRE</Text>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="large" style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.grid}>
          {collections.map((col) => (
            <TouchableOpacity
              key={col.id}
              style={styles.collectionCard}
              onPress={() => navigation.navigate('collection', { handle: col.handle, title: col.title })}
              activeOpacity={0.8}
            >
              {col.image ? (
                <Image source={{ uri: col.image.url }} style={styles.collectionImage} />
              ) : (
                <View style={[styles.collectionImage, styles.placeholder]}>
                  <Text style={{ fontSize: 32 }}>📼</Text>
                </View>
              )}
              <View style={styles.collectionLabel}>
                <Text style={styles.collectionTitle} numberOfLines={2}>{col.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerStore}>3RD FLOOR TAPES</Text>
        <Text style={styles.footerLocation}>Based in Chicago, IL · Est. 2019</Text>
        <Text style={styles.footerCredit}>app designed by Lieutenant Bigelow</Text>
        <Text style={styles.footerArt}>Logo by Alex Borrego (@brownyuio)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingBottom: 32 },
  header: { paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16 },
  storeName: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', letterSpacing: 4, lineHeight: 40, marginBottom: 12 },
  tagline: { color: '#999999', fontSize: 11, fontStyle: 'italic', lineHeight: 18 },
  banner: { backgroundColor: '#FFFFFF', paddingVertical: 8, paddingHorizontal: 16, marginBottom: 24 },
  bannerText: { color: '#000000', fontSize: 11, textAlign: 'center' },
  sectionLabel: { color: '#999999', fontSize: 11, letterSpacing: 3, paddingHorizontal: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  collectionCard: { width: '47%', backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333', overflow: 'hidden' },
  collectionImage: { width: '100%', height: 100, backgroundColor: '#222222' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  collectionLabel: { padding: 8 },
  collectionTitle: { color: '#FFFFFF', fontSize: 11, letterSpacing: 0.5, fontWeight: '700' },
  footer: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16 },
  footerDivider: { width: 40, height: 1, backgroundColor: '#333333', marginBottom: 16 },
  footerStore: { color: '#333333', fontSize: 11, letterSpacing: 3, marginBottom: 4 },
  footerLocation: { color: '#333333', fontSize: 11, marginBottom: 8 },
  footerCredit: { color: '#555555', fontSize: 11, fontStyle: 'italic' },
  footerArt: { color: '#555555', fontSize: 11, fontStyle: 'italic', marginTop: 4 },
});
