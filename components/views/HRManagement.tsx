import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import BadgeIcon from '@mui/icons-material/Badge';
import PaymentsIcon from '@mui/icons-material/Payments';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useSchool } from '../../context/SchoolContext';
import AddStaffModal from '../../components/modals/AddStaffModal';

export default function HRManagementPage() {
    const { user } = useAuth();
    const { showToast } = useSchool();
    const [activeTab, setActiveTab] = useState('staff');
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [runningPayroll, setRunningPayroll] = useState(false);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/hr/staff');
            if (res.ok) {
                const json = await res.json();
                setStaff(json);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (activeTab === 'staff') fetchStaff();
    }, [activeTab]);

    const runPayroll = async () => {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        if (!window.confirm(`Initiate payroll run for period ${month}/${year}?`)) return;

        setRunningPayroll(true);
        try {
            const res = await fetch('/api/hr/payroll/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month,
                    year,
                    requestedBy: { id: user?.id, name: user?.name }
                })
            });

            if (res.ok) {
                showToast('Payroll initiated and sent for approval', 'success');
                setActiveTab('payroll');
            } else {
                const error = await res.json();
                showToast(error.message || 'Payroll failed', 'error');
            }
        } catch (e) {
            showToast('Network error during payroll', 'error');
        } finally {
            setRunningPayroll(false);
        }
    };

    const handleAddStaff = async (staffData: any) => {
        try {
            const method = selectedStaff ? 'PUT' : 'POST';
            const url = selectedStaff ? `/api/hr/staff/${selectedStaff.id}` : '/api/hr/staff';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffData)
            });

            if (res.ok) {
                showToast(`Staff member ${selectedStaff ? 'updated' : 'added'} successfully`, 'success');
                fetchStaff();
                setIsAddStaffOpen(false);
                setSelectedStaff(null);
            } else {
                showToast('Failed to save staff member', 'error');
            }
        } catch (e) {
            showToast('Network error', 'error');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>HR & Payroll Management</h1>
                    <p className="subtitle">Staff Lifecycle, Salary Administration, and Compliance</p>
                </div>
                <div className="page-header-right">
                    {activeTab === 'payroll' && (
                        <button className="btn-primary" onClick={runPayroll} disabled={runningPayroll}>
                            <PaymentsIcon style={{ fontSize: 18, marginRight: 8 }} /> {runningPayroll ? 'Processing...' : 'Run New Payroll'}
                        </button>
                    )}
                    {activeTab === 'staff' && (
                        <button className="btn-primary" onClick={() => { setSelectedStaff(null); setIsAddStaffOpen(true); }}>
                            <AddIcon style={{ fontSize: 18, marginRight: 8 }} /> Add Staff Member
                        </button>
                    )}
                </div>
            </div>

            <div className="tabs-container" style={{ marginBottom: 20 }}>
                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>
                        <BadgeIcon style={{ fontSize: 18, marginRight: 8 }} /> Personnel Directory
                    </button>
                    <button className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>
                        <PaymentsIcon style={{ fontSize: 18, marginRight: 8 }} /> Payroll Processing
                    </button>
                    <button className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`} onClick={() => setActiveTab('leave')}>
                        <DateRangeIcon style={{ fontSize: 18, marginRight: 8 }} /> Leave & Attendance
                    </button>
                    <button className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>
                        <AccountBalanceIcon style={{ fontSize: 18, marginRight: 8 }} /> Staff Loans
                    </button>
                </div>
            </div>

            <div className="card">
                {activeTab === 'staff' && (
                    <div className="table-wrapper">
                        {loading ? <div className="loading-shimmer" style={{ height: 300 }}></div> : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Staff Name</th>
                                        <th>Role / Dept</th>
                                        <th>KRA / NSSF</th>
                                        <th>Salary Type</th>
                                        <th>Basic Pay</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>No staff found</td></tr> : staff.map(s => (
                                        <tr key={s.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                                            </td>
                                            <td>
                                                <div>{s.designation || s.role}</div>
                                                <div style={{ fontSize: 11, color: 'var(--accent-blue)' }}>{s.department || 'General'}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: 12 }}>KRA: {s.kraPin || '-'}</div>
                                                <div style={{ fontSize: 12 }}>NSSF: {s.nssfNumber || '-'}</div>
                                            </td>
                                            <td><span className="badge">{s.salaryType}</span></td>
                                            <td style={{ fontWeight: 600 }}>KSh {s.basicSalary.toLocaleString()}</td>
                                            <td><span className="status-pill active">{s.status}</span></td>
                                            <td><button className="text-btn" onClick={() => { setSelectedStaff(s); setIsAddStaffOpen(true); }}>Edit Profile</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'payroll' && (
                    <div className="empty-state" style={{ padding: 60 }}>
                        <PaymentsIcon style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
                        <h3>Payroll Management Console</h3>
                        <p>Select "Run New Payroll" to calculate this month's disbursements based on current scales.</p>
                        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                            * Posts to Finance automatically only after final Approval Clearing.
                        </div>
                    </div>
                )}

                {['leave', 'loans'].includes(activeTab) && (
                    <div className="empty-state" style={{ padding: 60 }}>
                        <TrendingUpIcon style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
                        <h3>Interactive Module Preview</h3>
                        <p>This section is being synchronized with your institution's specific HR policy documents.</p>
                    </div>
                )}
            </div>

            <AddStaffModal
                isOpen={isAddStaffOpen}
                onClose={() => { setIsAddStaffOpen(false); setSelectedStaff(null); }}
                onAdd={handleAddStaff}
                initialData={selectedStaff}
            />
        </div>
    );
}
