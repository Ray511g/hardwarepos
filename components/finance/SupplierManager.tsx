import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';

const SupplierManager: React.FC = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSchool();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        kraPin: '',
        contactPerson: '',
        phone: '',
        email: '',
        bankName: '',
        accountNumber: '',
        paymentTerms: 'Net 30',
        status: 'Active' as const
    });

    const filteredSuppliers = (suppliers || []).filter(s =>
        (s?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s?.kraPin || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await updateSupplier(editingId, form);
        } else {
            await addSupplier(form);
        }
        setShowForm(false);
        setEditingId(null);
        setForm({
            name: '', kraPin: '', contactPerson: '', phone: '', email: '',
            bankName: '', accountNumber: '', paymentTerms: 'Net 30', status: 'Active'
        });
    };

    const handleEdit = (s: any) => {
        setForm({
            name: s.name, kraPin: s.kraPin, contactPerson: s.contactPerson,
            phone: s.phone, email: s.email, bankName: s.bankName,
            accountNumber: s.accountNumber, paymentTerms: s.paymentTerms, status: s.status
        });
        setEditingId(s.id);
        setShowForm(true);
    };

    return (
        <div className="supplier-manager animate-in">
            <div className="finance-toolbar">
                <div>
                    <h2 className="section-title">Supplier Registry</h2>
                    <p className="text-muted text-xs">Manage material providers and service vendors</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)} title="Register a new vendor" aria-label="Add Supplier">
                        <AddIcon className="mr-2" style={{ fontSize: 18 }} />
                        Add Supplier
                    </button>
                )}
            </div>

            {showForm && (
                <div className="admin-section animate-in" style={{ marginBottom: 24, border: '1px solid #3b82f6' }}>
                    <h3 className="section-title" style={{ marginBottom: 20 }}>
                        {editingId ? 'Edit Supplier' : 'Register New Supplier'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-2">
                            <div className="form-group">
                                <label htmlFor="compName">Company Name</label>
                                <input id="compName" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required title="Official company name" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="kraPin">KRA PIN</label>
                                <input id="kraPin" className="form-control" value={form.kraPin} onChange={e => setForm({ ...form, kraPin: e.target.value })} required title="Tax registration number" />
                            </div>
                        </div>
                        <div className="grid-3" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label htmlFor="contactP">Contact Person</label>
                                <input id="contactP" className="form-control" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} title="Primary contact person" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="supPhone">Phone</label>
                                <input id="supPhone" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required title="Contact phone number" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="supEmail">Email</label>
                                <input id="supEmail" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} title="Contact email address" />
                            </div>
                        </div>
                        <div className="grid-2" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label htmlFor="supBank">Bank Name</label>
                                <input id="supBank" className="form-control" value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} title="Bank for payments" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="supAcc">Account Number</label>
                                <input id="supAcc" className="form-control" value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} title="Bank account number" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditingId(null); }} title="Discard changes">Cancel</button>
                            <button type="submit" className="btn btn-primary" title="Save supplier record">
                                <SaveIcon className="mr-2" style={{ fontSize: 18 }} />
                                {editingId ? 'Update Supplier' : 'Save Supplier'}
                            </button>
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
                                placeholder="Search by name or PIN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                title="Search through registered suppliers"
                                aria-label="Search Suppliers"
                            />
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Supplier Name</th>
                                    <th>KRA PIN</th>
                                    <th>Contact</th>
                                    <th>Payment Terms</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.length > 0 ? filteredSuppliers.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <div className="data-table-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <BusinessIcon style={{ fontSize: 16, color: '#3b82f6' }} />
                                                {s.name}
                                            </div>
                                        </td>
                                        <td><code>{s.kraPin}</code></td>
                                        <td>
                                            <div className="text-sm">{s.contactPerson}</div>
                                            <div className="text-muted text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <PhoneIcon style={{ fontSize: 10 }} /> {s.phone}
                                            </div>
                                        </td>
                                        <td>{s.paymentTerms}</td>
                                        <td><span className={`badge ${s.status === 'Active' ? 'green' : 'red'}`}>{s.status}</span></td>
                                        <td className="text-right">
                                            <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                                <button className="action-btn" onClick={() => handleEdit(s)} title="Edit supplier details" aria-label="Edit">
                                                    <EditIcon style={{ fontSize: 18 }} />
                                                </button>
                                                <button className="action-btn" onClick={() => { if (confirm('Delete this supplier?')) deleteSupplier(s.id); }} title="Remove from registry" aria-label="Delete">
                                                    <DeleteIcon style={{ fontSize: 18, color: '#ef4444' }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-muted">
                                            No suppliers found matching your search.
                                        </td>
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

export default SupplierManager;
