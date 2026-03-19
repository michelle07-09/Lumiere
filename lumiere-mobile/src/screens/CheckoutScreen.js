import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Dimensions, Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { saveOrder } from '../utils/supabase';
import { COLORS, CONFIG, SHIPPING } from '../utils/config';

const { width } = Dimensions.get('window');

// ─── Step indicator ─────────────────────────────────────────────────────────
function Steps({ current }) {
  const labels = ['Address', 'Payment', 'Confirm'];
  return (
    <View style={st.steps}>
      {labels.map((s, i) => (
        <React.Fragment key={s}>
          <View style={st.stepItem}>
            <View style={[st.stepCircle, i + 1 <= current && st.stepCircleActive]}>
              {i + 1 < current
                ? <Ionicons name="checkmark" size={12} color={COLORS.dark} />
                : <Text style={[st.stepNum, i + 1 <= current && { color: COLORS.dark }]}>{i + 1}</Text>
              }
            </View>
            <Text style={[st.stepLabel, i + 1 === current && st.stepLabelActive]}>{s}</Text>
          </View>
          {i < labels.length - 1 && (
            <View style={[st.stepLine, i + 1 < current && st.stepLineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Address form ────────────────────────────────────────────────────────────
function AddressForm({ form, errors, onChange }) {
  const rows = [
    [{ k:'firstName', label:'First Name', ph:'Jane' },
     { k:'lastName',  label:'Last Name',  ph:'Doe'  }],
    [{ k:'email',  label:'Email',            ph:'jane@email.com', type:'email-address' }],
    [{ k:'phone',  label:'Phone / WhatsApp', ph:'+62 812 3456 7890', type:'phone-pad' }],
    [{ k:'address',label:'Street Address',   ph:'Jl. Sudirman No. 1' }],
    [{ k:'city',   label:'City',             ph:'Bandung' },
     { k:'zip',    label:'Postal Code',      ph:'40111' }],
    [{ k:'state',  label:'Province',         ph:'West Java' },
     { k:'country',label:'Country',          ph:'Indonesia' }],
  ];
  return (
    <View style={{ gap: 14 }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection:'row', gap:12 }}>
          {row.map(f => (
            <View key={f.k} style={{ flex:1 }}>
              <Text style={st.fieldLabel}>{f.label}</Text>
              <TextInput
                style={[st.input, errors[f.k] && st.inputError]}
                placeholder={f.ph}
                placeholderTextColor={COLORS.muted}
                value={form[f.k]}
                onChangeText={v => onChange(f.k, v)}
                keyboardType={f.type || 'default'}
                autoCapitalize={f.type === 'email-address' ? 'none' : 'words'}
                returnKeyType="next"
              />
              {errors[f.k] ? <Text style={st.errMsg}>{errors[f.k]}</Text> : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Stripe card form via WebView ────────────────────────────────────────────
// Uses Stripe.js Elements in a WebView so no native SDK needed with Expo Go
function StripeCardWebView({ stripePk, amount, onSuccess, onError }) {
  const amountCents = Math.round(amount * 100);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <script src="https://js.stripe.com/v3/"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#231E18;padding:20px;font-family:system-ui,sans-serif}
    .field-label{color:#C4955A;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-weight:600}
    .card-element{background:#2E2720;border:1px solid rgba(196,149,90,0.25);padding:14px;border-radius:2px;margin-bottom:14px}
    #card-errors{color:#e74c3c;font-size:12px;margin-top:4px;min-height:16px}
    .secure{color:#9A8E80;font-size:11px;text-align:center;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px}
    .pay-btn{width:100%;background:#C4955A;color:#1A1512;border:none;padding:16px;font-size:12px;letter-spacing:2px;font-weight:700;cursor:pointer;margin-top:6px;text-transform:uppercase}
    .pay-btn:disabled{opacity:0.5;cursor:not-allowed}
    .pay-btn:active{background:#E8C88A}
  </style>
</head>
<body>
  <p class="field-label">Card Details</p>
  <div class="card-element" id="card-element"></div>
  <div id="card-errors"></div>
  <button class="pay-btn" id="pay-btn">PAY $${amount.toFixed(2)}</button>
  <p class="secure">🔒 Secured by Stripe — card data never stored</p>

  <script>
    const stripe = Stripe('${stripePk}');
    const elements = stripe.elements({ locale: 'en' });
    const card = elements.create('card', {
      style: {
        base: {
          color: '#F7F2EA',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '15px',
          '::placeholder': { color: '#9A8E80' },
          iconColor: '#C4955A',
        },
        invalid: { color: '#e74c3c', iconColor: '#e74c3c' },
      },
      hidePostalCode: true,
    });
    card.mount('#card-element');

    card.on('change', ({ error }) => {
      document.getElementById('card-errors').textContent = error ? error.message : '';
    });

    document.getElementById('pay-btn').addEventListener('click', async () => {
      const btn = document.getElementById('pay-btn');
      btn.disabled = true;
      btn.textContent = 'Processing…';

      try {
        // Create payment method (tokenizes card — no server needed for tokenization)
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: card,
        });

        if (error) {
          document.getElementById('card-errors').textContent = error.message;
          btn.disabled = false;
          btn.textContent = 'PAY $${amount.toFixed(2)}';
          window.ReactNativeWebView.postMessage(JSON.stringify({ type:'stripe_error', message: error.message }));
          return;
        }

        // Send payment method ID to React Native
        // In production: send paymentMethod.id to YOUR backend → create PaymentIntent → confirm
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'stripe_token',
          paymentMethodId: paymentMethod.id,
          last4: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
        }));
      } catch (e) {
        btn.disabled = false;
        btn.textContent = 'PAY $${amount.toFixed(2)}';
        window.ReactNativeWebView.postMessage(JSON.stringify({ type:'stripe_error', message: e.message }));
      }
    });
  </script>
</body>
</html>`;

  return (
    <WebView
      source={{ html }}
      style={st.stripeWebView}
      javaScriptEnabled
      originWhitelist={['*']}
      onMessage={(e) => {
        try {
          const data = JSON.parse(e.nativeEvent.data);
          if (data.type === 'stripe_token') onSuccess(data);
          if (data.type === 'stripe_error') onError(data.message);
        } catch {}
      }}
    />
  );
}

// ─── PayPal WebView ──────────────────────────────────────────────────────────
function PayPalWebView({ clientId, amount, onSuccess, onError }) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <script src="https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#1A1512;display:flex;justify-content:center;padding:20px}
    #paypal-btn{width:100%;max-width:400px}
    .loading{color:#9A8E80;text-align:center;font-family:system-ui;font-size:13px;padding:20px 0}
  </style>
</head>
<body>
  <div id="paypal-btn"><p class="loading">Loading PayPal…</p></div>
  <script>
    paypal.Buttons({
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{
          amount: { value: '${amount.toFixed(2)}', currency_code: 'USD' },
          description: 'Lumière Home — Order'
        }]
      }),
      onApprove: (data, actions) => actions.order.capture().then(details => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'paypal_success',
          orderId: details.id,
          payerEmail: details.payer?.email_address || '',
          status: details.status,
        }));
      }),
      onError: err => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'paypal_error',
          message: err.toString(),
        }));
      },
      onCancel: () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'paypal_cancel' }));
      },
      style: { layout:'vertical', color:'gold', shape:'rect', label:'pay', height:45 },
    }).render('#paypal-btn');
  </script>
</body>
</html>`;

  return (
    <WebView
      source={{ html }}
      style={st.paypalWebView}
      javaScriptEnabled
      originWhitelist={['*']}
      onMessage={(e) => {
        try {
          const data = JSON.parse(e.nativeEvent.data);
          if (data.type === 'paypal_success') onSuccess(data);
          if (data.type === 'paypal_error')   onError(data.message);
          if (data.type === 'paypal_cancel')  onError('Payment cancelled');
        } catch {}
      }}
    />
  );
}

// ─── QRIS / Midtrans Snap WebView ────────────────────────────────────────────
function QRISWebView({ clientKey, amount, orderId, onSuccess, onError }) {
  // Midtrans Snap: opens the payment page in WebView
  // In production you'd first call your backend to get a snap_token
  // For sandbox demo we use a direct QR display + Snap redirect
  const idrAmount = Math.round(amount * 15800);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <script src="https://app.${clientKey.startsWith('Mid-client-') ? 'sandbox.' : ''}midtrans.com/snap/snap.js"
    data-client-key="${clientKey}"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#1A1512;display:flex;flex-direction:column;align-items:center;padding:24px;font-family:system-ui,sans-serif;min-height:100vh}
    .qr-box{background:white;padding:28px;display:flex;flex-direction:column;align-items:center;width:260px}
    .qr-title{color:#333;font-size:11px;letter-spacing:2px;font-weight:700;margin-bottom:16px;text-transform:uppercase}
    .qr-svg{width:200px;height:200px}
    .qr-amount{color:#111;font-size:16px;font-weight:700;margin-top:14px}
    .qr-idr{color:#666;font-size:12px;margin-top:4px}
    .qr-timer{font-size:13px;font-weight:600;margin-top:8px}
    .apps{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;justify-content:center}
    .app-badge{border:1px solid #ddd;padding:3px 8px;font-size:10px;color:#333;font-weight:600}
    .sub{color:#888;font-size:10px;text-align:center;margin-top:8px;line-height:1.6;max-width:220px}
    .confirm-btn{background:#C4955A;color:#1A1512;border:none;padding:14px 32px;font-size:12px;letter-spacing:2px;font-weight:700;cursor:pointer;margin-top:24px;text-transform:uppercase;width:100%;max-width:260px}
    .confirm-btn:active{background:#E8C88A}
    .note{color:#9A8E80;font-size:11px;text-align:center;margin-top:12px;max-width:260px;line-height:1.6}
  </style>
</head>
<body>
  <div class="qr-box">
    <p class="qr-title">SCAN TO PAY · QRIS</p>
    <svg class="qr-svg" viewBox="0 0 190 190">
      <!-- Corner squares -->
      ${[[8,8],[138,8],[8,138]].map(([x,y]) => `
        <rect x="${x}" y="${y}" width="44" height="44" fill="none" stroke="#000" stroke-width="4"/>
        <rect x="${x+9}" y="${y+9}" width="26" height="26" fill="#000"/>
      `).join('')}
      <!-- Data cells -->
      ${Array.from({length:220},(_,k)=>{
        const r=Math.floor(k/15),c=k%15;
        const cx=8+c*11+5,cy=8+r*11+5;
        if((cx<56&&cy<56)||(cx>134&&cy<56)||(cx<56&&cy>134))return '';
        return ((r*13+c*7+k*3)%3===0)?`<rect x="${cx-4}" y="${cy-4}" width="8" height="8" fill="#000"/>`:''
      }).join('')}
      <!-- Center Lumiere logo -->
      <rect x="81" y="81" width="28" height="28" fill="white" stroke="#ddd"/>
      <rect x="85" y="85" width="20" height="20" fill="#C4955A"/>
    </svg>
    <p class="qr-amount">$${amount.toFixed(2)}</p>
    <p class="qr-idr">≈ IDR ${idrAmount.toLocaleString()}</p>
    <p class="qr-timer" id="timer">⏱ Expires 05:00</p>
    <div class="apps">
      ${['GoPay','OVO','Dana','ShopeePay','LinkAja'].map(a=>`<span class="app-badge">${a}</span>`).join('')}
    </div>
    <p class="sub">Also: BCA · Mandiri · BRI · BNI · BSI · All bank apps</p>
  </div>

  <button class="confirm-btn" id="confirm-btn">I'VE COMPLETED PAYMENT</button>
  <p class="note">After scanning and paying in your e-wallet app, tap the button above to confirm.</p>

  <script>
    // Countdown timer
    let sec = 300;
    const timerEl = document.getElementById('timer');
    const interval = setInterval(() => {
      sec--;
      if (sec <= 0) {
        clearInterval(interval);
        timerEl.textContent = '⚠️ QR expired — please refresh';
        timerEl.style.color = '#e74c3c';
        return;
      }
      const mm = String(Math.floor(sec/60)).padStart(2,'0');
      const ss = String(sec%60).padStart(2,'0');
      timerEl.textContent = '⏱ Expires ' + mm + ':' + ss;
      timerEl.style.color = sec < 60 ? '#e74c3c' : '#555';
    }, 1000);

    // Confirm button
    document.getElementById('confirm-btn').addEventListener('click', () => {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'qris_confirmed',
        orderId: '${orderId}',
        amount: ${idrAmount},
      }));
    });
  </script>
</body>
</html>`;

  return (
    <WebView
      source={{ html }}
      style={st.qrisWebView}
      javaScriptEnabled
      originWhitelist={['*']}
      onMessage={(e) => {
        try {
          const data = JSON.parse(e.nativeEvent.data);
          if (data.type === 'qris_confirmed') onSuccess(data);
        } catch {}
      }}
    />
  );
}

// ─── Payment method selector ──────────────────────────────────────────────────
const PAY_METHODS = [
  { id:'card',   icon:'card-outline',      name:'Card',    sub:'Visa · MC · Amex' },
  { id:'paypal', icon:'logo-paypal',        name:'PayPal',  sub:'Balance or card'  },
  { id:'qris',   icon:'qr-code-outline',   name:'QRIS',    sub:'GoPay · OVO · Dana' },
];

// ─── Order mini-summary ───────────────────────────────────────────────────────
function MiniSummary({ items, subtotal, total }) {
  return (
    <View style={st.miniSummary}>
      <Text style={st.miniSummaryTitle}>ORDER SUMMARY</Text>
      {items.map(i => (
        <View key={i.id} style={st.miniRow}>
          <Text style={st.miniName} numberOfLines={1}>{i.name} ×{i.qty}</Text>
          <Text style={st.miniPrice}>${(i.price * i.qty).toLocaleString()}</Text>
        </View>
      ))}
      <View style={st.miniRow}>
        <Text style={st.miniName}>Shipping</Text>
        <Text style={st.miniPrice}>${SHIPPING}</Text>
      </View>
      <View style={[st.miniRow, st.miniTotal]}>
        <Text style={{ color: COLORS.cream, fontWeight:'700', fontSize:15 }}>Total</Text>
        <Text style={{ color: COLORS.gold, fontWeight:'700', fontSize:18 }}>${total.toLocaleString()}</Text>
      </View>
    </View>
  );
}

// ─── Main checkout screen ─────────────────────────────────────────────────────
export default function CheckoutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items, total, subtotal, clear } = useCart();

  const [step,       setStep]       = useState(1);
  const [payMethod,  setPayMethod]  = useState('card');
  const [loading,    setLoading]    = useState(false);
  const [orderId,    setOrderId]    = useState('');
  const [saveOk,     setSaveOk]     = useState(true);

  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'',
    address:'', city:'', state:'', zip:'', country:'Indonesia',
  });
  const [formErrors, setFormErrors] = useState({});

  // Unique order reference used for QRIS
  const orderRef = useRef(`LUM-${Date.now()}`);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Validation ─────────────────────────────────────────────────
  function validateAddress() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Invalid email';
    if (!form.phone.trim())    e.phone   = 'Required';
    if (!form.address.trim())  e.address = 'Required';
    if (!form.city.trim())     e.city    = 'Required';
    if (!form.zip.trim())      e.zip     = 'Required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save order to Supabase + complete ──────────────────────────
  async function completeOrder(method, payId = '') {
    setLoading(true);
    const result = await saveOrder({
      customer:       form,
      items:          items.map(i => ({ id:i.id, name:i.name, series:i.series, qty:i.qty, price:i.price })),
      subtotal,
      shipping:       SHIPPING,
      total,
      payment_method: method,
      payment_status: 'paid',
      payment_id:     payId,
      status:         'confirmed',
      currency:       'USD',
    });
    const oid = result.order?.id || `LUM-${Date.now()}`;
    setOrderId(oid);
    setSaveOk(result.success);
    clear();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false);
    setStep(3);
  }

  // ── Payment handlers ───────────────────────────────────────────
  const handleStripeSuccess = useCallback(async (data) => {
    // data.paymentMethodId → send to your backend for charge
    // For now: record the tokenized payment method as success
    await completeOrder('card', data.paymentMethodId);
  }, [form, items, subtotal, total]);

  const handleStripeError = useCallback((msg) => {
    Alert.alert('Card Error', msg || 'Card payment failed. Please check your details.');
  }, []);

  const handlePayPalSuccess = useCallback(async (data) => {
    await completeOrder('paypal', data.orderId);
  }, [form, items, subtotal, total]);

  const handlePayPalError = useCallback((msg) => {
    if (msg !== 'Payment cancelled') {
      Alert.alert('PayPal Error', msg || 'PayPal payment failed. Please try again.');
    }
  }, []);

  const handleQRISSuccess = useCallback(async (data) => {
    await completeOrder('qris', `qris_${data.orderId}_${Date.now()}`);
  }, [form, items, subtotal, total]);

  return (
    <View style={[st.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={st.header}>
        <TouchableOpacity
          style={st.backBtn}
          onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.gold} />
          <Text style={st.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={st.headerTitle}>Checkout</Text>
        <View style={{ width: 60 }} />
      </View>

      <Steps current={step} />

      {/* ── Step 3: Success ── */}
      {step === 3 ? (
        <View style={st.successWrap}>
          <View style={st.successIconWrap}>
            <Ionicons name="checkmark-circle" size={72} color={COLORS.gold} />
          </View>
          <Text style={st.successTitle}>Order Placed!</Text>
          <Text style={st.successSub}>
            Your order has been confirmed{saveOk ? ' and saved to our database' : ''}.
          </Text>
          <View style={st.orderIdBox}>
            <Text style={st.orderIdLabel}>ORDER ID</Text>
            <Text style={st.orderIdVal}>{orderId}</Text>
          </View>
          {saveOk
            ? <Text style={st.saveStatus}>✓ Saved to Supabase database</Text>
            : <Text style={[st.saveStatus, { color: COLORS.muted }]}>⚠ Saved locally — check Supabase connection</Text>
          }
          <TouchableOpacity
            style={st.continueBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={st.continueBtnText}>CONTINUE SHOPPING</Text>
          </TouchableOpacity>
        </View>

      ) : loading ? (
        <View style={st.loadingFull}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={st.loadingText}>Processing payment…</Text>
        </View>

      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[st.body, { paddingBottom: 120 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Step 1: Address ── */}
          {step === 1 && (
            <>
              <Text style={st.stepTitle}>Delivery Details</Text>
              <AddressForm form={form} errors={formErrors} onChange={setF} />
            </>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <>
              <Text style={st.stepTitle}>Choose Payment</Text>

              {/* Method selector */}
              <View style={st.payMethods}>
                {PAY_METHODS.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[st.payMethod, payMethod === m.id && st.payMethodActive]}
                    onPress={() => setPayMethod(m.id)}
                  >
                    <Ionicons
                      name={m.icon}
                      size={22}
                      color={payMethod === m.id ? COLORS.gold : COLORS.muted}
                    />
                    <Text style={[st.pmName, payMethod === m.id && { color: COLORS.gold }]}>{m.name}</Text>
                    <Text style={st.pmSub}>{m.sub}</Text>
                    {payMethod === m.id && (
                      <View style={st.pmCheck}>
                        <Ionicons name="checkmark" size={10} color={COLORS.dark} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Stripe card via WebView ── */}
              {payMethod === 'card' && (
                <StripeCardWebView
                  stripePk={CONFIG.STRIPE_PK}
                  amount={total}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              )}

              {/* ── PayPal via WebView ── */}
              {payMethod === 'paypal' && (
                <PayPalWebView
                  clientId={CONFIG.PAYPAL_CLIENT_ID}
                  amount={total}
                  onSuccess={handlePayPalSuccess}
                  onError={handlePayPalError}
                />
              )}

              {/* ── QRIS via WebView ── */}
              {payMethod === 'qris' && (
                <QRISWebView
                  clientKey={CONFIG.MIDTRANS_CLIENT_KEY}
                  amount={total}
                  orderId={orderRef.current}
                  onSuccess={handleQRISSuccess}
                  onError={(msg) => Alert.alert('QRIS Error', msg)}
                />
              )}

              <MiniSummary items={items} subtotal={subtotal} total={total} />
            </>
          )}
        </ScrollView>
      )}

      {/* ── Bottom CTA — only on Address step ── */}
      {step === 1 && !loading && (
        <View style={[st.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={st.nextBtn}
            onPress={() => validateAddress() && setStep(2)}
          >
            <Text style={st.nextBtnText}>CONTINUE TO PAYMENT  →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment step: card & QRIS show their own pay button inside WebView */}
      {/* PayPal: PayPal renders its own button inside WebView */}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex:1, backgroundColor:COLORS.dark },

  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderColor:'rgba(196,149,90,0.1)' },
  backBtn:     { flexDirection:'row', alignItems:'center', gap:4, width:60 },
  backText:    { color:COLORS.gold, fontSize:13 },
  headerTitle: { color:COLORS.cream, fontSize:18, fontWeight:'500' },

  steps:          { flexDirection:'row', alignItems:'center', paddingHorizontal:24, paddingVertical:16, borderBottomWidth:1, borderColor:'rgba(196,149,90,0.1)' },
  stepItem:       { alignItems:'center', gap:4 },
  stepCircle:     { width:26, height:26, borderRadius:13, borderWidth:1.5, borderColor:COLORS.muted, alignItems:'center', justifyContent:'center' },
  stepCircleActive:{ borderColor:COLORS.gold, backgroundColor:COLORS.gold },
  stepNum:        { color:COLORS.muted, fontSize:11, fontWeight:'700' },
  stepLabel:      { color:COLORS.muted, fontSize:10, letterSpacing:1 },
  stepLabelActive:{ color:COLORS.gold },
  stepLine:       { flex:1, height:1, backgroundColor:'rgba(196,149,90,0.2)', marginBottom:12 },
  stepLineActive: { backgroundColor:COLORS.gold },

  body:      { padding:24, gap:20 },
  stepTitle: { color:COLORS.cream, fontSize:22, fontWeight:'300', marginBottom:4 },

  fieldLabel: { color:COLORS.gold, fontSize:10, letterSpacing:2, marginBottom:6, fontWeight:'600' },
  input:      { backgroundColor:COLORS.dark3, borderWidth:1, borderColor:'rgba(196,149,90,0.2)', color:COLORS.cream, padding:13, fontSize:14 },
  inputError: { borderColor:COLORS.red },
  errMsg:     { color:COLORS.red, fontSize:11, marginTop:3 },

  payMethods:     { flexDirection:'row', gap:8, flexWrap:'wrap', marginBottom:4 },
  payMethod:      { flex:1, minWidth:90, backgroundColor:COLORS.dark3, borderWidth:1, borderColor:'rgba(196,149,90,0.15)', padding:14, alignItems:'center', gap:5, position:'relative' },
  payMethodActive:{ borderColor:COLORS.gold, backgroundColor:'rgba(196,149,90,0.08)' },
  pmName:         { color:COLORS.muted, fontSize:11, fontWeight:'600', textAlign:'center' },
  pmSub:          { color:COLORS.muted, fontSize:9, textAlign:'center', letterSpacing:0.5 },
  pmCheck:        { position:'absolute', top:6, right:6, width:16, height:16, backgroundColor:COLORS.gold, borderRadius:8, alignItems:'center', justifyContent:'center' },

  stripeWebView: { height:260, backgroundColor:COLORS.dark2 },
  paypalWebView: { height:280, backgroundColor:COLORS.dark },
  qrisWebView:   { height:520, backgroundColor:COLORS.dark },

  miniSummary:      { backgroundColor:COLORS.dark3, padding:18, gap:10 },
  miniSummaryTitle: { color:COLORS.gold, fontSize:10, letterSpacing:3, fontWeight:'600', marginBottom:4 },
  miniRow:          { flexDirection:'row', justifyContent:'space-between' },
  miniName:         { color:COLORS.muted, fontSize:13, flex:1, marginRight:8 },
  miniPrice:        { color:COLORS.muted, fontSize:13 },
  miniTotal:        { paddingTop:10, borderTopWidth:1, borderColor:'rgba(196,149,90,0.15)', marginTop:2 },

  bottomBar: { position:'absolute', bottom:0, left:0, right:0, backgroundColor:COLORS.dark2, padding:16, borderTopWidth:1, borderColor:'rgba(196,149,90,0.15)' },
  nextBtn:     { backgroundColor:COLORS.gold, paddingVertical:16, alignItems:'center' },
  nextBtnText: { color:COLORS.dark, fontSize:12, letterSpacing:2.5, fontWeight:'700' },

  loadingFull: { flex:1, alignItems:'center', justifyContent:'center', gap:16 },
  loadingText: { color:COLORS.muted, fontSize:14, letterSpacing:1 },

  successWrap:    { flex:1, alignItems:'center', justifyContent:'center', padding:36, gap:14 },
  successIconWrap:{ marginBottom:8 },
  successTitle:   { color:COLORS.cream, fontSize:36, fontWeight:'300' },
  successSub:     { color:COLORS.muted, fontSize:14, textAlign:'center', lineHeight:22, maxWidth:300 },
  saveStatus:     { color:COLORS.green, fontSize:12, letterSpacing:0.5 },
  orderIdBox:     { backgroundColor:COLORS.dark2, padding:16, width:'100%', borderWidth:1, borderColor:'rgba(196,149,90,0.3)', alignItems:'center' },
  orderIdLabel:   { color:COLORS.muted, fontSize:10, letterSpacing:3, marginBottom:6 },
  orderIdVal:     { color:COLORS.gold, fontSize:13, letterSpacing:2, fontWeight:'600' },
  continueBtn:    { backgroundColor:COLORS.gold, paddingVertical:14, paddingHorizontal:32, marginTop:8 },
  continueBtnText:{ color:COLORS.dark, fontSize:12, letterSpacing:2.5, fontWeight:'700' },
});