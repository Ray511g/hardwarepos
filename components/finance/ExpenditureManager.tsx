import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentsIcon from '@mui/icons-material/Payments';
import FilePresentIcon from '@mui/icons-material/FilePresent';

const ExpenditureManager: React.FC = () => {
    const { user, hasPermission } = useAuth();
    const { expenses, suppliers, requestExpenditure, actOnExpenditure } = useSchool();

    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        category: '',
        amount: 0,
        description: '',
        supplierId: '',
        paymentMethod: 'Bank' as 'Bank' | 'Cash' | 'M-Pesa'
    });

    const filteredExpenses = (expenses || []).filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const requestedByName = user?.name || 'Unknown';
        await requestExpenditure({
            ...form,
            requestedBy: user?.id || 'unknown',
            requestedByName: requestedByName
        });
        setForm({ category: '', amount: 0, description: '', supplierId: '', paymentMethod: 'Bank' });
        setShowForm(false);
    };

    const canApprove = hasPermission('finance', 'APPROVE');
    const canPay = hasPermission('finance', 'PAY');

    return (
        <div className="expenditure-manager animate-in">
            <div className="finance-toolbar">
                <div>
                    <h2 className="section-title">Expenditure Controls</h2>
                    <p className="text-muted text-xs">Request and approve school expenses</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)} title="Create a new fund request" aria-label="Raise Request">
                        <AddIcon className="mr-2" style={{ fontSize: 18 }} />
                        Raise Request
                    </button>
                )}
            </div>

            {showForm && (
                <div className="admin-section animate-in" style={{ marginBottom: 24, border: '1px solid #3b82f6' }}>
                    <h3 className="section-title" style={{ marginBottom: 20 }}>New Expense Request</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-3">
                            <div className="form-group">
                                <label htmlFor="expCat">Category / Purpose</label>
                                <select
                                    id="expCat"
                                    className="form-control"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    title="Categorize the expense"
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Operational">Operational</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Supplies">Supplies</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expAmt">Amount (KES)</label>
                                <input
                                    id="expAmt"
                                    type="number"
                                    className="form-control"
                                    value={form.amount || ''}
                                    onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                                    title="Enter requested amount"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="expSupplier">Supplier (Optional)</label>
                                <select
                                    id="expSupplier"
                                    className="form-control"
                                    value={form.supplierId}
                                    onChange={e => setForm({ ...form, supplierId: e.target.value })}
                                    title="Associate with a registered supplier"
                                >
                                    <option value="">N/A / Walk-in</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label htmlFor="expDesc">Detailed Description</label>
                            <textarea
                                id="expDesc"
                                className="form-control"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="What the funds will be used for..."
                                title="Explain the need for funds"
                                required
                                rows={3}
                            ></textarea>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} title="Cancel request">Cancel</button>
                            <button type="submit" className="btn btn-primary" title="Submit request for internal approval">Submit Request</button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <>
                    <div className="finance-nav-row">
                        <div className="search-box-container">
                            <SearchIcon className="search-box-icon" />
                            <input
                                type="text"
                                className="form-control search-input-pl"
                                placeholder="Search by description or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                title="Search through fund requests"
                                aria-label="Search Expenses"
                            />
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Requestor</th>
                                    <th className="text-right">Amount</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length > 0 ? filteredExpenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="data-table-name">{exp.category}</div>
                                            <div className="text-muted text-xs">{exp.description}</div>
                                            {exp.supplierId && (
                                                <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 4 }}>
                                                    Supplier: {suppliers.find(s => s.id === exp.supplierId)?.name || 'Unknown'}
                                                </div>
                                            )}
                                        </td>
                                        <td>{exp.requestedBy}</td>
                                        <td className="text-right" style={{ fontWeight: 700 }}>KES {exp.amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${exp.status === 'Paid' ? 'green' : exp.status === 'Approved' ? 'blue' : exp.status === 'Pending' ? 'orange' : 'red'}`}>
                                                {exp.status}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                                {exp.status === 'Pending' && canApprove && (
                                                    <>
                                                        <button className="action-btn" onClick={() => actOnExpenditure(exp.id, 'APPROVE')} title="Approve this fund request" aria-label="Approve">
                                                            <CheckCircleIcon style={{ fontSize: 18, color: '#10b981' }} />
                                                        </button>
                                                        <button className="action-btn" onClick={() => actOnExpenditure(exp.id, 'REJECT')} title="Reject this fund request" aria-label="Reject">
                                                            <CancelIcon style={{ fontSize: 18, color: '#ef4444' }} />
                                                        </button>
                                                    </>
                                                )}
                                                {exp.status === 'Approved' && canPay && (
                                                    <button className="action-btn" onClick={() => actOnExpenditure(exp.id, 'PAY')} title="Process disbursement" aria-label="Pay">
                                                        <PaymentsIcon style={{ fontSize: 18, color: '#3b82f6' }} />
                                                    </button>
                                                )}
                                                {exp.status === 'Paid' && <FilePresentIcon style={{ fontSize: 18, opacity: 0.3 }} />}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-muted">No expense requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExpenditureManager;
