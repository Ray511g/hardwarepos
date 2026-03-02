"use client";

import { useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", name: "", password: "", role: "CASHIER" });

  useEffect(() => {
     fetchUsers();
  }, []);

  const fetchUsers = async () => {
     try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
     } catch (err) {
        console.error("Fetch Users Failed");
     } finally {
        setIsLoading(false);
     }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
       const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser)
       });
       if (res.ok) {
          setShowAdd(false);
          setNewUser({ username: "", name: "", password: "", role: "CASHIER" });
          fetchUsers();
       }
    } catch (err) {
       alert("Failed to save terminal user.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Terminal Access</h1>
          <p style={{ opacity: 0.5 }}>Staff & Operator Credentials | Security Logs Nominal</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem' }} onClick={() => setShowAdd(true)}>+ Onboard New Staff</button>
      </header>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleAddUser} className="card" style={{ width: '450px', background: 'var(--sidebar)', border: '1px solid var(--primary)', padding: '3rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Staff Onboarding</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               <input 
                 placeholder="Operator Full Name" 
                 style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                 value={newUser.name}
                 onChange={e => setNewUser({...newUser, name: e.target.value})}
                 required
               />
               <input 
                 placeholder="Terminal Username" 
                 style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                 value={newUser.username}
                 onChange={e => setNewUser({...newUser, username: e.target.value})}
                 required
               />
               <input 
                 type="password"
                 placeholder="Access PIN / Password" 
                 style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                 value={newUser.password}
                 onChange={e => setNewUser({...newUser, password: e.target.value})}
                 required
               />
               <select 
                 style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                 value={newUser.role}
                 onChange={e => setNewUser({...newUser, role: e.target.value})}
               >
                  <option value="CASHIER">CASHIER (Terminal Only)</option>
                  <option value="MANAGER">MANAGER (Inventory Access)</option>
                  <option value="ADMIN">ADMIN (Full Authority)</option>
               </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
               <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
               <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Sync Credentials</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: '0' }}>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)', opacity: 0.4, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                <th style={{ padding: '1.5rem 1rem' }}>Operator Identity</th>
                <th style={{ padding: '1.5rem 1rem' }}>Username</th>
                <th style={{ padding: '1.5rem 1rem' }}>Privilege Class</th>
                <th style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>Security</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="hover-lift" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '1.25rem 1rem', fontWeight: '900', color: 'var(--primary)' }}>{u.name}</td>
                  <td style={{ padding: '1.25rem 1rem' }}>{u.username}</td>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: '800',
                      background: u.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: u.role === 'ADMIN' ? 'var(--accent)' : 'inherit',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,0,0,0.1)', color: 'var(--error)', cursor: 'pointer', fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>Revoke ⚡</button>
                  </td>
                </tr>
              ))}
              {isLoading && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>Verifying authority chains...</td></tr>}
            </tbody>
          </table>
      </div>
    </div>
  );
}
