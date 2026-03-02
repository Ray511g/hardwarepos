"use client";

import { useState, useEffect } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newContractor, setNewContractor] = useState({ name: '', phone: '', email: '', creditLimit: '' });
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payRef, setPayRef] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
       if (!showAdd && !selectedCustomer) {
          fetchData();
       }
    }, 5000); // 5-second Ledger Sync
    return () => clearInterval(interval);
  }, [showAdd, selectedCustomer]);

  const fetchData = () => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleRegister = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newContractor, creditLimit: parseFloat(newContractor.creditLimit) || 0 })
       });
       if (res.ok) {
          setShowAdd(false);
          setNewContractor({ name: '', phone: '', email: '', creditLimit: '' });
          fetchData();
       }
     } catch (err) {
       alert("Registration failed.");
     }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Contractors & Engineers</h1>
          <p style={{ opacity: 0.5 }}>Industrial Debt Ledger | Credit Account Management Hub</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem' }} onClick={() => setShowAdd(true)}>+ Onboard New Contractor</button>
      </header>

      {/* Contractor Registration Modal */}
      {showAdd && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleRegister} className="card" style={{ width: '450px', background: 'var(--sidebar)', border: '1px solid var(--primary)', padding: '3rem' }}>
               <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Contractor Onboarding</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <input 
                    placeholder="Company Name / Engineer Name" 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    value={newContractor.name}
                    onChange={e => setNewContractor({...newContractor, name: e.target.value})}
                    required
                  />
                  <input 
                    placeholder="Validated Phone Number" 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    value={newContractor.phone}
                    onChange={e => setNewContractor({...newContractor, phone: e.target.value})}
                    required
                  />
                  <input 
                    placeholder="Email Address (Optional)" 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    value={newContractor.email}
                    onChange={e => setNewContractor({...newContractor, email: e.target.value})}
                  />
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 'bold', opacity: 0.4 }}>CREDIT LIMIT (KES)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 250000" 
                      style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                      value={newContractor.creditLimit}
                      onChange={e => setNewContractor({...newContractor, creditLimit: e.target.value})}
                      required
                    />
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Abort</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Finalize Account</button>
               </div>
            </form>
         </div>
      )}

      {/* Payment Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <form onSubmit={handlePayment} className="card" style={{ width: '450px', background: 'var(--sidebar)', border: '1px solid var(--primary)', padding: '3rem' }}>
              <div style={{ fontSize: '3.5rem', textAlign: 'center', marginBottom: '1rem' }}>🏦</div>
              <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Accept Debt Payment</h2>
              <p style={{ textAlign: 'center', opacity: 0.5, marginBottom: '2.5rem' }}>Processing for <b>{selectedCustomer.name}</b></p>
              
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
                  <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem' }}>Outstanding Debt: Kes {selectedCustomer.debtBalance.toLocaleString()}</p>
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
                        <option value="BANK">Bank Transfer</option>
                     </select>
                   </div>
                   <div style={{ textAlign: 'left' }}>
                     <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.5 }}>REFERENCE</label>
                     <input 
                       type="text" 
                       style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                       value={payRef}
                       onChange={(e) => setPayRef(e.target.value)}
                       placeholder="TX-123..."
                     />
                   </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                 <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedCustomer(null)}>Abort</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Sync Ledger</button>
              </div>
           </form>
        </div>
      )}

      <div className="card" style={{ padding: '0' }}>
         <div style={{ padding: '0 1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.4, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                     <th style={{ padding: '1.5rem 1rem' }}>Engineer / Contractor</th>
                     <th style={{ padding: '1.5rem 1rem' }}>Credit Limit</th>
                     <th style={{ padding: '1.5rem 1rem' }}>Outstanding Balance</th>
                     <th style={{ padding: '1.5rem 1rem' }}>Utilization</th>
                     <th style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>Ledger Operations</th>
                  </tr>
               </thead>
               <tbody>
                  {customers.map((c, i) => (
                     <tr key={i} className="hover-lift" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '1.25rem 1rem' }}>
                           <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{c.name}</div>
                           <div style={{ opacity: 0.5, fontSize: '0.8rem' }}>{c.phone}</div>
                        </td>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: '700' }}>Kes {c.creditLimit?.toLocaleString()}</td>
                        <td style={{ padding: '1.25rem 1rem' }}>
                           <span style={{ fontWeight: '900', color: c.debtBalance > 0 ? 'var(--error)' : 'var(--success)', fontSize: '1.2rem' }}>Kes {c.debtBalance.toLocaleString()}</span>
                        </td>
                        <td style={{ padding: '1.25rem 1rem' }}>
                           <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ 
                                 width: `${Math.min(100, (c.debtBalance / c.creditLimit) * 100)}%`, 
                                 height: '100%', 
                                 background: (c.debtBalance / c.creditLimit) > 0.8 ? 'var(--error)' : 'var(--primary)' 
                              }}></div>
                           </div>
                           <div style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: '0.4rem' }}>{Math.round((c.debtBalance / c.creditLimit) * 100)}% Used</div>
                        </td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                           <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setSelectedCustomer(c)}>Receive Payment 💸</button>
                        </td>
                     </tr>
                  ))}
                  {loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>Reconciling debt ledgers...</td></tr>}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
