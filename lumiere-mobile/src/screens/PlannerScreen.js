import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, PanResponder, Dimensions, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PRODUCTS, ROOMS } from '../data/products';
import { useCart } from '../context/CartContext';
import { COLORS } from '../utils/config';

const { width: SW } = Dimensions.get('window');
const ROOM_W = SW - 32;
const ROOM_H = ROOM_W * 0.75;

const perspScale = (y, h) => 0.38 + (y / h) * 0.62;

function PlacedItem({ item, onMove, onDelete }) {
  const pos = useRef({ x: item.x, y: item.y });
  const sc = perspScale(item.y, ROOM_H);
  const imgW = Math.max(Math.round((item.w || 80) * sc * 0.55), 36);
  const imgH = Math.max(Math.round((item.h || 60) * sc * 0.38), 24);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const nx = Math.max(0, Math.min(ROOM_W - imgW - 10, pos.current.x + g.dx));
        const ny = Math.max(0, Math.min(ROOM_H - imgH - 10, pos.current.y + g.dy));
        onMove(item.uid, nx, ny);
      },
      onPanResponderRelease: (_, g) => {
        pos.current.x = Math.max(0, Math.min(ROOM_W - imgW - 10, pos.current.x + g.dx));
        pos.current.y = Math.max(0, Math.min(ROOM_H - imgH - 10, pos.current.y + g.dy));
      },
    })
  ).current;

  return (
    <View style={{ position: 'absolute', left: item.x, top: item.y, zIndex: Math.round(item.y) }} {...pan.panHandlers}>
      <Image
        source={{ uri: item.thumb }}
        style={{ width: imgW, height: imgH }}
        resizeMode="contain"
      />
      <TouchableOpacity style={styles.delBtn} onPress={() => onDelete(item.uid)}>
        <Text style={styles.delBtnText}>×</Text>
      </TouchableOpacity>
      <Text style={styles.itemLabel} numberOfLines={1}>{item.name}</Text>
    </View>
  );
}

export default function PlannerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { add } = useCart();
  const [room, setRoom] = useState(ROOMS[0]);
  const [placed, setPlaced] = useState([]);
  const posMap = useRef({});

  // Auto-add product if navigated here from product detail
  useEffect(() => {
    if (route?.params?.addProduct) {
      const p = route.params.addProduct;
      setPlaced(prev => [...prev, { ...p, uid: Date.now(), x: 60 + Math.random()*100, y: 40 + Math.random()*80 }]);
    }
  }, [route?.params?.addProduct]);

  const handleMove = useCallback((uid, x, y) => {
    posMap.current[uid] = { x, y };
    setPlaced(prev => prev.map(i => i.uid === uid ? { ...i, x, y } : i));
  }, []);

  const handleDelete = useCallback((uid) => {
    Haptics.impactAsync();
    setPlaced(prev => prev.filter(i => i.uid !== uid));
  }, []);

  const handleAddFurniture = (product) => {
    const uid = Date.now() + Math.random();
    setPlaced(prev => [...prev, {
      ...product, uid,
      x: 40 + Math.random() * (ROOM_W - 120),
      y: 30 + Math.random() * (ROOM_H - 100),
    }]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddAllToCart = () => {
    placed.forEach(i => add(i));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Added!', `${placed.length} item${placed.length !== 1 ? 's' : ''} added to cart.`, [
      { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
      { text: 'OK', style: 'cancel' },
    ]);
  };

  const roomTotal = placed.reduce((s, i) => s + i.price, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>DESIGN STUDIO</Text>
          <Text style={styles.headerTitle}>Room Planner</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>

        {/* Room type picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroll} contentContainerStyle={styles.roomContent}>
          {ROOMS.map(r => (
            <TouchableOpacity key={r.id} style={[styles.roomPill, room.id === r.id && styles.roomPillActive]}
              onPress={() => setRoom(r)}>
              <Text style={[styles.roomPillText, room.id === r.id && styles.roomPillTextActive]}>{r.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ROOM SCENE */}
        <View style={[styles.roomWrap, { width: ROOM_W, height: ROOM_H }]}>
          {/* Ceiling */}
          <View style={[styles.ceiling, { backgroundColor: room.wall }]} />
          {/* Back wall */}
          <View style={[styles.wallBack, { backgroundColor: room.wall }]}>
            {/* Window */}
            <View style={styles.window}>
              <View style={styles.windowCrossV} />
              <View style={styles.windowCrossH} />
              <View style={styles.windowSill} />
            </View>
            {/* Baseboard */}
            <View style={styles.baseboard} />
          </View>
          {/* Side walls */}
          <View style={[styles.wallLeft, { backgroundColor: room.accent }]} />
          <View style={[styles.wallRight, { backgroundColor: room.accent }]} />
          {/* Floor */}
          <View style={[styles.floor, { backgroundColor: room.floor }]}>
            {[0.25, 0.5, 0.75].map((t, i) => (
              <View key={i} style={[styles.floorLine, { top: `${t * 100}%` }]} />
            ))}
            {[0.25, 0.5, 0.75].map((t, i) => (
              <View key={`v${i}`} style={[styles.floorLineV, { left: `${t * 100}%` }]} />
            ))}
          </View>

          {/* Empty state */}
          {placed.length === 0 && (
            <View style={styles.emptyRoom}>
              <Text style={styles.emptyRoomText}>Tap + on furniture below</Text>
            </View>
          )}

          {/* Placed items */}
          {[...placed].sort((a, b) => a.y - b.y).map(item => (
            <PlacedItem key={item.uid} item={item} onMove={handleMove} onDelete={handleDelete} />
          ))}
        </View>

        {/* Room info bar */}
        {placed.length > 0 && (
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>{placed.length} item{placed.length !== 1 ? 's' : ''}</Text>
            <Text style={styles.infoTotal}>${roomTotal.toLocaleString()}</Text>
            <View style={styles.infoActions}>
              <TouchableOpacity style={styles.clearBtn} onPress={() => setPlaced([])}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addAllBtn} onPress={handleAddAllToCart}>
                <Text style={styles.addAllBtnText}>Add All to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Furniture list */}
        <View style={styles.furnitureSection}>
          <Text style={styles.furnTitle}>ADD FURNITURE</Text>
          {PRODUCTS.map(p => (
            <TouchableOpacity key={p.id} style={styles.furnItem} onPress={() => handleAddFurniture(p)} activeOpacity={0.75}>
              <Image source={{ uri: p.thumb }} style={styles.furnThumb} resizeMode="cover" />
              <View style={styles.furnInfo}>
                <Text style={styles.furnName}>{p.name}</Text>
                <Text style={styles.furnPrice}>${p.price.toLocaleString()}</Text>
              </View>
              <View style={styles.furnAdd}>
                <Text style={styles.furnAddText}>+</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: 'rgba(196,149,90,0.1)' },
  headerTag: { color: COLORS.gold, fontSize: 10, letterSpacing: 4, fontWeight: '600', marginBottom: 4 },
  headerTitle: { color: COLORS.cream, fontSize: 28, fontWeight: '300' },
  roomScroll: { maxHeight: 50 },
  roomContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  roomPill: { paddingHorizontal: 16, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(196,149,90,0.2)' },
  roomPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  roomPillText: { color: COLORS.muted, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  roomPillTextActive: { color: COLORS.dark },
  roomWrap: { margin: 16, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(196,149,90,0.15)' },
  ceiling: { position: 'absolute', top: 0, left: 0, right: 0, height: ROOM_H * 0.14 },
  wallBack: { position: 'absolute', left: ROOM_W * 0.12, right: ROOM_W * 0.12, top: ROOM_H * 0.14, bottom: ROOM_H * 0.28 },
  wallLeft: { position: 'absolute', top: ROOM_H * 0.14, left: 0, width: ROOM_W * 0.12, bottom: ROOM_H * 0.28 },
  wallRight: { position: 'absolute', top: ROOM_H * 0.14, right: 0, width: ROOM_W * 0.12, bottom: ROOM_H * 0.28 },
  floor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: ROOM_H * 0.28, overflow: 'hidden' },
  floorLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.12)' },
  floorLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  baseboard: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, backgroundColor: 'rgba(210,200,185,0.6)' },
  window: { position: 'absolute', left: '30%', top: ROOM_H * 0.02, width: ROOM_W * 0.3, height: ROOM_H * 0.2, borderWidth: 5, borderColor: '#D4C8B4', backgroundColor: '#C8E4F0', overflow: 'hidden' },
  windowCrossV: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 5, backgroundColor: '#D4C8B4' },
  windowCrossH: { position: 'absolute', top: '50%', left: 0, right: 0, height: 5, backgroundColor: '#D4C8B4' },
  windowSill: { position: 'absolute', bottom: -10, left: -8, right: -8, height: 10, backgroundColor: '#C0B4A0' },
  emptyRoom: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center' },
  emptyRoomText: { color: 'rgba(196,149,90,0.3)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' },
  itemLabel: { color: 'rgba(247,242,234,0.7)', fontSize: 8, letterSpacing: 0.5, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 4, paddingVertical: 1, textAlign: 'center' },
  delBtn: { position: 'absolute', top: -8, right: -8, width: 18, height: 18, backgroundColor: COLORS.red, borderRadius: 9, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  delBtnText: { color: 'white', fontSize: 12, fontWeight: '700', lineHeight: 18 },
  infoBar: { marginHorizontal: 16, marginTop: -8, backgroundColor: COLORS.dark3, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTopWidth: 1, borderColor: 'rgba(196,149,90,0.15)' },
  infoText: { color: COLORS.muted, fontSize: 13 },
  infoTotal: { color: COLORS.gold, fontSize: 15, fontWeight: '600', marginRight: 'auto' },
  infoActions: { flexDirection: 'row', gap: 8 },
  clearBtn: { borderWidth: 1, borderColor: 'rgba(196,149,90,0.2)', paddingVertical: 7, paddingHorizontal: 14 },
  clearBtnText: { color: COLORS.muted, fontSize: 11, letterSpacing: 1 },
  addAllBtn: { backgroundColor: COLORS.gold, paddingVertical: 7, paddingHorizontal: 14 },
  addAllBtnText: { color: COLORS.dark, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  furnitureSection: { paddingHorizontal: 16, paddingTop: 20 },
  furnTitle: { color: COLORS.gold, fontSize: 10, letterSpacing: 3, fontWeight: '600', marginBottom: 14 },
  furnItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.dark2, padding: 10, marginBottom: 4 },
  furnThumb: { width: 52, height: 40, backgroundColor: COLORS.dark3 },
  furnInfo: { flex: 1 },
  furnName: { color: COLORS.cream, fontSize: 13, fontWeight: '500' },
  furnPrice: { color: COLORS.gold, fontSize: 12, marginTop: 2 },
  furnAdd: { width: 30, height: 30, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  furnAddText: { color: COLORS.dark, fontSize: 20, fontWeight: '700', lineHeight: 28 },
});
