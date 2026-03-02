"use client";

import { useState } from "react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', phone: '', category: 'Cement' });

  useEffect(() => {
     fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
     try {
        const res = await fetch("/api/suppliers");
        const data = await res.json();
        setSuppliers(data);
     } catch (err) {
        console.error("Fetch Suppliers Failed");
     } finally {
        setLoading(false);
     }
  };

  const handleAdd = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
        const res = await fetch("/api/suppliers", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(newSupplier)
        });
        if (res.ok) {
           setShowAdd(false);
           setNewSupplier({ name: '', contact: '', phone: '', category: 'Cement' });
           fetchSuppliers();
        }
     } catch (err) {
        alert("Failed to save vendor.");
     }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Vendor Network</h1>
          <p style={{ opacity: 0.5 }}>Supply Chain Partners | Global & Local Distribution Active</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem' }} onClick={() => setShowAdd(true)}>+ Register New Vendor</button>
      </header>

      {showAdd && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleAdd} className="card" style={{ width: '450px', background: 'var(--sidebar)', border: '1px solid var(--primary)', padding: '3rem' }}>
               <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Vendor Registration</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <input 
                    placeholder="Company Name (e.g. Bamburi)" 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    value={newSupplier.name}
                    onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                    required
                  />
                  <input 
                    placeholder="Primary Sales Contact" 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    value={newSupplier.contact}
                    onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})}
                  />
                  <input 
                    placeholder="Phone Number / WhatsApp" 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    value={newSupplier.phone}
                    onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                  />
                  <select 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    value={newSupplier.category}
                    onChange={e => setNewSupplier({...newSupplier, category: e.target.value})}
                  >
                     <option value="Cement">Cement & ReadyMix</option>
                     <option value="Steel">Steel & Rebar</option>
                     <option value="Paint">Paint & Coatings</option>
                     <option value="Tools">Electrical & Tools</option>
                  </select>
               </div>
               <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Abort</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Finalize Registration</button>
               </div>
            </form>
         </div>
      )}

      <div className="card" style={{ padding: '0' }}>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)', opacity: 0.4, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                <th style={{ padding: '1.5rem 1rem' }}>Supplier Identity</th>
                <th style={{ padding: '1.5rem 1rem' }}>Key Relations</th>
                <th style={{ padding: '1.5rem 1rem' }}>Digital Contact</th>
                <th style={{ padding: '1.5rem 1rem' }}>Asset Type</th>
                <th style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>Logistics</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, i) => (
                <tr key={i} className="hover-lift" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '1.25rem 1rem', fontWeight: '900', color: 'var(--primary)' }}>{s.name}</td>
                  <td style={{ padding: '1.25rem 1rem' }}>{s.contact}</td>
                  <td style={{ padding: '1.25rem 1rem' }}>{s.phone}</td>
                  <td style={{ padding: '1.25rem 1rem' }}>
                     <span style={{ fontSize: '0.65rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{s.category}</span>
                  </td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.7rem' }}>Create PO</button>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>Scanning vendor network...</td></tr>}
            </tbody>
          </table>
      </div>
    </div>
  );
}
