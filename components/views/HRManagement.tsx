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
import SearchIcon from '@mui/icons-material/Search';

export default function HRManagementPage() {
    const { user } = useAuth();
    const { showToast, tryApi, refreshData } = useSchool();
    const [activeTab, setActiveTab] = useState('staff');
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [runningPayroll, setRunningPayroll] = useState(false);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await tryApi('/api/hr/staff');
            if (res) {
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
            const res = await tryApi('/api/hr/payroll/run', {
                method: 'POST',
                body: JSON.stringify({
                    month,
                    year,
                    requestedBy: { id: user?.id, name: user?.name }
                })
            });

            if (res) {
                showToast('Payroll initiated and sent for approval', 'success');
                setActiveTab('payroll');
                refreshData();
            }
        } catch (e) {
            showToast('Error during payroll execution', 'error');
        } finally {
            setRunningPayroll(false);
        }
    };

    const handleAddStaff = async (staffData: any) => {
        try {
            const method = selectedStaff ? 'PUT' : 'POST';
            const url = selectedStaff ? `/api/hr/staff/${selectedStaff.id}` : '/api/hr/staff';
            const res = await tryApi(url, {
                method,
                body: JSON.stringify(staffData)
            });

            if (res) {
                showToast(`Staff member ${selectedStaff ? 'updated' : 'added'} successfully`, 'success');
                fetchStaff();
                setIsAddStaffOpen(false);
                setSelectedStaff(null);
                refreshData();
            }
        } catch (e) {
            showToast('Network error while saving staff', 'error');
        }
    };

    const filteredStaff = staff.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="finance-page animate-in">
            <div className="page-header">
                <div className="header-content">
                    <h1>HR & Payroll Management</h1>
                    <p className="text-muted">Staff Lifecycle, Salary Administration, and Compliance</p>
                </div>
            </div>

            <div className="tab-nav-container">
                <div className="tab-nav scrollable">
                    <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')} title="Personnel Directory" aria-label="Staff Directory Tab">
                        <BadgeIcon /> <span>Staff Directory</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')} title="Payroll Processing" aria-label="Payroll Tab">
                        <PaymentsIcon /> <span>Payroll Processing</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`} onClick={() => setActiveTab('leave')} title="Leave & Attendance" aria-label="Leave Tab">
                        <DateRangeIcon /> <span>Leave Management</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')} title="Staff Loans" aria-label="Loans Tab">
                        <AccountBalanceIcon /> <span>Staff Loans</span>
                    </button>
                </div>
            </div>

            <div className="finance-content">
                <div className="finance-nav-row">
                    {activeTab === 'staff' ? (
                        <>
                            <div className="search-box-container">
                                <SearchIcon className="search-box-icon" />
                                <input
                                    type="text"
                                    className="form-control search-input-pl"
                                    placeholder="Search staff..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    title="Search within staff directory"
                                    aria-label="Search Staff"
                                />
                            </div>
                            <div className="finance-toolbar-right">
                                <button className="btn btn-primary" onClick={() => { setSelectedStaff(null); setIsAddStaffOpen(true); }} title="Register a new staff member" aria-label="Add Staff">
                                    <AddIcon className="mr-2" style={{ fontSize: 18 }} /> Add Staff Member
                                </button>
                            </div>
                        </>
                    ) : activeTab === 'payroll' ? (
                        <div className="finance-toolbar-right" style={{ marginLeft: 'auto' }}>
                            <button className="btn btn-primary" onClick={runPayroll} disabled={runningPayroll} title="Execute payroll for this month" aria-label="Run Payroll">
                                <PaymentsIcon className="mr-2" style={{ fontSize: 18 }} /> {runningPayroll ? 'Processing...' : 'Run New Payroll'}
                            </button>
                        </div>
                    ) : null}
                </div>

                <div className="table-container">
                    {activeTab === 'staff' ? (
                        loading ? <div className="p-40 text-center text-muted">Loading personnel...</div> : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Staff Name</th>
                                        <th>Role / Dept</th>
                                        <th>KRA / NSSF</th>
                                        <th>Salary Type</th>
                                        <th className="text-right">Basic Pay</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.length === 0 ? <tr><td colSpan={7} className="text-center p-40 text-muted">No staff found</td></tr> : filteredStaff.map(s => (
                                        <tr key={s.id}>
                                            <td>
                                                <div className="data-table-name">{s.firstName} {s.lastName}</div>
                                                <div className="text-muted text-xs">{s.email}</div>
                                            </td>
                                            <td>
                                                <div>{s.designation || s.role}</div>
                                                <div className="text-muted text-xs" style={{ color: '#3b82f6' }}>{s.department || 'General'}</div>
                                            </td>
                                            <td>
                                                <div className="text-xs">KRA: {s.kraPin || '-'}</div>
                                                <div className="text-xs">NSSF: {s.nssfNumber || '-'}</div>
                                            </td>
                                            <td><span className="badge blue">{s.salaryType}</span></td>
                                            <td className="text-right" style={{ fontWeight: 600 }}>KSh {s.basicSalary.toLocaleString()}</td>
                                            <td><span className={`badge ${s.status === 'Active' ? 'green' : 'blue'}`}>{s.status}</span></td>
                                            <td className="text-right">
                                                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { setSelectedStaff(s); setIsAddStaffOpen(true); }}>Edit Profile</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    ) : activeTab === 'payroll' ? (
                        <div className="p-60 text-center">
                            <PaymentsIcon style={{ fontSize: 64, color: 'rgba(59, 130, 246, 0.2)', marginBottom: 20 }} />
                            <h3>Payroll Management Console</h3>
                            <p className="text-muted" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
                                Use the Button above to initiate a new payroll run. Past payrolls can be viewed in the Financial Reports section.
                            </p>
                            <div className="badge blue" style={{ fontSize: 12, padding: '8px 16px' }}>
                                Payroll generates ledger entries automatically after final approval.
                            </div>
                        </div>
                    ) : (
                        <div className="p-60 text-center">
                            <TrendingUpIcon style={{ fontSize: 64, color: 'rgba(59, 130, 246, 0.2)', marginBottom: 20 }} />
                            <h3>Interactive Module Sync</h3>
                            <p className="text-muted">
                                This section is being synchronized with your institution's specific policy documents.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {isAddStaffOpen && (
                <AddStaffModal
                    isOpen={isAddStaffOpen}
                    onClose={() => { setIsAddStaffOpen(false); setSelectedStaff(null); }}
                    onAdd={handleAddStaff}
                    initialData={selectedStaff}
                />
            )}
        </div>
    );
}
