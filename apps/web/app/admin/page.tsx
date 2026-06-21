"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore, Product } from "../StoreProvider";
import "../store.css";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, products, refreshProducts, isDarkMode, setIsDarkMode, handleLogout } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Protect Route
  useEffect(() => {
    // If not admin, redirect to home
    if (user && user.role !== 'ADMIN') {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') {
    return <div className="store-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem'}}>Acceso Denegado. Se requieren privilegios de Administrador.</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      const res = await fetch(`http://localhost:4000/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({
          title: editingProduct.title,
          price: typeof editingProduct.price === 'string' ? parseFloat(editingProduct.price) : editingProduct.price,
          stock: editingProduct.stock,
          badge: editingProduct.badge
        })
      });
      
      if (!res.ok) {
        throw new Error("No tienes permisos o ocurrió un error");
      }
      
      alert("Producto actualizado exitosamente");
      setEditingProduct(null);
      await refreshProducts(); // Sincroniza catálogo global
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const res = await fetch(`http://localhost:4000/products/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": user.id }
      });
      if (!res.ok) throw new Error("Error al eliminar");
      alert("Producto eliminado");
      await refreshProducts();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="store-container">
      <header className="store-header" style={{borderBottom: "2px solid #ef4444"}}>
        <div className="header-top">
          <div className="logo-container">
            <div className="logo">INCOMER</div>
            <span className="logo-subtitle" style={{color: "#ef4444"}}>Admin Control</span>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="user-menu">
              <span className="user-greeting" style={{color: "#ef4444", fontWeight: "bold"}}>Admin: {user.name}</span>
              <button onClick={handleLogout} className="logout-btn" style={{marginLeft: "15px"}}>Cerrar Sesión</button>
              <Link href="/" style={{marginLeft: "15px", color: "white", textDecoration: "underline"}}>Volver a la Tienda</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content" style={{padding: "40px 20px"}}>
        <h2>Dashboard Administrativo - Gestión de Catálogo</h2>
        <p>Control total de inventario (CRUD). Los cambios se reflejarán instantáneamente en PostgreSQL y en el frontend del cliente.</p>
        
        <table style={{width: "100%", borderCollapse: "collapse", marginTop: "30px", background: isDarkMode ? "#1f2937" : "white", color: isDarkMode ? "white" : "black", borderRadius: "10px", overflow: "hidden"}}>
          <thead>
            <tr style={{background: "#ef4444", color: "white", textAlign: "left"}}>
              <th style={{padding: "15px"}}>ID</th>
              <th style={{padding: "15px"}}>Producto</th>
              <th style={{padding: "15px"}}>Precio</th>
              <th style={{padding: "15px"}}>Stock</th>
              <th style={{padding: "15px"}}>Badge</th>
              <th style={{padding: "15px"}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{borderBottom: "1px solid #374151"}}>
                <td style={{padding: "15px", fontSize: "0.8rem", color: "gray"}}>{p.id.substring(0,8)}...</td>
                <td style={{padding: "15px"}}>{p.title}</td>
                <td style={{padding: "15px"}}>${p.price}</td>
                <td style={{padding: "15px", fontWeight: "bold", color: p.stock === 0 ? "#ef4444" : "#10b981"}}>{p.stock !== undefined ? p.stock : 10}</td>
                <td style={{padding: "15px"}}><span className="card-badge" style={{position: "relative", top: 0, left: 0}}>{p.badge}</span></td>
                <td style={{padding: "15px"}}>
                  <button onClick={() => setEditingProduct(p)} style={{background: "#3b82f6", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", marginRight: "10px"}}>Editar</button>
                  <button onClick={() => handleDelete(p.id)} style={{background: "#ef4444", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer"}}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="auth-modal" onClick={e => e.stopPropagation()} style={{maxWidth: "500px"}}>
            <button className="modal-close" onClick={() => setEditingProduct(null)}>×</button>
            <h2 style={{marginBottom: "20px"}}>Editar Producto</h2>
            <form className="auth-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Título</label>
                <input type="text" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Precio ($)</label>
                <input type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} required />
              </div>
              <div className="form-group">
                <label>Stock (Cantidad en Bodega)</label>
                <input type="number" value={editingProduct.stock || 0} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} required />
              </div>
              <div className="form-group">
                <label>Etiqueta (Badge)</label>
                <input type="text" value={editingProduct.badge || ""} onChange={e => setEditingProduct({...editingProduct, badge: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary full-width" style={{marginTop: "20px"}}>
                Guardar Cambios en Base de Datos
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
