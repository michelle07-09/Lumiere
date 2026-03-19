import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator,
  Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/config';

const { width, height } = Dimensions.get('window');

const HERO = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [mode,    setMode]    = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [showPw,  setShowPw]  = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email:    '',
    password: '',
    confirm:  '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError(''); setSuccess('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup') {
      if (!form.fullName.trim()) { setError('Please enter your full name.'); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(form.email.trim(), form.password);
        // navigation handled by AppRoot
      } else {
        const data = await signUp(form.email.trim(), form.password, form.fullName.trim());
        if (!data.access_token) {
          setSuccess('Account created! Check your email to confirm, then log in.');
          setMode('login');
          setForm(p => ({ ...p, password: '', confirm: '' }));
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError(''); setSuccess('');
  };

  return (
    <View style={st.root}>
      {/* Hero background */}
      <Image source={{ uri: HERO }} style={st.heroBg} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(26,21,18,0.55)', 'rgba(26,21,18,0.98)']}
        locations={[0, 0.5]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[st.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand header */}
          <View style={st.brand}>
            <View style={st.logoBox}>
              <Ionicons name="home-outline" size={20} color={COLORS.dark} />
            </View>
            <Text style={st.brandText}>LUMIÈRE</Text>
          </View>

          <Text style={st.tagline}>Furniture for{'\n'}<Text style={st.taglineItalic}>real living</Text></Text>
          <Text style={st.taglineSub}>Scandinavian design · Timeless quality</Text>

          {/* Form card */}
          <View style={st.card}>
            <Text style={st.formTag}>
              {mode === 'login' ? 'SIGN IN TO YOUR ACCOUNT' : 'CREATE AN ACCOUNT'}
            </Text>
            <Text style={st.formTitle}>
              {mode === 'login' ? 'Welcome back' : 'Join Lumière'}
            </Text>
            <Text style={st.formSub}>
              {mode === 'login'
                ? 'Access your orders, wishlist, and saved rooms.'
                : 'Shop, save favourites, and track your orders.'}
            </Text>

            <View style={st.fields}>
              {mode === 'signup' && (
                <View style={st.fieldWrap}>
                  <Text style={st.fieldLabel}>FULL NAME</Text>
                  <TextInput
                    style={st.input}
                    placeholder="Jane Doe"
                    placeholderTextColor={COLORS.muted}
                    value={form.fullName}
                    onChangeText={v => set('fullName', v)}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}

              <View style={st.fieldWrap}>
                <Text style={st.fieldLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={st.input}
                  placeholder="jane@email.com"
                  placeholderTextColor={COLORS.muted}
                  value={form.email}
                  onChangeText={v => set('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>

              <View style={st.fieldWrap}>
                <Text style={st.fieldLabel}>PASSWORD</Text>
                <View style={st.pwWrap}>
                  <TextInput
                    style={[st.input, { flex: 1, borderWidth: 0, padding: 0 }]}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                    placeholderTextColor={COLORS.muted}
                    value={form.password}
                    onChangeText={v => set('password', v)}
                    secureTextEntry={!showPw}
                    returnKeyType={mode === 'signup' ? 'next' : 'done'}
                    onSubmitEditing={mode === 'login' ? handleSubmit : undefined}
                  />
                  <TouchableOpacity onPress={() => setShowPw(p => !p)} style={st.eyeBtn}>
                    <Ionicons
                      name={showPw ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={COLORS.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {mode === 'signup' && (
                <View style={st.fieldWrap}>
                  <Text style={st.fieldLabel}>CONFIRM PASSWORD</Text>
                  <TextInput
                    style={st.input}
                    placeholder="Repeat your password"
                    placeholderTextColor={COLORS.muted}
                    value={form.confirm}
                    onChangeText={v => set('confirm', v)}
                    secureTextEntry={!showPw}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                </View>
              )}
            </View>

            {error   ? <Text style={st.error}>{error}</Text>   : null}
            {success ? <Text style={st.success}>{success}</Text> : null}

            {/* Submit button */}
            <TouchableOpacity
              style={[st.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color={COLORS.dark} />
                : <Text style={st.submitBtnText}>
                    {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                  </Text>}
            </TouchableOpacity>

            {/* Switch mode */}
            <View style={st.switchRow}>
              <Text style={st.switchText}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={switchMode}>
                <Text style={st.switchLink}>
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Feature bullets */}
          <View style={st.bullets}>
            {[
              { icon: 'shield-checkmark-outline', text: 'Stripe · PayPal · QRIS secured' },
              { icon: 'cube-outline',             text: 'White-glove delivery & assembly' },
              { icon: 'leaf-outline',             text: '90% renewable materials' },
              { icon: 'grid-outline',             text: 'Interactive room planner' },
            ].map((b, i) => (
              <View key={i} style={st.bullet}>
                <Ionicons name={b.icon} size={14} color={COLORS.gold} />
                <Text style={st.bulletText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  root:         { flex: 1, backgroundColor: COLORS.dark },
  heroBg:       { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.45 },
  scroll:       { paddingHorizontal: 24 },

  brand:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 36 },
  logoBox:      { width: 34, height: 34, backgroundColor: COLORS.gold, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  brandText:    { fontFamily: 'Outfit', fontSize: 18, fontWeight: '700', letterSpacing: 4, color: COLORS.gold },

  tagline:      { fontSize: 44, fontWeight: '300', color: COLORS.cream, lineHeight: 46, marginBottom: 10, letterSpacing: -0.5 },
  taglineItalic:{ fontStyle: 'italic', color: COLORS.gold },
  taglineSub:   { fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 32 },

  card:         { backgroundColor: COLORS.dark2, borderWidth: 1, borderColor: 'rgba(196,149,90,0.18)', padding: 24, marginBottom: 24 },
  formTag:      { fontSize: 9, letterSpacing: 3, color: COLORS.gold, fontWeight: '600', marginBottom: 8 },
  formTitle:    { fontSize: 26, fontWeight: '300', color: COLORS.cream, marginBottom: 6, letterSpacing: -0.3 },
  formSub:      { fontSize: 12, color: COLORS.muted, lineHeight: 18, marginBottom: 22 },

  fields:       { gap: 14 },
  fieldWrap:    {},
  fieldLabel:   { fontSize: 9, letterSpacing: 2.5, color: COLORS.gold, fontWeight: '600', marginBottom: 6 },
  input:        { backgroundColor: COLORS.dark3, borderWidth: 1, borderColor: 'rgba(196,149,90,0.2)', color: COLORS.cream, padding: 13, fontSize: 14 },

  pwWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.dark3, borderWidth: 1, borderColor: 'rgba(196,149,90,0.2)', paddingHorizontal: 13, paddingVertical: 4 },
  eyeBtn:       { paddingVertical: 8, paddingLeft: 8 },

  error:        { color: COLORS.red,   fontSize: 12, marginTop: 12, lineHeight: 18 },
  success:      { color: COLORS.green, fontSize: 12, marginTop: 12, lineHeight: 18 },

  submitBtn:     { backgroundColor: COLORS.gold, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: COLORS.dark, fontSize: 12, letterSpacing: 2.5, fontWeight: '700' },

  switchRow:    { flexDirection: 'row', justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' },
  switchText:   { color: COLORS.muted, fontSize: 13 },
  switchLink:   { color: COLORS.gold,  fontSize: 13, fontWeight: '600' },

  bullets:      { gap: 10, paddingHorizontal: 4 },
  bullet:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bulletText:   { color: COLORS.muted, fontSize: 12, letterSpacing: 0.5 },
});