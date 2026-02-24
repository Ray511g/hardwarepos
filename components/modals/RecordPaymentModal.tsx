import React, { useState } from 'react';
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
                    <h2 className="section-title">{payment ? 'Edit Fee Payment' : 'Record Fee Payment'}</h2>
                    <button className="modal-close" onClick={onClose} title="Close Modal" aria-label="Close modal"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {!payment && (
                            <div className="form-group">
                                <label htmlFor="studentSearch">Student *</label>
                                <div className="search-box-container" style={{ marginBottom: 12 }}>
                                    <input
                                        id="studentSearch"
                                        name="studentSearch"
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by student name..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        title="Search for candidate student"
                                    />
                                </div>
                                <select
                                    id="studentId"
                                    name="studentId"
                                    className="form-control"
                                    required
                                    value={form.studentId}
                                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                                    title="Select student from results"
                                >
                                    <option value="">Select a student ({filteredStudents.length} matches)</option>
                                    {filteredStudents.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.firstName} {s.lastName} ({s.grade}) - Bal: KSh {s.feeBalance.toLocaleString()}
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
                            <div className="card glass-panel" style={{ padding: 12, marginBottom: 16, border: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span className="text-muted text-xs uppercase">Total Fees:</span>
                                    <span className="text-sm">KSh {selectedStudent.totalFees.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span className="text-muted text-xs uppercase">Paid:</span>
                                    <span className="text-sm" style={{ color: '#10b981' }}>KSh {selectedStudent.paidFees.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="text-muted text-xs uppercase">Balance:</span>
                                    <span className="text-sm" style={{ color: '#ef4444', fontWeight: 600 }}>KSh {selectedStudent.feeBalance.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid-3">
                            <div className="form-group">
                                <label htmlFor="amount">Amount (KSh) *</label>
                                <input id="amount" name="amount" type="number" className="form-control" required min={1} value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} placeholder="Enter amount" title="Payment Amount" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="method">Method *</label>
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
                            <div className="form-group">
                                <label htmlFor="term">Term *</label>
                                <select
                                    id="term"
                                    name="term"
                                    className="form-control"
                                    value={form.term}
                                    onChange={e => setForm({ ...form, term: e.target.value })}
                                    title="Choose academic term"
                                >
                                    <option value="Term 1">Term 1</option>
                                    <option value="Term 2">Term 2</option>
                                    <option value="Term 3">Term 3</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid-3" style={{ marginTop: 12 }}>
                            <div className="form-group">
                                <label htmlFor="date">Date *</label>
                                <input id="date" name="date" type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required title="Payment Date" />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label htmlFor="reference">Reference / Transaction ID</label>
                                <input id="reference" name="reference" className="form-control" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="e.g. MPESA transaction code" title="Transaction reference" />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose} title="Cancel recording">Cancel</button>
                        <button type="submit" id="submitPayment" name="submitPayment" className="btn btn-primary green" title="Save this payment">{payment ? 'Update Payment' : 'Record Payment'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
