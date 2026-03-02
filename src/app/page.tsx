"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTelemetry = () => {
      Promise.all([
        fetch("/api/dashboard").then(res => res.json()),
        fetch("/api/finance").then(res => res.json())
      ]).then(([dashData, financeData]) => {
        setData(dashData);
        setFinance(financeData);
        setLoading(false);
      }).catch(() => setLoading(false));
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000); // 10-second Business Sync
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
     <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ opacity: 0.5, fontWeight: 'bold' }}>SYNCHRONIZING BUSINESS ENGINE...</p>
     </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Business Intelligence</h1>
          <p style={{ opacity: 0.5 }}>Industrial POS Terminal v4.0 | Real-time Profit/Loss Active</p>
        </div>
        <Link href="/pos">
          <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', fontWeight: 'bold' }}>🚀 Open POS Terminal</button>
        </Link>
      </header>

      {/* Financial Overview Grid */}
      <div className="grid grid-cols-4">
        {/* Today's Profit (Net) */}
        <div className="card glass" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Daily Net Profit</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--success)' }}>
            Kes {(finance?.netProfit || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.5rem' }}>
             {(finance?.margin || 0).toFixed(1)}% Operating Margin
          </div>
        </div>

        {/* Daily Revenue */}
        <div className="card glass" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Gross Revenue</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--primary)' }}>
            Kes {(data?.todaySales || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.5rem' }}>Live Flow (MPESA/Cash/Credit)</div>
        </div>

        {/* Asset Value */}
        <div className="card glass" style={{ borderLeft: '4px solid #6366f1' }}>
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Inventory Asset Value</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#6366f1' }}>
            Kes {(finance?.inventoryAssetValue || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.5rem' }}>Total Stock valuation at Cost</div>
        </div>
        
        {/* Alerts */}
        <div className="card glass" style={{ borderLeft: '4px solid var(--error)' }}>
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Out of Stock Alert</div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--error)' }}>
            {data?.lowStockCount || 0} SKUs
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, color: 'var(--error)', marginTop: '0.5rem', fontWeight: 'bold' }}>Immediate Inward Required</div>
        </div>
      </div>

      <div className="grid grid-cols-3">
         {/* Live Operations Feed */}
         <div className="card" style={{ gridColumn: 'span 2', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>Audit Trail & Stream</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {(data?.recentSales || []).map((sale: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                     <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                        {sale.paymentMethod === 'MPESA' ? '📱' : (sale.paymentMethod === 'CREDIT' ? '💳' : '💵')}
                     </div>
                     <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700' }}>{sale.invoiceNumber}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>{sale.customer?.name || "Counter Sale"} | {sale.paymentMethod}</div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '900', color: 'var(--primary)' }}>Kes {sale.total.toLocaleString()}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 'bold' }}>{sale.etimsSigned ? 'KRA SIGNED' : 'PENDING'}</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Operational Actions */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
               <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Management Launchpad</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link href="/finance"><button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'start' }}>📊 Profit & Loss Console</button></Link>
                  <Link href="/procurement"><button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'start' }}>🏗️ Stock Inward / PO</button></Link>
                  <Link href="/inventory"><button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'start' }}>🔍 Fast Stock Audit</button></Link>
                  <Link href="/customers"><button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'start' }}>💳 Managed Debt Ledger</button></Link>
               </div>
            </div>

            <div className="card glass" style={{ padding: '2.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,158,11,0.2), transparent)' }}>
               <div style={{ fontSize: '2rem' }}>🇰🇪</div>
               <h4 style={{ margin: '1rem 0 0.5rem 0' }}>KRA eTIMS Integrated</h4>
               <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Compliance Status: ACTIVE</p>
            </div>
         </div>
      </div>
    </div>
  );
}
