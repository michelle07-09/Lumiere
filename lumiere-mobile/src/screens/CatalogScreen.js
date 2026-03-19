import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ScrollView, Dimensions, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { useCart } from '../context/CartContext';
import { COLORS } from '../utils/config';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48 - 8) / 2;

const TAG_COLORS = {
  Bestseller: { bg: COLORS.dark3, color: COLORS.gold },
  New:        { bg: COLORS.gold,  color: COLORS.dark  },
  Sale:       { bg: COLORS.red,   color: '#fff'       },
  Featured:   { bg: 'rgba(196,149,90,0.15)', color: COLORS.gold },
};

function ProductCard({ item, onPress, onAddCart }) {
  const tagStyle = TAG_COLORS[item.tag] || {};
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.88}>
      <View style={styles.cardImgWrap}>
        <Image source={{ uri: item.thumb }} style={styles.cardImg} resizeMode="cover" />
        {item.tag ? (
          <View style={[styles.tag, { backgroundColor: tagStyle.bg }]}>
            <Text style={[styles.tagText, { color: tagStyle.color }]}>{item.tag}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardCat}>{item.category.toUpperCase()}</Text>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSeries}>{item.series}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => onAddCart(item)}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CatalogScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { add } = useCart();
  const initialCat = route?.params?.category || 'All';
  const [activeCat, setActiveCat] = useState(initialCat);

  const filtered = activeCat === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCat);

  const handleAddCart = useCallback((product) => {
    add(product);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Added to Cart', `${product.name} has been added.`, [{ text: 'OK' }], { cancelable: true });
  }, [add]);

  const handlePress = useCallback((product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const renderItem = ({ item, index }) => (
    <View style={index % 2 === 0 ? styles.leftCol : styles.rightCol}>
      <ProductCard item={item} onPress={handlePress} onAddCart={handleAddCart} />
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>OUR COLLECTION</Text>
          <Text style={styles.headerTitle}>Furniture</Text>
        </View>
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.pill, activeCat === cat && styles.pillActive]}
            onPress={() => setActiveCat(cat)}>
            <Text style={[styles.pillText, activeCat === cat && styles.pillTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTag: { color: COLORS.gold, fontSize: 10, letterSpacing: 4, marginBottom: 4, fontWeight: '600' },
  headerTitle: { color: COLORS.cream, fontSize: 34, fontWeight: '300', letterSpacing: -0.5 },
  pillScroll: { maxHeight: 52, borderBottomWidth: 1, borderColor: 'rgba(196,149,90,0.1)' },
  pillContent: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(196,149,90,0.2)' },
  pillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  pillText: { color: COLORS.muted, fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  pillTextActive: { color: COLORS.dark },
  grid: { padding: 20 },
  row: { gap: 8, marginBottom: 8 },
  leftCol: { flex: 1 },
  rightCol: { flex: 1 },
  card: { backgroundColor: COLORS.dark2, overflow: 'hidden' },
  cardImgWrap: { position: 'relative', height: CARD_W * 1.1 },
  cardImg: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 8, letterSpacing: 1.5, fontWeight: '700' },
  cardBody: { padding: 12 },
  cardCat: { color: COLORS.gold, fontSize: 8, letterSpacing: 2, marginBottom: 3, fontWeight: '600' },
  cardName: { color: COLORS.cream, fontSize: 14, fontWeight: '500', marginBottom: 2 },
  cardSeries: { color: COLORS.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { color: COLORS.gold, fontSize: 15, fontWeight: '600' },
  addBtn: { width: 30, height: 30, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: COLORS.dark, fontSize: 20, fontWeight: '700', lineHeight: 28 },
});
