"use client";

import { useState, useEffect } from "react";

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch products from database
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      });
  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const vat = total * (16 / 116); // Assuming unitPrice is VAT inclusive as per Kenyan standards

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    
    setIsProcessing(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          paymentMethod,
          total,
          taxAmount: vat,
          // Placeholder customer for now
          customerId: null
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`Sale completed! Invoice: ${result.sale.invoiceNumber}`);
        setCart([]);
        // Refresh products to show updated stock
        const prodRes = await fetch("/api/products");
        const prodData = await prodRes.json();
        setProducts(prodData);
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert("Failed to process sale");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', height: 'calc(100vh - 100px)' }}>
      {/* Product Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-secondary">Scanner On</button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading inventory...</div>
        ) : (
          <div className="grid grid-cols-3" style={{ overflowY: 'auto', alignContent: 'start' }}>
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())).map(product => (
              <div key={product.id} className="card" onClick={() => addToCart(product)} style={{ cursor: 'pointer', textAlign: 'center', opacity: product.stockLevel <= 0 ? 0.5 : 1 }}>
                 <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>{product.category === 'Cement' ? '🧱' : product.category === 'Steel' ? '🏗️' : '📦'}</div>
                 </div>
                 <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{product.name}</div>
                 <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Kes {product.unitPrice.toLocaleString()}</div>
                 <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.5rem' }}>
                    {product.stockLevel} {product.unit}(s) in stock
                 </div>
                 {product.stockLevel <= 0 && <div style={{ color: 'var(--error)', fontSize: '0.7rem', fontWeight: 'bold' }}>OUT OF STOCK</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart & Checkout */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--sidebar)' }}>
        <h2 style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>Current Sale</h2>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.length === 0 && <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>Cart is empty</div>}
          {cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.qty} x {item.unitPrice}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>Kes {(item.qty * item.unitPrice).toLocaleString()}</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
               </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
            <span>Subtotal (Exc. VAT)</span>
            <span>Kes {(total - vat).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
            <span>VAT (16%)</span>
            <span>Kes {vat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.5rem' }}>
            <span>Total</span>
            <span>Kes {total.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            {['CASH', 'MPESA', 'CREDIT'].map(mode => (
              <button 
                key={mode}
                onClick={() => setPaymentMethod(mode)}
                style={{ 
                  padding: '0.5rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--card-border)', 
                  background: paymentMethod === mode ? 'var(--primary)' : 'transparent',
                  color: paymentMethod === mode ? 'black' : 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600'
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
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', opacity: isProcessing ? 0.7 : 1 }}
          >
            {isProcessing ? "Processing..." : "Complete Sale & eTIMS"}
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.6 }}>
            KRA eTIMS invoice signed automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
