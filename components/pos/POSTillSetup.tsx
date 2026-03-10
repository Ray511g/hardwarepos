import React, { useState } from 'react';
import { POSTill } from '@/types/index';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

interface Props { tills: POSTill[]; onRefresh: () => void; }
const EMPTY = { tillNumber: '', paybillNumber: '', accountNumber: '', description: '' };

export default function POSTillSetup({ tills, onRefresh }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<POSTill | null>(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [saving, setSaving] = useState(false);

    const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); };
    const openEdit = (t: POSTill) => {
        setEditing(t);
        setForm({ tillNumber: t.tillNumber, paybillNumber: t.paybillNumber || '', accountNumber: t.accountNumber || '', description: t.description || '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.tillNumber) { alert('Till number is required'); return; }
        setSaving(true);
        try {
            const token = localStorage.getItem('elirama_token');
            const body = editing ? { id: editing.id, ...form } : form;
            const res = await fetch('/api/pos/tills', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            if (res.ok) { setShowModal(false); onRefresh(); }
            else { const e = await res.json(); alert(e.error || 'Save failed'); }
        } catch { alert('Network error'); }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this till?')) return;
        const token = localStorage.getItem('elirama_token');
        await fetch(`/api/pos/tills?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        onRefresh();
    };

    const toggleActive = async (t: POSTill) => {
        const token = localStorage.getItem('elirama_token');
        await fetch('/api/pos/tills', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ id: t.id, isActive: !t.isActive }),
        });
        onRefresh();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h3 style={{ margin: 0 }}>Business Till Setup</h3>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Configure M-Pesa tills and payment channels for POS checkout</p>
                </div>
                <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AddIcon fontSize="small" /> Add Till
                </button>
            </div>

            {tills.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
                    <p>No tills configured. Add a till to enable M-Pesa and Till payments.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {tills.map(till => (
                        <div key={till.id} className="card" style={{ padding: 20, borderLeft: `3px solid ${till.isActive ? 'var(--accent-green)' : '#64748b'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 18 }}>Till {till.tillNumber}</div>
                                    {till.description && <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{till.description}</div>}
                                </div>
                                <span className={`badge ${till.isActive ? 'green' : ''}`}>{till.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            {till.paybillNumber && (
                                <div style={{ marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Paybill: </span>
                                    <span style={{ fontWeight: 700 }}>{till.paybillNumber}</span>
                                </div>
                            )}
                            {till.accountNumber && (
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Account No: </span>
                                    <span style={{ fontWeight: 700 }}>{till.accountNumber}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button className="action-btn" onClick={() => openEdit(till)} title="Edit"><EditIcon fontSize="small" /></button>
                                <button className="action-btn" onClick={() => toggleActive(till)} title={till.isActive ? 'Deactivate' : 'Activate'} style={{ fontSize: 11 }}>
                                    {till.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(till.id)} title="Delete"><DeleteIcon fontSize="small" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editing ? 'Edit Till' : 'Add Business Till'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Till Number *</label>
                                <input className="form-control" value={form.tillNumber} onChange={e => setForm({ ...form, tillNumber: e.target.value })} placeholder="e.g. 5551234" />
                            </div>
                            <div className="form-group">
                                <label>Paybill Number</label>
                                <input className="form-control" value={form.paybillNumber} onChange={e => setForm({ ...form, paybillNumber: e.target.value })} placeholder="e.g. 400200" />
                            </div>
                            <div className="form-group">
                                <label>Account Number</label>
                                <input className="form-control" value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} placeholder="e.g. 0712345678 or till no." />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Canteen Till 1" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary green" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : editing ? 'Update Till' : 'Add Till'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
