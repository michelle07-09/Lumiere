import React from 'react';
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { CartProvider, useCart } from './src/context/CartContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/utils/config';

import AuthScreen          from './src/screens/AuthScreen';
import HomeScreen          from './src/screens/HomeScreen';
import CatalogScreen       from './src/screens/CatalogScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen          from './src/screens/CartScreen';
import CheckoutScreen      from './src/screens/CheckoutScreen';
import PlannerScreen       from './src/screens/PlannerScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab icon config — Ionicons only, no emoji
const TAB_ICONS = {
  Home:    { default: 'home-outline',    active: 'home'         },
  Catalog: { default: 'grid-outline',    active: 'grid'         },
  Planner: { default: 'pencil-outline',  active: 'pencil'       },
  Cart:    { default: 'bag-outline',     active: 'bag'          },
};

// ── Catalog stack ─────────────────────────────────────────────────────────────
function CatalogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CatalogMain"   component={CatalogScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Cart stack ────────────────────────────────────────────────────────────────
function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

// ── Home stack ────────────────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
    </Stack.Navigator>
  );
}

// ── Custom Tab Bar ────────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const { count } = useCart();
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: COLORS.dark2,
      borderTopWidth: 1,
      borderColor: 'rgba(196,149,90,0.15)',
      paddingBottom: Platform.OS === 'ios' ? 24 : 8,
      paddingTop: 10,
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label   = options.tabBarLabel ?? route.name;
        const focused = state.index === index;
        const isCart  = route.name === 'CartTab';
        const icons   = TAB_ICONS[label] || { default: 'ellipse-outline', active: 'ellipse' };

        return (
          <TouchableOpacity
            key={route.key}
            style={{ flex: 1, alignItems: 'center', gap: 4, position: 'relative' }}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            {focused && (
              <View style={{
                position: 'absolute', top: -10,
                left: '25%', right: '25%',
                height: 2, backgroundColor: COLORS.gold,
              }} />
            )}
            <Ionicons
              name={focused ? icons.active : icons.default}
              size={20}
              color={focused ? COLORS.gold : COLORS.muted}
            />
            <Text style={{
              fontSize: 9, letterSpacing: 1.5,
              color: focused ? COLORS.gold : COLORS.muted,
              fontWeight: focused ? '700' : '400',
            }}>
              {label.toUpperCase()}
            </Text>
            {isCart && count > 0 && (
              <View style={{
                position: 'absolute', top: 0, right: '22%',
                width: 18, height: 18,
                backgroundColor: COLORS.red, borderRadius: 9,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: 'white', fontSize: 9, fontWeight: '800' }}>
                  {count > 9 ? '9+' : count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Main tabs ─────────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"    component={HomeStack}    options={{ tabBarLabel: 'Home'    }} />
      <Tab.Screen name="Catalog" component={CatalogStack} options={{ tabBarLabel: 'Catalog' }} />
      <Tab.Screen name="Planner" component={PlannerScreen} options={{ tabBarLabel: 'Planner' }} />
      <Tab.Screen name="CartTab" component={CartStack}    options={{ tabBarLabel: 'Cart'    }} />
    </Tab.Navigator>
  );
}

// ── AppRoot — shows AuthScreen if not logged in ────────────────────────────────
function AppRoot() {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary:      COLORS.gold,
          background:   COLORS.dark,
          card:         COLORS.dark2,
          text:         COLORS.cream,
          border:       'rgba(196,149,90,0.15)',
          notification: COLORS.red,
        },
      }}
    >
      <StatusBar style="light" backgroundColor={COLORS.dark} />
      {user ? <MainTabs /> : <AuthScreen />}
    </NavigationContainer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoot />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}