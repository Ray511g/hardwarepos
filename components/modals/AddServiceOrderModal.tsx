import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useSchool } from '../../context/SchoolContext';

interface Props {
    onClose: () => void;
    onAdd: (order: any) => void;
}

export default function AddServiceOrderModal({ onClose, onAdd }: Props) {
    const { students } = useSchool();
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
        const res = await fetch('/api/commercial/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        if (res.ok) {
            const data = await res.json();
            onAdd(data);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Service Order</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="studentId">Student *</label>
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

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="serviceType">Service Type *</label>
                                <select
                                    id="serviceType"
                                    className="form-control"
                                    required
                                    value={form.serviceType}
                                    title="Service Type"
                                    onChange={e => setForm({ ...form, serviceType: e.target.value })}
                                >
                                    <option value="TRANSPORT">Transport</option>
                                    <option value="HOSTEL">Hostel / Boarding</option>
                                    <option value="MEAL_PLAN">Meal Plan</option>
                                    <option value="UNIFORM">Uniform Bundle</option>
                                    <option value="SPECIAL_PROGRAM">Special Program / Club</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount">Amount (KSh) *</label>
                                <input
                                    id="amount"
                                    type="number"
                                    className="form-control"
                                    required
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="form-row" style={{ alignItems: 'center', gap: 20 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={form.recurring}
                                    onChange={e => setForm({ ...form, recurring: e.target.checked })}
                                />
                                Recurring Service
                            </label>
                            {form.recurring && (
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="frequency">Frequency</label>
                                    <select
                                        id="frequency"
                                        className="form-control"
                                        value={form.frequency}
                                        title="Frequency"
                                        onChange={e => setForm({ ...form, frequency: e.target.value })}
                                    >
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="TERMLY">Termly</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="nextBillingDate">Next Billing Date</label>
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
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Create Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
