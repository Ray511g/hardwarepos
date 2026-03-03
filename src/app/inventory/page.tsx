"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState("STOCK"); // STOCK, AUDIT, PROCUREMENT
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", category: "CEMENT", unit: "Bag", unitPrice: "", costPrice: "", stockLevel: 0, minStockLevel: 5 });
  const [auditQty, setAuditQty] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const fetchData = () => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        const validated = Array.isArray(data) ? data : [];
        setItems(validated);
        localStorage.setItem("inventory_items_cache", JSON.stringify(validated));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
     const cachedItems = localStorage.getItem("inventory_items_cache");
     if (cachedItems) {
        setItems(JSON.parse(cachedItems));
        setIsLoading(false);
     }

     fetchData();
     const interval = setInterval(() => {
        if (!showAdd && !selectedProduct && document.visibilityState === 'visible') {
           fetchData();
        }
     }, 10000); 
     return () => clearInterval(interval);
  }, [showAdd, selectedProduct]);

  const handleAddProduct = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSaving(true);
     try {
        const res = await fetch("/api/products", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
              ...newProduct,
              unitPrice: parseFloat(newProduct.unitPrice),
              costPrice: parseFloat(newProduct.costPrice)
           })
        });
        if (res.ok) {
           setShowAdd(false);
           setNewProduct({ name: "", sku: "", category: "CEMENT", unit: "Bag", unitPrice: "", costPrice: "", stockLevel: 0, minStockLevel: 5 });
           fetchData();
        }
     } catch (err) {
        alert("Product registration failed.");
     } finally {
        setIsSaving(false);
     }
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !auditQty) return;
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/inventory/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          physicalStock: parseFloat(auditQty),
          reason: "Manual Reconciliation Audit"
        })
      });

      const result = await response.json();
      if (result.success) {
        setItems(items.map(p => p.id === selectedProduct.id ? { ...p, stockLevel: parseFloat(auditQty) } : p));
        setSelectedProduct(null);
        setAuditQty("");
      }
    } catch (error) {
       alert("Audit failed to save.");
    } finally {
       setIsSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
     return items.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase()) || 
        p.sku.toLowerCase().includes(filter.toLowerCase())
     );
  }, [items, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflow: 'hidden' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Stock Operations</h1>
          <p style={{ opacity: 0.5, fontSize: '1.1rem', marginTop: '0.5rem' }}>Global Hardware Asset Management & Reconciliation Console</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-secondary" onClick={() => setShowAdd(true)}>+ Register New SKU</button>
           <Link href="/procurement">
              <button className="btn btn-primary" style={{ padding: '1rem 2rem' }}>🏗️ Stock Inward</button>
           </Link>
        </div>
      </header>

      {/* Add Product Modal */}
      {showAdd && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleAddProduct} className="card" style={{ width: '500px', background: 'var(--sidebar)', border: '1px solid var(--primary)', padding: '3rem' }}>
               <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>New Master SKU Registration</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input 
                      placeholder="Product SKU" 
                      style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                      value={newProduct.sku}
                      onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                      required
                    />
                    <select 
                      style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      {["CEMENT", "STEEL", "ROOFING", "PLUMBING", "ELECTRICAL", "PAINT", "TOOLS"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <input 
                    placeholder="Product Description (e.g. 50kg Cement)" 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    required
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input 
                      placeholder="Unit Price (KES)" 
                      type="number"
                      style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                      value={newProduct.unitPrice}
                      onChange={e => setNewProduct({...newProduct, unitPrice: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="Cost Price (KES)" 
                      type="number"
                      style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                      value={newProduct.costPrice}
                      onChange={e => setNewProduct({...newProduct, costPrice: e.target.value})}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input 
                      placeholder="Weight / Unit (e.g. kg, Pc)" 
                      style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                      value={newProduct.unit}
                      onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                    />
                    <input 
                      placeholder="Min Stock Alert" 
                      type="number"
                      style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                      value={newProduct.minStockLevel}
                      onChange={e => setNewProduct({...newProduct, minStockLevel: parseInt(e.target.value)})}
                    />
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                     {isSaving ? "REGISTERING..." : "Register Global SKU"}
                  </button>
               </div>
            </form>
         </div>
      )}

      {/* Audit Modal Overlay */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <form onSubmit={handleAudit} className="card" style={{ width: '450px', background: 'var(--sidebar)', border: '1px solid var(--primary)', padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔦</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Stock Reconciliation</h2>
              <p style={{ opacity: 0.5, marginBottom: '2rem' }}>Reconciling physical count for <b>{selectedProduct.sku}</b></p>
              
              <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.5 }}>PHYSICAL QUANTITY DETECTED ({selectedProduct.unit})</label>
                <input 
                  type="number" 
                  autoFocus
                  style={{ width: '100%', padding: '1.25rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.75rem', fontSize: '1.5rem', fontWeight: 'bold' }}
                  value={auditQty}
                  onChange={(e) => setAuditQty(e.target.value)}
                  placeholder="Counted reality..."
                  required
                />
                <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '1rem' }}>Current system stock: {selectedProduct.stockLevel}</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedProduct(null)}>Abort</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                    {isSaving ? "RECORDING..." : "Finalize Reality"}
                 </button>
              </div>
           </form>
        </div>
      )}

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden', padding: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
             <input 
               type="text" 
               placeholder="🔍 Filter ledger by SKU or Name..." 
               style={{ width: '100%', padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: 'white', fontSize: '1rem' }}
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
             />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.4, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0 1rem' }}>SKU</th>
                    <th style={{ padding: '0 1rem' }}>Description</th>
                    <th style={{ padding: '0 1rem' }}>Category</th>
                    <th style={{ padding: '0 1rem' }}>System Stock</th>
                    <th style={{ padding: '0 1rem' }}>Cost vs Unit Price</th>
                    <th style={{ padding: '0 1rem' }}>Health Status</th>
                    <th style={{ padding: '0 1rem', textAlign: 'right' }}>Audit Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>Scrutinizing inventory stream...</td></tr>
                  ) : filteredItems.map((item, i) => (
                    <tr key={i} className="hover-lift" style={{ background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.8rem' }}>{item.sku}</td>
                      <td style={{ padding: '1.25rem 1rem' }}>{item.name}</td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                         <span style={{ fontSize: '0.7rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{item.category}</span>
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span style={{ fontWeight: '900', color: item.stockLevel < 10 ? 'var(--error)' : 'inherit' }}>
                             {item.stockLevel}
                           </span>
                           <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{item.unit}(s)</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>KES {item.unitPrice.toLocaleString()}</span>
                            <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Cost: {item.costPrice.toLocaleString()}</span>
                         </div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        {item.stockLevel < 10 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--error)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                             <div style={{ width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%' }}></div>
                             CRITICAL LOW
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                             <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></div>
                             OPTIMAL
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                        <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)' }} onClick={() => setSelectedProduct(item)}>Audit 🔍</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
