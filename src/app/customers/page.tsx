"use client";

import { useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([
    { id: '1', name: 'John Kamau Builders', phone: '0712345678', debt: 45000, lastPay: '2024-02-15' },
    { id: '2', name: 'Mary Atieno', phone: '0722334455', debt: 0, lastPay: '2024-02-28' },
    { id: '3', name: 'Elite Construction Ltd', phone: '0700112233', debt: 125800, lastPay: '2024-01-20' },
    { id: '4', name: 'Samuel Maina', phone: '0733445566', debt: 2200, lastPay: '2024-02-10' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Customer Ledgers</h1>
          <p style={{ opacity: 0.7 }}>Manage customer relationships and track credit/debt balances.</p>
        </div>
        <button className="btn btn-primary">+ Register New Customer</button>
      </header>

      <div className="grid grid-cols-4">
        <div className="card">
           <div style={{ opacity: 0.7, fontSize: '0.875rem' }}>Total Outstanding Debt</div>
           <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--error)', marginTop: '0.5rem' }}>Kes 173,000</div>
        </div>
        <div className="card">
           <div style={{ opacity: 0.7, fontSize: '0.875rem' }}>Collected This Month</div>
           <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)', marginTop: '0.5rem' }}>Kes 82,400</div>
        </div>
      </div>

      <div className="card">
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)', opacity: 0.6, fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem' }}>Customer Name</th>
                <th style={{ padding: '1rem' }}>Phone Number</th>
                <th style={{ padding: '1rem' }}>Debt Balance (Kes)</th>
                <th style={{ padding: '1rem' }}>Last Payment</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{c.name}</td>
                  <td style={{ padding: '1rem' }}>{c.phone}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: 'bold', color: c.debt > 0 ? 'var(--error)' : 'var(--success)' }}>
                      {c.debt.toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{c.lastPay}</td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ background: 'var(--primary)', border: 'none', color: 'black', cursor: 'pointer', padding: '0.25rem 0.75rem', borderRadius: '4px', marginRight: '0.5rem', fontSize: '0.875rem' }}>Settle Debt</button>
                    <button style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'white', cursor: 'pointer', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>Statement</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
