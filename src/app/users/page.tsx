"use client";

import { useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([
    { id: '1', username: 'admin', name: 'System Admin', role: 'ADMIN' },
    { id: '2', username: 'cashier1', name: 'Main Cashier', role: 'CASHIER' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", name: "", password: "", role: "CASHIER" });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: Date.now().toString() }]);
    setShowAdd(false);
    setNewUser({ username: "", name: "", password: "", role: "CASHIER" });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Staff & User Access</h1>
          <p style={{ opacity: 0.7 }}>Manage terminal logins and assign roles for your staff.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add New User</button>
      </header>

      {showAdd && (
        <div className="card" style={{ border: '1px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Register New Staff Member</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-2" style={{ gap: '1rem' }}>
             <input 
               placeholder="Full Name" 
               style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--sidebar)', border: '1px solid var(--card-border)', color: 'white' }}
               value={newUser.name}
               onChange={e => setNewUser({...newUser, name: e.target.value})}
               required
             />
             <input 
               placeholder="Username" 
               style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--sidebar)', border: '1px solid var(--card-border)', color: 'white' }}
               value={newUser.username}
               onChange={e => setNewUser({...newUser, username: e.target.value})}
               required
             />
             <input 
               type="password"
               placeholder="System Password" 
               style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--sidebar)', border: '1px solid var(--card-border)', color: 'white' }}
               value={newUser.password}
               onChange={e => setNewUser({...newUser, password: e.target.value})}
               required
             />
             <select 
               style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--sidebar)', border: '1px solid var(--card-border)', color: 'white' }}
               value={newUser.role}
               onChange={e => setNewUser({...newUser, role: e.target.value})}
             >
                <option value="CASHIER">CASHIER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
             </select>
             <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User</button>
             </div>
          </form>
        </div>
      )}

      <div className="card">
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)', opacity: 0.6, fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem' }}>Full Name</th>
                <th style={{ padding: '1rem' }}>Username</th>
                <th style={{ padding: '1rem' }}>Access Role</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                  <td style={{ padding: '1rem' }}>{u.username}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: u.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: u.role === 'ADMIN' ? 'var(--accent)' : 'inherit',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>Disable</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
