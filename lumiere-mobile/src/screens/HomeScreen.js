import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ImageBackground, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/config';

const { width, height } = Dimensions.get('window');

const HERO_IMG = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';

// Professional icon definitions — no emoji
const FEATURES = [
  {
    icon: 'shield-checkmark-outline',
    title: 'Secure Payments',
    sub: 'PayPal · Credit Card · QRIS · GoPay · OVO · Dana',
  },
  {
    icon: 'leaf-outline',
    title: 'Sustainably Made',
    sub: '90% renewable materials. We plant one tree per order.',
  },
  {
    icon: 'cube-outline',
    title: 'White-Glove Delivery',
    sub: 'Full in-home assembly and placement included.',
  },
  {
    icon: 'grid-outline',
    title: 'Room Planner',
    sub: 'Visualise furniture in your space before you buy.',
  },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const heroScale   = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.15, 1], extrapolate: 'clamp' });
  const heroOpacity = scrollY.interpolate({ inputRange: [0, 200],  outputRange: [1, 0.3],  extrapolate: 'clamp' });
  const titleTY     = scrollY.interpolate({ inputRange: [0, 200],  outputRange: [0, -60],  extrapolate: 'clamp' });

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ── */}
        <View style={[styles.hero, { height: height * 0.75 }]}>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: heroScale }] }]}>
            <ImageBackground source={{ uri: HERO_IMG }} style={StyleSheet.absoluteFill} resizeMode="cover">
              <LinearGradient
                colors={['rgba(26,21,18,0.2)', 'rgba(26,21,18,0.96)']}
                locations={[0.3, 1]}
                style={StyleSheet.absoluteFill}
              />
            </ImageBackground>
          </Animated.View>

          <Animated.View
            style={[
              styles.heroContent,
              { opacity: heroOpacity, transform: [{ translateY: titleTY }], paddingTop: insets.top + 80 },
            ]}
          >
            <Text style={styles.heroEye}>SCANDINAVIAN DESIGN · SINCE 1943</Text>
            <Text style={styles.heroTitle}>
              Furniture{'\n'}for{' '}
              <Text style={styles.heroTitleItalic}>real{'\n'}living</Text>
            </Text>
            <Text style={styles.heroSub}>
              Beautifully crafted pieces for every room. Free delivery over $500.
            </Text>
            <View style={styles.heroBtns}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => navigation.navigate('Catalog')}
              >
                <Text style={styles.btnPrimaryText}>SHOP COLLECTION</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() => navigation.navigate('Planner')}
              >
                <Text style={styles.btnOutlineText}>ROOM PLANNER</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* ── MARQUEE STRIP ── */}
        <View style={styles.strip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
            {[
              'PayPal & Cards',
              'QRIS Indonesia',
              'Free Delivery $500+',
              '10-Year Guarantee',
              'Expert Design Help',
              'Room Planner',
              '2,400+ Products',
              'White-Glove Assembly',
            ].map((t, i) => (
              <View key={i} style={styles.stripItem}>
                <Text style={styles.stripText}>{t}</Text>
                <View style={styles.stripDot} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── QUICK CATEGORIES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTag}>BROWSE BY ROOM</Text>
          <Text style={styles.sectionTitle}>Collections</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {[
              { label: 'Living',   img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80' },
              { label: 'Bedroom',  img: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=300&q=80' },
              { label: 'Dining',   img: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=300&q=80' },
              { label: 'Office',   img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300&q=80' },
              { label: 'Lighting', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&q=80' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={styles.catCard}
                onPress={() => navigation.navigate('Catalog', { category: cat.label })}
              >
                <ImageBackground
                  source={{ uri: cat.img }}
                  style={styles.catImg}
                  imageStyle={{ borderRadius: 2 }}
                >
                  <LinearGradient colors={['transparent', 'rgba(26,21,18,0.85)']} style={styles.catGrad}>
                    <Text style={styles.catLabel}>{cat.label.toUpperCase()}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── FEATURES ── */}
        <View style={[styles.section, { paddingBottom: 32 }]}>
          <Text style={styles.sectionTag}>WHY LUMIÈRE</Text>
          <Text style={styles.sectionTitle}>Our Promise</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              {/* Icon container — gold background square, no emoji */}
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={20} color={COLORS.gold} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── BOTTOM CTA ── */}
        <View style={styles.cta}>
          <LinearGradient colors={[COLORS.dark2, COLORS.dark3]} style={styles.ctaInner}>
            {/* Decorative corner accent */}
            <View style={styles.ctaAccent} />
            <Text style={styles.ctaTag}>DESIGN STUDIO</Text>
            <Text style={styles.ctaTitle}>Design your{'\n'}dream room</Text>
            <Text style={styles.ctaSub}>Place furniture virtually before you buy</Text>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('Planner')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="grid-outline" size={14} color={COLORS.dark} />
                <Text style={styles.btnPrimaryText}>OPEN ROOM PLANNER</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 32 + insets.bottom }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: COLORS.dark },
  hero:            { position: 'relative', justifyContent: 'flex-end' },
  heroContent:     { paddingHorizontal: 28, paddingBottom: 40 },
  heroEye:         { color: COLORS.gold, fontSize: 10, letterSpacing: 4, marginBottom: 14, fontWeight: '600' },
  heroTitle:       { color: COLORS.cream, fontSize: 52, lineHeight: 52, marginBottom: 16, fontWeight: '300', letterSpacing: -1 },
  heroTitleItalic: { color: COLORS.gold, fontStyle: 'italic' },
  heroSub:         { color: COLORS.muted, fontSize: 14, lineHeight: 22, marginBottom: 28, maxWidth: 280 },
  heroBtns:        { flexDirection: 'row', gap: 12 },

  btnPrimary:     { backgroundColor: COLORS.gold, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
  btnPrimaryText: { color: COLORS.dark, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  btnOutline:     { borderWidth: 1, borderColor: 'rgba(247,242,234,0.3)', paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
  btnOutlineText: { color: COLORS.cream, fontSize: 11, letterSpacing: 2, fontWeight: '600' },

  strip:     { backgroundColor: COLORS.dark2, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(196,149,90,0.12)' },
  stripItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  stripText: { color: COLORS.muted, fontSize: 12, letterSpacing: 2 },
  stripDot:  { width: 4, height: 4, backgroundColor: COLORS.gold, borderRadius: 2, marginLeft: 16 },

  section:      { paddingHorizontal: 24, paddingTop: 40 },
  sectionTag:   { color: COLORS.gold, fontSize: 10, letterSpacing: 4, marginBottom: 8, fontWeight: '600' },
  sectionTitle: { color: COLORS.cream, fontSize: 32, fontWeight: '300', marginBottom: 24, letterSpacing: -0.5 },

  catScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
  catCard:   { width: 140, height: 180, marginRight: 10 },
  catImg:    { flex: 1, justifyContent: 'flex-end' },
  catGrad:   { padding: 14 },
  catLabel:  { color: COLORS.cream, fontSize: 11, letterSpacing: 2, fontWeight: '700' },

  featureRow:     { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 18, borderBottomWidth: 1, borderColor: 'rgba(196,149,90,0.08)', gap: 16 },
  featureIconWrap: { width: 40, height: 40, backgroundColor: 'rgba(196,149,90,0.1)', borderWidth: 1, borderColor: 'rgba(196,149,90,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText:    { flex: 1 },
  featureTitle:   { color: COLORS.cream, fontSize: 16, fontWeight: '500', marginBottom: 4 },
  featureSub:     { color: COLORS.muted, fontSize: 13, lineHeight: 20 },

  cta:       { margin: 24 },
  ctaInner:  { padding: 32, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  ctaAccent: { position: 'absolute', top: 0, left: 0, width: 3, height: '100%', backgroundColor: COLORS.gold },
  ctaTag:    { color: COLORS.gold, fontSize: 10, letterSpacing: 4, fontWeight: '600', marginBottom: 12 },
  ctaTitle:  { color: COLORS.cream, fontSize: 32, fontWeight: '300', textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 },
  ctaSub:    { color: COLORS.muted, fontSize: 14, marginBottom: 24, textAlign: 'center' },
});