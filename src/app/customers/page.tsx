"use client";

import { useState, useEffect } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payRef, setPayRef] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !payAmount) return;

    const response = await fetch("/api/customers/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: selectedCustomer.id,
        amount: parseFloat(payAmount),
        method: payMethod,
        reference: payRef
      })
    });

    if (response.ok) {
       alert("💸 Payment Applied: Debt Ledger Updated.");
       setSelectedCustomer(null);
       setPayAmount("");
       setPayRef("");
       fetchData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Managed Debt Ledger</h1>
        <p style={{ opacity: 0.5, fontSize: '1.1rem' }}>Contractor Credit & Payment Reconciliation Console</p>
      </header>

      {/* Payment Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <form onSubmit={handlePayment} className="card" style={{ width: '450px', background: 'var(--sidebar)', border: '1px solid var(--primary)', padding: '3rem' }}>
              <div style={{ fontSize: '3.5rem', textAlign: 'center', marginBottom: '1rem' }}>🏦</div>
              <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Accept Debt Payment</h2>
              <p style={{ textAlign: 'center', opacity: 0.5, marginBottom: '2.5rem' }}>Paying for <b>{selectedCustomer.name}</b></p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.5 }}>AMOUNT TO PAY (KES)</label>
                  <input 
                    type="number" 
                    style={{ width: '100%', padding: '1.25rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: '900' }}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem' }}>Current Balance: Kes {selectedCustomer.debtBalance.toLocaleString()}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div style={{ textAlign: 'left' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.5 }}>METHOD</label>
                     <select 
                       style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                       value={payMethod}
                       onChange={(e) => setPayMethod(e.target.value)}
                     >
                        <option value="CASH">Cash</option>
                        <option value="MPESA">M-PESA</option>
                     </select>
                   </div>
                   <div style={{ textAlign: 'left' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.5 }}>REFERENCE (MPESA CODE)</label>
                     <input 
                       type="text" 
                       style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                       value={payRef}
                       onChange={(e) => setPayRef(e.target.value)}
                       placeholder="SBA123..."
                     />
                   </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                 <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedCustomer(null)}>Abort</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Apply Credit</button>
              </div>
           </form>
        </div>
      )}

      <div className="card" style={{ padding: '0' }}>
         <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Active Credit Customers</h3>
         </div>
         <div style={{ padding: '0 2rem 2rem 2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.4, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                     <th style={{ paddingBottom: '1.25rem' }}>CUSTOMER NAME</th>
                     <th>CONTACT</th>
                     <th>CREDIT LIMIT</th>
                     <th>OUTSTANDING BALANCE</th>
                     <th style={{ textAlign: 'right' }}>DEBT OPERATIONS</th>
                  </tr>
               </thead>
               <tbody>
                  {customers.map((c, i) => (
                     <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: '0.95rem' }}>
                        <td style={{ padding: '1.5rem 0', fontWeight: 'bold' }}>{c.name}</td>
                        <td style={{ padding: '1.5rem 0', opacity: 0.6 }}>{c.phone}</td>
                        <td style={{ padding: '1.5rem 0', fontWeight: '800' }}>Kes {c.creditLimit?.toLocaleString() || 'N/A'}</td>
                        <td style={{ padding: '1.5rem 0' }}>
                           <span style={{ fontWeight: '900', color: c.debtBalance > 0 ? 'var(--error)' : 'var(--success)', fontSize: '1.1rem' }}>Kes {c.debtBalance.toLocaleString()}</span>
                        </td>
                        <td style={{ padding: '1.5rem 0', textAlign: 'right' }}>
                           <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setSelectedCustomer(c)}>Receive Payment 💸</button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
