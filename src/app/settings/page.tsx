"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: "KENYA HARDWARE PRO",
    phone: "0700123456",
    email: "pos@kenyahardware.co.ke",
    address: "Main Street, Nairobi",
    pinNumber: "P051234567X",
    paybillNumber: "247247",
    tillNumber: "567890"
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // In real app, call /api/settings
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Business Settings</h1>
        <p style={{ opacity: 0.7 }}>Configure your hardware store profile and payment details.</p>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <h3 style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>General Information</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <label style={{ fontSize: '0.875rem', opacity: 0.8 }}>Business Name</label>
             <input 
               type="text" 
               style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
               value={settings.name}
               onChange={(e) => setSettings({...settings, name: e.target.value})}
             />
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <label style={{ fontSize: '0.875rem', opacity: 0.8 }}>KRA PIN Number</label>
             <input 
               type="text" 
               style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
               value={settings.pinNumber}
               onChange={(e) => setSettings({...settings, pinNumber: e.target.value})}
             />
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <label style={{ fontSize: '0.875rem', opacity: 0.8 }}>Business Address</label>
             <textarea 
               style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', minHeight: '80px' }}
               value={settings.address}
               onChange={(e) => setSettings({...settings, address: e.target.value})}
             />
           </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <h3 style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>Payment Configuration</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <label style={{ fontSize: '0.875rem', opacity: 0.8 }}>M-Pesa Paybill Number</label>
             <input 
               type="text" 
               style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
               value={settings.paybillNumber}
               onChange={(e) => setSettings({...settings, paybillNumber: e.target.value})}
             />
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <label style={{ fontSize: '0.875rem', opacity: 0.8 }}>M-Pesa Till Number</label>
             <input 
               type="text" 
               style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
               value={settings.tillNumber}
               onChange={(e) => setSettings({...settings, tillNumber: e.target.value})}
             />
           </div>

           <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.1)', fontSize: '0.875rem' }}>
             <p><strong>Note:</strong> These details will appear on all generated receipts and be used for Daraja API STK Push transactions.</p>
           </div>
        </div>

        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
           <button type="submit" className="btn btn-primary" disabled={isSaving}>
             {isSaving ? "Saving..." : "Save Configuration"}
           </button>
        </div>
      </form>
    </div>
  );
}
