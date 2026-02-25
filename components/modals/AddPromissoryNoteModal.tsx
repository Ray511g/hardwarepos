import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
    onClose: () => void;
    onAdd: (note: any) => void;
}

export default function AddPromissoryNoteModal({ onClose, onAdd }: Props) {
    const { students, tryApi, showToast } = useSchool();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        studentId: '',
        guardianName: '',
        amount: 0,
        issueDate: new Date().toISOString().split('T')[0],
        maturityDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await tryApi('/api/commercial/notes', {
                method: 'POST',
                body: JSON.stringify({ ...form, requestedBy: { id: user?.id, name: user?.name } })
            });
            if (res) {
                const data = await res.json();
                showToast('Promissory note recorded successfully', 'success');
                onAdd(data);
                onClose();
            }
        } catch (error) {
            console.error('Submission error:', error);
            showToast('Failed to record promissory note', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container animate-in" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="stat-icon" style={{ padding: 8, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <ListAltIcon />
                        </div>
                        <div>
                            <h2 className="modal-title">Record Commitment</h2>
                            <p className="text-muted text-xs">Execute a legal promissory note</p>
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
                            <label htmlFor="guardianName" className="form-label">Guarantor / Guardian Name *</label>
                            <input
                                id="guardianName"
                                type="text"
                                className="form-control"
                                required
                                value={form.guardianName}
                                onChange={e => setForm({ ...form, guardianName: e.target.value })}
                                placeholder="FullName of legal guardian"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="amount" className="form-label">Principal Amount (KSh) *</label>
                            <input
                                id="amount"
                                type="number"
                                className="form-control"
                                required
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: Number(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label htmlFor="issueDate" className="form-label">Issue Date *</label>
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
                                <label htmlFor="maturityDate" className="form-label">Maturity Date *</label>
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
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Record Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
