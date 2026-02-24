import React, { useState, useEffect } from 'react';
import { Staff } from '../../types';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (staff: Omit<Staff, 'id'>) => void;
    initialData?: Staff;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onAdd, initialData }) => {
    const [formData, setFormData] = useState<Omit<Staff, 'id'>>({
        firstName: '',
        lastName: '',
        type: 'SUPPORT_STAFF',
        role: '',
        email: '',
        phone: '',
        salaryType: 'Fixed',
        basicSalary: 0,
        bankName: '',
        accountNumber: '',
        status: 'Active'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName,
                lastName: initialData.lastName,
                type: initialData.type,
                role: initialData.role,
                email: initialData.email || '',
                phone: initialData.phone || '',
                salaryType: initialData.salaryType,
                basicSalary: initialData.basicSalary,
                bankName: initialData.bankName || '',
                accountNumber: initialData.accountNumber || '',
                status: initialData.status
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                type: 'SUPPORT_STAFF',
                role: '',
                email: '',
                phone: '',
                salaryType: 'Fixed',
                basicSalary: 0,
                bankName: '',
                accountNumber: '',
                status: 'Active'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container animate-in" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="stat-icon" style={{ padding: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <PersonIcon />
                        </div>
                        <div>
                            <h2 className="modal-title">{initialData ? 'Update Profile' : 'New Staff Registration'}</h2>
                            <p className="text-muted text-xs">Enter personnel and remuneration details</p>
                        </div>
                    </div>
                    <button className="action-btn" onClick={onClose} aria-label="Close modal" title="Close">
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="form-group">
                                <label htmlFor="firstName" className="form-label">First Name</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className="form-control"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName" className="form-label">Last Name</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className="form-control"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                    placeholder="Enter last name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="type" className="form-label">Staff Category</label>
                                <select
                                    id="type"
                                    className="form-control"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    title="Staff Category"
                                >
                                    <option value="SUPPORT_STAFF">Support Staff</option>
                                    <option value="BOM_TEACHER">BOM Teacher / Contractual</option>
                                    <option value="ADMIN">Administration</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="role" className="form-label">Job Role / Position</label>
                                <input
                                    id="role"
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Accountant, Driver"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">Mobile Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+254..."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="staff@example.com"
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: 32, borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AccountBalanceIcon style={{ fontSize: 18, color: '#3b82f6' }} /> Remuneration & Banking
                            </h3>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div className="form-group">
                                    <label htmlFor="basicSalary" className="form-label">Monthly Gross Pay (KES)</label>
                                    <input
                                        id="basicSalary"
                                        type="number"
                                        className="form-control"
                                        value={formData.basicSalary}
                                        onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="salaryType" className="form-label">Payment Basis</label>
                                    <select
                                        id="salaryType"
                                        className="form-control"
                                        value={formData.salaryType}
                                        onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as any })}
                                        title="Payment Basis"
                                    >
                                        <option value="Fixed">Monthly Fixed</option>
                                        <option value="Hourly">Hourly / Shift Based</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bankName" className="form-label">Bank Name</label>
                                    <input
                                        id="bankName"
                                        type="text"
                                        className="form-control"
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        placeholder="e.g. Equity Bank"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="accountNumber" className="form-label">Account Number</label>
                                    <input
                                        id="accountNumber"
                                        type="text"
                                        className="form-control"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                        placeholder="Bank account no."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Discard</button>
                        <button type="submit" className="btn btn-primary">
                            {initialData ? 'Save Changes' : 'Register Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffModal;
