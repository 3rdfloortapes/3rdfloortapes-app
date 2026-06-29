import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Image,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { submitOffer } from '../api/offers';
import { formatPrice, getProductImage, getFirstVariant } from '../api/shopify';

export default function MakeOfferScreen({ route, navigation }: any) {
  const { product } = route.params;
  const variant = getFirstVariant(product);
  const imageUrl = getProductImage(product);
  const listPrice = parseFloat(variant?.price?.amount ?? '0');

  const [offerPrice, setOfferPrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [multiItem, setMultiItem] = useState(false);
  const [openToCounter, setOpenToCounter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const offerNum = parseFloat(offerPrice);
  const isValidOffer = offerNum > 0 && offerNum < listPrice;
  const savingsAmount = isValidOffer ? listPrice - offerNum : 0;
  const savingsPct = isValidOffer ? Math.round((savingsAmount / listPrice) * 100) : 0;

  async function handleSubmit() {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      Alert.alert('Missing info', 'Please enter your name and email.');
      return;
    }
    if (!isValidOffer) {
      Alert.alert('Invalid offer', `Offer must be less than ${formatPrice(String(listPrice))}.`);
      return;
    }
    setLoading(true);
    try {
      await submitOffer({
        product_id: product.id,
        variant_id: variant?.id,
        product_title: product.title,
        product_image: imageUrl ?? undefined,
        list_price: listPrice,
        offer_price: offerNum,
        buyer_name: buyerName.trim(),
        buyer_email: buyerEmail.trim().toLowerCase(),
        message: message.trim() || undefined,
        multi_item: multiItem,
        open_to_counter: openToCounter,
      });
      setSubmitted(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit offer.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.bigEmoji}>📼</Text>
        <Text style={styles.heroText}>OFFER SUBMITTED</Text>
        <Text style={styles.subText}>
          Your offer of <Text style={styles.accent}>{formatPrice(String(offerNum))}</Text> for{' '}
          <Text style={{ fontStyle: 'italic' }}>{product.title}</Text> has been sent.{'\n\n'}
          {multiItem
            ? 'Since you\'re offering on multiple items, we\'ll send you a custom invoice if your offers are accepted.'
            : 'If accepted, you\'ll receive a custom invoice.'}
          {'\n\n'}
          You may or may not receive a counter offer. We\'ll be in touch by email.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>KEEP BROWSING</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.productRow}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productThumb} />
          ) : (
            <View style={[styles.productThumb, styles.thumbPlaceholder]}>
              <Text style={{ fontSize: 28 }}>📼</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.productTitle} numberOfLines={3}>{product.title}</Text>
            <Text style={styles.listPrice}>List: {formatPrice(String(listPrice))}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>YOUR OFFER</Text>
        <View style={styles.priceInputRow}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.priceInput}
            value={offerPrice}
            onChangeText={setOfferPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#555"
            maxLength={7}
          />
        </View>
        {isValidOffer && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{savingsPct}% off · you'd save {formatPrice(String(savingsAmount))}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>MULTIPLE ITEMS?</Text>
            <Text style={styles.toggleHint}>Making offers on more than one item?</Text>
          </View>
          <Switch
            value={multiItem}
            onValueChange={setMultiItem}
            trackColor={{ false: '#333', true: '#FFFFFF' }}
            thumbColor={multiItem ? '#000000' : '#888'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>OPEN TO COUNTER?</Text>
            <Text style={styles.toggleHint}>Would you accept a counter offer?</Text>
          </View>
          <Switch
            value={openToCounter}
            onValueChange={setOpenToCounter}
            trackColor={{ false: '#333', true: '#FFFFFF' }}
            thumbColor={openToCounter ? '#000000' : '#888'}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>YOUR NAME</Text>
        <TextInput
          style={styles.input}
          value={buyerName}
          onChangeText={setBuyerName}
          placeholder="First Last"
          placeholderTextColor="#555"
          autoCapitalize="words"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>EMAIL</Text>
        <TextInput
          style={styles.input}
          value={buyerEmail}
          onChangeText={setBuyerEmail}
          placeholder="you@example.com"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>MESSAGE <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="e.g. Happy to bundle if you have other tapes..."
          placeholderTextColor="#555"
          multiline
          numberOfLines={3}
          maxLength={300}
        />

        <View style={styles.finePrint}>
          <Text style={styles.finePrintText}>
            If accepted, you'll receive a custom invoice via email.{' '}
            You may or may not receive a counter offer.{' '}
            No offer is guaranteed.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, (!isValidOffer || loading) && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={!isValidOffer || loading}
        >
          {loading
            ? <ActivityIndicator color="#000000" />
            : <Text style={styles.btnText}>SUBMIT OFFER</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  formContainer: { padding: 16, paddingBottom: 48 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  productThumb: { width: 72, height: 72, backgroundColor: '#111' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  productTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  listPrice: { color: '#999999', fontSize: 12, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 16 },
  label: { color: '#999999', fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  optional: { color: '#555', fontStyle: 'italic', letterSpacing: 0 },
  priceInputRow: { flexDirection: 'row', alignItems: 'center' },
  dollarSign: { color: '#FFFFFF', fontSize: 32, marginRight: 8 },
  priceInput: { color: '#FFFFFF', fontSize: 32, fontWeight: '700', flex: 1, borderBottomWidth: 2, borderBottomColor: '#FFFFFF', paddingVertical: 4 },
  savingsBadge: { marginTop: 8, backgroundColor: '#111', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', borderLeftWidth: 3, borderLeftColor: '#FFFFFF' },
  savingsText: { color: '#FFFFFF', fontSize: 11, letterSpacing: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  toggleHint: { color: '#555', fontSize: 11, marginTop: 2 },
  input: { backgroundColor: '#111', color: '#FFFFFF', fontSize: 14, borderRadius: 4, borderWidth: 1, borderColor: '#333', paddingHorizontal: 12, paddingVertical: 10 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  finePrint: { marginTop: 24, marginBottom: 8, padding: 12, borderRadius: 4, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed' },
  finePrintText: { color: '#555', fontSize: 11, lineHeight: 18, fontStyle: 'italic' },
  btn: { backgroundColor: '#FFFFFF', borderRadius: 4, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', marginTop: 12 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#000000', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  bigEmoji: { fontSize: 56, marginBottom: 16 },
  heroText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 16 },
  subText: { color: '#999', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  accent: { color: '#FFFFFF', fontWeight: 'bold' },
});
