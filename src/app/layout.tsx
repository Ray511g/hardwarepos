"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser && pathname !== "/login") {
      router.push("/login");
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsReady(true);
  }, [pathname, router]);

  const handleLogout = () => {
     localStorage.removeItem("user");
     router.push("/login");
  };

  if (!isReady) return <body style={{ background: '#020202' }}></body>;

  if (pathname === "/login") {
    return (
      <html lang="en">
        <body style={{ margin: 0 }}>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body style={{ margin: 0, display: 'flex', height: '100vh', background: 'var(--background)', color: 'white', overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: '280px', background: 'var(--sidebar)', borderRight: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'black' }}>🏗️</div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Hardware<span style={{ color: 'var(--primary)' }}>PRO</span></h1>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            {[
              { label: '📊 Dashboard', path: '/' },
              { label: '🖨️ POS Terminal', path: '/pos' },
              { label: '📦 Inventory & Audit', path: '/inventory' },
              { label: '🤝 Vendor Network', path: '/suppliers' },
              { label: '🏗️ Stock Inward / PO', path: '/procurement' },
              { label: '💳 Contractor Ledger', path: '/customers' },
              { label: '📉 Profit & Loss', path: '/finance' },
              { label: '👨‍💼 Staff Control', path: '/users' },
              { label: '⚖️ Tax & Reports', path: '/reports' },
              { label: '⚙️ Business Config', path: '/settings' }
            ].map((link) => (
              <Link key={link.path} href={link.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  padding: '0.875rem 1.25rem', 
                  borderRadius: '12px', 
                  background: pathname === link.path ? 'rgba(245,158,11,0.1)' : 'transparent',
                  color: pathname === link.path ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
                  fontWeight: pathname === link.path ? '700' : '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: pathname === link.path ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent'
                }}>
                  {link.label}
                </div>
              </Link>
            ))}
          </nav>

          <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="etims-status" style={{ background: 'rgba(34, 197, 94, 0.05)', color: 'var(--success)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                <div style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
                KRA eTIMS Signed Online 🇰🇪
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                   {user?.avatar || "👤"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                   <div style={{ fontWeight: '700', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || "Authenticating..."}</div>
                   <div style={{ opacity: 0.5, fontSize: '0.7rem' }}>{user?.role || "Staff Operator"}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}
                  title="Logout"
                >🚪</button>
             </div>
          </footer>
        </aside>

        {/* Main Workspace */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', position: 'relative' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
