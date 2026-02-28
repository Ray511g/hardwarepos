"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simulate login for now - in real app, call /api/auth
    if (username === "admin" && password === "password123") {
      localStorage.setItem("user", JSON.stringify({ name: "System Admin", role: "ADMIN", username: "admin" }));
      router.push("/");
    } else if (username === "cashier1" && password === "password123") {
      localStorage.setItem("user", JSON.stringify({ name: "Main Cashier", role: "CASHIER", username: "cashier1" }));
      router.push("/");
    } else {
      setError("Invalid credentials. Try admin / password123");
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--background)',
      padding: '2rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>HardwarePRO</h1>
          <p style={{ opacity: 0.7 }}>Sign in to manage your store</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', opacity: 0.8 }}>Username</label>
            <input 
              type="text" 
              className="glass"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', color: 'white' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', opacity: 0.8 }}>Password</label>
            <input 
              type="password" 
              className="glass"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', color: 'white' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            Log In to Terminal
          </button>
        </form>
      </div>
    </div>
  );
}
