"use client";

import { useState, useEffect } from "react";

export default function ProcurementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Stock Inward State
  const [showInward, setShowInward] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [inwardQty, setInwardQty] = useState("");
  const [inwardCost, setInwardCost] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch("/api/products").then(res => res.json()),
      fetch("/api/procurement").then(res => res.json())
    ]).then(([prodData, orderData]) => {
      setProducts(prodData);
      setOrders(orderData);
      setLoading(false);
      setSuppliers([{ id: 'sup-1', name: 'Bamburi Cement Ltd' }, { id: 'sup-2', name: 'Devki Steel' }]);
    }).catch(() => setLoading(false));
  };

  const handleStockInward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !inwardQty || !inwardCost) return;
    setIsSaving(true);
    try {
       const response = await fetch("/api/procurement", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           supplierId: selectedSupplier || 'sup-1',
           items: [{
              productId: selectedProduct,
              quantity: parseFloat(inwardQty),
              costPrice: parseFloat(inwardCost)
           }]
         })
       });

       if (response.ok) {
          setShowInward(false);
          setInwardQty("");
          setInwardCost("");
          fetchData();
       }
    } catch (err) {
       alert("Failed to record stock inward.");
    } finally {
       setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Procurement Center</h1>
          <p style={{ opacity: 0.5, fontSize: '1.1rem' }}>Supply Chain & Stock Inward Hub | Logistics Tracking Active</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInward(true)}>🏗️ Record Stock Inward</button>
      </header>

      {/* Stock Inward Overlay */}
      {showInward && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <form onSubmit={handleStockInward} className="card" style={{ width: '450px', background: 'var(--sidebar)', border: '1px solid var(--primary)', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🏗️</div>
              <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Stock Inward / Delivery</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.5 }}>SUPPLIER SOURCE</label>
                  <select 
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.5 }}>TARGET PRODUCT</label>
                  <select 
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Select SKU...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.5 }}>QUANTITY RECEIVED</label>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}
                      value={inwardQty}
                      onChange={(e) => setInwardQty(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.5 }}>UNIT COST (KES)</label>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}
                      value={inwardCost}
                      onChange={(e) => setInwardCost(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                 <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowInward(false)}>Abort</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                    {isSaving ? "RECORDING..." : "Update Stock Levels"}
                 </button>
              </div>
           </form>
        </div>
      )}

      <div className="card" style={{ padding: '0' }}>
         <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Recent Procurement Stream</h3>
         </div>
         <div style={{ padding: '0 2rem 2rem 2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.4, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: '1rem' }}>PO NUMBER</th>
                    <th>SUPPLIER</th>
                    <th>INWARD DATE</th>
                    <th>ITEMS RECEIVED</th>
                    <th style={{ textAlign: 'right' }}>VALUATION (KES)</th>
                  </tr>
                </thead>
                <tbody>
                   {(Array.isArray(orders) ? orders : []).map((o, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem' }}>
                         <td style={{ padding: '1.25rem 0', fontWeight: 'bold', color: 'var(--primary)' }}>{o.orderNumber}</td>
                         <td style={{ padding: '1.25rem 0' }}>{o.supplier?.name || "Global Vendor"}</td>
                         <td style={{ padding: '1.25rem 0' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                         <td style={{ padding: '1.25rem 0' }}>{o.items?.length || 0} Products</td>
                         <td style={{ padding: '1.25rem 0', textAlign: 'right', fontWeight: '900' }}>{o.totalAmount.toLocaleString()}</td>
                      </tr>
                   ))}
                   {(!orders || orders.length === 0) && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>No procurement history detected.</td></tr>
                   )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
