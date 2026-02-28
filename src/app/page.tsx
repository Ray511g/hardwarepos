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
      });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Store Analytics...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Store Overview</h1>
          <p style={{ opacity: 0.7 }}>Real-time business intelligence from your hardware inventory.</p>
        </div>
        <Link href="/pos">
          <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Open POS Interface
          </button>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-4">
        <div className="card">
          <div style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Today's Sales</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            Kes {data.todaySales.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem' }}>Live from Database</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
          <div style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Stock Alerts</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--error)' }}>
            {data.lowStockCount} Items
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>Below critical levels</div>
        </div>
        <div className="card">
          <div style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '0.5rem' }}>eTIMS Sync</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)' }}>Active</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>Real-time tax signing</div>
        </div>
        <div className="card">
          <div style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '0.5rem' }}>System Status</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Online</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem' }}>Database Connected</div>
        </div>
      </div>

      <div className="grid grid-cols-3">
        {/* Recent Transactions */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            Recent Sales
            <Link href="/reports" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--primary)', cursor: 'pointer' }}>View All</span>
            </Link>
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)', opacity: 0.6, fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 0' }}>Invoice #</th>
                <th style={{ padding: '1rem 0' }}>Customer</th>
                <th style={{ padding: '1rem 0' }}>Method</th>
                <th style={{ padding: '1rem 0' }}>Amount</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSales.map((sale: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem' }}>
                  <td style={{ padding: '1rem 0', fontWeight: '500' }}>{sale.invoiceNumber}</td>
                  <td style={{ padding: '1rem 0' }}>{sale.customer?.name || "Walk-in"}</td>
                  <td style={{ padding: '1rem 0' }}>
                     <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: sale.paymentMethod === 'MPESA' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)', color: sale.paymentMethod === 'MPESA' ? 'var(--success)' : 'inherit' }}>
                      {sale.paymentMethod}
                     </span>
                  </td>
                  <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>Kes {sale.total.toLocaleString()}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: sale.etimsSigned ? 'var(--success)' : 'var(--warning)' }}></div>
                      {sale.etimsSigned ? 'eTIMS Signed' : 'Pending KRA'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.recentSales.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No sales recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/inventory" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'start' }}>📦 Manage Stock</button>
            </Link>
            <Link href="/customers" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'start' }}>👥 View Debtors</button>
            </Link>
            <Link href="/reports" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'start' }}>📊 Tax Report</button>
            </Link>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'start' }}>⚙️ KRA eTIMS Config</button>
          </div>
        </div>
      </div>
    </div>
  );
}
