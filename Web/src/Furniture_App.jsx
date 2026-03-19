import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// 🔑  API KEYS
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  SUPABASE_URL: "import.meta.env.https://dcroqgupxhvcoshgezzt.supabase.co",
  SUPABASE_ANON_KEY: "import.meta.env.sb_publishable_5OcpmINr0I15sHXz3Puhgg_98j3QyaW",
  PAYPAL_CLIENT_ID: "import.meta.env.AfCAqED4LiAan1_nMEGQt3t6gmefZemhrDn-LGErmLMniYph_ZpUZF89onN6T4KG2OjU9JQfwfAWwlqp",
  STRIPE_PK: "import.meta.env.pk_test_51SBGkt1IhtajnptQ91W36FLNmu90q5Q6Fz9CKUlhYru8DJBtLUWD6ZXy0lKJiHOCaFDqzO7hhyhU19lYUkwnIQ2900jVLBzbUH",
  MIDTRANS_CLIENT_KEY: "import.meta.env.Mid-client-5Yfg4QnBlE4NQWgX",
  MIDTRANS_ENV: "import.meta.env.sandbox",
};

const GF = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');`;

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "KIVIK Sofa", series: "KIVIK", category: "Living", price: 799, tag: "Bestseller", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=180&q=80", desc: "3-seat sofa, Tibbleby beige/grey", w: 140, h: 85, depth: 90 },
  { id: 2, name: "POÄNG Armchair", series: "POÄNG", category: "Living", price: 149, tag: "Bestseller", img: "https://images.unsplash.com/photo-1567538096621-38d2284b23ff?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1567538096621-38d2284b23ff?w=120&q=80", desc: "Bentwood frame, birch veneer", w: 68, h: 100, depth: 82 },
  { id: 3, name: "EKEDALEN Table", series: "EKEDALEN", category: "Dining", price: 299, tag: "New", img: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=180&q=80", desc: "Extendable, white oak, seats 4–6", w: 120, h: 75, depth: 80 },
  { id: 4, name: "MALM Bed Frame", series: "MALM", category: "Bedroom", price: 349, tag: "Featured", img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=180&q=80", desc: "Queen with underbed storage, white pine", w: 160, h: 120, depth: 210 },
  { id: 5, name: "BILLY Bookcase", series: "BILLY", category: "Office", price: 79, tag: "", img: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=100&q=80", desc: "Adjustable shelves, white", w: 80, h: 202, depth: 28 },
  { id: 6, name: "VITTSJO Table", series: "VITTSJO", category: "Living", price: 49, tag: "Sale", img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=120&q=80", desc: "Coffee table, black-brown/glass", w: 100, h: 45, depth: 50 },
  { id: 7, name: "PAX Wardrobe", series: "PAX", category: "Bedroom", price: 550, tag: "", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80", desc: "150×58×201 cm, sliding doors", w: 150, h: 201, depth: 58 },
  { id: 8, name: "KNARREVIK Table", series: "KNARREVIK", category: "Living", price: 20, tag: "New", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=90&q=80", desc: "Bedside table, steel black", w: 45, h: 55, depth: 28 },
  { id: 9, name: "MICKE Desk", series: "MICKE", category: "Office", price: 129, tag: "New", img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=160&q=80", desc: "Cable management built-in, white", w: 105, h: 75, depth: 50 },
  { id: 10, name: "SÖDERHAMN Chaise", series: "SÖDERHAMN", category: "Living", price: 119, tag: "", img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=120&q=80", desc: "Chaise longue, Finnsta turquoise", w: 80, h: 45, depth: 80 },
  { id: 11, name: "HEKTAR Lamp", series: "HEKTAR", category: "Lighting", price: 69, tag: "New", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=80&q=80", desc: "Floor lamp, dark grey, USB port", w: 35, h: 180, depth: 35 },
  { id: 12, name: "INGOLF Chair", series: "INGOLF", category: "Dining", price: 89, tag: "Featured", img: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80", roomImg: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=100&q=80", desc: "Solid pine, antique stain", w: 50, h: 91, depth: 52 },
];

const ROOMS = [
  { id: "living", name: "Living Room", wall: "#F5F0E8", floor: "#C8A97A", floorDark: "#B8956A", accent: "#E8DDD0" },
  { id: "bedroom", name: "Bedroom", wall: "#EEF0F5", floor: "#B8A88A", floorDark: "#A89878", accent: "#E0E4EE" },
  { id: "dining", name: "Dining Room", wall: "#F2EDE6", floor: "#B0907A", floorDark: "#9A7A68", accent: "#E8E0D8" },
  { id: "office", name: "Home Office", wall: "#EBF0EB", floor: "#9A9A88", floorDark: "#8A8A78", accent: "#DDE5DD" },
];

const CATS = ["All", "Living", "Dining", "Bedroom", "Office", "Lighting"];
const SHIPPING = 49;

// ── CART CONTEXT ──────────────────────────────────────────────────────────────
const CartCtx = createContext(null);
function useCart() { return useContext(CartCtx); }

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const add = (p) => setItems(prev => { const ex = prev.find(i => i.id === p.id); if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i); return [...prev, { ...p, qty: 1 }]; });
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const update = (id, qty) => { if (qty < 1) return remove(id); setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i)); };
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + (items.length > 0 ? SHIPPING : 0);
  return <CartCtx.Provider value={{ items, add, remove, update, clear, count, subtotal, total }}>{children}</CartCtx.Provider>;
}

// ── SUPABASE AUTH HELPERS ─────────────────────────────────────────────────────
const SUPA_BASE = { "Content-Type": "application/json", "apikey": CONFIG.SUPABASE_ANON_KEY };

async function supaSignUp(email, password, fullName) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/signup`, {
    method: "POST", headers: SUPA_BASE,
    body: JSON.stringify({ email, password, data: { full_name: fullName } }),
  });
  return res.json();
}

async function supaSignIn(email, password) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: SUPA_BASE,
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function supaSignOut(accessToken) {
  await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { ...SUPA_BASE, "Authorization": `Bearer ${accessToken}` },
  });
}

async function saveOrder(orderData, accessToken) {
  try {
    const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": CONFIG.SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${accessToken || CONFIG.SUPABASE_ANON_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { success: true, order: data[0] };
  } catch (e) {
    console.error("Order save failed:", e);
    return { success: false, error: e.message };
  }
}

// ── AUTH CONTEXT ──────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lumiere_session");
      if (raw) {
        const sess = JSON.parse(raw);
        // simple expiry check
        if (sess.expires_at && Date.now() / 1000 > sess.expires_at) {
          localStorage.removeItem("lumiere_session");
        } else {
          setSession(sess);
          setUser(sess.user);
        }
      }
    } catch { }
    setAuthReady(true);
  }, []);

  const signIn = async (email, password) => {
    const data = await supaSignIn(email, password);
    if (data.error || data.error_code) throw new Error(data.error_description || data.msg || "Login failed");
    const sess = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at, user: data.user };
    localStorage.setItem("lumiere_session", JSON.stringify(sess));
    setSession(sess); setUser(data.user);
    return data;
  };

  const signUp = async (email, password, fullName) => {
    const data = await supaSignUp(email, password, fullName);
    if (data.error || data.error_code) throw new Error(data.error_description || data.msg || "Signup failed");
    if (data.access_token) {
      const sess = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at, user: data.user };
      localStorage.setItem("lumiere_session", JSON.stringify(sess));
      setSession(sess); setUser(data.user);
    }
    return data;
  };

  const signOut = async () => {
    if (session?.access_token) await supaSignOut(session.access_token).catch(() => { });
    localStorage.removeItem("lumiere_session");
    setSession(null); setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, session, authReady, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
${GF}
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --gold:#C4955A;--gold2:#E8C88A;
  --dark:#1A1512;--dark2:#231E18;--dark3:#2E2720;
  --cream:#F7F2EA;--muted:#9A8E80;
  --red:#C0392B;--green:#27AE60;--blue:#2980B9;
}
body{background:var(--dark);color:var(--cream);font-family:'Outfit',sans-serif;overflow-x:hidden;}
/* cursor */
.cur{width:10px;height:10px;background:var(--gold);border-radius:50%;position:fixed;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .25s,height .25s;mix-blend-mode:difference;}
.cur-ring{width:38px;height:38px;border:1.5px solid var(--gold);border-radius:50%;position:fixed;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:all .18s ease,width .3s,height .3s;}
.cur-h{width:50px!important;height:50px!important;opacity:.5;}
.cur-dot-h{width:4px!important;height:4px!important;}
/* nav */
nav{position:fixed;top:0;left:0;right:0;z-index:200;padding:18px 60px;display:flex;align-items:center;justify-content:space-between;background:rgba(26,21,18,.97);backdrop-filter:blur(12px);border-bottom:1px solid rgba(196,149,90,.12);}
.logo{display:flex;align-items:center;gap:10px;cursor:pointer;}
.logo-text{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;letter-spacing:3px;color:var(--gold);text-transform:uppercase;}
.nav-links{display:flex;gap:36px;list-style:none;}
.nav-links a{color:var(--muted);text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;transition:color .3s;position:relative;}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:var(--gold);transition:width .3s;}
.nav-links a:hover{color:var(--gold);}
.nav-links a:hover::after{width:100%;}
.nav-right{display:flex;align-items:center;gap:12px;}
.user-chip{display:flex;align-items:center;gap:8px;}
.user-avatar{width:30px;height:30px;background:rgba(196,149,90,.15);border:1px solid rgba(196,149,90,.35);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--gold);font-weight:600;flex-shrink:0;}
.user-email{font-size:11px;color:var(--muted);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.signout-btn{background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:11px;letter-spacing:2px;font-family:'Outfit',sans-serif;text-transform:uppercase;transition:color .2s;padding:0;}
.signout-btn:hover{color:var(--gold);}
.cart-btn{position:relative;background:var(--gold);color:var(--dark);padding:9px 22px;font-size:11px;letter-spacing:2px;text-transform:uppercase;border:none;cursor:pointer;font-weight:600;font-family:'Outfit',sans-serif;transition:all .3s;}
.cart-btn:hover{background:var(--gold2);transform:translateY(-1px);}
.cart-badge{position:absolute;top:-8px;right:-8px;width:20px;height:20px;background:var(--red);border-radius:50%;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700;}
/* hero */
.hero{height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;}
.hero-bg{position:absolute;inset:0;}
.hero-img{width:100%;height:100%;object-fit:cover;opacity:.28;}
.hero-ov{position:absolute;inset:0;background:linear-gradient(135deg,rgba(26,21,18,.94) 0%,rgba(26,21,18,.55) 65%,rgba(26,21,18,.82) 100%);}
.hero-content{position:relative;z-index:2;max-width:800px;padding:0 60px;}
.h-eye{font-size:10px;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:24px;opacity:0;animation:fadeUp 1s .2s forwards;}
.h-title{font-family:'Cormorant Garamond',serif;font-size:clamp(50px,7vw,96px);font-weight:300;line-height:.92;color:var(--cream);margin-bottom:24px;opacity:0;animation:fadeUp 1s .4s forwards;}
.h-title em{font-style:italic;color:var(--gold);}
.h-sub{font-size:14px;color:var(--muted);line-height:1.8;max-width:420px;margin-bottom:40px;opacity:0;animation:fadeUp 1s .6s forwards;}
.h-btns{display:flex;gap:16px;opacity:0;animation:fadeUp 1s .8s forwards;}
.btn-p{background:var(--gold);color:var(--dark);padding:14px 36px;font-size:11px;letter-spacing:3px;text-transform:uppercase;border:none;cursor:pointer;font-weight:600;font-family:'Outfit',sans-serif;transition:all .3s;}
.btn-p:hover{background:var(--gold2);transform:translateY(-2px);box-shadow:0 16px 32px rgba(196,149,90,.3);}
.btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.btn-o{background:transparent;color:var(--cream);padding:14px 36px;font-size:11px;letter-spacing:3px;text-transform:uppercase;border:1px solid rgba(247,242,234,.25);cursor:pointer;font-family:'Outfit',sans-serif;transition:all .3s;}
.btn-o:hover{border-color:var(--gold);color:var(--gold);}
/* marquee */
.mq{padding:28px 0;border-top:1px solid rgba(196,149,90,.12);border-bottom:1px solid rgba(196,149,90,.12);overflow:hidden;background:var(--dark2);}
.mq-track{display:flex;gap:50px;animation:marquee 25s linear infinite;white-space:nowrap;}
.mq-item{font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--muted);letter-spacing:2px;display:flex;align-items:center;gap:28px;flex-shrink:0;}
.mq-dot{width:4px;height:4px;background:var(--gold);border-radius:50%;}
/* catalog */
.catalog{padding:110px 60px;}
.sec-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:50px;flex-wrap:wrap;gap:24px;}
.sec-tag{font-size:10px;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:12px;}
.sec-title{font-family:'Cormorant Garamond',serif;font-size:clamp(34px,5vw,58px);font-weight:300;color:var(--cream);line-height:1;}
.pills{display:flex;gap:8px;flex-wrap:wrap;}
.pill{padding:8px 18px;border:1px solid rgba(196,149,90,.2);background:transparent;color:var(--muted);font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .3s;}
.pill.active,.pill:hover{background:var(--gold);color:var(--dark);border-color:var(--gold);}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:2px;}
.pcard{background:var(--dark2);position:relative;overflow:hidden;cursor:pointer;transition:transform .4s cubic-bezier(.25,.46,.45,.94);}
.pcard:hover{transform:translateY(-5px);z-index:2;}
.pcard:hover .cover{opacity:1;}
.pcard:hover .cactions{transform:translateY(0);opacity:1;}
.pcard:hover .pimg-inner{transform:scale(1.04);}
.pimg{height:250px;overflow:hidden;position:relative;background:#1E1A15;}
.pimg-inner{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.25,.46,.45,.94);display:block;}
.ptag{position:absolute;top:14px;left:14px;font-size:9px;letter-spacing:2px;padding:4px 10px;text-transform:uppercase;font-weight:600;z-index:2;}
.t-new{background:var(--gold);color:var(--dark);}
.t-sale{background:var(--red);color:white;}
.t-feat{background:rgba(196,149,90,.15);color:var(--gold);border:1px solid rgba(196,149,90,.4);}
.t-best{background:var(--dark3);color:var(--gold);border:1px solid rgba(196,149,90,.3);}
.cover{position:absolute;inset:0;background:rgba(26,21,18,.5);opacity:0;transition:opacity .3s;}
.cactions{position:absolute;bottom:0;left:0;right:0;padding:18px;display:flex;gap:8px;transform:translateY(18px);opacity:0;transition:all .3s cubic-bezier(.25,.46,.45,.94);z-index:3;}
.cbtn{flex:1;padding:10px;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;border:none;transition:all .2s;}
.cbtn-p{background:var(--gold);color:var(--dark);}
.cbtn-p:hover{background:var(--gold2);}
.cbtn-s{background:rgba(247,242,234,.1);color:var(--cream);border:1px solid rgba(247,242,234,.2);}
.cbtn-s:hover{background:rgba(247,242,234,.2);}
.pinfo{padding:20px 22px 24px;}
.pcat{font-size:10px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:6px;}
.pname{font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--cream);margin-bottom:5px;}
.pseries{font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.pdesc{font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:14px;}
.pprice{font-size:17px;color:var(--gold);font-weight:500;}
/* cart drawer */
.cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:300;backdrop-filter:blur(4px);animation:fadeIn .25s;}
.cart-drawer{position:fixed;top:0;right:0;bottom:0;width:420px;background:var(--dark2);z-index:301;display:flex;flex-direction:column;border-left:1px solid rgba(196,149,90,.15);animation:slideFromRight .35s cubic-bezier(.25,.46,.45,.94);}
.cart-header{padding:28px 28px 20px;border-bottom:1px solid rgba(196,149,90,.1);display:flex;align-items:center;justify-content:space-between;}
.cart-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;color:var(--cream);}
.cart-count{font-size:12px;color:var(--muted);margin-top:2px;}
.close-btn{width:36px;height:36px;border:1px solid rgba(196,149,90,.2);background:transparent;color:var(--muted);cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.close-btn:hover{border-color:var(--gold);color:var(--gold);}
.cart-items{flex:1;overflow-y:auto;padding:20px 28px;scrollbar-width:thin;scrollbar-color:var(--gold) var(--dark3);}
.cart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:12px;}
.cart-empty-text{color:var(--muted);font-size:14px;letter-spacing:1px;}
.cart-item{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid rgba(196,149,90,.08);}
.ci-img{width:72px;height:72px;object-fit:cover;flex-shrink:0;background:var(--dark3);}
.ci-info{flex:1;}
.ci-name{font-size:14px;color:var(--cream);margin-bottom:3px;}
.ci-series{font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.ci-row{display:flex;align-items:center;justify-content:space-between;}
.ci-qty{display:flex;align-items:center;gap:10px;}
.qty-btn{width:24px;height:24px;border:1px solid rgba(196,149,90,.3);background:transparent;color:var(--cream);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.qty-btn:hover{background:var(--gold);color:var(--dark);border-color:var(--gold);}
.qty-num{font-size:14px;color:var(--cream);min-width:16px;text-align:center;}
.ci-price{font-size:15px;color:var(--gold);font-weight:500;}
.ci-remove{background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:11px;letter-spacing:1px;text-transform:uppercase;transition:color .2s;padding:0;}
.ci-remove:hover{color:var(--red);}
.cart-footer{padding:20px 28px 28px;border-top:1px solid rgba(196,149,90,.1);}
.cart-summary{margin-bottom:20px;}
.summary-row{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:8px;}
.summary-row.total{color:var(--cream);font-size:16px;font-weight:500;padding-top:10px;border-top:1px solid rgba(196,149,90,.1);margin-top:10px;}
.summary-row.total span:last-child{color:var(--gold);font-size:18px;}
.checkout-btn{width:100%;background:var(--gold);color:var(--dark);padding:16px;font-size:12px;letter-spacing:3px;text-transform:uppercase;border:none;cursor:pointer;font-weight:700;font-family:'Outfit',sans-serif;transition:all .3s;}
.checkout-btn:hover{background:var(--gold2);}
.checkout-btn:disabled{opacity:.5;cursor:not-allowed;}
/* checkout modal */
.co-bg{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:400;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);animation:fadeIn .3s;padding:20px;}
.co-modal{background:var(--dark2);width:100%;max-width:860px;max-height:90vh;overflow-y:auto;border:1px solid rgba(196,149,90,.2);animation:slideUp .4s cubic-bezier(.25,.46,.45,.94);scrollbar-width:thin;scrollbar-color:var(--gold) var(--dark3);}
.co-header{padding:28px 36px 0;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--dark2);z-index:2;border-bottom:1px solid rgba(196,149,90,.1);padding-bottom:20px;}
.co-title{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:var(--cream);}
.co-steps{display:flex;gap:0;}
.step{display:flex;align-items:center;gap:8px;padding:6px 14px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);}
.step.active{color:var(--gold);}
.step.done{color:var(--green);}
.step-num{width:22px;height:22px;border-radius:50%;border:1px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;}
.step-sep{width:20px;height:1px;background:rgba(196,149,90,.2);}
.co-body{padding:32px 36px;}
/* form */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
.form-full{grid-column:1/-1;}
.field{display:flex;flex-direction:column;gap:6px;}
.field label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);}
.field input,.field select,.field textarea{background:var(--dark3);border:1px solid rgba(196,149,90,.2);color:var(--cream);padding:12px 14px;font-size:13px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s;}
.field input:focus,.field select:focus{border-color:var(--gold);}
.field input::placeholder{color:var(--muted);}
.field select option{background:var(--dark3);}
.field-error{border-color:var(--red)!important;}
.err-msg{font-size:11px;color:var(--red);margin-top:-10px;}
/* payment */
.pay-methods{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px;}
.pay-method{padding:18px 14px;border:1px solid rgba(196,149,90,.2);background:var(--dark3);cursor:pointer;transition:all .3s;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;}
.pay-method:hover{border-color:var(--gold);}
.pay-method.selected{border-color:var(--gold);background:rgba(196,149,90,.1);}
.pm-icon{width:28px;height:28px;display:flex;align-items:center;justify-content:center;}
.pm-name{font-size:12px;color:var(--cream);font-weight:500;}
.pm-sub{font-size:10px;color:var(--muted);letter-spacing:1px;}
#paypal-container{min-height:50px;}
.card-form{background:var(--dark3);border:1px solid rgba(196,149,90,.15);padding:20px;margin-bottom:20px;}
.card-note{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:6px;margin-top:10px;}
.qris-wrap{display:flex;flex-direction:column;align-items:center;padding:24px;background:white;border-radius:4px;max-width:280px;margin:0 auto 20px;}
.qris-title{font-size:12px;color:#333;font-weight:700;letter-spacing:2px;margin-bottom:12px;}
.qris-img{width:200px;height:200px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;}
.qris-note{font-size:10px;color:#666;text-align:center;margin-top:10px;line-height:1.5;}
.qris-apps{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;justify-content:center;}
.qapp{padding:3px 9px;border:1px solid #ddd;font-size:10px;color:#333;font-weight:600;}
.qris-timer{font-size:13px;color:var(--red);font-weight:600;margin-top:8px;}
.co-layout{display:grid;grid-template-columns:1fr 340px;gap:0;}
.co-main{padding:32px 36px;border-right:1px solid rgba(196,149,90,.1);}
.co-aside{padding:32px 28px;background:var(--dark3);}
.aside-title{font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--cream);margin-bottom:20px;}
.oi{display:flex;gap:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid rgba(196,149,90,.08);}
.oi-img{width:52px;height:52px;object-fit:cover;flex-shrink:0;}
.oi-name{font-size:13px;color:var(--cream);}
.oi-qty{font-size:11px;color:var(--muted);margin-top:2px;}
.oi-price{font-size:13px;color:var(--gold);margin-top:auto;margin-left:auto;white-space:nowrap;}
.aside-total{margin-top:16px;}
.at-row{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:8px;}
.at-row.big{color:var(--cream);font-size:16px;font-weight:500;border-top:1px solid rgba(196,149,90,.15);padding-top:12px;margin-top:4px;}
.at-row.big span:last-child{color:var(--gold);}
.co-nav{display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding-top:20px;border-top:1px solid rgba(196,149,90,.1);}
.back-btn{background:transparent;border:1px solid rgba(196,149,90,.2);color:var(--muted);padding:12px 24px;font-size:11px;letter-spacing:2px;cursor:pointer;font-family:'Outfit',sans-serif;text-transform:uppercase;transition:all .3s;}
.back-btn:hover{border-color:var(--gold);color:var(--gold);}
.next-btn{background:var(--gold);color:var(--dark);padding:14px 36px;font-size:11px;letter-spacing:3px;text-transform:uppercase;border:none;cursor:pointer;font-weight:700;font-family:'Outfit',sans-serif;transition:all .3s;}
.next-btn:hover{background:var(--gold2);}
.next-btn:disabled{opacity:.5;cursor:not-allowed;}
.success-wrap{text-align:center;padding:60px 40px;}
.success-icon{font-size:64px;margin-bottom:24px;}
.success-title{font-family:'Cormorant Garamond',serif;font-size:36px;color:var(--cream);margin-bottom:12px;}
.success-sub{font-size:14px;color:var(--muted);line-height:1.7;max-width:400px;margin:0 auto 8px;}
.order-id{font-size:12px;color:var(--gold);letter-spacing:2px;margin-bottom:8px;}
.save-ok{font-size:11px;color:var(--green);margin-bottom:28px;}
/* planner */
.planner{padding:110px 60px;background:var(--dark2);}
.planner-layout{display:grid;grid-template-columns:300px 1fr;gap:24px;margin-top:50px;}
.psidebar{display:flex;flex-direction:column;gap:18px;}
.slabel{font-size:10px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:10px;}
.room-btns{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.room-btn{padding:11px 10px;border:1px solid rgba(196,149,90,.18);background:transparent;color:var(--muted);font-size:11px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .3s;text-align:left;}
.room-btn.active{border-color:var(--gold);color:var(--gold);background:rgba(196,149,90,.08);}
.room-btn:hover:not(.active){border-color:rgba(196,149,90,.4);color:var(--cream);}
.furn-list{display:flex;flex-direction:column;gap:5px;max-height:350px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--gold) var(--dark3);}
.fitem{display:flex;align-items:center;gap:10px;padding:9px 11px;border:1px solid rgba(196,149,90,.1);cursor:pointer;transition:all .3s;background:var(--dark3);}
.fitem:hover{border-color:var(--gold);background:rgba(196,149,90,.08);}
.fthumb{width:46px;height:34px;object-fit:cover;flex-shrink:0;background:#1E1A15;}
.finfo{flex:1;min-width:0;}
.fname{font-size:12px;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fprice{font-size:11px;color:var(--gold);}
.fadd{width:26px;height:26px;border:1px solid rgba(196,149,90,.3);background:transparent;color:var(--gold);cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;}
.fadd:hover{background:var(--gold);color:var(--dark);}
.room-wrap{border:1px solid rgba(196,149,90,.15);overflow:hidden;}
.room-scene{position:relative;width:100%;height:540px;overflow:hidden;}
.rm-ceiling{position:absolute;top:0;left:0;right:0;height:80px;}
.rm-wall-back{position:absolute;left:70px;right:70px;top:80px;bottom:165px;}
.rm-wall-left{position:absolute;top:80px;left:0;width:70px;bottom:165px;}
.rm-wall-right{position:absolute;top:80px;right:0;width:70px;bottom:165px;}
.rm-floor{position:absolute;bottom:0;left:0;right:0;height:165px;}
.floor-planks{position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0px,transparent 38px,rgba(0,0,0,.09) 38px,rgba(0,0,0,.09) 40px),repeating-linear-gradient(180deg,transparent 0px,transparent 14px,rgba(0,0,0,.05) 14px,rgba(0,0,0,.05) 16px);}
.rm-window{position:absolute;left:50%;top:90px;transform:translateX(-50%);width:200px;height:130px;border:7px solid #D4C8B4;background:linear-gradient(180deg,#B8D4E8 0%,#DCF0F8 60%,#F0EEE0 100%);box-shadow:inset 0 0 18px rgba(0,0,0,.12),0 4px 12px rgba(0,0,0,.3);}
.rm-window::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:7px;height:100%;background:#D4C8B4;}
.rm-window::after{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:100%;height:7px;background:#D4C8B4;}
.rm-window-sill{position:absolute;bottom:-13px;left:-10px;right:-10px;height:13px;background:#C8BAA4;}
.placed-item{position:absolute;cursor:grab;user-select:none;display:flex;flex-direction:column;align-items:center;}
.placed-item:active{cursor:grabbing;}
.placed-item.dragging{z-index:100;}
.placed-item img{object-fit:contain;pointer-events:none;display:block;}
.placed-item .ilabel{font-size:9px;color:rgba(247,242,234,.75);letter-spacing:1px;text-align:center;margin-top:3px;white-space:nowrap;background:rgba(0,0,0,.5);padding:2px 6px;}
.placed-item .idel{position:absolute;top:-8px;right:-8px;width:18px;height:18px;background:var(--red);border-radius:50%;display:none;align-items:center;justify-content:center;font-size:11px;color:white;cursor:pointer;z-index:10;border:none;}
.placed-item:hover .idel{display:flex;}
.room-empty{position:absolute;top:48%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}
.room-empty h3{font-family:'Cormorant Garamond',serif;font-size:26px;color:rgba(196,149,90,.2);}
.room-empty p{font-size:11px;color:rgba(154,142,128,.4);letter-spacing:2px;margin-top:8px;text-transform:uppercase;}
.room-bar{padding:14px 22px;border-top:1px solid rgba(196,149,90,.1);display:flex;align-items:center;justify-content:space-between;background:var(--dark3);}
.room-stat{font-size:13px;color:var(--muted);}
.room-stat span{color:var(--gold);font-size:16px;font-weight:500;margin-left:8px;}
.bar-btns{display:flex;gap:10px;}
.bar-btn{background:transparent;border:1px solid rgba(196,149,90,.2);color:var(--muted);padding:7px 16px;font-size:10px;letter-spacing:2px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .3s;text-transform:uppercase;}
.bar-btn:hover{border-color:var(--gold);color:var(--gold);}
.bar-btn-fill{background:var(--gold);border-color:var(--gold);color:var(--dark);font-weight:600;}
.bar-btn-fill:hover{background:var(--gold2);}
/* features */
.features{padding:90px 60px;display:grid;grid-template-columns:repeat(3,1fr);gap:2px;}
.fcard{padding:46px 38px;background:var(--dark2);position:relative;overflow:hidden;transition:background .4s;}
.fcard:hover{background:var(--dark3);}
.fcard::before{content:'';position:absolute;top:0;left:0;width:3px;height:0;background:var(--gold);transition:height .4s;}
.fcard:hover::before{height:100%;}
.fn{font-family:'Cormorant Garamond',serif;font-size:58px;color:rgba(196,149,90,.07);line-height:1;margin-bottom:18px;}
.ft{font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--cream);margin-bottom:12px;}
.fx{font-size:13px;color:var(--muted);line-height:1.8;}
footer{padding:50px 60px;border-top:1px solid rgba(196,149,90,.1);display:flex;align-items:center;justify-content:space-between;}
.flogo{font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--gold);letter-spacing:3px;text-transform:uppercase;}
.fcopy{font-size:12px;color:var(--muted);}
.flinks{display:flex;gap:28px;}
.flinks a{font-size:11px;color:var(--muted);text-decoration:none;letter-spacing:2px;text-transform:uppercase;transition:color .3s;}
.flinks a:hover{color:var(--gold);}
/* modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);animation:fadeIn .3s;}
.modal{background:var(--dark2);max-width:680px;width:90%;border:1px solid rgba(196,149,90,.2);animation:slideUp .4s;display:grid;grid-template-columns:1fr 1fr;position:relative;}
.modal-img{height:380px;overflow:hidden;}
.modal-img img{width:100%;height:100%;object-fit:cover;}
.modal-body{padding:36px;display:flex;flex-direction:column;justify-content:space-between;}
.m-ser{font-size:10px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:10px;}
.m-name{font-family:'Cormorant Garamond',serif;font-size:28px;color:var(--cream);margin-bottom:14px;line-height:1.2;}
.m-desc{font-size:13px;color:var(--muted);line-height:1.8;margin-bottom:20px;}
.m-specs{border-top:1px solid rgba(196,149,90,.1);padding-top:16px;margin-bottom:20px;}
.m-spec{font-size:11px;color:var(--muted);margin-bottom:7px;}
.m-price{font-size:26px;color:var(--gold);font-weight:500;margin-bottom:24px;}
.m-btns{display:flex;gap:10px;}
.mclose{position:absolute;top:16px;right:16px;background:transparent;border:1px solid rgba(196,149,90,.2);color:var(--muted);width:32px;height:32px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.mclose:hover{border-color:var(--gold);color:var(--gold);}
/* toast */
.toast{position:fixed;bottom:28px;right:28px;background:var(--dark2);border:1px solid rgba(196,149,90,.3);padding:14px 22px;z-index:500;font-size:13px;color:var(--cream);animation:slideR .3s;display:flex;align-items:center;gap:10px;max-width:300px;}
.tdot{width:8px;height:8px;background:var(--gold);border-radius:50%;flex-shrink:0;}
.loading-spinner{width:20px;height:20px;border:2px solid rgba(196,149,90,.3);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;display:inline-block;}
/* auth page */
.auth-page{min-height:100vh;display:flex;}
.auth-left{flex:1;background:var(--dark2);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;border-right:1px solid rgba(196,149,90,.1);position:relative;overflow:hidden;}
.auth-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.1;}
.auth-left-inner{position:relative;z-index:1;text-align:center;max-width:360px;}
.auth-brand{display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:48px;}
.auth-brand-text{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;letter-spacing:3px;color:var(--gold);text-transform:uppercase;}
.auth-tagline{font-family:'Cormorant Garamond',serif;font-size:40px;color:var(--cream);font-weight:300;line-height:1.1;margin-bottom:18px;}
.auth-tagline em{color:var(--gold);font-style:italic;}
.auth-sub{font-size:13px;color:var(--muted);line-height:1.8;}
.auth-bullets{margin-top:44px;display:flex;flex-direction:column;gap:13px;text-align:left;}
.auth-bullet{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--muted);letter-spacing:.5px;}
.auth-bullet-dot{width:5px;height:5px;background:var(--gold);border-radius:50%;flex-shrink:0;}
.auth-right{width:480px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 48px;}
.auth-form{width:100%;max-width:360px;}
.auth-form-tag{font-size:10px;letter-spacing:4px;color:var(--gold);text-transform:uppercase;margin-bottom:10px;font-weight:600;}
.auth-form-title{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:300;color:var(--cream);margin-bottom:8px;}
.auth-form-sub{font-size:13px;color:var(--muted);margin-bottom:34px;line-height:1.6;}
.auth-fields{display:flex;flex-direction:column;gap:16px;}
.auth-error{font-size:12px;color:var(--red);margin-top:12px;line-height:1.5;}
.auth-success{font-size:12px;color:var(--green);margin-top:12px;line-height:1.5;}
.auth-switch{text-align:center;font-size:13px;color:var(--muted);margin-top:22px;}
.auth-switch-btn{background:none;border:none;color:var(--gold);cursor:pointer;font-size:13px;font-family:'Outfit',sans-serif;padding:0;transition:opacity .2s;}
.auth-switch-btn:hover{opacity:.75;}
.auth-footer{text-align:center;font-size:10px;color:var(--muted);margin-top:36px;letter-spacing:2px;opacity:.5;}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideR{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideFromRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:900px){
  nav{padding:14px 20px;} .nav-links{display:none;}
  .catalog,.planner{padding:70px 20px;} .planner-layout{grid-template-columns:1fr;}
  .features{grid-template-columns:1fr;padding:50px 20px;}
  footer{flex-direction:column;gap:20px;text-align:center;padding:36px 20px;}
  .cart-drawer{width:100%;max-width:420px;}
  .co-layout{grid-template-columns:1fr;} .co-aside{display:none;}
  .pay-methods{grid-template-columns:1fr;} .form-grid{grid-template-columns:1fr;}
  .modal{grid-template-columns:1fr;} .modal-img{height:180px;}
  .h-title{font-size:46px;} .hero-content{padding:0 24px;}
  .auth-page{flex-direction:column;} .auth-left{display:none;} .auth-right{width:100%;padding:48px 28px;}
}
`;

// ── LOGO ──────────────────────────────────────────────────────────────────────
const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <rect width="34" height="34" rx="3" fill="#C4955A" />
    <rect x="5" y="8" width="10" height="7" rx="1" fill="#1A1512" />
    <rect x="5" y="19" width="10" height="7" rx="1" fill="#1A1512" />
    <rect x="19" y="8" width="10" height="7" rx="1" fill="#1A1512" />
    <rect x="19" y="19" width="10" height="7" rx="1" fill="#1A1512" />
  </svg>
);

const perspScale = (y, h) => 0.4 + (y / h) * 0.6;

// ── QRIS CODE ─────────────────────────────────────────────────────────────────
function QRISCode({ amount }) {
  const [sec, setSec] = useState(300);
  useEffect(() => {
    const t = setInterval(() => setSec(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return (
    <div className="qris-wrap">
      <p className="qris-title">SCAN TO PAY · QRIS</p>
      <div className="qris-img">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {[[10, 10], [130, 10], [10, 130]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="40" height="40" fill="none" stroke="#000" strokeWidth="4" />
              <rect x={x + 8} y={y + 8} width="24" height="24" fill="#000" />
            </g>
          ))}
          {Array.from({ length: 200 }, (_, k) => {
            const row = Math.floor(k / 14), col = k % 14, cx2 = 10 + col * 11 + 5, cy2 = 10 + row * 11 + 5;
            if ((cx2 < 55 && cy2 < 55) || (cx2 > 125 && cy2 < 55) || (cx2 < 55 && cy2 > 125)) return null;
            return ((row * 13 + col * 7 + k * 3) % 3) === 0 ? <rect key={k} x={cx2 - 4} y={cy2 - 4} width="8" height="8" fill="#000" /> : null;
          })}
          <rect x="76" y="76" width="28" height="28" fill="white" stroke="#ccc" strokeWidth="1" />
          <rect x="80" y="80" width="20" height="20" fill="#C4955A" />
        </svg>
      </div>
      <p className="qris-note">
        GoPay · OVO · Dana · ShopeePay · LinkAja<br />
        BCA · Mandiri · BRI · BNI · BSI · All bank apps
      </p>
      <div className="qris-apps">
        {["GoPay", "OVO", "Dana", "ShopeePay"].map(a => <span key={a} className="qapp">{a}</span>)}
      </div>
      <p className="qris-timer">⏱ Expires {mm}:{ss}</p>
      <p style={{ fontSize: 13, color: "#555", marginTop: 8, fontWeight: 600 }}>
        IDR {(amount * 15800).toLocaleString()}
      </p>
    </div>
  );
}

// ── AUTH PAGE ─────────────────────────────────────────────────────────────────
function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !form.fullName.trim()) { setError("Please enter your full name."); return; }
    if (mode === "signup" && form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (mode === "signup" && form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(form.email, form.password);
      } else {
        const data = await signUp(form.email, form.password, form.fullName);
        if (!data.access_token) {
          setSuccess("Account created! Check your email to confirm, then log in.");
          setMode("login");
          setForm(p => ({ ...p, password: "", confirm: "" }));
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === "login" ? "signup" : "login");
    setError(""); setSuccess("");
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-left">
        <img className="auth-bg" src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80" alt="" />
        <div className="auth-left-inner">
          <div className="auth-brand">
            <Logo />
            <span className="auth-brand-text">Lumière</span>
          </div>
          <p className="auth-tagline">
            Furniture for <em>real</em> living
          </p>
          <p className="auth-sub">
            Beautifully crafted Scandinavian pieces. Curated for every room, built to last a lifetime.
          </p>
          <div className="auth-bullets">
            {["Secure PayPal & Stripe payments", "QRIS · GoPay · OVO · Dana · Banks", "Free delivery over $500", "10-year guarantee on all pieces", "Interactive room planner"].map((t, i) => (
              <div key={i} className="auth-bullet">
                <div className="auth-bullet-dot" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form">
          <p className="auth-form-tag">Lumière Account</p>
          <h2 className="auth-form-title">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="auth-form-sub">
            {mode === "login"
              ? "Sign in to track orders and save your favourites."
              : "Join Lumière for a personalised shopping experience."}
          </p>

          <div className="auth-fields">
            {mode === "signup" && (
              <div className="field">
                <label>Full Name</label>
                <input placeholder="Jane Doe" value={form.fullName}
                  onChange={e => set("fullName", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
            )}
            <div className="field">
              <label>Email Address</label>
              <input type="email" placeholder="jane@email.com" value={form.email}
                onChange={e => set("email", e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                value={form.password}
                onChange={e => set("password", e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
            {mode === "signup" && (
              <div className="field">
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat your password" value={form.confirm}
                  onChange={e => set("confirm", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
            )}
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button className="btn-p" style={{ width: "100%", marginTop: 24, padding: "15px", fontSize: 11, letterSpacing: 3 }}
            onClick={handleSubmit} disabled={loading}>
            {loading
              ? <span className="loading-spinner" />
              : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>

          <p className="auth-switch">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button className="auth-switch-btn" onClick={switchMode}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
          <p className="auth-footer">LUMIÈRE · SCANDINAVIAN DESIGN</p>
        </div>
      </div>
    </div>
  );
}

// ── CART DRAWER ───────────────────────────────────────────────────────────────
function CartDrawer({ onClose, onCheckout }) {
  const { items, remove, update, count, subtotal, total } = useCart();
  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <div>
            <h2 className="cart-title">Your Cart</h2>
            <p className="cart-count">{count} item{count !== 1 ? "s" : ""}</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(196,149,90,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="cart-empty-text">Your cart is empty</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="cart-item">
              <img className="ci-img" src={item.img} alt={item.name} />
              <div className="ci-info">
                <p className="ci-name">{item.name}</p>
                <p className="ci-series">{item.series}</p>
                <div className="ci-row">
                  <div className="ci-qty">
                    <button className="qty-btn" onClick={() => update(item.id, item.qty - 1)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => update(item.id, item.qty + 1)}>+</button>
                  </div>
                  <span className="ci-price">${(item.price * item.qty).toLocaleString()}</span>
                </div>
                <button className="ci-remove" onClick={() => remove(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              <div className="summary-row"><span>Shipping</span><span>${SHIPPING}</span></div>
              <div className="summary-row total"><span>Total</span><span>${total.toLocaleString()}</span></div>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>Proceed to Checkout →</button>
          </div>
        )}
      </div>
    </>
  );
}

// ── ORDER SIDEBAR ─────────────────────────────────────────────────────────────
function OrderSidebar() {
  const { items, subtotal, total } = useCart();
  return (
    <div className="co-aside">
      <h3 className="aside-title">Order Summary</h3>
      {items.map(item => (
        <div key={item.id} className="oi">
          <img className="oi-img" src={item.img} alt={item.name} />
          <div style={{ flex: 1 }}>
            <p className="oi-name">{item.name}</p>
            <p className="oi-qty">Qty: {item.qty}</p>
          </div>
          <p className="oi-price">${(item.price * item.qty).toLocaleString()}</p>
        </div>
      ))}
      <div className="aside-total">
        <div className="at-row"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
        <div className="at-row"><span>Shipping</span><span>${SHIPPING}</span></div>
        <div className="at-row big"><span>Total</span><span>${total.toLocaleString()}</span></div>
      </div>
    </div>
  );
}

// ── CHECKOUT MODAL ────────────────────────────────────────────────────────────
function CheckoutModal({ onClose }) {
  const { items, total, subtotal, clear } = useCart();
  const { user, session } = useAuth();
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [saveOk, setSaveOk] = useState(true);
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [cardErrors, setCardErrors] = useState({});
  const [form, setForm] = useState({
    firstName: user?.user_metadata?.full_name?.split(" ")[0] || "",
    lastName: user?.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "", address: "", city: "", state: "", zip: "", country: "ID",
  });
  const [formErrors, setFormErrors] = useState({});
  const paypalRef = useRef(null);
  const paypalRendered = useRef(false);

  // Load PayPal SDK when needed
  useEffect(() => {
    if (step !== 2 || payMethod !== "paypal") return;
    if (window.paypal) { renderPayPal(); return; }
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${CONFIG.PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    s.onload = renderPayPal;
    document.head.appendChild(s);
  }, [step, payMethod]);

  function renderPayPal() {
    if (!paypalRef.current || paypalRendered.current || !window.paypal) return;
    paypalRendered.current = true;
    window.paypal.Buttons({
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: total.toFixed(2), currency_code: "USD" }, description: "Lumière Home Order" }],
      }),
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        await completeOrder("paypal", details.id, {
          paypal_order_id: details.id,
          paypal_capture_id: details.purchase_units?.[0]?.payments?.captures?.[0]?.id,
          paypal_payer_id: details.payer?.payer_id,
          paypal_payer_email: details.payer?.email_address,
        });
      },
      onError: (err) => console.error("PayPal error", err),
      style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
    }).render(paypalRef.current);
  }

  function validateAddress() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.zip.trim()) e.zip = "Required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateCard() {
    const e = {};
    if (cardData.number.replace(/\s/g, "").length < 16) e.number = "Invalid card number";
    if (!cardData.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "Format: MM/YY";
    if (cardData.cvv.length < 3) e.cvv = "Invalid CVV";
    if (!cardData.name.trim()) e.name = "Required";
    setCardErrors(e); return Object.keys(e).length === 0;
  }

  function fmtCard(v) { return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim(); }
  function fmtExpiry(v) { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d; }

  async function completeOrder(method, paymentId = "", gatewayExtra = {}) {
    setLoading(true);
    const gateway = method === "card" ? "stripe" : method === "paypal" ? "paypal" : "midtrans";
    const orderData = {
      // user
      user_id: user?.id || null,
      source: "web",
      // customer
      customer: { ...form },
      // items
      items: items.map(i => ({ id: i.id, name: i.name, series: i.series, qty: i.qty, price: i.price })),
      // amounts
      subtotal, shipping: SHIPPING, tax: 0, discount: 0, total,
      currency: "USD",
      idr_equivalent: method === "qris" ? Math.round(total * 15800) : null,
      // payment
      payment_method: method,
      payment_status: "paid",
      payment_id: paymentId,
      payment_gateway: gateway,
      payment_amount: total,
      payment_currency: "USD",
      payment_fee: method === "card" ? parseFloat((total * 0.029 + 0.30).toFixed(4)) : method === "paypal" ? parseFloat((total * 0.0349 + 0.49).toFixed(4)) : 0,
      payment_net: method === "card" ? parseFloat((total - (total * 0.029 + 0.30)).toFixed(2)) : method === "paypal" ? parseFloat((total - (total * 0.0349 + 0.49)).toFixed(2)) : total,
      payment_captured_at: new Date().toISOString(),
      // Stripe-specific
      stripe_payment_method_id: method === "card" ? paymentId : null,
      // PayPal-specific
      ...gatewayExtra,
      // QRIS-specific
      midtrans_transaction_id: method === "qris" ? paymentId : null,
      midtrans_order_id: method === "qris" ? `LUM-${Date.now()}` : null,
      midtrans_payment_type: method === "qris" ? "qris" : null,
      // lifecycle
      status: "confirmed",
    };
    const result = await saveOrder(orderData, session?.access_token);
    const oid = result.order?.id || `LUM-${Date.now()}`;
    setOrderId(oid); setSaveOk(result.success);
    setLoading(false); setStep(3); clear();
  }

  async function handleCardPay() {
    if (!validateCard()) return;
    setLoading(true);
    // TODO production: stripe.createPaymentMethod({type:'card',card:elements.getElement('card')})
    //   → send paymentMethod.id to your backend → create+confirm PaymentIntent
    await new Promise(r => setTimeout(r, 1800));
    await completeOrder("card", `stripe_pm_${Date.now()}`, {
      stripe_card_brand: "visa",
      stripe_card_last4: cardData.number.replace(/\s/g, "").slice(-4),
    });
  }

  const steps = [{ n: 1, label: "Address" }, { n: 2, label: "Payment" }, { n: 3, label: "Confirm" }];

  return (
    <div className="co-bg" onClick={onClose}>
      <div className="co-modal" onClick={e => e.stopPropagation()}>
        <div className="co-header">
          <h2 className="co-title">
            {step === 1 ? "Delivery Details" : step === 2 ? "Payment" : "Order Confirmed"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {steps.map((s, i) => (
              <div key={s.n} style={{ display: "contents" }}>
                <div className={`step ${step === s.n ? "active" : step > s.n ? "done" : ""}`}>
                  <div className="step-num">{step > s.n ? "✓" : s.n}</div>
                  <span>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className="step-sep" />}
              </div>
            ))}
            <button className="close-btn" style={{ marginLeft: 16 }} onClick={onClose}>×</button>
          </div>
        </div>

        {step === 3 ? (
          <div className="success-wrap">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Thank You!</h2>
            <p className="success-sub">Your order has been placed successfully.</p>
            <p className="order-id">Order ID: {orderId}</p>
            <p className="save-ok">{saveOk ? "✓ Saved to Supabase database" : "⚠ Saved locally"}</p>
            <button className="btn-p" onClick={onClose}>Continue Shopping</button>
          </div>
        ) : (
          <div className="co-layout">
            <div className="co-main">
              {step === 1 && (
                <>
                  <div className="form-grid">
                    {[{ k: "firstName", label: "First Name", ph: "Jane" }, { k: "lastName", label: "Last Name", ph: "Doe" }].map(f => (
                      <div key={f.k} className="field">
                        <label>{f.label}</label>
                        <input className={formErrors[f.k] ? "field-error" : ""} placeholder={f.ph}
                          value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
                        {formErrors[f.k] && <span className="err-msg">{formErrors[f.k]}</span>}
                      </div>
                    ))}
                    <div className="field">
                      <label>Email</label>
                      <input type="email" className={formErrors.email ? "field-error" : ""} placeholder="jane@email.com"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      {formErrors.email && <span className="err-msg">{formErrors.email}</span>}
                    </div>
                    <div className="field">
                      <label>Phone</label>
                      <input placeholder="+62 812 3456 7890" className={formErrors.phone ? "field-error" : ""}
                        value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                      {formErrors.phone && <span className="err-msg">{formErrors.phone}</span>}
                    </div>
                    <div className="field form-full">
                      <label>Street Address</label>
                      <input placeholder="Jl. Sudirman No. 1" className={formErrors.address ? "field-error" : ""}
                        value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                      {formErrors.address && <span className="err-msg">{formErrors.address}</span>}
                    </div>
                    <div className="field">
                      <label>City</label>
                      <input placeholder="Bandung" className={formErrors.city ? "field-error" : ""}
                        value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                      {formErrors.city && <span className="err-msg">{formErrors.city}</span>}
                    </div>
                    <div className="field">
                      <label>Postal Code</label>
                      <input placeholder="40111" className={formErrors.zip ? "field-error" : ""}
                        value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
                      {formErrors.zip && <span className="err-msg">{formErrors.zip}</span>}
                    </div>
                    <div className="field">
                      <label>Province / State</label>
                      <input placeholder="West Java"
                        value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Country</label>
                      <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                        <option value="ID">Indonesia</option>
                        <option value="SG">Singapore</option>
                        <option value="MY">Malaysia</option>
                        <option value="US">United States</option>
                        <option value="AU">Australia</option>
                        <option value="GB">United Kingdom</option>
                      </select>
                    </div>
                  </div>
                  <div className="co-nav">
                    <button className="back-btn" onClick={onClose}>← Back to Cart</button>
                    <button className="next-btn" onClick={() => validateAddress() && setStep(2)}>
                      Continue to Payment →
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="pay-methods">
                    {[
                      { id: "card", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>, name: "Credit / Debit Card", sub: "Visa · Mastercard · Amex" },
                      { id: "paypal", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><text x="3" y="18" fontSize="16" fontWeight="700" fill="currentColor">P</text></svg>, name: "PayPal", sub: "PayPal balance or card" },
                      { id: "qris", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01M14 18v.01M18 14v.01" /></svg>, name: "QRIS", sub: "GoPay · OVO · Dana · Banks" },
                    ].map(m => (
                      <div key={m.id} className={`pay-method ${payMethod === m.id ? "selected" : ""}`}
                        onClick={() => { setPayMethod(m.id); paypalRendered.current = false; }}>
                        <span className="pm-icon" style={{ color: payMethod === m.id ? "var(--gold)" : "var(--muted)" }}>{m.icon}</span>
                        <span className="pm-name">{m.name}</span>
                        <span className="pm-sub">{m.sub}</span>
                      </div>
                    ))}
                  </div>

                  {payMethod === "card" && (
                    <div className="card-form">
                      <div className="form-grid" style={{ marginBottom: 14 }}>
                        <div className="field form-full">
                          <label>Cardholder Name</label>
                          <input placeholder="JANE DOE" className={cardErrors.name ? "field-error" : ""}
                            value={cardData.name}
                            onChange={e => setCardData({ ...cardData, name: e.target.value.toUpperCase() })} />
                          {cardErrors.name && <span className="err-msg">{cardErrors.name}</span>}
                        </div>
                        <div className="field form-full">
                          <label>Card Number</label>
                          <input placeholder="4242 4242 4242 4242" className={cardErrors.number ? "field-error" : ""}
                            maxLength={19} value={cardData.number}
                            onChange={e => setCardData({ ...cardData, number: fmtCard(e.target.value) })} />
                          {cardErrors.number && <span className="err-msg">{cardErrors.number}</span>}
                        </div>
                        <div className="field">
                          <label>Expiry</label>
                          <input placeholder="MM/YY" className={cardErrors.expiry ? "field-error" : ""}
                            maxLength={5} value={cardData.expiry}
                            onChange={e => setCardData({ ...cardData, expiry: fmtExpiry(e.target.value) })} />
                          {cardErrors.expiry && <span className="err-msg">{cardErrors.expiry}</span>}
                        </div>
                        <div className="field">
                          <label>CVV</label>
                          <input placeholder="123" type="password" className={cardErrors.cvv ? "field-error" : ""}
                            maxLength={4} value={cardData.cvv}
                            onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "") })} />
                          {cardErrors.cvv && <span className="err-msg">{cardErrors.cvv}</span>}
                        </div>
                      </div>
                      <p className="card-note">🔒 Encrypted via Stripe. Card data never stored.</p>
                    </div>
                  )}

                  {payMethod === "paypal" && (
                    <div id="paypal-container" ref={paypalRef} style={{ minHeight: 50 }}>
                      {!window.paypal && (
                        <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                          Loading PayPal…
                        </p>
                      )}
                    </div>
                  )}

                  {payMethod === "qris" && <QRISCode amount={total} />}

                  <div className="co-nav">
                    <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
                    {payMethod !== "paypal" && (
                      <button className="next-btn" disabled={loading}
                        onClick={() => payMethod === "card" ? handleCardPay() : completeOrder("qris", `qris_${Date.now()}`)}>
                        {loading
                          ? <><span className="loading-spinner" /> Processing…</>
                          : payMethod === "qris"
                            ? `Confirm QRIS — $${total.toLocaleString()}`
                            : `Pay $${total.toLocaleString()} →`}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            <OrderSidebar />
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP INNER ────────────────────────────────────────────────────────────
function AppInner() {
  const { add: addCart, count: cartCount } = useCart();
  const { user, signOut } = useAuth();
  const [cx, setCx] = useState(-100);
  const [cy, setCy] = useState(-100);
  const [hov, setHov] = useState(false);
  const [cat, setCat] = useState("All");
  const [room, setRoom] = useState(ROOMS[0]);
  const [placed, setPlaced] = useState([]);
  const [modal, setModal] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [drag, setDrag] = useState(null);
  const roomRef = useRef(null);
  const offRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    const mv = e => { setCx(e.clientX); setCy(e.clientY); };
    window.addEventListener("mousemove", mv);
    return () => window.removeEventListener("mousemove", mv);
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };
  const on = () => setHov(true);
  const off = () => setHov(false);

  const handleAddCart = p => { addCart(p); showToast(`${p.name} added to cart`); };
  const addRoom = p => {
    if (!roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    setPlaced(prev => [...prev, { ...p, uid: Date.now() + Math.random(), x: 80 + Math.random() * (rect.width - 200), y: 60 + Math.random() * (rect.height - 180) }]);
    showToast(`${p.name} placed — drag to arrange`);
  };

  const startDrag = useCallback((e, item) => {
    if (!roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const ex = e.touches ? e.touches[0].clientX : e.clientX;
    const ey = e.touches ? e.touches[0].clientY : e.clientY;
    offRef.current = { x: ex - rect.left - item.x, y: ey - rect.top - item.y };
    setDrag(item.uid); e.preventDefault();
  }, []);

  const moveDrag = useCallback(e => {
    if (!drag || !roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const ex = e.touches ? e.touches[0].clientX : e.clientX;
    const ey = e.touches ? e.touches[0].clientY : e.clientY;
    const nx = Math.max(0, Math.min(rect.width - 80, ex - rect.left - offRef.current.x));
    const ny = Math.max(0, Math.min(rect.height - 60, ey - rect.top - offRef.current.y));
    setPlaced(p => p.map(i => i.uid === drag ? { ...i, x: nx, y: ny } : i));
  }, [drag]);

  const endDrag = useCallback(() => setDrag(null), []);

  useEffect(() => {
    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", moveDrag, { passive: false });
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", moveDrag);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", moveDrag);
      window.removeEventListener("touchend", endDrag);
    };
  }, [moveDrag, endDrag]);

  const filtered = cat === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
  const ROOM_H = 540;
  const placed_total = placed.reduce((s, i) => s + i.price, 0);

  const userInitial = (user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase();
  const userEmail = user?.email || "";

  return (
    <div style={{ minHeight: "100vh", background: "#1A1512", cursor: "none" }}>
      <div className={`cur ${hov ? "cur-dot-h" : ""}`} style={{ left: cx, top: cy }} />
      <div className={`cur-ring ${hov ? "cur-h" : ""}`} style={{ left: cx, top: cy }} />

      {/* NAV */}
      <nav>
        <div className="logo" onMouseEnter={on} onMouseLeave={off}>
          <Logo /><span className="logo-text">Lumière</span>
        </div>
        <ul className="nav-links">
          {[{ label: "Collection", id: "catalog" }, { label: "Rooms", id: "planner" }, { label: "Planner", id: "planner" }, { label: "About", id: "features" }].map(({ label, id }) => (
            <li key={label}>
              <a href={`#${id}`} onMouseEnter={on} onMouseLeave={off}
                onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <div className="user-chip">
            <div className="user-avatar">{userInitial}</div>
            <span className="user-email">{userEmail}</span>
            <button className="signout-btn" onClick={signOut} onMouseEnter={on} onMouseLeave={off}>
              Logout
            </button>
          </div>
          <button className="cart-btn" onMouseEnter={on} onMouseLeave={off} onClick={() => setCartOpen(true)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 7 }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img className="hero-img" src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80" alt="hero" />
          <div className="hero-ov" />
        </div>
        <div className="hero-content">
          <p className="h-eye">Scandinavian design · Timeless quality</p>
          <h1 className="h-title">Furniture for <em>real</em> living</h1>
          <p className="h-sub">Beautifully crafted pieces for every room. Design your space with our interactive room planner.</p>
          <div className="h-btns">
            <button className="btn-p" onMouseEnter={on} onMouseLeave={off}
              onClick={() => document.getElementById("catalog").scrollIntoView({ behavior: "smooth" })}>
              Shop Collection
            </button>
            <button className="btn-o" onMouseEnter={on} onMouseLeave={off}
              onClick={() => document.getElementById("planner").scrollIntoView({ behavior: "smooth" })}>
              Room Planner
            </button>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="mq">
        <div className="mq-track">
          {[...Array(2)].map((_, ri) =>
            ["Secure PayPal Checkout", "Credit & Debit Cards", "QRIS · GoPay · OVO · Dana", "Free Delivery Over $500", "10-Year Guarantee", "Expert Design Advice", "Real-Time Order Tracking", "2,400+ Products"]
              .map((t, i) => <span key={`${ri}-${i}`} className="mq-item">{t}<span className="mq-dot" /></span>)
          )}
        </div>
      </div>

      {/* CATALOG */}
      <section className="catalog" id="catalog">
        <div className="sec-header">
          <div><p className="sec-tag">Our Collection</p><h2 className="sec-title">Explore Furniture</h2></div>
          <div className="pills">
            {CATS.map(c => (
              <button key={c} className={`pill ${cat === c ? "active" : ""}`} onClick={() => setCat(c)} onMouseEnter={on} onMouseLeave={off}>{c}</button>
            ))}
          </div>
        </div>
        <div className="pgrid">
          {filtered.map(p => (
            <div key={p.id} className="pcard" onMouseEnter={on} onMouseLeave={off}>
              <div className="pimg">
                <img className="pimg-inner" src={p.img} alt={p.name} loading="lazy" />
                {p.tag && <span className={`ptag ${p.tag === "New" ? "t-new" : p.tag === "Sale" ? "t-sale" : p.tag === "Featured" ? "t-feat" : "t-best"}`}>{p.tag}</span>}
                <div className="cover" />
                <div className="cactions">
                  <button className="cbtn cbtn-p" onClick={() => handleAddCart(p)}>Add to Cart</button>
                  <button className="cbtn cbtn-s" onClick={() => setModal(p)}>Details</button>
                </div>
              </div>
              <div className="pinfo">
                <p className="pcat">{p.category}</p>
                <h3 className="pname">{p.name}</h3>
                <p className="pseries">{p.series} Series</p>
                <p className="pdesc">{p.desc}</p>
                <p className="pprice">${p.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLANNER */}
      <section className="planner" id="planner">
        <div>
          <p className="sec-tag">Design Studio</p>
          <h2 className="sec-title">Room Planner</h2>
          <p style={{ color: "var(--muted)", marginTop: 14, fontSize: 14, maxWidth: 480, lineHeight: 1.7 }}>
            Choose a room, add furniture, drag to arrange — then add everything to cart instantly.
          </p>
        </div>
        <div className="planner-layout">
          <div className="psidebar">
            <div>
              <p className="slabel">Room Type</p>
              <div className="room-btns">
                {ROOMS.map(r => (
                  <button key={r.id} className={`room-btn ${room.id === r.id ? "active" : ""}`}
                    onClick={() => setRoom(r)} onMouseEnter={on} onMouseLeave={off}>{r.name}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="slabel">Add Furniture</p>
              <div className="furn-list">
                {PRODUCTS.map(p => (
                  <div key={p.id} className="fitem" onMouseEnter={on} onMouseLeave={off}>
                    <img className="fthumb" src={p.roomImg} alt={p.name} loading="lazy" />
                    <div className="finfo">
                      <p className="fname">{p.name}</p>
                      <p className="fprice">${p.price.toLocaleString()}</p>
                    </div>
                    <button className="fadd" onClick={() => addRoom(p)}>+</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="room-wrap">
            <div className="room-scene" ref={roomRef}>
              <div className="rm-ceiling" style={{ background: `linear-gradient(180deg,${room.wall} 60%,${room.accent})` }} />
              <div className="rm-wall-back" style={{ background: room.wall }}>
                <div className="rm-window"><div className="rm-window-sill" /></div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: "#E0D8CC", opacity: .55 }} />
              </div>
              <div className="rm-wall-left" style={{ background: `linear-gradient(90deg,${room.accent},${room.wall})`, clipPath: "polygon(0 0,100% 8%,100% 92%,0 100%)" }} />
              <div className="rm-wall-right" style={{ background: `linear-gradient(270deg,${room.accent},${room.wall})`, clipPath: "polygon(0 8%,100% 0,100% 100%,0 92%)" }} />
              <div className="rm-floor" style={{ background: `linear-gradient(180deg,${room.floorDark},${room.floor})`, clipPath: "polygon(70px 0%,calc(100% - 70px) 0%,100% 100%,0% 100%)" }}>
                <div className="floor-planks" />
                {[.22, .44, .66, .88].map((t, i) => (
                  <div key={i} style={{ position: "absolute", top: `${t * 100}%`, left: `${70 * (1 - t)}px`, right: `${70 * (1 - t)}px`, height: "1px", background: "rgba(0,0,0,.12)" }} />
                ))}
              </div>
              {placed.length === 0 && (
                <div className="room-empty"><h3>Your room awaits</h3><p>Add furniture from the list</p></div>
              )}
              {[...placed].sort((a, b) => a.y - b.y).map(item => {
                const sc = perspScale(item.y, ROOM_H);
                const iw = Math.max(Math.round(item.w * sc * 1.15), 50);
                const ih = Math.max(Math.round(item.h * sc * .7), 30);
                return (
                  <div key={item.uid} className={`placed-item ${drag === item.uid ? "dragging" : ""}`}
                    style={{ left: item.x, top: item.y, zIndex: Math.round(item.y) }}
                    onMouseDown={e => startDrag(e, item)} onTouchStart={e => startDrag(e, item)}
                    onMouseEnter={on} onMouseLeave={off}>
                    <img src={item.roomImg} alt={item.name} width={iw} height={ih}
                      style={{ filter: `drop-shadow(0 ${Math.round(6 * sc)}px ${Math.round(14 * sc)}px rgba(0,0,0,.7))`, borderRadius: 2 }} />
                    <span className="ilabel">{item.name}</span>
                    <button className="idel" onClick={() => setPlaced(p => p.filter(i => i.uid !== item.uid))}>×</button>
                  </div>
                );
              })}
            </div>
            <div className="room-bar">
              <p className="room-stat">
                {placed.length} item{placed.length !== 1 ? "s" : ""}
                {placed.length > 0 && <span>${placed_total.toLocaleString()}</span>}
              </p>
              <div className="bar-btns">
                {placed.length > 0 && <button className="bar-btn" onClick={() => setPlaced([])} onMouseEnter={on} onMouseLeave={off}>Clear</button>}
                {placed.length > 0 && (
                  <button className="bar-btn bar-btn-fill" onMouseEnter={on} onMouseLeave={off}
                    onClick={() => { placed.forEach(i => addCart(i)); showToast("Room items added to cart!"); setCartOpen(true); }}>
                    Add Room to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        {[
          { n: "01", t: "Secure Payments", x: "PayPal, all major credit/debit cards, and QRIS for Indonesian e-wallets and bank transfers. All transactions encrypted." },
          { n: "02", t: "Sustainable Promise", x: "90% of materials from renewable or recycled sources. We plant a tree for every order placed worldwide." },
          { n: "03", t: "White-Glove Delivery", x: "Full in-home assembly, packaging removal, and placement. We don't leave until everything is perfect." },
        ].map(f => (
          <div key={f.n} className="fcard" onMouseEnter={on} onMouseLeave={off}>
            <p className="fn">{f.n}</p><h3 className="ft">{f.t}</h3><p className="fx">{f.x}</p>
          </div>
        ))}
      </section>

      <footer>
        <span className="flogo">Lumière</span>
        <span className="fcopy">© 2025 Lumière Home. All rights reserved.</span>
        <div className="flinks">
          {["Privacy", "Terms", "Careers", "Contact"].map(l => (
            <a key={l} href="#" onMouseEnter={on} onMouseLeave={off}>{l}</a>
          ))}
        </div>
      </footer>

      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}

      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-img"><img src={modal.img} alt={modal.name} /></div>
            <div className="modal-body">
              <div>
                <p className="m-ser">{modal.series} · {modal.category}</p>
                <h2 className="m-name">{modal.name}</h2>
                <p className="m-desc">{modal.desc}</p>
                <div className="m-specs">
                  {[`Width: ${modal.w} cm`, `Height: ${modal.h} cm`, `Depth: ${modal.depth} cm`, "Origin: European crafted", "Warranty: 10 years"].map(d => (
                    <p key={d} className="m-spec">· {d}</p>
                  ))}
                </div>
                <p className="m-price">${modal.price.toLocaleString()}</p>
              </div>
              <div className="m-btns">
                <button className="btn-p" style={{ flex: 1, padding: "12px 16px", fontSize: 10 }}
                  onClick={() => { handleAddCart(modal); setModal(null); }} onMouseEnter={on} onMouseLeave={off}>
                  Add to Cart
                </button>
                <button className="cbtn cbtn-s" style={{ flex: 1 }}
                  onClick={() => { addRoom(modal); setModal(null); }} onMouseEnter={on} onMouseLeave={off}>
                  Place in Room
                </button>
              </div>
            </div>
            <button className="mclose" onClick={() => setModal(null)}>×</button>
          </div>
        </div>
      )}

      {toast && <div className="toast"><div className="tdot" />{toast}</div>}
    </div>
  );
}

// ── APP ROOT (auth gate) ──────────────────────────────────────────────────────
function AppRoot() {
  const { user, authReady } = useAuth();
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);
  if (!authReady) {
    return (
      <div style={{ minHeight: "100vh", background: "#1A1512", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="loading-spinner" />
      </div>
    );
  }
  if (!user) return <AuthPage />;
  return <AppInner />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoot />
      </CartProvider>
    </AuthProvider>
  );
}