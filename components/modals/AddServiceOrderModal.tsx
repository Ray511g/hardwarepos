import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useSchool } from '../../context/SchoolContext';

interface Props {
    onClose: () => void;
    onAdd: (order: any) => void;
}

export default function AddServiceOrderModal({ onClose, onAdd }: Props) {
    const { students, tryApi } = useSchool();
    const [form, setForm] = useState({
        studentId: '',
        serviceType: 'TRANSPORT',
        amount: 0,
        recurring: true,
        frequency: 'MONTHLY',
        nextBillingDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await tryApi('/api/commercial/services', {
                method: 'POST',
                body: JSON.stringify(form)
            });
            if (res) {
                const data = await res.json();
                onAdd(data);
                onClose();
            }
        } catch (error) {
            console.error('Submission error:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container animate-in" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="stat-icon" style={{ padding: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <LocalShippingIcon />
                        </div>
                        <div>
                            <h2 className="modal-title">New Service Enrollment</h2>
                            <p className="text-muted text-xs">Provision transport, boarding, or meal plans</p>
                        </div>
                    </div>
                    <button className="action-btn" onClick={onClose} aria-label="Close modal" title="Close"><CloseIcon /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="studentId" className="form-label">Student *</label>
                            <select
                                id="studentId"
                                className="form-control"
                                required
                                value={form.studentId}
                                title="Select Student"
                                onChange={e => setForm({ ...form, studentId: e.target.value })}
                            >
                                <option value="">Select a student</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label htmlFor="serviceType" className="form-label">Service Type *</label>
                                <select
                                    id="serviceType"
                                    className="form-control"
                                    required
                                    value={form.serviceType}
                                    title="Service Type"
                                    onChange={e => setForm({ ...form, serviceType: e.target.value })}
                                >
                                    <option value="TRANSPORT">Transport Service</option>
                                    <option value="HOSTEL">Boarding / Hostel</option>
                                    <option value="MEAL_PLAN">Meal Plan / Canteen</option>
                                    <option value="UNIFORM">Uniform Bundle</option>
                                    <option value="SPECIAL_PROGRAM">Special Program / Club</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount" className="form-label">Billing Amount (KES) *</label>
                                <input
                                    id="amount"
                                    type="number"
                                    className="form-control"
                                    required
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: Number(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                            <input
                                id="recurring"
                                type="checkbox"
                                checked={form.recurring}
                                onChange={e => setForm({ ...form, recurring: e.target.checked })}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                            />
                            <label htmlFor="recurring" style={{ cursor: 'pointer', fontSize: 14 }}>Enable Recurring Billing</label>
                        </div>

                        {form.recurring && (
                            <div className="form-group">
                                <label htmlFor="frequency" className="form-label">Billing cycle</label>
                                <select
                                    id="frequency"
                                    className="form-control"
                                    value={form.frequency}
                                    title="Frequency"
                                    onChange={e => setForm({ ...form, frequency: e.target.value })}
                                >
                                    <option value="MONTHLY">Monthly Billing</option>
                                    <option value="TERMLY">Once Every Term</option>
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="nextBillingDate" className="form-label">First Billing Date</label>
                            <input
                                id="nextBillingDate"
                                type="date"
                                className="form-control"
                                value={form.nextBillingDate}
                                onChange={e => setForm({ ...form, nextBillingDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Enroll Student</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
