import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FeePayment } from '../../types';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    onClose: () => void;
    payment?: FeePayment;
}

export default function RecordPaymentModal({ onClose, payment }: Props) {
    const { students, addPayment, updatePayment, settings } = useSchool();
    const [form, setForm] = useState({
        studentId: payment?.studentId || '',
        amount: payment?.amount || 0,
        method: payment?.method || 'Cash' as 'Cash' | 'M-Pesa' | 'Bank Transfer' | 'Cheque',
        reference: payment?.reference || '',
        date: payment?.date || new Date().toISOString().split('T')[0],
        term: payment?.term || settings.currentTerm,
    });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedStudent = students.find(s => s.id === form.studentId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        if (payment) {
            updatePayment(payment.id, {
                ...form,
                amount: Number(form.amount)
            });
        } else {
            addPayment({
                ...form,
                studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
                grade: selectedStudent.grade,
                amount: Number(form.amount)
            });
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{payment ? 'Edit Fee Payment' : 'Record Fee Payment'}</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {!payment && (
                            <div className="form-group">
                                <label htmlFor="studentSearch">Student *</label>
                                <input
                                    id="studentSearch"
                                    name="studentSearch"
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ marginBottom: 8 }}
                                />
                                <select
                                    id="studentId"
                                    name="studentId"
                                    className="form-control"
                                    required
                                    value={form.studentId}
                                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                                    title="Select student"
                                >
                                    <option value="">Select a student ({filteredStudents.length} matches)</option>
                                    {filteredStudents.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.firstName} {s.lastName} ({s.grade}) - Balance: KSh {s.feeBalance.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {payment && (
                            <div className="form-group">
                                <label htmlFor="studentDisplay">Student</label>
                                <input id="studentDisplay" name="studentDisplay" className="form-control" value={payment.studentName} disabled title="Selected student" />
                            </div>
                        )}

                        {selectedStudent && (
                            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Total Fees:</span>
                                    <span>KSh {selectedStudent.totalFees.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Paid:</span>
                                    <span style={{ color: 'var(--accent-green)' }}>KSh {selectedStudent.paidFees.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Balance:</span>
                                    <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>KSh {selectedStudent.feeBalance.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="amount">Amount (KSh) *</label>
                                <input id="amount" name="amount" type="number" className="form-control" required min={1} value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} placeholder="Enter amount" title="Payment Amount" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="method">Payment Method *</label>
                                <select
                                    id="method"
                                    name="method"
                                    className="form-control"
                                    value={form.method}
                                    onChange={e => setForm({ ...form, method: e.target.value as any })}
                                    title="Payment method"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="M-Pesa">M-Pesa</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="term">Term *</label>
                                <select
                                    id="term"
                                    name="term"
                                    className="form-control"
                                    value={form.term}
                                    onChange={e => setForm({ ...form, term: e.target.value })}
                                    title="Term"
                                >
                                    <option value="Term 1">Term 1</option>
                                    <option value="Term 2">Term 2</option>
                                    <option value="Term 3">Term 3</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="date">Date *</label>
                                <input id="date" name="date" type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required title="Payment Date" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="reference">Reference / Transaction ID</label>
                            <input id="reference" name="reference" className="form-control" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="e.g. MPESA transaction code" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" id="submitPayment" name="submitPayment" className="btn-primary green">{payment ? 'Update Payment' : 'Record Payment'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
