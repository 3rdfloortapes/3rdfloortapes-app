import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Alert, ActivityIndicator,
  Dimensions, FlatList,
} from 'react-native';
import { formatPrice, getFirstVariant } from '../api/shopify';
import { useCart } from '../hooks/useCart';

const { width } = Dimensions.get('window');

export default function ProductScreen({ route, navigation }: any) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const variant = getFirstVariant(product);
  const price = variant?.price?.amount ? formatPrice(variant.price.amount) : '';
  const [adding, setAdding] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = product?.images?.edges?.map((e: any) => e.node?.url).filter(Boolean) ?? [];

  async function handleAddToCart() {
    if (!variant?.id) return;
    setAdding(true);
    try {
      await addToCart(variant.id);
      Alert.alert('Added!', `${product.title} added to cart.`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {images.length > 0 ? (
        <View>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
            )}
          />
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_: any, i: number) => (
                <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={{ fontSize: 48 }}>📼</Text>
        </View>
      )}

      <View style={styles.details}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{price}</Text>
        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        {product.availableForSale ? (
          <>
            <TouchableOpacity style={styles.btn} onPress={handleAddToCart} disabled={adding}>
              {adding
                ? <ActivityIndicator color="#000000" />
                : <Text style={styles.btnText}>ADD TO CART</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnOffer]}
              onPress={() => navigation.navigate('MakeOffer', { product })}
            >
              <Text style={[styles.btnText, { color: '#FFFFFF' }]}>MAKE AN OFFER</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.soldOutBtn}>
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingBottom: 48 },
  image: { width, height: 320, backgroundColor: '#111111' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#444', marginHorizontal: 3 },
  dotActive: { backgroundColor: '#FFFFFF' },
  details: { padding: 16 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  price: { color: '#999999', fontSize: 16, marginBottom: 16 },
  description: { color: '#999999', fontSize: 13, lineHeight: 20, marginBottom: 24 },
  btn: { backgroundColor: '#FFFFFF', padding: 14, alignItems: 'center', marginBottom: 12 },
  btnOffer: { backgroundColor: '#000000', borderWidth: 1, borderColor: '#FFFFFF' },
  btnText: { color: '#000000', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  soldOutBtn: { padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  soldOutText: { color: '#666666', fontSize: 12, letterSpacing: 2 },
});
