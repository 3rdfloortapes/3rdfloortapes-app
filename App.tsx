import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { CartProvider, useCart } from './src/hooks/useCart';
import HomeScreen from './src/screens/HomeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import ProductScreen from './src/screens/ProductScreen';
import MakeOfferScreen from './src/screens/MakeOfferScreen';
import MyOffersScreen from './src/screens/MyOffersScreen';
import CartScreen from './src/screens/CartScreen';

function Main() {
  const [screen, setScreen] = useState('home');
  const [params, setParams] = useState<any>({});
  const [activeTab, setActiveTab] = useState('shop');
  const [history, setHistory] = useState<string[]>([]);
  const { itemCount } = useCart();

  function navigate(screenName: string, screenParams?: any) {
    setHistory(h => [...h, screen]);
    setParams(screenParams ?? {});
    setScreen(screenName);
    if (screenName === 'myoffers') setActiveTab('offers');
    if (screenName === 'cart') setActiveTab('cart');
    if (screenName === 'home') setActiveTab('shop');
  }

  function goBack() {
    const prev = history[history.length - 1] ?? 'home';
    setHistory(h => h.slice(0, -1));
    setScreen(prev);
  }

  const navigation = { navigate, goBack };

  const showBack = screen !== 'home' && screen !== 'myoffers' && screen !== 'cart';

  return (
    <SafeAreaView style={styles.container}>
      {showBack && (
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
      )}
      <View style={styles.screen}>
        {screen === 'home' && <HomeScreen navigation={navigation} />}
        {screen === 'collection' && <CollectionScreen route={{ params }} navigation={navigation} />}
        {screen === 'product' && <ProductScreen route={{ params }} navigation={navigation} />}
        {screen === 'MakeOffer' && <MakeOfferScreen route={{ params }} navigation={navigation} />}
        {screen === 'myoffers' && <MyOffersScreen navigation={navigation} />}
        {screen === 'cart' && <CartScreen navigation={navigation} />}
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} onPress={() => { setScreen('home'); setActiveTab('shop'); }}>
          <Text style={styles.tabIcon}>📼</Text>
          <Text style={[styles.tabLabel, activeTab === 'shop' && styles.tabActive]}>SHOP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => { setScreen('cart'); setActiveTab('cart'); }}>
          <Text style={styles.tabIcon}>🛒</Text>
          <Text style={[styles.tabLabel, activeTab === 'cart' && styles.tabActive]}>
            CART {itemCount > 0 ? `(${itemCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => { setScreen('myoffers'); setActiveTab('offers'); }}>
          <Text style={styles.tabIcon}>💬</Text>
          <Text style={[styles.tabLabel, activeTab === 'offers' && styles.tabActive]}>OFFERS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Main />
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  screen: { flex: 1 },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#222222' },
  backText: { color: '#FFFFFF', fontSize: 12, letterSpacing: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingBottom: 30,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 20 },
  tabLabel: { color: '#555555', fontSize: 11, letterSpacing: 1, marginTop: 2 },
  tabActive: { color: '#FFFFFF' },
});
