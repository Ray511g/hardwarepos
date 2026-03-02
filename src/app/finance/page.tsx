"use client";

import { useState, useEffect } from "react";

export default function FinancePage() {
  const [finance, setFinance] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Expense State
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'RENT', description: '', amount: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch("/api/finance").then(res => res.json()),
      fetch("/api/expenses").then(res => res.json())
    ]).then(([finData, expData]) => {
      setFinance(finData);
      setExpenses(expData);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newExpense, amount: parseFloat(newExpense.amount) })
    });

    if (response.ok) {
       setShowAddExpense(false);
       setNewExpense({ category: 'RENT', description: '', amount: '' });
       fetchData();
    }
  };

  if (loading) return <div>Loading Finance Engine...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2.5px', margin: 0 }}>Treasury & Yield</h1>
          <p style={{ opacity: 0.5, fontSize: '1.1rem' }}>Enterprise P&L Management Console | Nairobi HQ Reporting</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddExpense(true)}>+ Record Expense</button>
      </header>

      {/* Expense Modal Overlay */}
      {showAddExpense && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <form onSubmit={handleAddExpense} className="card" style={{ width: '450px', background: 'var(--sidebar)', border: '1px solid var(--primary)', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>💳</div>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Record Operational Cost</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.5 }}>CATEGORY</label>
                  <select 
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    <option value="RENT">Shop Rent</option>
                    <option value="SALARY">Salaries & Wages</option>
                    <option value="ELECTRICITY">Electricity / Utilities</option>
                    <option value="TRANSPORT">Delivery / Logistics</option>
                    <option value="OTHER">Other Expenses</option>
                  </select>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.5 }}>DESCRIPTION</label>
                  <input 
                    type="text" 
                    placeholder="Reference, e.g. Feb Rent"
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    required
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.5 }}>AMOUNT (KES)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                 <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddExpense(false)}>Cancel</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Debit Expense</button>
              </div>
           </form>
        </div>
      )}

      {/* Finance Grid */}
      <div className="grid grid-cols-3">
        <div className="card glass">
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem' }}>Enterprise Revenue</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>Kes {finance?.revenue.toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '1rem' }}>Total Sales (VAT 16% inclusive)</div>
        </div>
        <div className="card glass">
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem' }}>Cost of Goods (COGS)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--error)' }}>Kes {finance?.cogs.toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '1rem' }}>Total inventory purchase cost</div>
        </div>
        <div className="card glass">
          <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem' }}>Operating Net Profit</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--success)' }}>Kes {finance?.netProfit.toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '1rem' }}>Margin: {finance?.margin.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-3">
         {/* Ledgers Summary */}
         <div className="card" style={{ gridColumn: 'span 2', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Expense General Ledger</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.4, fontSize: '0.75rem', fontWeight: '800' }}>
                     <th style={{ paddingBottom: '1rem' }}>DATE</th>
                     <th>CATEGORY</th>
                     <th>DESCRIPTION</th>
                     <th style={{ textAlign: 'right' }}>AMOUNT (KES)</th>
                  </tr>
               </thead>
               <tbody>
                  {expenses.map((e, i) => (
                     <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem 0' }}>{new Date(e.date).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem 0' }}>
                           <span style={{ fontSize: '0.65rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{e.category}</span>
                        </td>
                        <td style={{ padding: '1rem 0', opacity: 0.7 }}>{e.description}</td>
                        <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 'bold', color: 'var(--error)' }}>{e.amount.toLocaleString()}</td>
                     </tr>
                  ))}
                  {expenses.length === 0 && (
                     <tr><td colSpan={4} style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>No expenses recorded this period.</td></tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Asset Metrics */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
               <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Wealth Index</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ opacity: 0.5 }}>Inventory Asset</span>
                     <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>Kes {finance?.inventoryAssetValue.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ opacity: 0.5 }}>Profit Margin</span>
                     <span style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--success)' }}>{finance?.margin.toFixed(1)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ opacity: 0.5 }}>VAT Liability (Est)</span>
                     <span style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--primary)' }}>Kes {(finance?.revenue * 0.16).toLocaleString()}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
