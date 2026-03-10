import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { Supplier } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Supplier>) => void;
    initialData?: Supplier;
}

export default function AddSupplierModal({ isOpen, onClose, onSave, initialData }: Props) {
    const [form, setForm] = useState({
        name: '',
        kraPin: '',
        contactPerson: '',
        phone: '',
        email: '',
        bankName: '',
        accountNumber: '',
        paymentTerms: 'Net 30',
        status: 'Active' as 'Active' | 'Inactive'
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || '',
                kraPin: initialData.kraPin || '',
                contactPerson: initialData.contactPerson || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                bankName: initialData.bankName || '',
                accountNumber: initialData.accountNumber || '',
                paymentTerms: initialData.paymentTerms || 'Net 30',
                status: initialData.status || 'Active'
            });
        } else {
            setForm({
                name: '', kraPin: '', contactPerson: '', phone: '', email: '',
                bankName: '', accountNumber: '', paymentTerms: 'Net 30', status: 'Active'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="section-title">{initialData ? 'Edit Supplier' : 'Register New Supplier'}</h2>
                    <button className="modal-close" onClick={onClose} title="Close Modal"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label htmlFor="compName">Company Name *</label>
                                <input
                                    id="compName"
                                    className="form-control"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                    placeholder="e.g. Acme Supplies Ltd"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="kraPin">KRA PIN *</label>
                                <input
                                    id="kraPin"
                                    className="form-control"
                                    value={form.kraPin}
                                    onChange={e => setForm({ ...form, kraPin: e.target.value })}
                                    required
                                    placeholder="P0XXXXXXXXX"
                                />
                            </div>
                        </div>

                        <div className="grid-3" style={{ marginTop: 12 }}>
                            <div className="form-group">
                                <label htmlFor="contactP">Contact Person</label>
                                <input
                                    id="contactP"
                                    className="form-control"
                                    value={form.contactPerson}
                                    onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="supPhone">Phone *</label>
                                <input
                                    id="supPhone"
                                    className="form-control"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    required
                                    placeholder="+254..."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="supEmail">Email</label>
                                <input
                                    id="supEmail"
                                    type="email"
                                    className="form-control"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="vendor@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid-2" style={{ marginTop: 12 }}>
                            <div className="form-group">
                                <label htmlFor="supBank">Bank Name</label>
                                <input
                                    id="supBank"
                                    className="form-control"
                                    value={form.bankName}
                                    onChange={e => setForm({ ...form, bankName: e.target.value })}
                                    placeholder="e.g. KCB Bank"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="supAcc">Account Number</label>
                                <input
                                    id="supAcc"
                                    className="form-control"
                                    value={form.accountNumber}
                                    onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                                    placeholder="Bank account/Paybill"
                                />
                            </div>
                        </div>

                        <div className="grid-2" style={{ marginTop: 12 }}>
                            <div className="form-group">
                                <label htmlFor="payTerms">Payment Terms</label>
                                <select
                                    id="payTerms"
                                    className="form-control"
                                    value={form.paymentTerms}
                                    onChange={e => setForm({ ...form, paymentTerms: e.target.value })}
                                >
                                    <option value="Immediate">Immediate</option>
                                    <option value="Net 7">Net 7 Days</option>
                                    <option value="Net 15">Net 15 Days</option>
                                    <option value="Net 30">Net 30 Days</option>
                                    <option value="Net 60">Net 60 Days</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="supStatus">Status</label>
                                <select
                                    id="supStatus"
                                    className="form-control"
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value as any })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary green">
                            <SaveIcon className="mr-2" style={{ fontSize: 18 }} />
                            {initialData ? 'Update Supplier' : 'Save Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
