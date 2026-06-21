"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import "../../incomer.css";
import { useStore, Product } from "../../StoreProvider";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

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

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (!productId || products.length === 0) return;
    const found = products.find(p => p.id === productId);
    setProduct(found || null);
  }, [productId, products]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!emailInput || !passwordInput) { setAuthError("Llena todos los campos."); return; }
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
    setAuthError("Inicio con Google no disponible en entorno de desarrollo local. Por favor use correo y contraseña.");
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addToCart(product);
  };

  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setTimeout(() => { setIsAuthOpen(true); setAuthError("⚠️ Debes iniciar sesión para finalizar tu compra."); }, 300);
      return;
    }
    alert("¡Compra procesada con éxito! Gracias por elegir Incomer Store. 🎉");
    clearCart();
    setIsCartOpen(false);
  };

  if (isLoadingProducts) {
    return <div className="inc-root dark" style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}><div className="inc-spinner" /></div>;
  }

  if (!product) {
    return (
      <div className="inc-root dark" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:"20px"}}>
        <p style={{fontSize:"1.5rem"}}>Producto no encontrado</p>
        <Link href="/" className="inc-btn-primary" style={{textDecoration:"none",padding:"12px 24px",borderRadius:"99px"}}>Volver a la tienda</Link>
      </div>
    );
  }

  const isWished = wishlist.some(w => w.id === product.id);
  const inCartQty = cart.find(i => i.product.id === product.id)?.quantity || 0;

  return (
    <div className={`inc-root${isDarkMode ? " dark" : " light"}`}>

      {/* HEADER */}
      <header className="inc-header">
        <div className="inc-header-inner">
          <Link href="/" className="inc-logo">Incomer<span>Store</span></Link>
          <div className="inc-search-wrap">
            <svg className="inc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="inc-search" type="text" placeholder="¿Qué te puedo ayudar a buscar hoy?" value={searchQuery} onChange={e => handleSearchChange(e.target.value)} />
          </div>
          <div className="inc-header-actions">
            <button className="inc-theme-btn" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
            {user ? (
              <div className="inc-user-menu">
                <button className="inc-user-btn">👤 {user.name.split(" ")[0]}</button>
                <div className="inc-dropdown">
                  <Link href="/wishlist" className="inc-dropdown-item">❤️ Favoritos ({wishlist.length})</Link>
                  {user.role === "ADMIN" && <Link href="/admin" className="inc-dropdown-item">⚙️ Admin</Link>}
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
      </header>

      {/* BREADCRUMB */}
      <div className="inc-breadcrumb">
        <button onClick={() => router.back()} className="inc-back-btn">← Volver</button>
        <span className="inc-breadcrumb-sep">/</span>
        <Link href="/">Inicio</Link>
        <span className="inc-breadcrumb-sep">/</span>
        <span>{product.category}</span>
        <span className="inc-breadcrumb-sep">/</span>
        <span className="inc-breadcrumb-current">{product.title}</span>
      </div>

      {/* PRODUCT DETAIL */}
      <main className="inc-detail-main">
        <div className="inc-detail-layout">

          {/* LEFT: Image */}
          <div className="inc-detail-img-col">
            <div className="inc-detail-img-box">
              {product.badge && <span className="inc-card-badge">{product.badge}</span>}
              <img src={product.image} alt={product.title} className="inc-detail-img" />
            </div>
          </div>

          {/* RIGHT: Info */}
          <div className="inc-detail-info-col">
            <p className="inc-detail-category">{product.category}</p>
            <h1 className="inc-detail-title">{product.title}</h1>

            <p className="inc-detail-price">
              ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
              <span className="inc-detail-iva"> Incluye IVA</span>
            </p>

            {product.specs && product.specs.length > 0 && (
              <div className="inc-detail-specs">
                <h3>Características principales</h3>
                <ul>
                  {product.specs.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {product.description && !product.specs && (
              <p className="inc-detail-desc">{product.description}</p>
            )}

            {/* Stock indicator */}
            <div className="inc-detail-stock">
              {product.stock === 0 ? (
                <span className="inc-stock-out">⛔ Agotado</span>
              ) : product.stock && product.stock <= 5 ? (
                <span className="inc-stock-low">⚠️ Solo {product.stock} en stock</span>
              ) : (
                <span className="inc-stock-ok">✅ En stock</span>
              )}
              {inCartQty > 0 && <span className="inc-in-cart"> · {inCartQty} en tu carrito</span>}
            </div>

            {/* Quantity + Add */}
            <div className="inc-detail-buy">
              <div className="inc-detail-qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button
                className="inc-btn-primary inc-detail-add-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Agotado" : "Añadir al carrito"}
              </button>
              <button className={`inc-wish-btn-lg${isWished ? " wished" : ""}`} onClick={() => toggleWishlist(product)} title="Lista de deseos">
                {isWished ? "❤️" : "🤍"}
              </button>
            </div>

            {/* Trust badges */}
            <div className="inc-trust-badges">
              <div className="inc-badge">🚚 Envío express</div>
              <div className="inc-badge">🛡️ Garantía 12 meses</div>
              <div className="inc-badge">💳 Pago seguro</div>
              <div className="inc-badge">🔄 30 días devolución</div>
            </div>
          </div>
        </div>
      </main>

      {/* AUTH MODAL */}
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
                <div className="inc-field"><label>Nombre</label><input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Ej: Juan Pérez" required /></div>
              )}
              <div className="inc-field"><label>Correo</label><input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="usuario@gmail.com" required /></div>
              <div className="inc-field"><label>Contraseña</label><input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} /></div>
              <button type="submit" className="inc-btn-primary full">{authTab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}</button>
            </form>
            <div className="inc-divider"><span>o continúa con</span></div>
            <button className="inc-google-btn" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </button>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      <div className={`inc-cart${isCartOpen ? " open" : ""}`}>
        <div className="inc-cart-head">
          <h3>Tu Carrito ({getCartCount()})</h3>
          <button className="inc-cart-close" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>
        <div className="inc-cart-items">
          {cart.length === 0 ? (
            <div className="inc-cart-empty"><span style={{fontSize:"3rem"}}>🛒</span><p>Vacío</p></div>
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
            <button className="inc-btn-primary full" onClick={handleCheckout}>Finalizar Compra</button>
            {!user && <p className="inc-checkout-hint">⚠️ Inicia sesión para continuar</p>}
          </div>
        )}
      </div>
      {isCartOpen && <div className="inc-overlay" onClick={() => setIsCartOpen(false)}/>}
    </div>
  );
}
