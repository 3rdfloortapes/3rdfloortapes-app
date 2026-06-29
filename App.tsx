import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, SafeAreaView,
  BackHandler,
} from 'react-native';
import { CartProvider, useCart } from './src/hooks/useCart';
import HomeScreen from './src/screens/HomeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import ProductScreen from './src/screens/ProductScreen';
import MakeOfferScreen from './src/screens/MakeOfferScreen';
import MyOffersScreen from './src/screens/MyOffersScreen';
import CartScreen from './src/screens/CartScreen';
import DrawerMenu from './src/components/DrawerMenu';

function Main() {
  const [screen, setScreen] = useState('home');
  const [params, setParams] = useState<any>({});
  const [activeTab, setActiveTab] = useState('shop');
  const [history, setHistory] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (drawerOpen) { setDrawerOpen(false); return true; }
      if (screen !== 'home') { goBack(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [screen, history, drawerOpen]);

  const showBack = screen !== 'home' && screen !== 'myoffers' && screen !== 'cart';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.hamburger}>
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>
        {showBack && (
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
        )}
      </View>
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
          <Text style={styles.tabIcon}>🏠</Text>
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
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} navigation={navigation} />
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
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, paddingTop: 20,
    borderBottomWidth: 1, borderBottomColor: '#222222',
    backgroundColor: '#000000',
  },
  hamburger: { paddingRight: 16 },
  hamburgerText: { color: '#FFFFFF', fontSize: 22 },
  backBtn: { flex: 1 },
  backText: { color: '#FFFFFF', fontSize: 12, letterSpacing: 1 },
  screen: { flex: 1 },
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
