"use client";

export default function ReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Financial Reports & Tax</h1>
        <p style={{ opacity: 0.7 }}>Generate VAT reports and daily sales summaries for eTIMS compliance.</p>
      </header>

      <div className="grid grid-cols-3">
         <div className="card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Daily Sales Summary</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1.5rem' }}>Total sales for today reconciled with cash, M-Pesa and credit.</p>
            <button className="btn btn-secondary" style={{ width: '100%' }}>Download PDF</button>
         </div>
         <div className="card">
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>VAT Report (KRA)</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1.5rem' }}>Output VAT (16%) for the selected period. Ready for iTax filing.</p>
            <button className="btn btn-secondary" style={{ width: '100%' }}>Export CSV</button>
         </div>
         <div className="card">
            <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Stock Valuation</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1.5rem' }}>Current value of all items in stock based on purchase cost.</p>
            <button className="btn btn-secondary" style={{ width: '100%' }}>View Details</button>
         </div>
      </div>

      <div className="card">
         <h3 style={{ marginBottom: '1.5rem' }}>Monthly Performance (Mock Data)</h3>
         <div style={{ height: '300px', width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '3rem', opacity: 0.2 }}>📊</div>
               <p style={{ opacity: 0.5 }}>Recharts Chart would be rendered here integrating with actual sales data.</p>
            </div>
         </div>
      </div>

      <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
         <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>eTIMS Auto-Sync Status</h3>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.875rem' }}>
               Last successful sync: <strong>Today, 10:45 AM</strong><br/>
               Pending Invoices: <strong>0</strong><br/>
               Sync Errors: <strong style={{ color: 'var(--success)' }}>None</strong>
            </div>
            <button className="btn btn-primary">Force Sync with KRA</button>
         </div>
      </div>
    </div>
  );
}
