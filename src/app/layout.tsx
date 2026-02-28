import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kenya Hardware Pro - Best POS in Kenya",
  description: "Next-generation Point of Sale for Kenyan Hardware Stores with eTIMS and M-Pesa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="main-container">
          <aside className="sidebar">
            <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', color: 'var(--primary)' }}>
              HardwarePRO
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s' }}>Dashboard</div>
              </Link>
              <Link href="/pos" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>POS (Sales Terminal)</div>
              </Link>
              <Link href="/inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Inventory</div>
              </Link>
              <Link href="/customers" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Customer Ledgers</div>
              </Link>
              <Link href="/suppliers" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Suppliers</div>
              </Link>
              <Link href="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Finance Reports</div>
              </Link>
              <div style={{ borderTop: '1px solid var(--card-border)', margin: '0.5rem 0' }}></div>
              <Link href="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Staff Management</div>
              </Link>
              <Link href="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Business Settings</div>
              </Link>
            </nav>

            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', opacity: 0.6 }}>
                Logout
              </button>
            </Link>

            <div className="etims-status" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
              KRA eTIMS Online
            </div>

            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
               <div style={{ width: '40px', height: '40px', background: 'var(--secondary)', borderRadius: '50%' }}></div>
               <div>
                  <div style={{ fontWeight: '500' }}>Main Store</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Admin Access</div>
               </div>
            </div>
          </aside>

          <main className="content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
