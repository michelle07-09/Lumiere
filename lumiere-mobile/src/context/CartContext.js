import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SHIPPING } from '../utils/config';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Persist cart to device storage
  useEffect(() => {
    AsyncStorage.getItem('cart').then(data => {
      if (data) setItems(JSON.parse(data));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem('cart', JSON.stringify(items));
  }, [items, loaded]);

  const add = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const update = (id, qty) => {
    if (qty < 1) { remove(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const clear = () => setItems([]);

  const count    = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + (items.length > 0 ? SHIPPING : 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, count, subtotal, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
