"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import localProductsData from "../data/products.json";

export type Product = {
  id: string;
  title: string;
  price: number | string;
  image: string;
  badge: string;
  category: string;
  description?: string;
  specs?: string[];
  stock?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type StoreContextType = {
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isDarkMode: boolean;
  setIsDarkMode: (mode: boolean) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  handleLogout: () => void;
  searchQuery: string;
  handleSearchChange: (query: string) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  authError: string;
  setAuthError: (error: string) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ─── helpers ────────────────────────────────────────────────────────────────
function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function removeLS(key: string) {
  try { localStorage.removeItem(key); } catch {}
}
// ────────────────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [products, setProducts]           = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoading] = useState(true);
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [wishlist, setWishlist]           = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen]       = useState(false);
  const [isDarkMode, setIsDarkModeState]  = useState(false); // default light
  const [user, setUserState]              = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [isAuthOpen, setIsAuthOpen]       = useState(false);
  const [authError, setAuthError]         = useState("");

  // ── Apply theme to <html> immediately ─────────────────────────────────────
  const applyTheme = useCallback((dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
    }
  }, []);

  const setIsDarkMode = useCallback((dark: boolean) => {
    setIsDarkModeState(dark);
    applyTheme(dark);
    writeLS("incomer-theme", dark);
  }, [applyTheme]);

  // ── Hydrate from localStorage once on client mount ─────────────────────────
  useEffect(() => {
    // Theme — apply before first paint to avoid flash
    const savedDark = readLS<boolean>("incomer-theme", false);
    setIsDarkModeState(savedDark);
    applyTheme(savedDark);

    // Cart
    const savedCart = readLS<CartItem[]>("incomer-cart", []);
    if (savedCart.length > 0) setCart(savedCart);

    // User
    const savedUser = readLS<UserProfile | null>("incomer-user", null);
    if (savedUser) setUserState(savedUser);

    // Wishlist — always from localStorage (source of truth when API is down)
    const savedWishlist = readLS<Product[]>("incomer-wishlist", []);
    if (savedWishlist.length > 0) setWishlist(savedWishlist);

    // URL search param
    const searchParam = new URLSearchParams(window.location.search).get("search");
    if (searchParam) setSearchQuery(searchParam);

    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist cart ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (cart.length > 0) writeLS("incomer-cart", cart);
    else removeLS("incomer-cart");
  }, [cart, mounted]);

  // ── Persist user ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (user) writeLS("incomer-user", user);
    else removeLS("incomer-user");
  }, [user, mounted]);

  // ── Persist wishlist ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (wishlist.length > 0) writeLS("incomer-wishlist", wishlist);
    else removeLS("incomer-wishlist");
  }, [wishlist, mounted]);

  // ── Products (API → JSON fallback) ─────────────────────────────────────────
  const refreshProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:4000/products");
      if (!res.ok) throw new Error("API unavailable");
      const data = await res.json();
      setProducts(data);
    } catch {
      setProducts(localProductsData as Product[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshProducts(); }, [refreshProducts]);

  // ── Cart helpers ───────────────────────────────────────────────────────────
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getCartCount = useCallback(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const getCartTotal = useCallback(() => cart.reduce((s, i) => {
    const p = typeof i.product.price === "number" ? i.product.price : parseFloat(String(i.product.price).replace(/[^0-9.]/g, ""));
    return s + p * i.quantity;
  }, 0), [cart]);

  // ── Sync/Fetch Wishlist when user changes ──────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      // Clear or load default
      return;
    }
    const fetchUserWishlist = async () => {
      try {
        const res = await fetch("http://localhost:4000/wishlist", {
          headers: { "X-User-Id": user.id }
        });
        if (res.ok) {
          const data = await res.json();
          setWishlist(data);
        }
      } catch (e) {
        console.error("Error fetching wishlist:", e);
      }
    };
    fetchUserWishlist();
  }, [user?.id, mounted]);

  // ── Wishlist ───────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback(async (product: Product) => {
    if (!user) {
      setIsAuthOpen(true);
      setAuthError("Debes iniciar sesión para guardar favoritos.");
      return;
    }
    
    const exists = wishlist.some(w => w.id === product.id);
    
    // Optimistic UI update
    setWishlist(prev => {
      return exists ? prev.filter(w => w.id !== product.id) : [...prev, product];
    });

    try {
      const url = `http://localhost:4000/wishlist/${product.id}`;
      const method = exists ? "DELETE" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "X-User-Id": user.id }
      });
      if (!res.ok) {
        // Rollback state if failed
        setWishlist(prev => {
          return exists ? [...prev, product] : prev.filter(w => w.id !== product.id);
        });
      }
    } catch (e) {
      console.error("Error syncing wishlist with API:", e);
      // Rollback state if error
      setWishlist(prev => {
        return exists ? [...prev, product] : prev.filter(w => w.id !== product.id);
      });
    }
  }, [user, wishlist]);

  // ── User / Session ─────────────────────────────────────────────────────────
  const setUser = useCallback((u: UserProfile | null) => {
    setUserState(u);
    if (!u) {
      const saved = readLS<Product[]>("incomer-wishlist", []);
      setWishlist(saved);
    }
  }, []);

  const handleLogout = useCallback(() => {
    removeLS("incomer-user");
    removeLS("incomer-cart");
    removeLS("incomer-wishlist");
    setUserState(null);
    setCart([]);
    setWishlist([]);
    setIsCartOpen(false);
    setIsAuthOpen(false);
    router.push("/");
  }, [router]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery(val);
    const url = new URL(window.location.href);
    if (val) url.searchParams.set("search", val);
    else url.searchParams.delete("search");
    window.history.replaceState({}, "", url.pathname + url.search);
    if (window.location.pathname !== "/") {
      router.push(val ? `/?search=${encodeURIComponent(val)}` : "/");
    }
  }, [router]);

  const value: StoreContextType = {
    products, isLoadingProducts, refreshProducts,
    cart, addToCart, updateQuantity, removeFromCart, getCartCount, getCartTotal, clearCart,
    isCartOpen, setIsCartOpen,
    wishlist, toggleWishlist,
    isDarkMode, setIsDarkMode,
    user, setUser, handleLogout,
    searchQuery, handleSearchChange,
    isAuthOpen, setIsAuthOpen, authError, setAuthError,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
