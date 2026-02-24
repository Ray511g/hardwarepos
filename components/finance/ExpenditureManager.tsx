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
        <div className="finance-content animate-in">
            <div className="finance-nav-row">
                <div className="search-box-container">
                    <SearchIcon className="search-box-icon" />
                    <input
                        type="text"
                        className="form-control search-input-pl"
                        placeholder="Search expenditures..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        title="Search within expenses"
                        aria-label="Search"
                    />
                </div>
                <div className="finance-toolbar-right">
                    {!showForm && (
                        <button className="btn btn-primary" onClick={() => setShowForm(true)} title="Create a new fund request" aria-label="Raise Request">
                            <AddIcon className="mr-2" style={{ fontSize: 18 }} /> Raise Request
                        </button>
                    )}
                </div>
            </div>

            {showForm && (
                <div className="modal-container animate-in" style={{ marginBottom: 32, maxWidth: '100%' }}>
                    <div className="modal-header">
                        <h3 className="modal-title">New Expense Request</h3>
                        <button className="action-btn" onClick={() => setShowForm(false)} title="Cancel"><CancelIcon /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="modal-body">
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                            <div className="form-group">
                                <label htmlFor="expCat" className="form-label">Category / Purpose</label>
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
                                <label htmlFor="expAmt" className="form-label">Amount (KES)</label>
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
                                <label htmlFor="expSupplier" className="form-label">Supplier (Optional)</label>
                                <select
                                    id="expSupplier"
                                    className="form-control"
                                    value={form.supplierId}
                                    onChange={e => setForm({ ...form, supplierId: e.target.value })}
                                    title="Reference a supplier"
                                >
                                    <option value="">N/A</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: 20 }}>
                            <label htmlFor="expDesc" className="form-label">Detailed Description</label>
                            <textarea
                                id="expDesc"
                                className="form-control"
                                rows={2}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                title="Describe the need for this expense"
                                required
                            />
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 0 0 0', marginTop: 20 }}>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Discard</button>
                            <button type="submit" className="btn btn-primary">Submit for Approval</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Requested By</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th className="text-right">Amount</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.length === 0 ? (
                            <tr><td colSpan={6} className="p-40 text-center text-muted">No expenditure requests found</td></tr>
                        ) : filteredExpenses.map(e => (
                            <tr key={e.id}>
                                <td>
                                    <div className="data-table-name">{e.requestedByName}</div>
                                    <div className="text-xs text-muted">{new Date(e.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td>{e.description}</td>
                                <td><span className="badge blue">{e.category}</span></td>
                                <td className="text-right" style={{ fontWeight: 600 }}>KSh {e.amount.toLocaleString()}</td>
                                <td>
                                    <span className={`badge ${e.status === 'PAID' ? 'green' :
                                            e.status === 'APPROVED' ? 'blue' :
                                                e.status === 'PENDING' ? 'orange' : 'red'
                                        }`}>
                                        {e.status}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                        {e.status === 'PENDING' && canApprove && (
                                            <button className="action-btn" style={{ color: '#10b981' }} onClick={() => actOnExpenditure(e.id, 'APPROVE')} title="Approve Request">
                                                <CheckCircleIcon style={{ fontSize: 20 }} />
                                            </button>
                                        )}
                                        {e.status === 'APPROVED' && canPay && (
                                            <button className="action-btn" style={{ color: '#3b82f6' }} onClick={() => actOnExpenditure(e.id, 'PAY')} title="Mark as Paid">
                                                <PaymentsIcon style={{ fontSize: 20 }} />
                                            </button>
                                        )}
                                        {e.status === 'PENDING' && canApprove && (
                                            <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => actOnExpenditure(e.id, 'REJECT')} title="Decline Request">
                                                <CancelIcon style={{ fontSize: 20 }} />
                                            </button>
                                        )}
                                        <button className="action-btn" title="View Document">
                                            <FilePresentIcon style={{ fontSize: 20 }} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenditureManager;
