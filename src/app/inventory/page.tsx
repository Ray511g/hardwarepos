"use client";

import { useState, useEffect } from "react";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setIsLoading(false);
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Inventory Management</h1>
          <p style={{ opacity: 0.7 }}>Track and manage your hardware stock from the live database.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-secondary">Import Bulk (CSV)</button>
           <button className="btn btn-primary">+ Add New Item</button>
        </div>
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>Fetching live data...</div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input 
                type="text" 
                placeholder="Filter by name, SKU or category..." 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
              />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)', opacity: 0.6, fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem' }}>Product Name</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Stock Level</th>
                  <th style={{ padding: '1rem' }}>Unit</th>
                  <th style={{ padding: '1rem' }}>Price (Kes)</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '1rem' }}>{item.category}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 'bold', color: item.stockLevel < item.minStockLevel ? 'var(--error)' : 'inherit' }}>
                        {item.stockLevel}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{item.unit}</td>
                    <td style={{ padding: '1rem' }}>{item.unitPrice.toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      {item.stockLevel < item.minStockLevel ? (
                        <span style={{ color: 'var(--error)', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>LOW STOCK</span>
                      ) : (
                        <span style={{ color: 'var(--success)', fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>GOOD</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                      <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
