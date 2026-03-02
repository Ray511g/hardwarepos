"use client";

import { useState, useEffect, useMemo } from "react";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
     let filtered = items.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase()) || 
        p.sku.toLowerCase().includes(filter.toLowerCase())
     );
     if (categoryFilter !== "ALL") {
        filtered = filtered.filter(p => p.category.toUpperCase() === categoryFilter);
     }
     return filtered;
  }, [items, filter, categoryFilter]);

  const categories = ["ALL", ...Array.from(new Set(items.map(i => i.category.toUpperCase())))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflow: 'hidden' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '0.25rem' }}>Inventory Control</h1>
          <p style={{ opacity: 0.6, fontSize: '1rem' }}>Manage over {items.length} SKUs across all branches.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-secondary">📥 Export Ledger</button>
           <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold' }}>+ Stock Intake</button>
        </div>
      </header>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden', padding: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Filter stock by SKU, name or reference..." 
                  style={{ width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: 'white' }}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                 {categories.slice(0, 6).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      style={{ 
                         padding: '0.5rem 0.75rem', 
                         borderRadius: '8px', 
                         border: '1px solid var(--card-border)', 
                         background: categoryFilter === cat ? 'var(--primary)' : 'transparent',
                         color: categoryFilter === cat ? 'black' : 'white',
                         fontSize: '0.7rem',
                         fontWeight: 'bold',
                         cursor: 'pointer'
                      }}
                    >
                       {cat}
                    </button>
                 ))}
              </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.4, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '0 1rem' }}>SKU / Reference</th>
                    <th style={{ padding: '0 1rem' }}>Product Name</th>
                    <th style={{ padding: '0 1rem' }}>Category</th>
                    <th style={{ padding: '0 1rem' }}>Available Stock</th>
                    <th style={{ padding: '0 1rem' }}>Unit Price (KES)</th>
                    <th style={{ padding: '0 1rem' }}>Health Status</th>
                    <th style={{ padding: '0 1rem', textAlign: 'right' }}>Management</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>Querying live stock data...</td></tr>
                  ) : filteredItems.map((item, i) => (
                    <tr key={i} className="hover-lift" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', transition: 'all 0.2s' }}>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.8rem' }}>{item.sku}</td>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: '600' }}>{item.name}</td>
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
                      <td style={{ padding: '1.25rem 1rem', fontWeight: '800' }}>{item.unitPrice.toLocaleString()}</td>
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
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                           <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)' }}>Edit</button>
                           <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: 'var(--success)' }}>Stock +</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && !isLoading && (
                     <tr><td colSpan={7} style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>No items match your criteria.</td></tr>
                  )}
                </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
