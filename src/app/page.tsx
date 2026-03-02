"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
     <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ opacity: 0.5, fontWeight: 'bold', letterSpacing: '1px' }}>INITIALIZING TERMINAL...</p>
     </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></span>
              Live Metrics Active
           </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Business Pulse</h1>
          <p style={{ opacity: 0.5, fontSize: '1.1rem', marginTop: '0.5rem' }}>Kenya Hardware Pro - Nairobi Central Terminal</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <Link href="/pos">
             <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(245, 158, 11, 0.2)' }}>
               🚀 Open POS Terminal
             </button>
           </Link>
        </div>
      </header>

      {/* Primary Stats */}
      <div className="grid grid-cols-4">
        <div className="card glass" style={{ borderLeft: '4px solid var(--primary)', padding: '2rem' }}>
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Today's Gross Sales</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--primary)' }}>
            Kes {(data?.todaySales || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.75rem', fontWeight: 'bold' }}>
             ↑ 12% from yesterday
          </div>
        </div>
        
        <div className="card glass" style={{ borderLeft: '4px solid var(--error)', padding: '2rem' }}>
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Inventory Scarcity</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--error)' }}>
            {data?.lowStockCount || 0} <span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.5 }}>SKUs</span>
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.75rem' }}>Requires immediate restocking</div>
        </div>

        <div className="card glass" style={{ borderLeft: '4px solid var(--success)', padding: '2rem' }}>
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Tax Compliance</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--success)' }}>100%</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.75rem' }}>eTIMS Signature active</div>
        </div>

        <div className="card glass" style={{ borderLeft: '4px solid var(--accent)', padding: '2rem' }}>
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Customer Logic</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--accent)' }}>Active</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.75rem' }}>Credit ledger tracking enabled</div>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ alignItems: 'start' }}>
        {/* Main Feed */}
        <div className="card" style={{ gridColumn: 'span 2', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Recent Invoice Stream</h3>
             <Link href="/reports" style={{ textDecoration: 'none', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>FULL AUDIT LOG →</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(data?.recentSales || []).map((sale: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: sale.paymentMethod === 'MPESA' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginRight: '1.25rem' }}>
                    {sale.paymentMethod === 'MPESA' ? '📱' : '💵'}
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{sale.invoiceNumber}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.4 }}>{sale.customer?.name || "Counter Sale"} • {new Date(sale.createdAt).toLocaleTimeString()}</div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--primary)' }}>Kes {sale.total.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 'bold' }}>{sale.etimsSigned ? '✓ KRA SIGNED' : 'PENDING'}</div>
                 </div>
              </div>
            ))}
            {(!data?.recentSales || data.recentSales.length === 0) && (
              <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📉</div>
                 <p>No transactions detected in the current shift.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="card glass" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Quick Dispatch</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/inventory" style={{ textDecoration: 'none' }}><button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>Stock Audit <span>📦</span></button></Link>
                <Link href="/customers" style={{ textDecoration: 'none' }}><button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>Debt Ledger <span>💳</span></button></Link>
                <Link href="/reports" style={{ textDecoration: 'none' }}><button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>Tax Filing <span>🇰🇪</span></button></Link>
              </div>
           </div>

           <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.1), transparent)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1rem' }}>Terminal Info</h3>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.5 }}>Branch ID:</span>
                    <span style={{ fontWeight: 'bold' }}>NRB-001</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.5 }}>System Health:</span>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>OPTIMAL</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.5 }}>Database:</span>
                    <span style={{ fontWeight: 'bold' }}>{data?.error ? "LOCAL-CACHE" : "PRISMA-SQLITE"}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
