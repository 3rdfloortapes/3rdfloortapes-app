import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Animated, Dimensions,
} from 'react-native';
import { fetchMenu } from '../api/shopify';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.80;

export default function DrawerMenu({ visible, onClose, navigation }: any) {
  const [menu, setMenu] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    fetchMenu().then(setMenu).catch(console.error);
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  function handleItem(item: any) {
    const url = item.url || '';
    const collectionMatch = url.match(/\/collections\/([^?]+)/);
    const pageMatch = url.match(/\/pages\/([^?]+)/);
    const blogMatch = url.match(/\/blogs\/([^/]+)\/([^?]+)/);
    if (collectionMatch) {
      navigation.navigate('collection', { handle: collectionMatch[1], title: item.title });
      onClose();
    } else if (pageMatch || blogMatch || url.startsWith('http')) {
      navigation.navigate('webview', { url, title: item.title });
      onClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>3RD FLOOR TAPES</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.drawerScroll}>
          {menu?.items?.map((item: any) => (
            <View key={item.title}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  if (item.items?.length > 0) {
                    setExpanded(expanded === item.title ? null : item.title);
                  } else {
                    handleItem(item);
                  }
                }}
              >
                <Text style={styles.menuItemText}>{item.title}</Text>
                {item.items?.length > 0 && (
                  <Text style={styles.chevron}>{expanded === item.title ? '▲' : '▼'}</Text>
                )}
              </TouchableOpacity>
              {expanded === item.title && item.items?.map((sub: any) => (
                <TouchableOpacity
                  key={sub.title}
                  style={styles.subItem}
                  onPress={() => handleItem(sub)}
                >
                  <Text style={styles.subItemText}>{sub.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#333333',
  },
  drawerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#222222',
  },
  drawerTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 3 },
  closeBtn: { color: '#FFFFFF', fontSize: 18, paddingHorizontal: 8 },
  drawerScroll: { flex: 1 },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  menuItemText: { color: '#FFFFFF', fontSize: 12, letterSpacing: 1, fontWeight: '700' },
  chevron: { color: '#555555', fontSize: 10 },
  subItem: {
    paddingHorizontal: 32, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#111111',
    backgroundColor: '#0a0a0a',
  },
  subItemText: { color: '#999999', fontSize: 11, letterSpacing: 0.5 },
});
