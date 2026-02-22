import React, { useState } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddStaffModal from '../modals/AddStaffModal';
import { Staff } from '../../types';

interface PayrollManagerProps {
    staff: Staff[];
    payrollEntries: any[];
    onGenerate: (month: number, year: number) => void;
    onUpdateStatus: (id: string, status: string) => void;
    onAddStaff?: (staff: Omit<Staff, 'id'>) => void;
    onUpdateStaff?: (id: string, updates: Partial<Staff>) => void;
    onDeleteStaff?: (id: string) => void;
    user: any;
}

const PayrollManager: React.FC<PayrollManagerProps> = ({ staff, payrollEntries, onGenerate, onUpdateStatus, onAddStaff, onUpdateStaff, onDeleteStaff, user }) => {
    const [activeTab, setActiveTab] = useState<'staff' | 'payroll'>('payroll');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [generateConfig, setGenerateConfig] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

    const isAdminOrPrincipal = user?.role === 'Super Admin' || user?.role === 'Principal' || user?.role === 'Admin';

    const handlePrintPayslip = (entry: any) => {
        const win = window.open('', '_blank');
        if (!win) return;

        const payslipHTML = `
            <html>
                <head>
                    <title>Payslip - ${entry.staff?.firstName} ${entry.staff?.lastName}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        .school-name { font-size: 24px; font-weight: bold; margin: 0; }
                        .document-title { font-size: 18px; color: #666; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
                        .info-item { margin-bottom: 8px; font-size: 14px; }
                        .info-label { font-weight: 600; color: #666; width: 120px; display: inline-block; }
                        .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        .salary-table th, .salary-table td { padding: 12px; border: 1px solid #eee; text-align: left; font-size: 14px; }
                        .salary-table th { background: #f9fafb; font-weight: 600; }
                        .salary-table td.amount { text-align: right; }
                        .total-row { font-weight: bold; background: #f3f4f6; }
                        .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
                        .signature-space { margin-top: 60px; display: flex; justify-content: space-between; }
                        .signature-box { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="school-name">ELIRAMA SCHOOLS</h1>
                        <div class="document-title">Staff Pay Advice</div>
                        <p style="margin: 5px 0;">P.O. Box 12345, Nairobi | info@elirama.ac.ke</p>
                    </div>

                    <div class="info-grid">
                        <div>
                            <div class="info-item"><span class="info-label">Staff Name:</span> ${entry.staff?.firstName} ${entry.staff?.lastName}</div>
                            <div class="info-item"><span class="info-label">Staff ID:</span> ${entry.staff?.id.slice(0, 8).toUpperCase()}</div>
                            <div class="info-item"><span class="info-label">Role:</span> ${entry.staff?.role}</div>
                            <div class="info-item"><span class="info-label">Month/Year:</span> ${['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][entry.month]} ${entry.year}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="info-item"><span class="info-label">Print Date:</span> ${new Date().toLocaleDateString()}</div>
                            <div class="info-item"><span class="info-label">Bank:</span> ${entry.staff?.bankName || 'N/A'}</div>
                            <div class="info-item"><span class="info-label">Account:</span> ${entry.staff?.accountNumber || 'N/A'}</div>
                        </div>
                    </div>

                    <table class="salary-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="amount">Earnings (KES)</th>
                                <th class="amount">Deductions (KES)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Basic Salary</td>
                                <td class="amount">${entry.basicSalary.toLocaleString()}</td>
                                <td class="amount">0</td>
                            </tr>
                            ${(entry.allowances || []).map((a: any) => `
                                <tr>
                                    <td>${a.name}</td>
                                    <td class="amount">${a.amount.toLocaleString()}</td>
                                    <td class="amount">0</td>
                                </tr>
                            `).join('')}
                            ${(entry.deductions || []).map((d: any) => `
                                <tr>
                                    <td>${d.name}</td>
                                    <td class="amount">0</td>
                                    <td class="amount">${d.amount.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td>TOTALS</td>
                                <td class="amount">${(entry.basicSalary + entry.totalAllowances).toLocaleString()}</td>
                                <td class="amount">${entry.totalDeductions.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="background: #1e293b; color: white; padding: 15px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold; font-size: 16px;">NET PAYABLE</span>
                        <span style="font-size: 20px; font-weight: 800;">KES ${entry.netPay.toLocaleString()}</span>
                    </div>

                    <div class="signature-space">
                        <div class="signature-box">Employee Signature</div>
                        <div class="signature-box">Authorized Signature</div>
                    </div>

                    <div class="footer">
                        This is a computer generated document and does not require a physical stamp unless requested.
                        <br/>&copy; ${new Date().getFullYear()} Elirama School Management System
                    </div>
                </body>
            </html>
        `;

        win.document.write(payslipHTML);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
            // win.close();
        }, 500);
    };

    return (
        <div className="payroll-manager">
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payroll')}
                >
                    <ReceiptIcon style={{ fontSize: 20 }} /> Monthly Payroll
                </button>
                <button
                    className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staff')}
                >
                    <GroupIcon style={{ fontSize: 20 }} /> Staff Salary Configuration
                </button>
            </div>

            {activeTab === 'payroll' ? (
                <div className="payroll-entries">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Payroll Processing</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Review and approve monthly staff payments</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <select
                                className="form-control"
                                value={generateConfig.month}
                                onChange={(e) => setGenerateConfig({ ...generateConfig, month: parseInt(e.target.value) })}
                                style={{ width: 140 }}
                                title="Select Month"
                            >
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <input
                                className="form-control"
                                type="number"
                                value={generateConfig.year}
                                onChange={(e) => setGenerateConfig({ ...generateConfig, year: parseInt(e.target.value) })}
                                style={{ width: 100 }}
                                title="Select Year"
                            />
                            <button className="btn-primary" onClick={() => onGenerate(generateConfig.month, generateConfig.year)}>
                                <PlayArrowIcon style={{ fontSize: 18, marginRight: 4 }} /> Generate
                            </button>
                        </div>
                    </div>

                    <div className="table-container card" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Staff Name</th>
                                    <th style={{ textAlign: 'right' }}>Basic Salary</th>
                                    <th style={{ textAlign: 'right' }}>Allowances</th>
                                    <th style={{ textAlign: 'right' }}>Deductions</th>
                                    <th style={{ textAlign: 'right' }}>Net Pay</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const filtered = payrollEntries.filter(e => e.month === generateConfig.month && e.year === generateConfig.year);
                                    if (filtered.length > 0) {
                                        return filtered.map((entry) => (
                                            <tr key={entry.id}>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{entry.staff?.firstName || 'Unknown'} {entry.staff?.lastName || ''}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entry.staff?.role || 'N/A'}</div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>{(entry.basicSalary || 0).toLocaleString()}</td>
                                                <td style={{ textAlign: 'right', color: 'var(--accent-green)' }}>+ {(entry.totalAllowances || 0).toLocaleString()}</td>
                                                <td style={{ textAlign: 'right', color: 'var(--accent-red)' }}>- {(entry.totalDeductions || 0).toLocaleString()}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{(entry.netPay || 0).toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${entry.status === 'Locked' ? 'green' : entry.status === 'Approved' ? 'blue' : entry.status === 'Draft' ? 'neutral' : 'blue'}`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                        {entry.status === 'Draft' && (
                                                            <button className="btn-outline" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => onUpdateStatus(entry.id, 'Reviewed')}>
                                                                Mark Reviewed
                                                            </button>
                                                        )}
                                                        {entry.status === 'Reviewed' && isAdminOrPrincipal && (
                                                            <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => onUpdateStatus(entry.id, 'Approved')}>
                                                                <SaveIcon style={{ fontSize: 14, marginRight: 4 }} /> Approve
                                                            </button>
                                                        )}
                                                        {entry.status === 'Approved' && isAdminOrPrincipal && (
                                                            <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 12, background: 'var(--accent-red)' }} onClick={() => onUpdateStatus(entry.id, 'Locked')}>
                                                                <LockIcon style={{ fontSize: 14, marginRight: 4 }} /> Lock & Post
                                                            </button>
                                                        )}
                                                        {entry.status === 'Locked' && (
                                                            <button className="btn-outline" style={{ padding: '4px 8px' }} title="Print Payslip" onClick={() => handlePrintPayslip(entry)}>
                                                                <VisibilityIcon style={{ fontSize: 16 }} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ));
                                    }
                                    return (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                                No payroll entries for this period. Click Generate to start.
                                            </td>
                                        </tr>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="staff-config">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Staff Remuneration</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Configure basic salaries and payment methods for employees</p>
                        </div>
                        {isAdminOrPrincipal && (
                            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                Add Staff Member
                            </button>
                        )}
                    </div>

                    <AddStaffModal
                        isOpen={isAddModalOpen}
                        onClose={() => {
                            setIsAddModalOpen(false);
                            setEditingStaff(null);
                        }}
                        onAdd={(data) => {
                            if (editingStaff) {
                                // update
                                onUpdateStaff?.(editingStaff.id, data);
                            } else {
                                onAddStaff?.(data);
                            }
                        }}
                        initialData={editingStaff || undefined}
                    />
                    <div className="table-container card" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Role</th>
                                    <th style={{ textAlign: 'right' }}>Basic Salary</th>
                                    <th>Bank Account</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((s) => (
                                    <tr key={s.id}>
                                        <td style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</td>
                                        <td><span className="badge blue">{(s.type || '').replace('_', ' ')}</span></td>
                                        <td>{s.role}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{(s.basicSalary || 0).toLocaleString()}</td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>{s.bankName || 'Not Set'}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.accountNumber}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${s.status === 'Active' ? 'green' : 'neutral'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                <button
                                                    className="btn-outline"
                                                    style={{ padding: '4px 8px' }}
                                                    onClick={() => {
                                                        setEditingStaff(s);
                                                        setIsAddModalOpen(true);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                {isAdminOrPrincipal && (
                                                    <button
                                                        className="btn-outline"
                                                        style={{ padding: '4px 8px', color: 'var(--accent-red)' }}
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to remove this staff member?')) {
                                                                onDeleteStaff?.(s.id);
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollManager;
