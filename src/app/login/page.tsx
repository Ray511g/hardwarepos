"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Reset any cached user on login page load
  useEffect(() => {
     localStorage.removeItem("user");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Professional Simulation / Potential API check
    setTimeout(() => {
       const userMap: any = {
          "admin": { name: "System Admin", role: "ADMIN", avatar: "👨‍💼" },
          "cashier1": { name: "Nairobi Branch Cashier", role: "CASHIER", avatar: "🛒" },
          "manager": { name: "Store Manager", role: "MANAGER", avatar: "🏢" }
       };

       if (userMap[username] && password === "password123") {
          localStorage.setItem("user", JSON.stringify({ ...userMap[username], username, loginTime: new Date().toISOString() }));
          router.push("/");
       } else {
          setError("❌ Access Denied: Incorrect credentials for the hardware terminal.");
          setLoading(false);
       }
    }, 1200);
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at top left, #1a1c23, #020202)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambience */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, top: '10%', left: '10%' }}></div>
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'var(--accent)', filter: 'blur(180px)', opacity: 0.05, bottom: '5%', right: '5%' }}></div>

      <div className="card" style={{ 
         width: '100%', 
         maxWidth: '450px', 
         padding: '3rem', 
         background: 'rgba(255,255,255,0.02)', 
         backdropFilter: 'blur(40px)', 
         border: '1px solid rgba(255,255,255,0.05)',
         boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
         borderRadius: '24px',
         textAlign: 'center'
      }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ 
             width: '64px', 
             height: '64px', 
             background: 'var(--primary)', 
             borderRadius: '16px', 
             margin: '0 auto 1.5rem auto',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             fontSize: '2rem',
             color: 'black'
          }}>🏗️</div>
          <h1 style={{ fontWeight: '900', fontSize: '2.5rem', letterSpacing: '-1px', color: 'white', marginBottom: '0.5rem' }}>KenyaHardware<span style={{ color: 'var(--primary)' }}>PRO</span></h1>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Enterprise POS Terminal | V3.2.0</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>Operator Identity</label>
            <input 
              type="text" 
              placeholder="Username"
              style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>Terminal Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ 
               padding: '1.1rem', 
               justifyContent: 'center', 
               marginTop: '1.5rem', 
               fontSize: '1.1rem', 
               fontWeight: 'bold', 
               borderRadius: '12px',
               boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}
          >
            {loading ? "Authenticating Operator..." : "Authorize Terminal Login"}
          </button>
          <div style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.4 }}>
             Biometric login disabled for non-touch terminals.
          </div>
        </form>
      </div>
    </div>
  );
}
