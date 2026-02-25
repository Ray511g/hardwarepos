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

export default function AddCreditAgreementModal({ onClose, onAdd }: Props) {
    const { students, tryApi, showToast } = useSchool();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        studentId: '',
        studentName: '',
        guardianName: '',
        totalAmount: 0,
        installments: [{ dueDate: '', amount: 0 }]
    });

    const handleAddInstallment = () => {
        setForm({ ...form, installments: [...form.installments, { dueDate: '', amount: 0 }] });
    };

    const handleRemoveInstallment = (index: number) => {
        const newInst = [...form.installments];
        newInst.splice(index, 1);
        setForm({ ...form, installments: newInst });
    };

    const handleInstallmentChange = (index: number, field: string, value: any) => {
        const newInst = [...form.installments];
        newInst[index] = { ...newInst[index], [field]: value };
        setForm({ ...form, installments: newInst });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const totalAmount = form.installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
            const res = await tryApi('/api/commercial/credit', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    totalAmount,
                    requestedBy: { id: user?.id, name: user?.name }
                })
            });
            if (res) {
                const data = await res.json();
                showToast('Credit agreement created successfully', 'success');
                onAdd(data);
                onClose();
            }
        } catch (error) {
            console.error('Submission error:', error);
            showToast('Failed to create credit agreement', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalCalculated = form.installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="section-title">New Credit Agreement</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Student *</label>
                                <select
                                    className="form-control"
                                    required
                                    value={form.studentId}
                                    onChange={e => {
                                        const s = students.find(st => st.id === e.target.value);
                                        setForm({ ...form, studentId: e.target.value, studentName: s ? `${s.firstName} ${s.lastName}` : '', guardianName: s?.parentName || '' });
                                    }}
                                >
                                    <option value="">Select Student...</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Guardian Name</label>
                                <input
                                    className="form-control"
                                    value={form.guardianName}
                                    onChange={e => setForm({ ...form, guardianName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h3 className="text-sm uppercase font-bold text-muted">Payment Schedule</h3>
                                <button type="button" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={handleAddInstallment}>
                                    <AddIcon style={{ fontSize: 14 }} /> Add Installment
                                </button>
                            </div>

                            {form.installments.map((inst, index) => (
                                <div key={index} className="grid-3" style={{ gap: 12, marginBottom: 12, alignItems: 'center' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="text-xs">Due Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={inst.dueDate}
                                            onChange={e => handleInstallmentChange(index, 'dueDate', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="text-xs">Amount (KSh)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={inst.amount || ''}
                                            onChange={e => handleInstallmentChange(index, 'amount', Number(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div style={{ paddingTop: 18 }}>
                                        {form.installments.length > 1 && (
                                            <button type="button" className="action-btn delete" onClick={() => handleRemoveInstallment(index)}>
                                                <DeleteIcon style={{ fontSize: 18 }} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card glass-panel" style={{ marginTop: 20, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="text-muted font-bold">TOTAL COMMITTED:</span>
                            <span className="text-lg font-bold" style={{ color: totalCalculated !== form.totalAmount ? '#f59e0b' : '#10b981' }}>
                                KSh {totalCalculated.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Create Agreement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
