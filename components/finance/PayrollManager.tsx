import React, { useState } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddStaffModal from '../modals/AddStaffModal';
import { Staff } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

interface PayrollManagerProps {
    staff?: Staff[];
    payrollEntries?: any[];
    onGenerate?: (month: number, year: number) => void;
    onUpdateStatus?: (id: string, status: string) => void;
    onAddStaff?: (staff: Omit<Staff, 'id'>) => void;
    onUpdateStaff?: (id: string, updates: Partial<Staff>) => void;
    onDeleteStaff?: (id: string) => void;
    user?: any;
}

const PayrollManager: React.FC<PayrollManagerProps> = (props) => {
    const context = useSchool();
    const auth = useAuth();

    // Use props if provided, otherwise fallback to context
    const staff = props.staff || context.staff || [];
    const payrollEntries = props.payrollEntries || context.payrollEntries || [];
    const user = props.user || auth.user;

    const onGenerate = props.onGenerate || (async (month, year) => {
        const res = await context.tryApi('/api/hr/payroll/run', {
            method: 'POST',
            body: JSON.stringify({ month, year, requestedBy: { id: user?.id, name: user?.name } })
        });
        if (res) {
            context.showToast('Payroll initiated', 'success');
            context.refreshData();
        }
    });

    const onUpdateStatus = props.onUpdateStatus || (async (id: string, status: string) => {
        const res = await context.tryApi('/api/finance/payroll', {
            method: 'PUT',
            body: JSON.stringify({ id, status })
        });
        if (res) {
            context.showToast('Payroll status updated successfully', 'success');
            context.refreshData();
        }
    });

    const onAddStaff = props.onAddStaff || context.addStaff;
    const onUpdateStaff = props.onUpdateStaff || context.updateStaff;
    const onDeleteStaff = props.onDeleteStaff || context.deleteStaff;

    const [activeTab, setActiveTab] = useState<'staff' | 'payroll' | 'compliance'>('payroll');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [generateConfig, setGenerateConfig] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    
    // Compliance Settings State
    const [compForm, setCompForm] = useState(context.settings);

    React.useEffect(() => {
        setCompForm(context.settings);
    }, [context.settings]);

    const handleSaveCompliance = async () => {
        await context.updateSettings(compForm);
    };

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
                            ${(entry.totalAllowances > 0) ? `
                                <tr>
                                    <td>Total Allowances</td>
                                    <td class="amount">${entry.totalAllowances.toLocaleString()}</td>
                                    <td class="amount">0</td>
                                </tr>
                            ` : ''}

                            <!-- Statutory Deductions -->
                            ${entry.tax > 0 ? `
                                <tr>
                                    <td>PAYE (Income Tax)</td>
                                    <td class="amount">0</td>
                                    <td class="amount">${entry.tax.toLocaleString()}</td>
                                </tr>
                            ` : ''}
                            ${entry.nssf > 0 ? `
                                <tr>
                                    <td>NSSF Deduction</td>
                                    <td class="amount">0</td>
                                    <td class="amount">${entry.nssf.toLocaleString()}</td>
                                </tr>
                            ` : ''}
                            ${entry.nhif > 0 ? `
                                <tr>
                                    <td>${compForm.shifEnabled ? 'SHIF' : 'NHIF'} Contribution</td>
                                    <td class="amount">0</td>
                                    <td class="amount">${entry.nhif.toLocaleString()}</td>
                                </tr>
                            ` : ''}
                            ${entry.housingLevy > 0 ? `
                                <tr>
                                    <td>Affordable Housing Levy</td>
                                    <td class="amount">0</td>
                                    <td class="amount">${entry.housingLevy.toLocaleString()}</td>
                                </tr>
                            ` : ''}

                            <!-- Other Custom Deductions -->
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
        }, 500);
    };

    return (
        <div className="payroll-manager animate-in">
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payroll')}
                    title="Process and review monthly staff payments"
                    aria-label="Monthly Payroll Tab"
                >
                    <ReceiptIcon style={{ fontSize: 20 }} /> Monthly Payroll
                </button>
                <button
                    className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staff')}
                    title="Configure basic salaries and staff records"
                    aria-label="Staff Configuration Tab"
                >
                    <GroupIcon style={{ fontSize: 20 }} /> Staff Salary Configuration
                </button>
                <button
                    className={`tab-btn ${activeTab === 'compliance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('compliance')}
                    title="Configure tax brackets and statutory deductions"
                    aria-label="Compliance Settings Tab"
                >
                    <LockIcon style={{ fontSize: 20 }} /> Compliance & Tax Rules
                </button>
            </div>

            {activeTab === 'payroll' && (
                <div className="payroll-entries">
                    <div className="finance-toolbar">
                        <div>
                            <h2 className="section-title">Payroll Processing</h2>
                            <p className="text-muted text-xs">Review and approve monthly staff payments</p>
                        </div>
                        <div className="finance-toolbar-right">
                            <select
                                className="form-control"
                                value={generateConfig.month}
                                onChange={(e) => setGenerateConfig({ ...generateConfig, month: parseInt(e.target.value) })}
                                style={{ width: 140 }}
                                title="Select Month for payroll"
                                aria-label="Select payroll month"
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
                                title="Select Year for payroll"
                                aria-label="Select payroll year"
                            />
                            <button className="btn btn-primary" onClick={() => onGenerate(generateConfig.month, generateConfig.year)} title="Calculate payroll for selected period" aria-label="Generate Payroll">
                                <PlayArrowIcon className="mr-2" style={{ fontSize: 18 }} /> Generate
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Staff Name</th>
                                    <th className="text-right">Basic Salary</th>
                                    <th className="text-right">Allowances</th>
                                    <th className="text-right">Deductions</th>
                                    <th className="text-right">Net Pay</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const filtered = payrollEntries.filter(e => e.month === generateConfig.month && e.year === generateConfig.year);
                                    if (filtered.length > 0) {
                                        return filtered.map((entry) => (
                                            <tr key={entry.id}>
                                                <td>
                                                    <div className="data-table-name">{entry.staff?.firstName || 'Unknown'} {entry.staff?.lastName || ''}</div>
                                                    <div className="text-muted text-xs">{entry.staff?.role || 'N/A'}</div>
                                                </td>
                                                <td className="text-right">{(entry.basicSalary || 0).toLocaleString()}</td>
                                                <td className="text-right" style={{ color: '#10b981' }}>+ {(entry.totalAllowances || 0).toLocaleString()}</td>
                                                <td className="text-right" style={{ color: '#ef4444' }}>- {(entry.totalDeductions || 0).toLocaleString()}</td>
                                                <td className="text-right" style={{ fontWeight: 600 }}>{(entry.netPay || 0).toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${entry.status === 'Locked' ? 'green' : entry.status === 'Approved' ? 'green' : entry.status === 'Reviewed' ? 'blue' : entry.status === 'Draft' ? 'orange' : 'blue'}`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                                        {entry.status === 'Draft' && (
                                                            <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => onUpdateStatus(entry.id, 'Reviewed')} title="Mark as reviewed by finance" aria-label="Mark Reviewed">
                                                                Mark Reviewed
                                                            </button>
                                                        )}
                                                        {entry.status === 'Reviewed' && isAdminOrPrincipal && (
                                                            <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => onUpdateStatus(entry.id, 'Approved')} title="Approve for payment" aria-label="Approve Payroll">
                                                                <SaveIcon className="mr-2" style={{ fontSize: 14 }} /> Approve
                                                            </button>
                                                        )}
                                                        {entry.status === 'Approved' && isAdminOrPrincipal && (
                                                            <button className="btn btn-primary red" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => onUpdateStatus(entry.id, 'Locked')} title="Lock entries and post to ledger" aria-label="Lock and Post">
                                                                <LockIcon className="mr-2" style={{ fontSize: 14 }} /> Lock & Post
                                                            </button>
                                                        )}
                                                        {(entry.status === 'Approved' || entry.status === 'Locked') && (
                                                            <button className="action-btn" onClick={() => handlePrintPayslip(entry)} title="Generate and Print Payslip" aria-label="View Payslip">
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
                                            <td colSpan={7} className="p-10 text-center text-muted">
                                                No payroll entries for this period. Click Generate to start.
                                            </td>
                                        </tr>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className="staff-config">
                    <div className="finance-toolbar">
                        <div>
                            <h2 className="section-title">Staff Remuneration</h2>
                            <p className="text-muted text-xs">Configure basic salaries and payment methods for employees</p>
                        </div>
                        {isAdminOrPrincipal && (
                            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} title="Register new staff member for payroll" aria-label="Add Staff">
                                <GroupIcon className="mr-2" /> Add Staff Member
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
                                onUpdateStaff?.(editingStaff.id, data);
                            } else {
                                onAddStaff?.(data);
                            }
                        }}
                        initialData={editingStaff || undefined}
                    />
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Role</th>
                                    <th className="text-right">Basic Salary</th>
                                    <th>Bank Account</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((s) => (
                                    <tr key={s.id}>
                                        <td className="data-table-name">{s.firstName} {s.lastName}</td>
                                        <td><span className="badge blue">{(s.type || '').replace('_', ' ')}</span></td>
                                        <td>{s.role}</td>
                                        <td className="text-right" style={{ fontWeight: 600 }}>{(s.basicSalary || 0).toLocaleString()}</td>
                                        <td>
                                            <div className="text-sm">{s.bankName || 'Not Set'}</div>
                                            <div className="text-muted text-xs">{s.accountNumber}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${s.status === 'Active' ? 'green' : 'orange'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '4px 12px', fontSize: 12 }}
                                                    onClick={() => {
                                                        setEditingStaff(s);
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    title="Modify staff payroll details"
                                                    aria-label="Edit Staff"
                                                >
                                                    Edit
                                                </button>
                                                {isAdminOrPrincipal && (
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '4px 12px', fontSize: 12, color: '#ef4444' }}
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to remove this staff member?')) {
                                                                onDeleteStaff?.(s.id);
                                                            }
                                                        }}
                                                        title="Remove staff member from payroll"
                                                        aria-label="Delete Staff"
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

            {activeTab === 'compliance' && (
                <div className="compliance-config animate-in">
                    <div className="finance-toolbar">
                        <div>
                            <h2 className="section-title">Compliance & Statutory Rules</h2>
                            <p className="text-muted text-xs">Configure income tax brackets and social insurance rates</p>
                        </div>
                        {isAdminOrPrincipal && (
                            <button className="btn btn-primary" onClick={handleSaveCompliance}>
                                <SaveIcon className="mr-2" /> Save Compliance Rules
                            </button>
                        )}
                    </div>

                    <div className="admin-grid-2">
                        <div className="admin-section">
                            <h3>Governing Rates</h3>
                            <div className="card">
                                <div className="settings-form">
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label>NSSF Contribution Rate</label>
                                            <div className="flex-row">
                                                <input type="number" className="form-control" value={(compForm.nssfRate || 0.06) * 100} onChange={e => setCompForm({...compForm, nssfRate: parseFloat(e.target.value)/100})} />
                                                <span className="ml-2">%</span>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>NSSF Max Cap (KES)</label>
                                            <input type="number" className="form-control" value={compForm.nssfMax || 0} onChange={e => setCompForm({...compForm, nssfMax: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="grid-2 mt-15">
                                        <div className="form-group">
                                            <label>Affordable Housing Levy</label>
                                            <div className="flex-row">
                                                <input type="number" className="form-control" value={(compForm.housingLevyRate || 0.015) * 100} onChange={e => setCompForm({...compForm, housingLevyRate: parseFloat(e.target.value)/100})} />
                                                <span className="ml-2">%</span>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Monthly Personal Relief</label>
                                            <input type="number" className="form-control" value={compForm.personalRelief || 0} onChange={e => setCompForm({...compForm, personalRelief: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="form-group mt-15">
                                        <label className="flex-row pointer">
                                            <input type="checkbox" checked={compForm.shifEnabled} onChange={e => setCompForm({...compForm, shifEnabled: e.target.checked})} />
                                            <span className="ml-2">Apply Flat SHIF Rate (2.75% of Gross)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {!compForm.shifEnabled && (
                                <>
                                    <h3 className="mt-20">NHIF Brackets (Legacy)</h3>
                                    <div className="card">
                                        <div className="table-container p-0">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>From (KES)</th>
                                                        <th>To (KES)</th>
                                                        <th>Amount (KES)</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(compForm.nhifConfig || []).map((b: any, idx: number) => (
                                                        <tr key={idx}>
                                                            <td><input type="number" className="form-control form-control-sm" value={b.min || 0} onChange={e => {
                                                                const newB = [...compForm.nhifConfig];
                                                                newB[idx].min = parseFloat(e.target.value);
                                                                setCompForm({...compForm, nhifConfig: newB});
                                                            }} /></td>
                                                            <td><input type="number" className="form-control form-control-sm" value={b.max || 0} onChange={e => {
                                                                const newB = [...compForm.nhifConfig];
                                                                newB[idx].max = parseFloat(e.target.value);
                                                                setCompForm({...compForm, nhifConfig: newB});
                                                            }} /></td>
                                                            <td><input type="number" className="form-control form-control-sm" value={b.amount || 0} onChange={e => {
                                                                const newB = [...compForm.nhifConfig];
                                                                newB[idx].amount = parseFloat(e.target.value);
                                                                setCompForm({...compForm, nhifConfig: newB});
                                                            }} /></td>
                                                            <td>
                                                                <button className="action-btn text-red" onClick={() => {
                                                                    const newB = compForm.nhifConfig.filter((_: any, i: number) => i !== idx);
                                                                    setCompForm({...compForm, nhifConfig: newB});
                                                                }}>Delete</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr>
                                                        <td colSpan={4}>
                                                            <button className="btn btn-outline-sm w-full" onClick={() => {
                                                                const newB = [...(compForm.nhifConfig || []), { min: 0, max: -1, amount: 0 }];
                                                                setCompForm({...compForm, nhifConfig: newB});
                                                            }}>+ Add NHIF Bracket</button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="admin-section">
                            <h3>PAYE Income Tax Brackets</h3>
                            <div className="card">
                                <div className="table-container p-0">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>From (KES)</th>
                                                <th>To (KES)</th>
                                                <th>Tax Rate (%)</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(compForm.payeConfig || []).map((b: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td><input type="number" className="form-control form-control-sm" value={b.min || 0} onChange={e => {
                                                        const newB = [...compForm.payeConfig];
                                                        newB[idx].min = parseFloat(e.target.value);
                                                        setCompForm({...compForm, payeConfig: newB});
                                                    }} /></td>
                                                    <td><input type="number" className="form-control form-control-sm" value={b.max || 0} onChange={e => {
                                                        const newB = [...compForm.payeConfig];
                                                        newB[idx].max = parseFloat(e.target.value);
                                                        setCompForm({...compForm, payeConfig: newB});
                                                    }} /></td>
                                                    <td><input type="number" className="form-control form-control-sm" value={(b.rate || 0) * 100} onChange={e => {
                                                        const newB = [...compForm.payeConfig];
                                                        newB[idx].rate = parseFloat(e.target.value) / 100;
                                                        setCompForm({...compForm, payeConfig: newB});
                                                    }} /></td>
                                                    <td>
                                                        <button className="action-btn text-red" onClick={() => {
                                                            const newB = compForm.payeConfig.filter((_: any, i: number) => i !== idx);
                                                            setCompForm({...compForm, payeConfig: newB});
                                                        }}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={4}>
                                                    <button className="btn btn-outline-sm w-full" onClick={() => {
                                                        const newB = [...(compForm.payeConfig || []), { min: 0, max: -1, rate: 0.1 }];
                                                        setCompForm({...compForm, payeConfig: newB});
                                                    }}>+ Add Tax Bracket</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-muted text-xs p-10">Use -1 for 'To' amount to represent 'Infinity' or 'And Above'.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollManager;
