import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Animated, Dimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCart } from '../context/CartContext';
import { COLORS } from '../utils/config';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { add } = useCart();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const imgH = width * 0.9;
  const imgScale = scrollY.interpolate({ inputRange: [-80, 0], outputRange: [1.2, 1], extrapolate: 'clamp' });
  const imgOpacity = scrollY.interpolate({ inputRange: [0, imgH * 0.5], outputRange: [1, 0.6], extrapolate: 'clamp' });

  const handleAdd = () => {
    add(product);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Added!', `${product.name} added to cart.`, [
      { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
      { text: 'Continue', style: 'cancel' },
    ]);
  };

  const handlePlaceRoom = () => navigation.navigate('Planner', { addProduct: product });

  const SPECS = [
    { label: 'Dimensions', value: product.dims },
    { label: 'Material',   value: product.material },
    { label: 'Warranty',   value: product.warranty },
    { label: 'Series',     value: product.series },
    { label: 'Category',   value: product.category },
  ];

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        <Animated.View style={{ height: imgH, transform: [{ scale: imgScale }], opacity: imgOpacity }}>
          <Image source={{ uri: product.img }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(26,21,18,0.6)']} style={StyleSheet.absoluteFill} />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.cat}>{product.category.toUpperCase()} · {product.series}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toLocaleString()}</Text>
          <Text style={styles.desc}>{product.desc}</Text>

          {/* Specs */}
          <View style={styles.specsBox}>
            <Text style={styles.specsTitle}>SPECIFICATIONS</Text>
            {SPECS.map(s => (
              <View key={s.label} style={styles.specRow}>
                <Text style={styles.specLabel}>{s.label}</Text>
                <Text style={styles.specValue}>{s.value}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 120 + insets.bottom }} />
        </View>
      </Animated.ScrollView>

      {/* Back button */}
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 12 }]} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.priceCol}>
          <Text style={styles.bottomLabel}>PRICE</Text>
          <Text style={styles.bottomPrice}>${product.price.toLocaleString()}</Text>
        </View>
        <View style={styles.bottomBtns}>
          <TouchableOpacity style={styles.roomBtn} onPress={handlePlaceRoom}>
            <Text style={styles.roomBtnText}>📐 TRY IN ROOM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartBtn} onPress={handleAdd}>
            <Text style={styles.cartBtnText}>ADD TO CART</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.dark },
  content: { backgroundColor: COLORS.dark, padding: 24, marginTop: -20 },
  cat: { color: COLORS.gold, fontSize: 10, letterSpacing: 4, marginBottom: 8, fontWeight: '600' },
  name: { color: COLORS.cream, fontSize: 34, fontWeight: '300', letterSpacing: -0.5, marginBottom: 8, lineHeight: 38 },
  price: { color: COLORS.gold, fontSize: 24, fontWeight: '600', marginBottom: 16 },
  desc: { color: COLORS.muted, fontSize: 14, lineHeight: 24, marginBottom: 28 },
  specsBox: { backgroundColor: COLORS.dark2, padding: 20, borderLeftWidth: 2, borderColor: COLORS.gold },
  specsTitle: { color: COLORS.gold, fontSize: 10, letterSpacing: 3, marginBottom: 16, fontWeight: '600' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: 'rgba(196,149,90,0.08)' },
  specLabel: { color: COLORS.muted, fontSize: 12, letterSpacing: 1 },
  specValue: { color: COLORS.cream, fontSize: 12, textAlign: 'right', flex: 1, marginLeft: 16 },
  backBtn: { position: 'absolute', left: 16, width: 40, height: 40, backgroundColor: 'rgba(26,21,18,0.8)', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: COLORS.cream, fontSize: 20 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.dark2, borderTopWidth: 1, borderColor: 'rgba(196,149,90,0.15)', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceCol: { marginRight: 8 },
  bottomLabel: { color: COLORS.muted, fontSize: 9, letterSpacing: 2 },
  bottomPrice: { color: COLORS.gold, fontSize: 20, fontWeight: '600' },
  bottomBtns: { flex: 1, flexDirection: 'row', gap: 8 },
  roomBtn: { flex: 1, borderWidth: 1, borderColor: 'rgba(196,149,90,0.3)', paddingVertical: 13, alignItems: 'center' },
  roomBtnText: { color: COLORS.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: '600' },
  cartBtn: { flex: 1.4, backgroundColor: COLORS.gold, paddingVertical: 13, alignItems: 'center' },
  cartBtnText: { color: COLORS.dark, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
});
