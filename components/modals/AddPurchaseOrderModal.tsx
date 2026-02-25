import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
    onClose: () => void;
    onAdd: (data: any) => void;
}

export default function AddPurchaseOrderModal({ onClose, onAdd }: Props) {
    const { suppliers, tryApi, showToast } = useSchool();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        supplierId: '',
        supplierName: '',
        department: '',
        items: [{ description: '', qty: 1, unitPrice: 0, total: 0 }]
    });

    const handleAddItem = () => {
        setForm({ ...form, items: [...form.items, { description: '', qty: 1, unitPrice: 0, total: 0 }] });
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...form.items];
        newItems.splice(index, 1);
        setForm({ ...form, items: newItems });
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...form.items];
        const item = { ...newItems[index], [field]: value };
        if (field === 'qty' || field === 'unitPrice') {
            item.total = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
        }
        newItems[index] = item;
        setForm({ ...form, items: newItems });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const totalAmount = form.items.reduce((sum, i) => sum + i.total, 0);
            const res = await tryApi('/api/commercial/po', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    totalAmount,
                    requestedBy: { id: user?.id, name: user?.name }
                })
            });
            if (res) {
                const data = await res.json();
                showToast('Purchase order generated successfully', 'success');
                onAdd(data);
                onClose();
            }
        } catch (error) {
            console.error('Submission error:', error);
            showToast('Failed to generate purchase order', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalCalculated = form.items.reduce((sum, i) => sum + i.total, 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="section-title">New Purchase Order</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Supplier *</label>
                                <select
                                    className="form-control"
                                    required
                                    value={form.supplierId}
                                    onChange={e => {
                                        const s = suppliers.find(sup => sup.id === e.target.value);
                                        setForm({ ...form, supplierId: e.target.value, supplierName: s?.name || '' });
                                    }}
                                >
                                    <option value="">Select Supplier...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department *</label>
                                <select
                                    className="form-control"
                                    required
                                    value={form.department}
                                    onChange={e => setForm({ ...form, department: e.target.value })}
                                >
                                    <option value="">Select Department...</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Kitchen">Kitchen</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h3 className="text-sm uppercase font-bold text-muted">Line Items</h3>
                                <button type="button" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={handleAddItem}>
                                    <AddIcon style={{ fontSize: 14 }} /> Add Item
                                </button>
                            </div>

                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40%' }}>Description</th>
                                        <th style={{ width: '15%' }}>Qty</th>
                                        <th style={{ width: '20%' }}>Unit Price</th>
                                        <th style={{ width: '20%', textAlign: 'right' }}>Total</th>
                                        <th style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    className="form-control"
                                                    value={item.description}
                                                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                                                    placeholder="Description..."
                                                    required
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={item.qty}
                                                    onChange={e => handleItemChange(index, 'qty', Number(e.target.value))}
                                                    required
                                                    min={1}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={item.unitPrice || ''}
                                                    onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                    required
                                                />
                                            </td>
                                            <td className="text-right" style={{ fontWeight: 600 }}>
                                                {item.total.toLocaleString()}
                                            </td>
                                            <td>
                                                {form.items.length > 1 && (
                                                    <button type="button" className="action-btn delete" onClick={() => handleRemoveItem(index)}>
                                                        <DeleteIcon style={{ fontSize: 18 }} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="card glass-panel" style={{ marginTop: 20, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="text-muted font-bold">PO TOTAL AMOUNT:</span>
                            <span className="text-xl font-bold" style={{ color: '#3b82f6' }}>
                                KSh {totalCalculated.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Generate Purchase Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
