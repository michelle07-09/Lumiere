// ─────────────────────────────────────────────────────────────────
//  🔑  API KEYS — synced with web app
// ─────────────────────────────────────────────────────────────────
export const CONFIG = {
  SUPABASE_URL: 'process.env.https://dcroqgupxhvcoshgezzt.supabase.co',
  SUPABASE_ANON_KEY: 'process.env.sb_publishable_5OcpmINr0I15sHXz3Puhgg_98j3QyaW',
  PAYPAL_CLIENT_ID: 'process.env.AfCAqED4LiAan1_nMEGQt3t6gmefZemhrDn-LGErmLMniYph_ZpUZF89onN6T4KG2OjU9JQfwfAWwlqp',
  STRIPE_PK: 'process.env.pk_test_51SBGkt1IhtajnptQ91W36FLNmu90q5Q6Fz9CKUlhYru8DJBtLUWD6ZXy0lKJiHOCaFDqzO7hhyhU19lYUkwnIQ2900jVLBzbUH',
  MIDTRANS_CLIENT_KEY: 'process.env.Mid-client-5Yfg4QnBlE4NQWgX',
  MIDTRANS_ENV: 'process.env.sandbox',  // change to 'production' when live
};

export const COLORS = {
  dark: '#1A1512',
  dark2: '#231E18',
  dark3: '#2E2720',
  dark4: '#3A3228',
  gold: '#C4955A',
  gold2: '#E8C88A',
  cream: '#F7F2EA',
  muted: '#9A8E80',
  red: '#C0392B',
  green: '#27AE60',
  blue: '#2980B9',
  white: '#FFFFFF',
};

export const FONTS = {
  light: 'Cormorant-Light',
  regular: 'Cormorant-Regular',
  semibold: 'Cormorant-SemiBold',
  italic: 'Cormorant-Italic',
  body: 'Outfit-Regular',
  bodyMed: 'Outfit-Medium',
  bodySemi: 'Outfit-SemiBold',
};

export const SHIPPING = 49;