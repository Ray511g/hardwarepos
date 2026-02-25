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
import PayrollManager from '../finance/PayrollManager';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';

export default function HRManagementPage() {
    const { user } = useAuth();
    const {
        staff, addStaff, updateStaff, payrollEntries,
        showToast, tryApi, refreshData, loading,
        settings, updateSettings
    } = useSchool();
    const [activeTab, setActiveTab] = useState('staff');
    const [runningPayroll, setRunningPayroll] = useState(false);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [statSettings, setStatSettings] = useState({
        nssfRate: settings?.nssfRate || 0.06,
        nssfMax: settings?.nssfMax || 2160,
        housingLevyRate: settings?.housingLevyRate || 0.015,
        personalRelief: settings?.personalRelief || 2400
    });

    useEffect(() => {
        if (settings) {
            setStatSettings({
                nssfRate: settings.nssfRate,
                nssfMax: settings.nssfMax,
                housingLevyRate: settings.housingLevyRate,
                personalRelief: settings.personalRelief
            });
        }
    }, [settings]);

    const saveStatSettings = async () => {
        const success = await updateSettings(statSettings);
        if (success) {
            showToast('Compliance rates updated successfully', 'success');
        }
    };

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
        if (selectedStaff) {
            await updateStaff(selectedStaff.id, staffData);
        } else {
            await addStaff(staffData);
        }
        setIsAddStaffOpen(false);
        setSelectedStaff(null);
    };

    const filteredStaff = (staff || []).filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title="Compliance & Rates" aria-label="Settings Tab">
                        <SettingsIcon /> <span>Compliance</span>
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
                                                <div>{s.role}</div>
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
                        <PayrollManager
                            staff={staff}
                            payrollEntries={payrollEntries}
                            user={user}
                        />
                    ) : activeTab === 'settings' ? (
                        <div className="p-40">
                            <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
                                <div className="card-header" style={{ marginBottom: 24 }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <SettingsIcon style={{ color: '#3b82f6' }} /> Statutory Deduction & Tax Settings
                                    </h3>
                                    <p className="text-muted text-sm">Configure institution-wide rates for automated payroll processing</p>
                                </div>

                                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                    <div className="form-group">
                                        <label>NSSF Contribution Rate (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            value={statSettings.nssfRate * 100}
                                            onChange={(e) => setStatSettings({ ...statSettings, nssfRate: parseFloat(e.target.value) / 100 })}
                                            placeholder="e.g. 6"
                                        />
                                        <p className="text-xs text-muted mt-2">Default 6% for Tier I & II combined</p>
                                    </div>

                                    <div className="form-group">
                                        <label>Max NSSF Deduction (KES)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={statSettings.nssfMax}
                                            onChange={(e) => setStatSettings({ ...statSettings, nssfMax: parseFloat(e.target.value) })}
                                            placeholder="e.g. 2160"
                                        />
                                        <p className="text-xs text-muted mt-2">Maximum cap for employee contribution</p>
                                    </div>

                                    <div className="form-group">
                                        <label>Housing Levy Rate (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            value={statSettings.housingLevyRate * 100}
                                            onChange={(e) => setStatSettings({ ...statSettings, housingLevyRate: parseFloat(e.target.value) / 100 })}
                                            placeholder="e.g. 1.5"
                                        />
                                        <p className="text-xs text-muted mt-2">Deducted from gross salary</p>
                                    </div>

                                    <div className="form-group">
                                        <label>Personal Tax Relief (KES)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={statSettings.personalRelief}
                                            onChange={(e) => setStatSettings({ ...statSettings, personalRelief: parseFloat(e.target.value) })}
                                            placeholder="e.g. 2400"
                                        />
                                        <p className="text-xs text-muted mt-2">Monthly standard tax relief</p>
                                    </div>
                                </div>

                                <div style={{ marginTop: 40, borderTop: '1px solid var(--border-color)', paddingTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-primary" onClick={saveStatSettings}>
                                        Save Statutory Rates
                                    </button>
                                </div>
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
