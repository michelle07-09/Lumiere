# 🪑 Lumière — React Native Furniture App

Full-featured mobile app with catalog, cart, payments (PayPal, Credit Card, QRIS), room planner, and Supabase database.

---

## 📱 Screens

| Screen | Description |
|--------|-------------|
| **Home** | Hero, category shortcuts, features |
| **Catalog** | Grid with filter by category, add to cart |
| **Product Detail** | Full info, specs, "Try in Room" |
| **Cart** | Qty controls, persists to device, checkout |
| **Checkout** | Address form → Payment → Confirmation |
| **Room Planner** | IKEA-style drag & drop furniture placement |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
# or
yarn install
```

### 2. Start the app
```bash
npx expo start
```
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with **Expo Go** app on your phone

---

## 🔑 Set Up API Keys

Open `src/utils/config.js` and fill in your keys:

```js
export const CONFIG = {
  SUPABASE_URL:        'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY:   'YOUR_SUPABASE_ANON_KEY',
  PAYPAL_CLIENT_ID:    'YOUR_PAYPAL_CLIENT_ID',
  STRIPE_PK:           'pk_test_YOUR_STRIPE_KEY',
  MIDTRANS_CLIENT_KEY: 'YOUR_MIDTRANS_KEY',
  MIDTRANS_ENV:        'sandbox',
};
```

### Where to get keys (all free):

| Service | URL | What it does |
|---------|-----|--------------|
| **Supabase** | supabase.com → New Project → Settings → API | Saves orders to PostgreSQL |
| **PayPal** | developer.paypal.com → My Apps → Create App | PayPal checkout |
| **Stripe** | dashboard.stripe.com → Developers → API Keys | Credit/debit cards |
| **Midtrans** | app.midtrans.com → Settings → Access Keys | QRIS + GoPay + OVO + Dana |

---

## 🗄️ Supabase Database Setup

Run this SQL once in your Supabase SQL Editor:

```sql
create table if not exists orders (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  customer    jsonb not null,
  items       jsonb not null,
  subtotal    numeric not null,
  shipping    numeric not null,
  total       numeric not null,
  pay_method  text not null,
  pay_status  text default 'pending',
  pay_id      text,
  status      text default 'confirmed'
);

-- Optional: view orders in dashboard
create or replace view order_summary as
  select id, created_at, customer->>'email' as email,
         customer->>'firstName' || ' ' || customer->>'lastName' as name,
         total, pay_method, status
  from orders order by created_at desc;
```

---

## 💳 Payment Integration Details

### Credit Card (Stripe)
The card form collects data and simulates a charge. For real charges:
1. Install: `npm install @stripe/stripe-react-native`
2. Replace the simulation in `CheckoutScreen.js` with:
```js
import { useStripe } from '@stripe/stripe-react-native';
const { createPaymentMethod } = useStripe();
const { paymentMethod } = await createPaymentMethod({ paymentMethodType: 'Card' });
// Send paymentMethod.id to your backend → charge via Stripe API
```

### PayPal
PayPal renders inside a WebView. Just set your `PAYPAL_CLIENT_ID` and it works.

### QRIS (Midtrans — for Indonesia)
For real QRIS:
1. Sign up at app.midtrans.com
2. Get your `client_key`
3. Replace QRISDisplay with Midtrans Snap:
```js
import { WebView } from 'react-native-webview';
// Use Midtrans Snap token from your backend
// https://docs.midtrans.com/en/snap/integration-guide
```
Supports: GoPay, OVO, Dana, ShopeePay, LinkAja, all bank QRIS

---

## 📦 Build for Production

### iOS
```bash
npx expo build:ios
# or with EAS
npx eas build --platform ios
```

### Android
```bash
npx expo build:android
# or with EAS
npx eas build --platform android
```

---

## 🏗️ Project Structure

```
lumiere-mobile/
├── App.js                        # Navigation root
├── app.json                      # Expo config
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js         # Landing page
│   │   ├── CatalogScreen.js      # Product grid
│   │   ├── ProductDetailScreen.js # Full product view
│   │   ├── CartScreen.js         # Cart with qty control
│   │   ├── CheckoutScreen.js     # Payment flow
│   │   └── PlannerScreen.js      # Room drag & drop
│   ├── context/
│   │   └── CartContext.js        # Global cart + AsyncStorage
│   ├── data/
│   │   └── products.js           # All 12 furniture items
│   └── utils/
│       ├── config.js             # API keys + colors
│       └── supabase.js           # DB helpers
```

---

## 🌐 Web Version

The web version (`furniture-app.jsx`) is the React companion to this app.
Both share the same Supabase database and product catalog.

Both apps → same orders table → manage from Supabase dashboard.
