import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../utils/config';

const { width: W, height: H } = Dimensions.get('window');

// Floating particle
function Particle({ delay, startX, duration }) {
  const y   = useRef(new Animated.Value(H + 20)).current;
  const op  = useRef(new Animated.Value(0)).current;
  const x   = useRef(new Animated.Value(startX)).current;
  const sc  = useRef(new Animated.Value(0.5 + Math.random() * 1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y,  { toValue: -20,       duration, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(x,  { toValue: startX + (Math.random()-0.5)*60, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.7, duration: duration*0.25, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0.7, duration: duration*0.5,  useNativeDriver: true }),
            Animated.timing(op, { toValue: 0,   duration: duration*0.25, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(y,  { toValue: H+20, duration:0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,    duration:0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[styles.particle, {
      transform: [{ translateX: x }, { translateY: y }, { scale: sc }],
      opacity: op,
    }]}/>
  );
}

// Animated ring
function Ring({ size, delay }) {
  const sc = useRef(new Animated.Value(0.6)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(sc, { toValue: 1.3, duration: 3500, easing: Easing.out(Easing.exp), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.5, duration: 500,  useNativeDriver: true }),
            Animated.timing(op, { toValue: 0,   duration: 3000, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(sc, { toValue: 0.6, duration:0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,   duration:0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[styles.ring, {
      width: size, height: size,
      borderRadius: size/2,
      marginLeft: -size/2, marginTop: -size/2,
      transform: [{ scale: sc }],
      opacity: op,
    }]}/>
  );
}

export default function SplashScreen({ onFinish }) {
  // Animation values
  const logoScale   = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY       = useRef(new Animated.Value(30)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameY       = useRef(new Animated.Value(24)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const lineWidth   = useRef(new Animated.Value(0)).current;
  const barWidth    = useRef(new Animated.Value(0)).current;
  const barOpacity  = useRef(new Animated.Value(0)).current;
  const screenOp    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo appears
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(logoScale,   { toValue:1, friction:6, tension:80, useNativeDriver:true }),
        Animated.timing(logoOpacity, { toValue:1, duration:600, useNativeDriver:true }),
        Animated.timing(logoY,       { toValue:0, duration:700, easing:Easing.out(Easing.exp), useNativeDriver:true }),
      ]),
      // Brand name
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(nameOpacity, { toValue:1, duration:700, useNativeDriver:true }),
        Animated.timing(nameY,       { toValue:0, duration:700, easing:Easing.out(Easing.exp), useNativeDriver:true }),
      ]),
      // Divider line
      Animated.delay(100),
      Animated.timing(lineWidth, { toValue:1, duration:800, easing:Easing.out(Easing.exp), useNativeDriver:true }),
      // Tagline
      Animated.timing(tagOpacity, { toValue:1, duration:500, useNativeDriver:true }),
      // Loading bar
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(barOpacity, { toValue:1, duration:300, useNativeDriver:false }),
        Animated.timing(barWidth,   { toValue:1, duration:2000, easing:Easing.inOut(Easing.cubic), useNativeDriver:false }),
      ]),
      // Hold then exit
      Animated.delay(400),
      Animated.timing(screenOp, { toValue:0, duration:800, easing:Easing.inOut(Easing.cubic), useNativeDriver:true }),
    ]).start(() => onFinish && onFinish());
  }, []);

  const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3000,
    startX: Math.random() * W,
    duration: 3000 + Math.random() * 3000,
  }));

  return (
    <Animated.View style={[styles.root, { opacity: screenOp }]}>
      <StatusBar style="light"/>
      <LinearGradient
        colors={[COLORS.dark, '#201A14', COLORS.dark]}
        style={StyleSheet.absoluteFill}
        start={{ x:0.5, y:0 }} end={{ x:0.5, y:1 }}
      />

      {/* Glow */}
      <View style={styles.glowWrap} pointerEvents="none">
        <LinearGradient
          colors={['rgba(196,149,90,0.14)', 'transparent']}
          style={styles.glowCircle}
        />
      </View>

      {/* Rings */}
      <View style={styles.ringWrap} pointerEvents="none">
        <Ring size={240} delay={600}/>
        <Ring size={400} delay={1200}/>
        <Ring size={580} delay={1800}/>
      </View>

      {/* Particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {PARTICLES.map(p => <Particle key={p.id} {...p}/>)}
      </View>

      {/* Corner ornaments */}
      {[
        [0,0,0],       // TL
        [0,W-50,90],   // TR
        [H-50,0,270],  // BL
        [H-50,W-50,180], // BR
      ].map(([t,l,rot],i) => (
        <View key={i} style={[styles.corner, { top:t, left:l, transform:[{rotate:`${rot}deg`}] }]}>
          <View style={styles.cornerH}/>
          <View style={styles.cornerV}/>
        </View>
      ))}

      {/* Grid lines (very subtle) */}
      {[0.25, 0.5, 0.75].map(t => (
        <View key={`h${t}`} style={[styles.gridLine, { top: H*t }]}/>
      ))}
      {[0.33, 0.67].map(t => (
        <View key={`v${t}`} style={[styles.gridLineV, { left: W*t }]}/>
      ))}

      {/* CENTER CONTENT */}
      <View style={styles.center}>
        {/* Logo mark */}
        <Animated.View style={[styles.logoWrap, {
          opacity: logoOpacity,
          transform: [{ scale: logoScale }, { translateY: logoY }],
        }]}>
          {/* Gold square background */}
          <View style={styles.logoSquare}>
            {/* 2x2 grid */}
            {[
              [0,0,0.92], [1,0,0.60],
              [0,1,0.60], [1,1,0.92],
            ].map(([col,row,op],i) => (
              <View key={i} style={[styles.logoCell, {
                left: col === 0 ? 14 : undefined,
                right: col === 1 ? 14 : undefined,
                top: row === 0 ? 14 : undefined,
                bottom: row === 1 ? 14 : undefined,
                opacity: op,
              }]}/>
            ))}
          </View>
        </Animated.View>

        {/* Brand name */}
        <Animated.Text style={[styles.brandName, {
          opacity: nameOpacity,
          transform: [{ translateY: nameY }],
        }]}>
          LUMI<Text style={styles.brandAccent}>È</Text>RE
        </Animated.Text>

        {/* Divider */}
        <Animated.View style={[styles.divider, {
          transform: [{ scaleX: lineWidth }],
        }]}/>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          Furniture for real living
        </Animated.Text>
      </View>

      {/* Loading bar */}
      <Animated.View style={[styles.loaderWrap, { opacity: barOpacity }]}>
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderFill, {
            width: barWidth.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] }),
          }]}/>
        </View>
        <Text style={styles.loaderText}>LOADING COLLECTION</Text>
      </Animated.View>
    </Animated.View>
  );
}

const SQ = 42;

const styles = StyleSheet.create({
  root: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor: COLORS.dark },
  glowWrap: { position:'absolute', inset:0, alignItems:'center', justifyContent:'center' },
  glowCircle: { width:500, height:500, borderRadius:250 },
  ringWrap: { position:'absolute', top:'50%', left:'50%' },
  ring: { position:'absolute', borderWidth:1, borderColor:'rgba(196,149,90,0.12)' },
  particle: { position:'absolute', width:3, height:3, borderRadius:1.5, backgroundColor:'#C4955A' },
  corner: { position:'absolute', width:44, height:44 },
  cornerH: { position:'absolute', top:0, left:0, right:0, height:1, backgroundColor:'rgba(196,149,90,0.45)' },
  cornerV: { position:'absolute', top:0, left:0, bottom:0, width:1, backgroundColor:'rgba(196,149,90,0.45)' },
  gridLine:  { position:'absolute', left:0, right:0, height:StyleSheet.hairlineWidth, backgroundColor:'rgba(196,149,90,0.06)' },
  gridLineV: { position:'absolute', top:0, bottom:0, width:StyleSheet.hairlineWidth, backgroundColor:'rgba(196,149,90,0.06)' },
  center: { alignItems:'center', gap:0 },
  logoWrap: { marginBottom:28 },
  logoSquare: { width:88, height:88, backgroundColor:'#C4955A', borderRadius:10, position:'relative' },
  logoCell: { position:'absolute', width:SQ-14, height:SQ-14, backgroundColor:'#1A1512', borderRadius:4 },
  brandName: { color:COLORS.cream, fontSize:44, fontWeight:'300', letterSpacing:12, textAlign:'center' },
  brandAccent: { color:COLORS.gold },
  divider: { width:240, height:1, backgroundColor:COLORS.gold, opacity:0.5, marginVertical:22, transformOrigin:'left' },
  tagline: { color:COLORS.muted, fontSize:11, letterSpacing:4, textTransform:'uppercase' },
  loaderWrap: { position:'absolute', bottom:72, alignItems:'center', gap:12 },
  loaderTrack: { width:180, height:1, backgroundColor:'rgba(196,149,90,0.15)', overflow:'hidden' },
  loaderFill: { height:'100%', backgroundColor:COLORS.gold },
  loaderText: { color:COLORS.muted, fontSize:9, letterSpacing:3 },
});
