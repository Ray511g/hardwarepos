import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
    onClose: () => void;
    onAdd: (note: any) => void;
}

export default function AddPromissoryNoteModal({ onClose, onAdd }: Props) {
    const { students } = useSchool();
    const { user } = useAuth();
    const [form, setForm] = useState({
        studentId: '',
        guardianName: '',
        amount: 0,
        issueDate: new Date().toISOString().split('T')[0],
        maturityDate: '',
    });

    const selectedStudent = students.find(s => s.id === form.studentId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/commercial/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, requestedBy: { id: user?.id, name: user?.name } })
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
                    <h2>Record Promissory Note</h2>
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
                                onChange={e => {
                                    const student = students.find(s => s.id === e.target.value);
                                    setForm({ ...form, studentId: e.target.value, guardianName: student?.parentName || '' });
                                }}
                            >
                                <option value="">Select a student</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="guardianName">Guardian Name *</label>
                            <input
                                id="guardianName"
                                className="form-control"
                                required
                                value={form.guardianName}
                                onChange={e => setForm({ ...form, guardianName: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
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

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="issueDate">Issue Date *</label>
                                <input
                                    id="issueDate"
                                    type="date"
                                    className="form-control"
                                    required
                                    value={form.issueDate}
                                    onChange={e => setForm({ ...form, issueDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="maturityDate">Maturity Date *</label>
                                <input
                                    id="maturityDate"
                                    type="date"
                                    className="form-control"
                                    required
                                    value={form.maturityDate}
                                    onChange={e => setForm({ ...form, maturityDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Record Note</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
