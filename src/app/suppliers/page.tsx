"use client";

import { useState } from "react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([
    { id: '1', name: 'Bamburi Cement Ltd', contact: 'Sales Dept', phone: '0700000001', category: 'Cement' },
    { id: '2', name: 'Devki Steel Mills', contact: 'Main Office', phone: '0700000002', category: 'Steel' },
    { id: '3', name: 'Crown Paints Kenya', contact: 'Distributor', phone: '0700000003', category: 'Paint' },
    { id: '4', name: 'East African Portland', contact: 'Blue Triangle', phone: '0700000004', category: 'Cement' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Supplier Management</h1>
          <p style={{ opacity: 0.7 }}>Maintain contact records and procurement history with your vendors.</p>
        </div>
        <button className="btn btn-primary">+ Add New Supplier</button>
      </header>

      <div className="card">
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)', opacity: 0.6, fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem' }}>Supplier Name</th>
                <th style={{ padding: '1rem' }}>Primary Contact</th>
                <th style={{ padding: '1rem' }}>Phone Number</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{s.name}</td>
                  <td style={{ padding: '1rem' }}>{s.contact}</td>
                  <td style={{ padding: '1rem' }}>{s.phone}</td>
                  <td style={{ padding: '1rem' }}>{s.category}</td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'white', cursor: 'pointer', padding: '0.25rem 0.75rem', borderRadius: '4px', marginRight: '0.5rem' }}>Purchase Order</button>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
