"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore, Product } from "./StoreProvider";
import "./incomer.css";

export default function Home() {
  const {
    products, isLoadingProducts,
    cart, addToCart, updateQuantity, removeFromCart, getCartCount, getCartTotal, clearCart,
    isCartOpen, setIsCartOpen,
    wishlist, toggleWishlist,
    isDarkMode, setIsDarkMode,
    user, setUser, handleLogout,
    searchQuery, handleSearchChange,
    isAuthOpen, setIsAuthOpen, authError, setAuthError
  } = useStore();

  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroDir, setHeroDir] = useState<"left" | "right" | null>(null);

  const categories = ["Teléfonos", "Tablets", "Televisores", "Zona Gamer", "Gadgets", "Hogar"];

  // Group products by category, max 5 per category
  const groupedProducts = categories.reduce<Record<string, Product[]>>((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat).slice(0, 5);
    return acc;
  }, {});

  // Search filter
  const filteredProducts = searchQuery
    ? products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!emailInput || !passwordInput) {
      setAuthError("Por favor llena todos los campos.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|icloud)\.com$/;
    if (!emailRegex.test(emailInput.toLowerCase())) {
      setAuthError("Usa un correo válido (@gmail.com, @yahoo.com, @hotmail.com, etc.)");
      return;
    }

    try {
      const isLogin = authTab === "login";
      const endpoint = isLogin ? "login" : "register";
      const bodyPayload = isLogin
        ? { email: emailInput, passwordHash: passwordInput }
        : { email: emailInput, passwordHash: passwordInput, name: nameInput || emailInput.split("@")[0] };

      const res = await fetch(`http://localhost:4000/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || `Error al ${isLogin ? "iniciar sesión" : "registrarse"}.`);
        return;
      }

      setUser(data);
      setIsAuthOpen(false);
      setEmailInput(""); setPasswordInput(""); setNameInput("");
    } catch (err) {
      setAuthError("Error de conexión con el servidor de autenticación.");
    }
  };

  const handleGoogleLogin = () => {
    // Muestra error ya que OAuth2 no está implementado localmente en esta demo, o simula con un usuario backend real
    setAuthError("Inicio con Google no disponible en entorno de desarrollo local. Por favor use correo y contraseña.");
  };

  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setTimeout(() => {
        setIsAuthOpen(true);
        setAuthError("⚠️ Debes iniciar sesión para poder finalizar tu compra.");
      }, 300);
      return;
    }
    alert("¡Compra procesada con éxito! Gracias por elegir Incomer Store. 🎉");
    clearCart();
    setIsCartOpen(false);
  };

  const featuredProducts = products.slice(0, 6);

  return (
    <div className={`inc-root${isDarkMode ? " dark" : " light"}`}>

      {/* ===== STICKY HEADER ===== */}
      <header className="inc-header">
        <div className="inc-header-inner">
          <Link href="/" className="inc-logo">
            Incomer<span>Store</span>
          </Link>

          <div className="inc-search-wrap">
            <svg className="inc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="inc-search"
              type="text"
              placeholder="¿Qué te puedo ayudar a buscar hoy?"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="inc-header-actions">
            <button className="inc-theme-btn" onClick={() => setIsDarkMode(!isDarkMode)} title="Cambiar tema">
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {user ? (
              <div className="inc-user-menu">
                <button className="inc-user-btn">👤 {user.name.split(" ")[0]}</button>
                <div className="inc-dropdown">
                  <Link href="/wishlist" className="inc-dropdown-item">❤️ Favoritos ({wishlist.length})</Link>
                  {user.role === "ADMIN" && <Link href="/admin" className="inc-dropdown-item">⚙️ Dashboard Admin</Link>}
                  <button onClick={handleLogout} className="inc-dropdown-item danger">Cerrar Sesión</button>
                </div>
              </div>
            ) : (
              <button className="inc-account-btn" onClick={() => { setAuthError(""); setIsAuthOpen(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                Mi cuenta
              </button>
            )}

            <button className="inc-cart-btn" onClick={() => setIsCartOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {getCartCount()} | ${getCartTotal().toFixed(2)}
            </button>
          </div>
        </div>

        {/* Category Nav */}
        <nav className="inc-nav">
          <div className="inc-nav-inner">
            {categories.map(cat => (
              <button key={cat} className="inc-nav-item" onClick={() => handleSearchChange(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* ===== HERO SECTION ===== */}
      {!searchQuery && (
        <section className="inc-hero">
          <div className="inc-hero-copy">
            <span className="inc-eyebrow">✨ NUEVA COLECCIÓN 2025</span>
            <h1>Tu opinión nos<br/>importa.</h1>
            <p>Explora una experiencia de compra premium con navegación ultrarrápida, productos seleccionados y una interfaz moderna diseñada para cautivar.</p>
            <div className="inc-hero-actions">
              <button className="inc-btn-primary" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>
                Ver productos
              </button>
              <button className="inc-btn-outline" onClick={() => { setAuthError(""); setIsAuthOpen(true); }}>
                Crear cuenta
              </button>
            </div>
          </div>
          <div className="inc-hero-visual">
            {/* Navigation arrows */}
            <button
              className="inc-hero-arrow inc-hero-arrow-left"
              onClick={() => {
                setHeroDir("right");
                setHeroIndex(i => (i - 1 + featuredProducts.length) % featuredProducts.length);
              }}
              aria-label="Anterior"
            >‹</button>

            <div className="inc-hero-carousel">
              {featuredProducts.map((p, i) => {
                // Calculate position relative to active
                const total = featuredProducts.length;
                let offset = (i - heroIndex + total) % total;
                if (offset > total / 2) offset -= total;
                // offset: 0 = front, ±1 = sides, ±2 = back
                const isActive = offset === 0;
                const isLeft = offset === -1 || offset === total - 1;
                const isRight = offset === 1;

                return (
                  <div
                    key={p.id}
                    className={`inc-hcard${isActive ? " active" : ""}${isLeft ? " left" : ""}${isRight ? " right" : ""}${Math.abs(offset) >= 2 ? " behind" : ""}`}
                    onClick={() => {
                      if (!isActive) {
                        setHeroDir(isLeft ? "right" : "left");
                        setHeroIndex(i);
                      }
                    }}
                    style={{ cursor: isActive ? "default" : "pointer" }}
                  >
                    {p.badge && <span className="inc-card-chip">{p.badge}</span>}
                    <div className="inc-hcard-img-wrap">
                      <img src={p.image} alt={p.title} />
                    </div>
                    <div className="inc-hcard-body">
                      <p className="inc-hcard-title">{p.title}</p>
                      <p className="inc-hcard-price">${p.price}</p>
                      {isActive && (
                        <div className="inc-hcard-actions">
                          <Link href={`/products/${p.id}`} className="inc-btn-sm-outline">Ver detalles</Link>
                          <button className="inc-btn-sm-primary" onClick={e => { e.stopPropagation(); addToCart(p); }}>
                            + Carrito
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="inc-hero-arrow inc-hero-arrow-right"
              onClick={() => {
                setHeroDir("left");
                setHeroIndex(i => (i + 1) % featuredProducts.length);
              }}
              aria-label="Siguiente"
            >›</button>

            {/* Dot indicators */}
            <div className="inc-hero-dots">
              {featuredProducts.map((_, i) => (
                <button
                  key={i}
                  className={`inc-hero-dot${i === heroIndex ? " active" : ""}`}
                  onClick={() => { setHeroDir(i > heroIndex ? "left" : "right"); setHeroIndex(i); }}
                  aria-label={`Ir a producto ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CATALOG ===== */}
      <main className="inc-main" id="catalog">
        {isLoadingProducts ? (
          <div className="inc-loading">
            <div className="inc-spinner"></div>
            <p>Cargando catálogo...</p>
          </div>
        ) : filteredProducts !== null ? (
          /* Search Results */
          <div className="inc-section">
            <div className="inc-section-header">
              <h2>Resultados: "{searchQuery}"</h2>
              <button className="inc-clear-search" onClick={() => handleSearchChange("")}>✕ Limpiar</button>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="inc-grid">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onWish={toggleWishlist} isWished={wishlist.some(w => w.id === p.id)} />)}
              </div>
            ) : (
              <div className="inc-empty"><p>No se encontraron productos para "{searchQuery}"</p></div>
            )}
          </div>
        ) : (
          /* Category Groups */
          categories.map(cat => {
            const items = groupedProducts[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat} className="inc-section">
                <div className="inc-section-header">
                  <h2>{cat}</h2>
                  <button className="inc-view-more" onClick={() => handleSearchChange(cat)}>Ver más →</button>
                </div>
                <div className="inc-grid">
                  {items.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onWish={toggleWishlist} isWished={wishlist.some(w => w.id === p.id)} />)}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* ===== AUTH MODAL ===== */}
      {isAuthOpen && (
        <div className="inc-modal-overlay" onClick={() => setIsAuthOpen(false)}>
          <div className="inc-modal" onClick={e => e.stopPropagation()}>
            <button className="inc-modal-close" onClick={() => setIsAuthOpen(false)}>✕</button>
            <h2 className="inc-modal-title">Incomer Store</h2>
            <div className="inc-tabs">
              <button className={`inc-tab${authTab === "login" ? " active" : ""}`} onClick={() => setAuthTab("login")}>Ingresar</button>
              <button className={`inc-tab${authTab === "register" ? " active" : ""}`} onClick={() => setAuthTab("register")}>Crear Cuenta</button>
            </div>
            {authError && <div className="inc-error">{authError}</div>}
            <form className="inc-form" onSubmit={handleAuthSubmit}>
              {authTab === "register" && (
                <div className="inc-field">
                  <label>Nombre Completo</label>
                  <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Ej: Juan Pérez" required />
                </div>
              )}
              <div className="inc-field">
                <label>Correo Electrónico</label>
                <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="usuario@gmail.com" required />
              </div>
              <div className="inc-field">
                <label>Contraseña</label>
                <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
              </div>
              <button type="submit" className="inc-btn-primary full">
                {authTab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </button>
            </form>
            <div className="inc-divider"><span>o continúa con</span></div>
            <button className="inc-google-btn" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </button>
          </div>
        </div>
      )}

      {/* ===== CART DRAWER ===== */}
      <div className={`inc-cart${isCartOpen ? " open" : ""}`}>
        <div className="inc-cart-head">
          <h3>Tu Carrito ({getCartCount()})</h3>
          <button className="inc-cart-close" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>
        <div className="inc-cart-items">
          {cart.length === 0 ? (
            <div className="inc-cart-empty">
              <span style={{fontSize:"3rem"}}>🛒</span>
              <p>Tu carrito está vacío</p>
              <button className="inc-btn-outline" onClick={() => setIsCartOpen(false)}>Seguir comprando</button>
            </div>
          ) : cart.map(item => (
            <div key={item.product.id} className="inc-cart-item">
              <img src={item.product.image} alt={item.product.title} />
              <div className="inc-cart-item-info">
                <p className="inc-cart-item-name">{item.product.title}</p>
                <p className="inc-cart-item-price">${item.product.price}</p>
                <div className="inc-qty">
                  <button onClick={() => updateQuantity(item.product.id, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, 1)}>+</button>
                </div>
              </div>
              <button className="inc-cart-remove" onClick={() => removeFromCart(item.product.id)}>🗑</button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="inc-cart-foot">
            <div className="inc-cart-total">
              <span>Total</span>
              <span className="inc-cart-total-price">${getCartTotal().toFixed(2)}</span>
            </div>
            <button className="inc-btn-primary full" onClick={handleCheckout}>
              Finalizar Compra
            </button>
            {!user && (
              <p className="inc-checkout-hint">⚠️ Necesitas iniciar sesión para pagar</p>
            )}
          </div>
        )}
      </div>
      {isCartOpen && <div className="inc-overlay" onClick={() => setIsCartOpen(false)}/>}
    </div>
  );
}

// ===== Product Card Component =====
function ProductCard({ product, onAdd, onWish, isWished }: {
  product: Product;
  onAdd: (p: Product) => void;
  onWish: (p: Product) => void;
  isWished: boolean;
}) {
  return (
    <div className="inc-card">
      {product.badge && <span className="inc-card-badge">{product.badge}</span>}
      <button className={`inc-wish-btn${isWished ? " wished" : ""}`} onClick={() => onWish(product)} title="Lista de deseos">
        {isWished ? "❤️" : "🤍"}
      </button>
      <Link href={`/products/${product.id}`} className="inc-card-img-wrap">
        <img src={product.image} alt={product.title} className="inc-card-img" />
      </Link>
      <div className="inc-card-body">
        <Link href={`/products/${product.id}`} className="inc-card-name">{product.title}</Link>
        <p className="inc-card-price">${product.price}</p>
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <p className="inc-card-stock-warn">⚠️ Solo {product.stock} en stock</p>
        )}
        <button
          className="inc-btn-primary full"
          onClick={() => onAdd(product)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Agotado" : "Añadir al carrito"}
        </button>
      </div>
    </div>
  );
}
