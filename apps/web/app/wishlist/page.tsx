"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "../StoreProvider";
import "../incomer.css";

export default function WishlistPage() {
  const {
    wishlist, toggleWishlist, addToCart,
    isDarkMode, setIsDarkMode,
    user, handleLogout,
    getCartCount, getCartTotal, setIsCartOpen,
    cart, updateQuantity, removeFromCart, clearCart,
    isAuthOpen, setIsAuthOpen, authError, setAuthError
  } = useStore();

  // No redirigir automáticamente — mostrar CTA de login si no hay sesión

  return (
    <div className={`inc-root${isDarkMode ? " dark" : " light"}`}>

      {/* HEADER — mismo que el resto de páginas */}
      <header className="inc-header">
        <div className="inc-header-inner">
          <Link href="/" className="inc-logo">Incomer<span>Store</span></Link>

          <div style={{ flex: 1 }} />

          <div className="inc-header-actions">
            <button className="inc-theme-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {user ? (
              <div className="inc-user-menu">
                <button className="inc-user-btn">👤 {user.name.split(" ")[0]}</button>
                <div className="inc-dropdown">
                  <Link href="/" className="inc-dropdown-item">🏠 Volver a la tienda</Link>
                  {user.role === "ADMIN" && <Link href="/admin" className="inc-dropdown-item">⚙️ Dashboard Admin</Link>}
                  <button onClick={handleLogout} className="inc-dropdown-item danger">Cerrar Sesión</button>
                </div>
              </div>
            ) : (
              <button className="inc-account-btn" onClick={() => { setAuthError(""); setIsAuthOpen(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                Mi cuenta
              </button>
            )}

            <button className="inc-cart-btn" onClick={() => setIsCartOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {getCartCount()} | ${getCartTotal().toFixed(2)}
            </button>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="inc-breadcrumb">
        <Link href="/">Inicio</Link>
        <span className="inc-breadcrumb-sep">/</span>
        <span className="inc-breadcrumb-current">❤️ Mi Lista de Deseos</span>
      </div>

      {/* MAIN */}
      <main className="inc-wishlist-main">
        {!user ? (
          /* Sin sesión — CTA de login */
          <div className="inc-wishlist-hero">
            <span style={{ fontSize: "4rem" }}>🔒</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "22px", fontWeight: 800 }}>
              Inicia sesión para ver tus favoritos
            </h2>
            <p style={{ color: "var(--text-2)", maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
              Tu lista de deseos se guarda en tu cuenta. Regístrate o inicia sesión para guardar productos.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="inc-btn-primary" onClick={() => { setAuthError(""); setIsAuthOpen(true); }}>
                Iniciar sesión
              </button>
              <Link href="/" className="inc-btn-outline">Ver catálogo</Link>
            </div>
          </div>
        ) : wishlist.length === 0 ? (
          /* Con sesión pero sin favoritos */
          <div className="inc-wishlist-hero">
            <span style={{ fontSize: "4rem" }}>🤍</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "22px", fontWeight: 800 }}>
              Tu lista de deseos está vacía
            </h2>
            <p style={{ color: "var(--text-2)", maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
              Guarda los productos que te interesan para comprarlos más tarde.
            </p>
            <Link href="/" className="inc-btn-primary" style={{ textDecoration: "none" }}>
              Explorar catálogo
            </Link>
          </div>
        ) : (
          /* Lista de favoritos */
          <>
            <div className="inc-section-header" style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "22px", fontWeight: 800 }}>
                ❤️ Mis Favoritos ({wishlist.length})
              </h2>
              <Link href="/" className="inc-btn-outline" style={{ textDecoration: "none", fontSize: 13, padding: "8px 16px" }}>
                Seguir explorando →
              </Link>
            </div>

            <div className="inc-grid">
              {wishlist.map(p => (
                <div key={p.id} className="inc-card">
                  <span className="inc-card-badge">{p.badge}</span>
                  <button
                    className="inc-wish-btn wished"
                    onClick={() => toggleWishlist(p)}
                    title="Quitar de favoritos"
                  >❤️</button>

                  <Link href={`/products/${p.id}`} className="inc-card-img-wrap">
                    <img src={p.image} alt={p.title} className="inc-card-img" />
                  </Link>

                  <div className="inc-card-body">
                    <Link href={`/products/${p.id}`} className="inc-card-name">{p.title}</Link>
                    <p className="inc-card-price">${p.price}</p>
                    <button className="inc-btn-primary full" onClick={() => addToCart(p)}>
                      🛒 Mover al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* CART DRAWER */}
      <div className={`inc-cart${getCartCount() > 0 && false ? " open" : ""}`}>
        {/* El carrito se abre desde setIsCartOpen */}
      </div>

      {/* Cart Drawer completo */}
      <div className={`inc-cart${false ? " open" : ""}`} />

    </div>
  );
}
