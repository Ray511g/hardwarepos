import React, { useState, useMemo, useCallback } from 'react';
import { POSProduct } from '@/types/index';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

interface Props { products: POSProduct[]; onRefresh: () => void; }

const EMPTY_FORM = {
    name: '', sku: '', barcode: '', category: 'Food',
    price: '', cost: '', stock: '', reorderLevel: '5',
    unit: 'pcs', taxRate: '0', isActive: true,
};
const CATEGORIES = ['Food', 'Drinks', 'Snacks', 'Stationery', 'Uniform', 'Other'] as const;
const UNITS = ['pcs', 'kg', 'litres', 'boxes', 'packets', 'units'] as const;

type FormState = typeof EMPTY_FORM;

export default function POSInventory({ products, onRefresh }: Props) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<POSProduct | null>(null);
    const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    // ── Memoised derived lists ──────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)
        );
    }, [products, search]);

    const lowStock = useMemo(
        () => products.filter(p => p.stock <= p.reorderLevel && p.isActive),
        [products]
    );

    // ── Modal helpers ───────────────────────────────────────────────────────
    const openAdd = useCallback(() => {
        setEditing(null);
        setForm({ ...EMPTY_FORM });
        setShowModal(true);
    }, []);

    const openEdit = useCallback((p: POSProduct) => {
        setEditing(p);
        setForm({
            name: p.name, sku: p.sku ?? '', barcode: p.barcode ?? '',
            category: p.category, price: String(p.price), cost: String(p.cost ?? 0),
            stock: String(p.stock), reorderLevel: String(p.reorderLevel),
            unit: p.unit, taxRate: String(p.taxRate ?? 0), isActive: p.isActive,
        });
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => setShowModal(false), []);

    const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    }, []);

    // ── Save / Delete ───────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.name.trim() || !form.price) { alert('Name and price are required'); return; }
        setSaving(true);
        try {
            const token = localStorage.getItem('elirama_token');
            const numeric = {
                price: Number(form.price),
                cost: Number(form.cost),
                stock: Number(form.stock),
                reorderLevel: Number(form.reorderLevel),
                taxRate: Number(form.taxRate),
            };
            const body = editing
                ? { id: editing.id, ...form, ...numeric }
                : { ...form, ...numeric };

            const res = await fetch('/api/pos/products', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token} ` },
                body: JSON.stringify(body),
            });
            if (res.ok) { closeModal(); onRefresh(); }
            else { const e = await res.json(); alert(e.error ?? 'Save failed'); }
        } catch { alert('Network error'); }
        setSaving(false);
    };

    const handleDelete = useCallback(async (p: POSProduct) => {
        if (!confirm(`Deactivate "${p.name}" ? `)) return;
        const token = localStorage.getItem('elirama_token');
        const res = await fetch(`/ api / pos / products ? id = ${p.id} `, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token} ` },
        });
        if (res.ok) onRefresh();
        else alert('Failed to deactivate product');
    }, [onRefresh]);

    return (
        <div>
            {/* Low-stock banner */}
            {lowStock.length > 0 && (
                <div className="card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 16, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 700, marginBottom: 8 }}>
                        <WarningAmberIcon /> Low Stock Alert ({lowStock.length} item{lowStock.length !== 1 ? 's' : ''})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {lowStock.map(p => (
                            <span key={p.id} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                                {p.name}: {p.stock} {p.unit} left
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ position: 'relative', width: 280 }}>
                    <SearchIcon style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 18 }} />
                    <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AddIcon fontSize="small" /> Add Product
                </button>
            </div>

            {/* Products table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                            {['Product', 'Category', 'Price (KSh)', 'Cost (KSh)', 'Stock', 'Reorder', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                                    {p.name}
                                    {p.sku && <span style={{ color: '#64748b', fontSize: 11, marginLeft: 6 }}>#{p.sku}</span>}
                                </td>
                                <td style={{ padding: '12px 16px' }}><span className="badge">{p.category}</span></td>
                                <td style={{ padding: '12px 16px', color: 'var(--accent-green)', fontWeight: 700 }}>{p.price.toFixed(2)}</td>
                                <td style={{ padding: '12px 16px', color: '#64748b' }}>{(p.cost ?? 0).toFixed(2)}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{
                                        color: p.stock === 0 ? '#ef4444' : p.stock <= p.reorderLevel ? '#ef4444' : p.stock <= p.reorderLevel * 2 ? '#f59e0b' : 'inherit',
                                        fontWeight: p.stock <= p.reorderLevel ? 700 : 400,
                                    }}>
                                        {p.stock} {p.unit}
                                        {p.stock === 0 && ' ⚠'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.reorderLevel}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span className={`badge ${p.isActive ? 'green' : 'red'} `}>{p.isActive ? 'Active' : 'Inactive'}</span>
                                </td>
                                <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                                    <button className="action-btn" onClick={() => openEdit(p)} title="Edit"><EditIcon fontSize="small" /></button>
                                    <button className="action-btn delete" onClick={() => handleDelete(p)} title="Deactivate"><CloseIcon fontSize="small" /></button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>No products found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
                            <button className="modal-close" onClick={closeModal}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Product Name *</label>
                                    <input className="form-control" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Bread" autoFocus />
                                </div>
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select className="form-control" value={form.category} onChange={e => setField('category', e.target.value)}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Selling Price (KSh) *</label>
                                    <input type="number" className="form-control" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="0.00" min="0" step="0.01" />
                                </div>
                                <div className="form-group">
                                    <label>Cost Price (KSh)</label>
                                    <input type="number" className="form-control" value={form.cost} onChange={e => setField('cost', e.target.value)} placeholder="0.00" min="0" step="0.01" />
                                </div>
                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input type="number" className="form-control" value={form.stock} onChange={e => setField('stock', e.target.value)} placeholder="0" min="0" />
                                </div>
                                <div className="form-group">
                                    <label>Reorder Level</label>
                                    <input type="number" className="form-control" value={form.reorderLevel} onChange={e => setField('reorderLevel', e.target.value)} placeholder="5" min="0" />
                                </div>
                                <div className="form-group">
                                    <label>Unit</label>
                                    <select className="form-control" value={form.unit} onChange={e => setField('unit', e.target.value)}>
                                        {UNITS.map(u => <option key={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>SKU / Barcode</label>
                                    <input className="form-control" value={form.sku} onChange={e => setField('sku', e.target.value)} placeholder="Optional" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" checked={form.isActive} onChange={e => setField('isActive', e.target.checked)} style={{ marginRight: 8 }} />
                                    Product Active
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary green" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
