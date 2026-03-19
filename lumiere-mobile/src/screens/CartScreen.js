import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCart } from '../context/CartContext';
import { COLORS, SHIPPING } from '../utils/config';

function CartItem({ item, onRemove, onUpdate }) {
  return (
    <View style={styles.item}>
      <Image source={{ uri: item.thumb }} style={styles.itemImg} resizeMode="cover" />
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSeries}>{item.series}</Text>
          </View>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(); onRemove(item.id); }}>
            <Text style={styles.removeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemBottom}>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => onUpdate(item.id, item.qty - 1)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{item.qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => onUpdate(item.id, item.qty + 1)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.itemPrice}>${(item.price * item.qty).toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items, remove, update, count, subtotal, total, clear } = useCart();

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clear },
    ]);
  };

  if (items.length === 0) {
    return (
      <View style={[styles.root, styles.empty, { paddingTop: insets.top }]}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Add some beautiful furniture to get started</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Catalog')}>
          <Text style={styles.shopBtnText}>BROWSE COLLECTION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>YOUR CART</Text>
          <Text style={styles.headerTitle}>{count} Item{count !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearBtn}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* Items */}
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => (
          <CartItem item={item} onRemove={remove} onUpdate={update} />
        )}
        contentContainerStyle={{ padding: 20, gap: 2, paddingBottom: 260 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary + Checkout */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>${SHIPPING}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT  →</Text>
        </TouchableOpacity>
        <Text style={styles.secureNote}>🔒 Secured by Stripe · PayPal · Midtrans</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.dark },
  empty: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 20, opacity: 0.5 },
  emptyTitle: { color: COLORS.cream, fontSize: 24, fontWeight: '300', marginBottom: 10 },
  emptySub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  shopBtn: { backgroundColor: COLORS.gold, paddingVertical: 14, paddingHorizontal: 28 },
  shopBtnText: { color: COLORS.dark, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderColor: 'rgba(196,149,90,0.1)' },
  headerTag: { color: COLORS.gold, fontSize: 10, letterSpacing: 4, fontWeight: '600' },
  headerTitle: { color: COLORS.cream, fontSize: 28, fontWeight: '300' },
  clearBtn: { color: COLORS.muted, fontSize: 12, letterSpacing: 1 },
  item: { flexDirection: 'row', backgroundColor: COLORS.dark2, padding: 14, gap: 14 },
  itemImg: { width: 80, height: 80, backgroundColor: COLORS.dark3 },
  itemInfo: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemName: { color: COLORS.cream, fontSize: 14, fontWeight: '500' },
  itemSeries: { color: COLORS.muted, fontSize: 10, letterSpacing: 1.5, marginTop: 2 },
  removeBtn: { color: COLORS.muted, fontSize: 14, padding: 4 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 28, height: 28, borderWidth: 1, borderColor: 'rgba(196,149,90,0.3)', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: COLORS.cream, fontSize: 16 },
  qtyNum: { color: COLORS.cream, fontSize: 15, minWidth: 20, textAlign: 'center' },
  itemPrice: { color: COLORS.gold, fontSize: 16, fontWeight: '600' },
  bottomCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.dark2, padding: 20, borderTopWidth: 1, borderColor: 'rgba(196,149,90,0.15)', gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryValue: { color: COLORS.muted, fontSize: 13 },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(196,149,90,0.15)', marginTop: 2 },
  totalLabel: { color: COLORS.cream, fontSize: 16, fontWeight: '600' },
  totalValue: { color: COLORS.gold, fontSize: 20, fontWeight: '700' },
  checkoutBtn: { backgroundColor: COLORS.gold, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  checkoutBtnText: { color: COLORS.dark, fontSize: 12, letterSpacing: 2.5, fontWeight: '700' },
  secureNote: { color: COLORS.muted, fontSize: 11, textAlign: 'center', letterSpacing: 0.5 },
});
