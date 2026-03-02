"use client";

import { useState, useEffect, useMemo } from "react";
import Receipt from "../../components/Receipt";

const CATEGORIES = ["ALL", "CEMENT", "STEEL", "ROOFING", "PLUMBING", "ELECTRICAL", "PAINT", "TOOLS"];

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch products from database / mock endpoint
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const addToCart = (product: any) => {
    if (product.stockLevel <= 0) return alert("❌ Out of Stock!");
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stockLevel) return alert("❌ Max stock reached!");
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const changeQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
       if (item.id === id) {
          const newQty = Math.max(1, Math.min(item.qty + delta, item.stockLevel));
          return { ...item, qty: newQty };
       }
       return item;
    }));
  }

  const filteredProducts = useMemo(() => {
     let filtered = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.sku.toLowerCase().includes(search.toLowerCase())
     );
     if (activeCategory !== "ALL") {
        filtered = filtered.filter(p => p.category.toUpperCase() === activeCategory);
     }
     return filtered;
  }, [products, search, activeCategory]);

  const total = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const vat = total * (16 / 116); 

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert("🛒 Cart is empty!");
    
    setIsProcessing(true);
    try {
      // Simulate/API call
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          paymentMethod,
          total,
          taxAmount: vat,
          customerId: null
        })
      });

      const result = await response.json();
      if (result.success || result.id) {
        const saleData = result.sale || { invoiceNumber: `INV-${Date.now()}`, total, items: cart };
        setLastSale(saleData);
        setShowReceipt(true);
        setCart([]);
        // Local stock update simulation
        setProducts(products.map(p => {
           const cItem = cart.find(ci => ci.id === p.id);
           if (cItem) return { ...p, stockLevel: p.stockLevel - cItem.qty };
           return p;
        }));
      } else {
        alert("⚠️ POS Note: Database sync failed, but sale is simulated locally for demo.");
        setLastSale({ invoiceNumber: `SIM-${Date.now()}`, total, items: cart, paymentMethod, etimsSigned: true });
        setShowReceipt(true);
        setCart([]);
      }
    } catch (err) {
      alert("⚠️ Network offline. Simulation active.");
      setLastSale({ invoiceNumber: `INV-${Date.now()}`, total, items: cart, paymentMethod, etimsSigned: true });
      setShowReceipt(true);
      setCart([]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '1.5rem', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      
      {/* Receipts Modal Overlay */}
      {showReceipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', z Babel: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
           <div className="card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white', color: 'black' }}>
              <Receipt sale={lastSale} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowReceipt(false)}>Close</button>
                 <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>Print 🖨️</button>
              </div>
           </div>
        </div>
      )}

      {/* Product Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="🔍 Search items by name, category or SKU..." 
              style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', fontSize: '1rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
             {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{ 
                     padding: '0.5rem 1rem', 
                     borderRadius: '20px', 
                     border: '1px solid var(--card-border)',
                     background: activeCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                     color: activeCategory === cat ? 'black' : 'white',
                     fontSize: '0.75rem',
                     fontWeight: '700',
                     cursor: 'pointer',
                     whiteSpace: 'nowrap'
                  }}
                >
                   {cat}
                </button>
             ))}
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', marginTop: '5rem', opacity: 0.5 }}>📡 Scanning inventory...</div>
        ) : (
          <div className="grid grid-cols-3" style={{ overflowY: 'auto', alignContent: 'start', paddingRight: '0.5rem' }}>
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="card p-4 hover-lift" 
                onClick={() => addToCart(product)} 
                style={{ 
                   cursor: 'pointer', 
                   display: 'flex', 
                   flexDirection: 'column', 
                   gap: '1rem',
                   opacity: product.stockLevel <= 0 ? 0.3 : 1,
                   transition: 'all 0.3s ease'
                }}
              >
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ fontSize: '1.5rem' }}>{['🏗️','🧱','🛠️','📦','🔩','🪚'][Math.floor(Math.random() * 6)]}</div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 'bold' }}>{product.category}</div>
                 </div>
                 <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', height: '2.4rem', overflow: 'hidden', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>{product.name}</div>
                    <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.25rem', marginTop: '0.5rem' }}>Kes {product.unitPrice.toLocaleString()}</div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: product.stockLevel < 10 ? 'var(--error)' : 'var(--success)', fontWeight: 'bold' }}>
                       {product.stockLevel} {product.unit}(s) left
                    </div>
                    {product.stockLevel <= 0 && <span style={{ color: 'var(--error)', fontSize: '0.7rem' }}>OUT</span>}
                 </div>
              </div>
            ))}
            {filteredProducts.length === 0 && <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '5rem', opacity: 0.5 }}>No results found for "{search}"</div>}
          </div>
        )}
      </div>

      {/* Right Sidebar - Checkout Container */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--sidebar)', border: 'none', borderRadius: '0', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Current Order</h2>
          <button className="btn btn-secondary" onClick={() => setCart([])} style={{ fontSize: '0.7rem' }}>Clear All</button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
          {cart.length === 0 && (
             <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                <p>Bag is empty. Ready for sales.</p>
             </div>
          )}
          {cart.map((item, i) => (
            <div key={i} className="card p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
               <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                     <button className="btn" style={{ padding: '0.1rem 0.4rem', minWidth: '24px', height: '24px', background: 'rgba(255,255,255,0.1)' }} onClick={() => changeQty(item.id, -1)}>−</button>
                     <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.qty}</span>
                     <button className="btn" style={{ padding: '0.1rem 0.4rem', minWidth: '24px', height: '24px', background: 'rgba(255,255,255,0.1)' }} onClick={() => changeQty(item.id, 1)}>+</button>
                     <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>@ Kes {item.unitPrice.toLocaleString()}</span>
                  </div>
               </div>
               <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Kes {(item.qty * item.unitPrice).toLocaleString()}</div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.7rem', cursor: 'pointer', padding: '0.25rem 0' }}
                  >
                    Remove
                  </button>
               </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '2px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
            <span>Net Subtotal</span>
            <span>Kes {(total - vat).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
            <span>VAT Amount (16%)</span>
            <span>Kes {vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', marginTop: '0.5rem' }}>
            <span>KES</span>
            <span>{total.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {['CASH', 'MPESA', 'CREDIT'].map(mode => (
              <button 
                key={mode}
                onClick={() => setPaymentMethod(mode)}
                style={{ 
                  padding: '1rem 0.5rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--card-border)', 
                  background: paymentMethod === mode ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                  color: paymentMethod === mode ? 'black' : 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          <button 
            className="btn btn-primary" 
            disabled={isProcessing || cart.length === 0}
            onClick={handleCompleteSale}
            style={{ 
               width: '100%', 
               justifyContent: 'center', 
               padding: '1.25rem', 
               fontSize: '1.25rem', 
               fontWeight: 'bold',
               opacity: isProcessing ? 0.7 : 1,
               boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
               textTransform: 'uppercase',
               letterSpacing: '1px'
            }}
          >
            {isProcessing ? "Signing Invoice..." : "Finalize Sale & Receipt"}
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.5 }}>
            ⚡ Automated KRA eTIMS Signing Simulation Enabled
          </div>
        </div>
      </div>
    </div>
  );
}
