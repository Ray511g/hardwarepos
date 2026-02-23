import React, { useState } from 'react';
import { Staff } from '../../types';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WorkIcon from '@mui/icons-material/Work';

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (staff: Omit<Staff, 'id'>) => void;
    initialData?: Staff;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onAdd, initialData }) => {
    const [formData, setFormData] = useState<Omit<Staff, 'id'>>(initialData || {
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

    React.useEffect(() => {
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
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content card" style={{ maxWidth: 600, width: '90%' }}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {initialData ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </h2>
                    <button className="btn-icon" onClick={onClose} aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                className="form-control"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                className="form-control"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="type" className="form-label">Staff Type</label>
                            <select
                                id="type"
                                name="type"
                                className="form-control"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="SUPPORT_STAFF">Support Staff</option>
                                <option value="BOM_TEACHER">BOM Teacher</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="role" className="form-label">Job Role / Position</label>
                            <input
                                id="role"
                                name="role"
                                type="text"
                                className="form-control"
                                placeholder="e.g. Accountant, Driver, Cook"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">Phone Number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="form-control"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-control"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AccountBalanceIcon fontSize="small" color="primary" /> Remuneration & Banking
                        </h3>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label htmlFor="basicSalary" className="form-label">Basic Salary (KES)</label>
                                <input
                                    id="basicSalary"
                                    name="basicSalary"
                                    type="number"
                                    className="form-control"
                                    value={formData.basicSalary}
                                    onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="salaryType" className="form-label">Salary Type</label>
                                <select
                                    id="salaryType"
                                    name="salaryType"
                                    className="form-control"
                                    value={formData.salaryType}
                                    onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as any })}
                                >
                                    <option value="Fixed">Monthly Fixed</option>
                                    <option value="Hourly">Hourly Rate</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="bankName" className="form-label">Bank Name</label>
                                <input
                                    id="bankName"
                                    name="bankName"
                                    type="text"
                                    className="form-control"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="accountNumber" className="form-label">Account Number</label>
                                <input
                                    id="accountNumber"
                                    name="accountNumber"
                                    type="text"
                                    className="form-control"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ marginTop: 32 }}>
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            {initialData ? 'Update Staff Member' : 'Add Staff Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffModal;
