import React, { useState, useEffect } from 'react';
import { useSchool, defaultTimeSlots } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RuleIcon from '@mui/icons-material/Rule';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import LockIcon from '@mui/icons-material/Lock';
import * as XLSX from 'xlsx';
import { PERMISSIONS } from '../../components/layout/Sidebar';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupIcon from '@mui/icons-material/Group';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function Admin() {
    const {
        settings, updateSettings,
        students, uploadStudents, uploadTeachers, uploadExams, clearAllData,
        systemUsers, addSystemUser, updateSystemUser, deleteSystemUser,
        feeStructures, addFeeStructure, updateFeeStructure, deleteFeeStructure, applyFeeStructure, revertFeeStructure,
        auditLogs, fetchAuditLogs,
        activeGrades, roles, addRole, updateRole, deleteRole, resetUserPassword,
        expenses, payrollEntries, tryApi, showToast
    } = useSchool();

    const { user } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(settings);
    const [activeTab, setActiveTabRaw] = useState<'settings' | 'users' | 'roles' | 'fees' | 'audit' | 'timetable' | 'approvals'>('settings');
    const [isPending, startTransition] = React.useTransition();

    const setActiveTab = (tab: any) => {
        startTransition(() => {
            setActiveTabRaw(tab);
        });
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['settings', 'users', 'roles', 'fees', 'audit', 'timetable', 'approvals'].includes(tab)) {
            setActiveTabRaw(tab as any);
        }
    }, []);

    useEffect(() => {
        if (!editing) {
            setForm(settings);
        }
    }, [settings, editing]);

    // Fee Structure State
    const [feeForm, setFeeForm] = useState({ grade: 'Grade 1', name: '', amount: 0, term: 'Term 1' });
    const [editingFeeItem, setEditingFeeItem] = useState<string | null>(null);
    const [previewGrade, setPreviewGrade] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    // User Management State
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userForm, setUserForm] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'Teacher',
        roleId: '',
        permissions: [] as string[]
    });

    // Role Management State
    const [showAddRole, setShowAddRole] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [roleForm, setRoleForm] = useState({
        name: '',
        permissions: {} as Record<string, string[]>
    });

    // Audit State
    const [auditFilters, setAuditFilters] = useState({ module: '', action: '' });
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const MODULES = [
        { id: 'users', label: 'User Management' },
        { id: 'settings', label: 'School Settings' },
        { id: 'fees', label: 'Finance & Fees' },
        { id: 'academic', label: 'Academic (Exams/Results)' },
        { id: 'students', label: 'Student Records' },
        { id: 'teachers', label: 'Teacher Management' },
        { id: 'audit', label: 'Audit Logs' }
    ];

    const ACTIONS = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PUBLISH', 'APPROVE', 'REVERT'];

    useEffect(() => {
        if (activeTab === 'audit') fetchAuditLogs();
    }, [activeTab]);

    const handleAddUser = () => {
        if (!userForm.firstName || !userForm.lastName || !userForm.username || !userForm.email) return;

        const fullName = `${userForm.firstName} ${userForm.lastName}`;
        const submissionData = { ...userForm, name: fullName };

        if (editingUser) {
            updateSystemUser(editingUser.id, submissionData as any);
        } else {
            addSystemUser(submissionData as any);
        }

        setUserForm({ firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Teacher', roleId: '', permissions: [] });
        setEditingUser(null);
        setShowAddUser(false);
    };

    const startEditUser = (u: any) => {
        setEditingUser(u);
        setUserForm({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            username: u.username || '',
            password: u.password || '',
            name: u.name,
            email: u.email,
            role: u.role,
            roleId: u.roleId || '',
            permissions: u.permissions || []
        });
        setShowAddUser(true);
    };

    const handleDeleteUser = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) {
            deleteSystemUser(id);
            if (id === selectedUserId) setSelectedUserId(null);
        }
    };

    const handleAddFeeItem = () => {
        if (!feeForm.name || feeForm.amount <= 0) return;
        if (editingFeeItem) {
            updateFeeStructure(editingFeeItem, feeForm);
            setEditingFeeItem(null);
        } else {
            addFeeStructure(feeForm);
        }
        setFeeForm({ ...feeForm, name: '', amount: 0 });
    };

    const startEditFeeItem = (item: any) => {
        setEditingFeeItem(item.id);
        setFeeForm({
            grade: item.grade,
            name: item.name,
            amount: item.amount,
            term: item.term
        });
    };

    const handleApplyFees = async (grade?: string) => {
        if (confirm(`Are you sure you want to PUBLISH ${grade ? `fees for ${grade}` : 'all fees'}? This will update students' total fees and current balances for the selected grade(s).`)) {
            setIsPublishing(true);
            try {
                await applyFeeStructure(grade);
            } finally {
                setIsPublishing(false);
            }
        }
    };

    // Group fee structures by grade
    const groupedFees = feeStructures.reduce((acc: any, item) => {
        if (!acc[item.grade]) acc[item.grade] = [];
        acc[item.grade].push(item);
        return acc;
    }, {});

    const sortedGrades = Object.keys(groupedFees).sort();

    const downloadTemplate = (type: 'students' | 'teachers' | 'exams') => {
        let headers: string[] = [];
        if (type === 'students') headers = ['Admission No', 'First Name', 'Last Name', 'Gender', 'Grade', 'DOB', 'Parent Name', 'Phone', 'Email', 'Address', 'Total Fees'];
        if (type === 'teachers') headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Qualification', 'Subjects', 'Grades'];
        if (type === 'exams') headers = ['Exam Name', 'Subject', 'Grade', 'Date', 'Term', 'Type', 'Total Marks'];

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, `${type}_template.xlsx`);
    };

    const handleSave = async () => {
        const success = await updateSettings(form);
        if (success) setEditing(false);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Admin Configuration</h1>
                    <p>Manage system settings, users, fees, and security</p>
                </div>
                <div className="page-header-right">
                    {activeTab === 'settings' || activeTab === 'timetable' ? (
                        !editing ? (
                            <button className="btn-primary" onClick={() => setEditing(true)}>
                                <EditIcon style={{ fontSize: 18 }} /> Edit Configuration
                            </button>
                        ) : (
                            <button className="btn-primary green" onClick={handleSave}>
                                <SaveIcon style={{ fontSize: 18 }} /> Save Changes
                            </button>
                        )
                    ) : null}
                </div>
            </div>

            <div className="admin-layout-container">
                <aside className="admin-side-nav">
                    <div className="admin-nav-header">
                        <h4>Control Panel</h4>
                        {isPending && <div className="spinner-small"></div>}
                    </div>
                    <nav className="admin-nav">
                        {[
                            { id: 'settings', label: 'School Settings', icon: <SettingsIcon /> },
                            { id: 'timetable', label: 'Timetable Setup', icon: <SchoolIcon /> },
                            { id: 'users', label: 'User Management', icon: <GroupIcon /> },
                            { id: 'roles', label: 'Access Control', icon: <SecurityIcon /> },
                            { id: 'fees', label: 'Fee Structure', icon: <PaymentIcon /> },
                            { id: 'audit', label: 'System Audit', icon: <HistoryIcon /> },
                        ].map(module => (
                            <button
                                key={module.id}
                                className={`admin-nav-item ${activeTab === module.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(module.id as any)}
                            >
                                {React.cloneElement(module.icon)}
                                {module.label}
                            </button>
                        ))}
                        {(user?.role === 'Principal' || user?.role === 'Super Admin') && (
                            <button
                                className={`admin-nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
                                onClick={() => setActiveTab('approvals')}
                            >
                                <RuleIcon /> Pending Approvals
                                {(expenses.filter(e => e.status === 'Pending').length + payrollEntries.filter(p => p.status === 'Reviewed').length) > 0 && (
                                    <span className="badge red">
                                        {expenses.filter(e => e.status === 'Pending').length + payrollEntries.filter(p => p.status === 'Reviewed').length}
                                    </span>
                                )}
                            </button>
                        )}
                    </nav>
                </aside>

                <div className="admin-main">
                    <div className="admin-grid-2">
                        {activeTab === 'settings' && (
                            <>
                                <div className="admin-section">
                                    <h3><SchoolIcon style={{ fontSize: 22 }} /> School Information</h3>
                                    {editing ? (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="school-logo">School Logo</label>
                                                <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginTop: 8 }}>
                                                    {form.logo && (
                                                        <img src={form.logo} style={{ height: 50, borderRadius: 4 }} alt="Logo Preview" />
                                                    )}
                                                    <input
                                                        id="school-logo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setForm({ ...form, logo: reader.result as string });
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="school-name">School Name</label>
                                                <input id="school-name" className="form-control" value={form.schoolName} onChange={e => setForm({ ...form, schoolName: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="school-motto">Motto</label>
                                                <input id="school-motto" className="form-control" value={form.motto} onChange={e => setForm({ ...form, motto: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="school-phone">Phone</label>
                                                <input id="school-phone" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="school-email">Email</label>
                                                <input id="school-email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="school-address">Address</label>
                                                <input id="school-address" className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="school-pobox">P.O. Box</label>
                                                <input id="school-pobox" className="form-control" value={form.poBox || ''} onChange={e => setForm({ ...form, poBox: e.target.value })} placeholder="e.g. P.O. Box 123-00100" />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="school-telephone">Telephone Number</label>
                                                <input id="school-telephone" className="form-control" value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="e.g. +254 20 1234567" />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="paybill-number">Lipa na M-Pesa Paybill</label>
                                                <input id="paybill-number" className="form-control" value={form.paybillNumber} onChange={e => setForm({ ...form, paybillNumber: e.target.value })} placeholder="e.g. 123456" />
                                            </div>
                                            <div className="form-group" style={{ gridColumn: 'span 2', marginTop: 10 }}>
                                                <label style={{ display: 'block', marginBottom: 15, fontWeight: 'bold' }}>Enabled School Levels</label>
                                                <div style={{ display: 'flex', gap: 30 }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={form.primaryEnabled} onChange={e => setForm({ ...form, primaryEnabled: e.target.checked })} />
                                                        Primary (Play Group - Grade 6)
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={form.jssEnabled} onChange={e => setForm({ ...form, jssEnabled: e.target.checked })} />
                                                        Junior Secondary (Grade 7 - Grade 9)
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={form.sssEnabled} onChange={e => setForm({ ...form, sssEnabled: e.target.checked })} />
                                                        Senior Secondary ({form.sssNaming === 'Grade' ? 'Grade 10 - Grade 12' : 'Form 1 - Form 4'})
                                                    </label>

                                                    {form.sssEnabled && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginLeft: 20 }}>
                                                            <span style={{ fontSize: 13, opacity: 0.8 }}>Naming:</span>
                                                            <select
                                                                title="SSS Naming"
                                                                className="form-control-sm"
                                                                value={form.sssNaming || 'Form'}
                                                                onChange={e => setForm({ ...form, sssNaming: e.target.value as any })}
                                                            >
                                                                <option value="Form">Form 1-4</option>
                                                                <option value="Grade">Grade 10-12</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                <label htmlFor="head-of-school-title">Head of School Title</label>
                                                <select
                                                    id="head-of-school-title"
                                                    className="form-control"
                                                    value={form.headOfSchoolTitle || 'Headteacher'}
                                                    onChange={e => setForm({ ...form, headOfSchoolTitle: e.target.value as any })}
                                                >
                                                    <option value="Headteacher">Headteacher</option>
                                                    <option value="Principal">Principal</option>
                                                    <option value="Chief Principal">Chief Principal</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="headteacher-signature">Digital Signature ({form.headOfSchoolTitle || 'Headteacher'})</label>
                                                <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginTop: 8 }}>
                                                    {form.headteacherSignature && (
                                                        <img src={form.headteacherSignature} style={{ height: 50, border: '1px solid var(--border-color)', borderRadius: 4 }} alt="Headteacher Signature Preview" />
                                                    )}
                                                    <input
                                                        id="headteacher-signature"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setForm({ ...form, headteacherSignature: reader.result as string });
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="finance-signature">Digital Signature / Stamp (Finance)</label>
                                                <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginTop: 8 }}>
                                                    {form.financeSignature && (
                                                        <img src={form.financeSignature} style={{ height: 50, border: '1px solid var(--border-color)', borderRadius: 4 }} alt="Finance Signature Preview" />
                                                    )}
                                                    <input
                                                        id="finance-signature"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setForm({ ...form, financeSignature: reader.result as string });
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="setting-row">
                                                <span className="setting-label">Logo</span>
                                                <span className="setting-value">
                                                    {settings.logo ? <img src={settings.logo} style={{ height: 40 }} alt="School Logo" /> : 'Not Set'}
                                                </span>
                                            </div>
                                            <div className="setting-row"><span className="setting-label">School Name</span><span className="setting-value">{settings.schoolName}</span></div>
                                            <div className="setting-row"><span className="setting-label">Motto</span><span className="setting-value">{settings.motto}</span></div>
                                            <div className="setting-row"><span className="setting-label">Phone</span><span className="setting-value">{settings.phone}</span></div>
                                            <div className="setting-row"><span className="setting-label">Email</span><span className="setting-value">{settings.email}</span></div>
                                            <div className="setting-row"><span className="setting-label">Address</span><span className="setting-value">{settings.address}</span></div>
                                            <div className="setting-row"><span className="setting-label">P.O. Box</span><span className="setting-value">{settings.poBox || 'Not Set'}</span></div>
                                            <div className="setting-row"><span className="setting-label">Telephone</span><span className="setting-value">{settings.telephone || 'Not Set'}</span></div>
                                            <div className="setting-row"><span className="setting-label">Paybill Number</span><span className="setting-value">{settings.paybillNumber || 'Not Set'}</span></div>
                                            <div className="setting-row">
                                                <span className="setting-label">{settings.headOfSchoolTitle || 'Headteacher'} Signature</span>
                                                <span className="setting-value">
                                                    {settings.headteacherSignature ? (
                                                        <img src={settings.headteacherSignature} style={{ height: 30, verticalAlign: 'middle' }} alt={`${settings.headOfSchoolTitle || 'Headteacher'} Signature`} />
                                                    ) : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Not Set</span>}
                                                </span>
                                            </div>
                                            <div className="setting-row">
                                                <span className="setting-label">Finance Signature / Stamp</span>
                                                <span className="setting-value">
                                                    {settings.financeSignature ? (
                                                        <img src={settings.financeSignature} style={{ height: 30, verticalAlign: 'middle' }} alt="Finance Signature" />
                                                    ) : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Not Set</span>}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="admin-section academic-settings-container">
                                    <h3 style={{ color: 'var(--primary-color)', borderBottom: '2px solid var(--primary-color)', paddingBottom: 10, marginBottom: 20 }}>
                                        <SettingsIcon style={{ fontSize: 22, verticalAlign: 'middle', marginRight: 8 }} />
                                        Academic Cycle
                                    </h3>
                                    {editing ? (
                                        <>
                                            <div className="form-group" style={{ marginBottom: 15 }}>
                                                <label htmlFor="current-term">Current Term</label>
                                                <select id="current-term" title="Select Current Term" className="form-control" value={form.currentTerm} onChange={e => setForm({ ...form, currentTerm: e.target.value })}>
                                                    <option>Term 1</option>
                                                    <option>Term 2</option>
                                                    <option>Term 3</option>
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 15 }}>
                                                <label htmlFor="current-year">Current Year</label>
                                                <input id="current-year" className="form-control" type="number" value={form.currentYear} onChange={e => setForm({ ...form, currentYear: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 15 }}>
                                                <label>Active School Levels</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 5 }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={form.earlyYearsEnabled} onChange={e => setForm({ ...form, earlyYearsEnabled: e.target.checked })} />
                                                        Early Years (Playgroup - PP2)
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={form.primaryEnabled} onChange={e => setForm({ ...form, primaryEnabled: e.target.checked })} />
                                                        Primary School
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={form.jssEnabled} onChange={e => setForm({ ...form, jssEnabled: e.target.checked })} />
                                                        Junior Secondary (JSS)
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={form.sssEnabled} onChange={e => setForm({ ...form, sssEnabled: e.target.checked })} />
                                                        Senior Secondary (SSS)
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 15 }}>
                                                <label>Timetable Management</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 5 }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={form.autoTimetableEnabled} onChange={e => setForm({ ...form, autoTimetableEnabled: e.target.checked })} />
                                                        Enable Auto Generator
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={form.manualTimetableBuilderEnabled} onChange={e => setForm({ ...form, manualTimetableBuilderEnabled: e.target.checked })} />
                                                        Enable Manual Builder
                                                    </label>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="setting-row"><span className="setting-label">Current Term</span><span className="setting-value">{settings.currentTerm}</span></div>
                                            <div className="setting-row"><span className="setting-label">Current Year</span><span className="setting-value">{settings.currentYear}</span></div>
                                            <div className="setting-row">
                                                <span className="setting-label">Active Levels</span>
                                                <span className="setting-value">
                                                    {[
                                                        settings.earlyYearsEnabled && 'Early Years',
                                                        settings.primaryEnabled && 'Primary',
                                                        settings.jssEnabled && 'JSS',
                                                        settings.sssEnabled && 'SSS'
                                                    ].filter(Boolean).join(', ') || 'None'}
                                                </span>
                                            </div>
                                            <div className="setting-row">
                                                <span className="setting-label">Timetable Features</span>
                                                <span className="setting-value">
                                                    {[
                                                        settings.autoTimetableEnabled && 'Auto-Generated',
                                                        settings.manualTimetableBuilderEnabled && 'Manual Builder'
                                                    ].filter(Boolean).join(', ') || 'Disabled'}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <h3 style={{ margin: 0 }}><SchoolIcon style={{ fontSize: 22 }} /> Bulk Data Components</h3>
                                    </div>
                                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', padding: 0 }}>
                                        <div className="card" style={{ background: 'var(--bg-surface)' }}>
                                            <h4 style={{ margin: '0 0 12px' }}>Students</h4>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <input type="file" id="upload-students" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadStudents(e.target.files[0])} />
                                                <button className="btn-primary" style={{ flex: 1 }} onClick={() => document.getElementById('upload-students')?.click()}>Upload File</button>
                                                <button className="btn-outline" onClick={() => downloadTemplate('students')}>Template</button>
                                            </div>
                                        </div>
                                        <div className="card" style={{ background: 'var(--bg-surface)' }}>
                                            <h4 style={{ margin: '0 0 12px' }}>Teachers</h4>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <input type="file" id="upload-teachers" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadTeachers(e.target.files[0])} />
                                                <button className="btn-primary" style={{ flex: 1 }} onClick={() => document.getElementById('upload-teachers')?.click()}>Upload File</button>
                                                <button className="btn-outline" onClick={() => downloadTemplate('teachers')}>Template</button>
                                            </div>
                                        </div>
                                        <div className="card" style={{ background: 'var(--bg-surface)' }}>
                                            <h4 style={{ margin: '0 0 12px' }}>Exams</h4>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <input type="file" id="upload-exams" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadExams(e.target.files[0])} />
                                                <button className="btn-primary" style={{ flex: 1 }} onClick={() => document.getElementById('upload-exams')?.click()}>Upload File</button>
                                                <button className="btn-outline" onClick={() => downloadTemplate('exams')}>Template</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="danger-zone">
                                    <div>
                                        <h3 className="danger-zone-title"><SecurityIcon style={{ fontSize: 22 }} /> Danger Zone</h3>
                                        <p>Caution: These actions are permanent and cannot be undone.</p>
                                    </div>
                                    <button className="btn-primary" style={{ background: '#c53030', borderColor: '#c53030' }} onClick={() => { if (window.confirm('CRITICAL WARNING: Clear everything?')) clearAllData(); }}>
                                        Clear All System Data
                                    </button>
                                </div>
                            </>
                        )}

                        {activeTab === 'timetable' && (
                            <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ margin: 0 }}><SchoolIcon style={{ fontSize: 22 }} /> Timetable Structure Setup</h3>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button className="btn-outline" onClick={() => { if (confirm('Reset slots to common school standards?')) setForm({ ...form, timeSlots: defaultTimeSlots }); }} style={{ fontSize: 13, padding: '6px 12px' }}>
                                            Restore Common Slots
                                        </button>
                                        <button className="btn-primary" onClick={() => setEditing(!editing)}>
                                            {editing ? 'Cancel' : 'Configure Slots'}
                                        </button>
                                    </div>
                                </div>

                                {editing ? (
                                    <div className="card" style={{ background: 'var(--bg-surface)' }}>
                                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                                            Define your school's daily periods, breaks, and lunch times. These will be used to render the timetable grid for all grades.
                                        </p>
                                        <div className="table-wrapper">
                                            <table className="data-table">
                                                <thead className="sticky-header">
                                                    <tr>
                                                        <th style={{ width: 80 }}>Order</th>
                                                        <th>Start Time</th>
                                                        <th>End Time</th>
                                                        <th>Label/Name</th>
                                                        <th>Type</th>
                                                        <th style={{ width: 100 }}>Status</th>
                                                        <th style={{ width: 60 }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(form.timeSlots || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((slot: any, idx: number) => (
                                                        <tr key={slot.id || idx}>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    style={{ padding: '4px 8px' }}
                                                                    title="Sort Order"
                                                                    value={slot.order || idx + 1}
                                                                    onChange={e => {
                                                                        const newSlots = [...(form.timeSlots || [])];
                                                                        newSlots[idx].order = parseInt(e.target.value);
                                                                        setForm({ ...form, timeSlots: newSlots });
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="time"
                                                                    className="form-control"
                                                                    title="Start Time"
                                                                    value={slot.startTime || ''}
                                                                    onChange={e => {
                                                                        const newSlots = [...(form.timeSlots || [])];
                                                                        newSlots[idx].startTime = e.target.value;
                                                                        newSlots[idx].label = `${e.target.value} - ${newSlots[idx].endTime || ''}`;
                                                                        setForm({ ...form, timeSlots: newSlots });
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="time"
                                                                    className="form-control"
                                                                    title="End Time"
                                                                    value={slot.endTime || ''}
                                                                    onChange={e => {
                                                                        const newSlots = [...(form.timeSlots || [])];
                                                                        newSlots[idx].endTime = e.target.value;
                                                                        newSlots[idx].label = `${newSlots[idx].startTime || ''} - ${e.target.value}`;
                                                                        setForm({ ...form, timeSlots: newSlots });
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    className="form-control"
                                                                    placeholder="e.g. Morning Break"
                                                                    title="Slot Label"
                                                                    value={slot.name || ''}
                                                                    onChange={e => {
                                                                        const newSlots = [...(form.timeSlots || [])];
                                                                        newSlots[idx].name = e.target.value;
                                                                        setForm({ ...form, timeSlots: newSlots });
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <select
                                                                    title="Slot Type"
                                                                    className="form-control"
                                                                    value={slot.type}
                                                                    onChange={e => {
                                                                        const newSlots = [...(form.timeSlots || [])];
                                                                        newSlots[idx].type = e.target.value as any;
                                                                        setForm({ ...form, timeSlots: newSlots });
                                                                    }}
                                                                >
                                                                    <option value="Lesson">Lesson</option>
                                                                    <option value="Break">Break</option>
                                                                    <option value="Lunch">Lunch</option>
                                                                    <option value="Assembly">Assembly</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <select
                                                                    title="Status"
                                                                    className="form-control"
                                                                    value={slot.isActive === false ? 'false' : 'true'}
                                                                    onChange={e => {
                                                                        const newSlots = [...(form.timeSlots || [])];
                                                                        newSlots[idx].isActive = e.target.value === 'true';
                                                                        setForm({ ...form, timeSlots: newSlots });
                                                                    }}
                                                                >
                                                                    <option value="true">Active</option>
                                                                    <option value="false">Inactive</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    title="Delete Slot"
                                                                    className="table-action-btn danger"
                                                                    onClick={() => {
                                                                        const newSlots = (form.timeSlots || []).filter((_: any, i: number) => i !== idx);
                                                                        setForm({ ...form, timeSlots: newSlots });
                                                                    }}
                                                                >
                                                                    <DeleteIcon style={{ fontSize: 18 }} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <button
                                            className="btn-outline"
                                            style={{ marginTop: 20 }}
                                            onClick={() => {
                                                const nextOrder = (form.timeSlots || []).length + 1;
                                                const newSlots = [...(form.timeSlots || []), {
                                                    id: `new-${Date.now()}`,
                                                    startTime: '08:00',
                                                    endTime: '08:40',
                                                    label: '08:00 - 08:40',
                                                    type: 'Lesson' as any,
                                                    order: nextOrder,
                                                    isActive: true
                                                }];
                                                setForm({ ...form, timeSlots: newSlots });
                                            }}
                                        >
                                            + Add New Time Slot
                                        </button>
                                    </div>
                                ) : (
                                    <div className="card" style={{ background: 'var(--bg-surface)' }}>
                                        <div className="table-wrapper">
                                            <table className="data-table">
                                                <thead className="sticky-header">
                                                    <tr>
                                                        <th style={{ width: 80 }}>Order</th>
                                                        <th>Time Range</th>
                                                        <th>Label/Name</th>
                                                        <th>Type</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(settings.timeSlots || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((slot: any) => (
                                                        <tr key={slot.id} style={{ opacity: slot.isActive === false ? 0.5 : 1 }}>
                                                            <td>{slot.order}</td>
                                                            <td>{slot.startTime} - {slot.endTime}</td>
                                                            <td>{slot.name || '-'}</td>
                                                            <td><span className={`badge ${slot.type === 'Lesson' ? 'blue' : 'green'}`}>{slot.type}</span></td>
                                                            <td>
                                                                <span className={`badge ${slot.isActive !== false ? 'green' : 'gray'}`}>
                                                                    {slot.isActive !== false ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!settings.timeSlots || settings.timeSlots.length === 0) && (
                                                        <tr>
                                                            <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>
                                                                No time slots configured. Click "Edit Configuration" to start.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ margin: 0 }}><PersonIcon style={{ fontSize: 22 }} /> User Management</h3>
                                    {selectedUserId && (
                                        <button className="btn-primary" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} onClick={() => {
                                            const u = systemUsers.find(u => u.id === selectedUserId);
                                            if (u) startEditUser(u);
                                        }}>
                                            View/Assign Roles
                                        </button>
                                    )}
                                </div>

                                {/* Toolbar - Screenshot Style */}
                                <div className="user-toolbar">
                                    <button className="toolbar-btn" onClick={() => {
                                        setShowAddUser(!showAddUser);
                                        if (!showAddUser) {
                                            setUserForm({ firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Teacher', roleId: '', permissions: [] });
                                        }
                                    }}>
                                        <AddIcon style={{ fontSize: 18, color: '#27ae60' }} /> Add
                                    </button>
                                    <button
                                        className={`toolbar-btn ${!selectedUserId ? 'disabled' : ''}`}
                                        disabled={!selectedUserId}
                                        onClick={() => {
                                            const u = systemUsers.find(u => u.id === selectedUserId);
                                            if (u) startEditUser(u);
                                        }}
                                    >
                                        <EditIcon style={{ fontSize: 18, color: '#2980b9' }} /> Edit
                                    </button>
                                    <button
                                        className={`toolbar-btn ${!selectedUserId ? 'disabled' : ''}`}
                                        disabled={!selectedUserId}
                                        onClick={() => {
                                            const u = systemUsers.find(u => u.id === selectedUserId);
                                            if (u) handleDeleteUser(u.id, u.name);
                                        }}
                                    >
                                        <DeleteIcon style={{ fontSize: 18, color: '#e74c3c' }} /> Delete
                                    </button>
                                    <div className="toolbar-divider"></div>
                                    <div className="search-input-wrapper" style={{ maxWidth: 300 }}>
                                        <SearchIcon className="search-icon" />
                                        <input
                                            className="search-input"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {showAddUser && (
                                    <div className="card" style={{ background: 'var(--bg-surface)', marginBottom: 0, borderRadius: 0, borderTop: 'none', border: '1px solid var(--border-color)' }}>
                                        <h4 style={{ margin: '0 0 16px' }}>{editingUser ? 'Edit User' : 'Add New System User'}</h4>
                                        <div className="form-row">
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>First Name</label>
                                                <input className="form-control" value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} placeholder="First Name" />
                                            </div>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>Last Name</label>
                                                <input className="form-control" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} placeholder="Last Name" />
                                            </div>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>Username</label>
                                                <input className="form-control" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} placeholder="Username" />
                                            </div>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>System Password</label>
                                                <input className="form-control" type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" />
                                            </div>
                                        </div>
                                        <div className="form-row" style={{ marginTop: 15 }}>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>Email Address</label>
                                                <input className="form-control" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="email@example.com" />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="user-role">Role</label>
                                                <select
                                                    id="user-role"
                                                    className="form-control"
                                                    value={userForm.roleId || ''}
                                                    onChange={e => {
                                                        const selectedRole = roles.find(r => r.id === e.target.value);
                                                        setUserForm({ ...userForm, roleId: e.target.value, role: selectedRole?.name || '' });
                                                    }}
                                                >
                                                    <option value="">Select Role</option>
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group" style={{ marginTop: 15 }}>
                                            <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>Permissions & Access Rights</label>
                                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                {PERMISSIONS.map(perm => (
                                                    <label key={perm.code} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        fontSize: 12,
                                                        cursor: 'pointer',
                                                        padding: '6px 12px',
                                                        background: userForm.permissions.includes(perm.code) ? 'rgba(52, 152, 219, 0.1)' : 'var(--bg-body)',
                                                        borderRadius: '4px',
                                                        border: userForm.permissions.includes(perm.code) ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={userForm.permissions.includes(perm.code)}
                                                            onChange={e => {
                                                                if (e.target.checked) setUserForm({ ...userForm, permissions: [...userForm.permissions, perm.code] });
                                                                else setUserForm({ ...userForm, permissions: userForm.permissions.filter(p => p !== perm.code) });
                                                            }}
                                                        />
                                                        {perm.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button className="btn-outline" onClick={() => setShowAddUser(false)}>Cancel</button>
                                                <button className="btn-primary green" onClick={handleAddUser}>{editingUser ? 'Save Changes' : 'Create User'}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="user-management-table-wrapper table-wrapper">
                                    <table className="data-table">
                                        <thead className="sticky-header">
                                            <tr>
                                                <th style={{ width: '18%' }}>First Name</th>
                                                <th style={{ width: '18%' }}>Last Name</th>
                                                <th style={{ width: '18%' }}>Username</th>
                                                <th style={{ width: '25%' }}>Email</th>
                                                <th style={{ width: '21%' }}>User updated</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {systemUsers.filter(u =>
                                                (u.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                                (u.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                                (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                                (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                                            ).map(u => (
                                                <tr
                                                    key={u.id}
                                                    className={selectedUserId === u.id ? 'selected-row' : ''}
                                                    onClick={() => setSelectedUserId(u.id === selectedUserId ? null : u.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>{u.firstName || u.name?.split(' ')[0] || 'N/A'}</td>
                                                    <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>{u.lastName || u.name?.split(' ').slice(1).join(' ') || 'N/A'}</td>
                                                    <td style={{ color: selectedUserId === u.id ? 'white' : 'var(--accent-blue)', textTransform: 'uppercase' }}>{u.username || 'N/A'}</td>
                                                    <td>{u.email || 'No email'}</td>
                                                    <td>{u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : '01/01/2026'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'fees' && (
                            <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <div>
                                        <h3 style={{ margin: 0 }}>Fee Structure Breakdown</h3>
                                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                                            Changes are saved as <strong>drafts</strong>. Use the "Publish" button under each grade to apply them.
                                        </p>
                                    </div>
                                </div>
                                <div className="card" style={{ background: 'var(--bg-surface)', marginBottom: 20 }}>
                                    <h4 style={{ margin: '0 0 10px' }}>Add Fee Item</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Grade</label>
                                            <select
                                                title="Select Grade for Fee Item"
                                                className="form-control"
                                                value={feeForm.grade}
                                                onChange={e => setFeeForm({ ...feeForm, grade: e.target.value })}
                                            >
                                                {activeGrades.map(g => <option key={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Item Name (e.g. Tuition, Lunch)</label>
                                            <input className="form-control" value={feeForm.name} onChange={e => setFeeForm({ ...feeForm, name: e.target.value })} placeholder="e.g. Transport" />
                                        </div>
                                        <div className="form-group" style={{ width: 120 }}>
                                            <label htmlFor="fee-amount">Amount (KSh)</label>
                                            <input id="fee-amount" className="form-control" type="number" title="Fee Amount" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: parseInt(e.target.value) })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Term</label>
                                            <select
                                                title="Select Term for Fee Item"
                                                className="form-control"
                                                value={feeForm.term}
                                                onChange={e => setFeeForm({ ...feeForm, term: e.target.value })}
                                            >
                                                <option>Term 1</option>
                                                <option>Term 2</option>
                                                <option>Term 3</option>
                                            </select>
                                        </div>
                                        <div style={{ alignSelf: 'flex-end', paddingBottom: 10, display: 'flex', gap: 10 }}>
                                            {editingFeeItem && (
                                                <button className="btn-outline" onClick={() => { setEditingFeeItem(null); setFeeForm({ ...feeForm, name: '', amount: 0 }); }}>Cancel</button>
                                            )}
                                            <button className="btn-primary" onClick={handleAddFeeItem}>
                                                {editingFeeItem ? 'Update Item' : 'Add Item'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {sortedGrades.map(grade => {
                                    const gradeItems = groupedFees[grade];
                                    const grandTotal = gradeItems.reduce((sum: number, item: any) => sum + item.amount, 0);
                                    const terms = ['Term 1', 'Term 2', 'Term 3'];
                                    const isPublished = gradeItems.some((item: any) => item.status === 'Published');

                                    return (
                                        <div key={grade} className="card" style={{ marginBottom: 20, background: 'var(--bg-surface)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                                <div>
                                                    <h4 style={{ margin: 0 }}>{grade} Structure</h4>
                                                    {isPublished ? (
                                                        <span className="badge green" style={{ fontSize: 10, marginTop: 4 }}>Published</span>
                                                    ) : (
                                                        <span className="badge gray" style={{ fontSize: 10, marginTop: 4 }}>Draft</span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                                    <button
                                                        className="btn-outline"
                                                        style={{ fontSize: 12, padding: '6px 12px' }}
                                                        onClick={() => setPreviewGrade(grade as string)}
                                                    >
                                                        Preview
                                                    </button>
                                                    {isPublished ? (
                                                        <button
                                                            className="btn-outline danger"
                                                            style={{ fontSize: 12, padding: '6px 12px' }}
                                                            onClick={async () => {
                                                                if (confirm(`Are you sure you want to revert ${grade} fees to draft? This will lock editing but not change student balances until re-published.`)) {
                                                                    await revertFeeStructure(grade as string);
                                                                }
                                                            }}
                                                        >
                                                            Revert to Draft
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn-primary"
                                                            style={{ fontSize: 12, padding: '6px 12px' }}
                                                            onClick={async () => {
                                                                if (confirm(`Are you sure you want to publish the fee structure for ${grade}? This will update all student balances.`)) {
                                                                    setIsPublishing(true);
                                                                    await applyFeeStructure(grade as string);
                                                                    setIsPublishing(false);
                                                                }
                                                            }}
                                                            disabled={isPublishing || gradeItems.length === 0}
                                                        >
                                                            Publish {grade} Fees
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {terms.map(term => {
                                                const termItems = gradeItems.filter((item: any) => item.term === term);
                                                if (termItems.length === 0) return null;
                                                const subtotal = termItems.reduce((sum: number, item: any) => sum + item.amount, 0);

                                                return (
                                                    <div key={term} style={{ marginBottom: 20 }}>
                                                        <h5 style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: 14 }}>{term}</h5>
                                                        <div className="table-wrapper">
                                                            <table className="data-table">
                                                                <thead className="sticky-header">
                                                                    <tr>
                                                                        <th>Item Name</th>
                                                                        <th>Amount</th>
                                                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {termItems.map((item: any) => (
                                                                        <tr key={item.id}>
                                                                            <td>{item.name}</td>
                                                                            <td>KES {item.amount.toLocaleString()}</td>
                                                                            <td style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                                                <button
                                                                                    title="Edit Fee Item"
                                                                                    className="table-action-btn primary"
                                                                                    onClick={() => startEditFeeItem(item)}
                                                                                    disabled={isPublished}
                                                                                >
                                                                                    <EditIcon style={{ fontSize: 16 }} />
                                                                                </button>
                                                                                <button
                                                                                    title="Delete Fee Item"
                                                                                    className="table-action-btn danger"
                                                                                    onClick={() => {
                                                                                        if (confirm('Delete this fee item?')) deleteFeeStructure(item.id);
                                                                                    }}
                                                                                    disabled={isPublished}
                                                                                >
                                                                                    <DeleteIcon style={{ fontSize: 16 }} />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    <tr style={{ background: 'rgba(52, 152, 219, 0.05)', fontWeight: 'bold' }}>
                                                                        <td>{term} Subtotal</td>
                                                                        <td colSpan={2}>KES {subtotal.toLocaleString()}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div style={{
                                                marginTop: 10,
                                                padding: '15px',
                                                background: 'var(--accent-blue)',
                                                color: 'white',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ fontWeight: 600 }}>GRAND TOTAL ({grade})</span>
                                                <span style={{ fontSize: 20, fontWeight: 800 }}>KES {grandTotal.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {previewGrade && (
                                    <div className="modal-overlay">
                                        <div className="modal-content" style={{ maxWidth: 600 }}>
                                            <div style={{ textAlign: 'center', borderBottom: '2px solid #eee', paddingBottom: 20, marginBottom: 20 }}>
                                                <h2 style={{ margin: 0, color: 'var(--accent-blue)' }}>{settings.schoolName}</h2>
                                                <p style={{ margin: '5px 0', fontSize: 14 }}>{settings.motto}</p>
                                                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                                                    {settings.address} | Tel: {settings.phone}
                                                </p>
                                            </div>
                                            <h3 style={{ textAlign: 'center', textTransform: 'uppercase' }}>Official Fee Structure - {previewGrade}</h3>

                                            {['Term 1', 'Term 2', 'Term 3'].map(term => {
                                                const termItems = groupedFees[previewGrade!].filter((item: any) => item.term === term);
                                                if (termItems.length === 0) return null;
                                                const subtotal = termItems.reduce((sum: number, item: any) => sum + item.amount, 0);

                                                return (
                                                    <div key={term} style={{ marginBottom: 15 }}>
                                                        <h4 style={{ borderBottom: '1px solid #ddd', paddingBottom: 5 }}>{term}</h4>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                            {termItems.map((item: any) => (
                                                                <tr key={item.id} style={{ borderBottom: '1px dashed #eee' }}>
                                                                    <td style={{ padding: '8px 0' }}>{item.name}</td>
                                                                    <td style={{ padding: '8px 0', textAlign: 'right' }}>KES {item.amount.toLocaleString()}</td>
                                                                </tr>
                                                            ))}
                                                            <tr style={{ fontWeight: 'bold' }}>
                                                                <td style={{ padding: '10px 0' }}>Total for {term}</td>
                                                                <td style={{ padding: '10px 0', textAlign: 'right' }}>KES {subtotal.toLocaleString()}</td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                );
                                            })}

                                            <div style={{
                                                marginTop: 30,
                                                borderTop: '2px solid var(--accent-blue)',
                                                paddingTop: 15,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <h3 style={{ margin: 0 }}>ANNUAL GRAND TOTAL</h3>
                                                <h3 style={{ margin: 0, color: 'var(--accent-blue)' }}>
                                                    KES {groupedFees[previewGrade!].reduce((sum: number, item: any) => sum + item.amount, 0).toLocaleString()}
                                                </h3>
                                            </div>

                                            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
                                                <button className="btn-primary" onClick={() => setPreviewGrade(null)}>Close Preview</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {feeStructures.length === 0 && (
                                    <div className="empty-state">
                                        <p>No fee items added yet. Use the form above to build the structure.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'audit' && (
                            <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                                        <h3 style={{ margin: 0 }}><SecurityIcon style={{ fontSize: 22 }} /> System Audit Trail</h3>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <select
                                                title="Filter by Module"
                                                className="form-control"
                                                style={{ width: 150, height: 35, fontSize: 13 }}
                                                value={auditFilters.module}
                                                onChange={e => setAuditFilters({ ...auditFilters, module: e.target.value })}
                                            >
                                                <option value="">All Modules</option>
                                                <option value="students">Students</option>
                                                <option value="teachers">Teachers</option>
                                                <option value="fees">Fees</option>
                                                <option value="exams">Exams</option>
                                                <option value="users">Users</option>
                                                <option value="settings">Settings</option>
                                            </select>
                                            <select
                                                title="Filter by Action"
                                                className="form-control"
                                                style={{ width: 130, height: 35, fontSize: 13 }}
                                                value={auditFilters.action}
                                                onChange={e => setAuditFilters({ ...auditFilters, action: e.target.value })}
                                            >
                                                <option value="">All Actions</option>
                                                {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button className="btn-outline" onClick={() => {
                                            const headers = ['Timestamp', 'UserName', 'Role', 'Module', 'Action', 'Details', 'IP Address'];
                                            const data = auditLogs.map(log => [
                                                new Date(log.createdAt).toLocaleString(),
                                                log.userName,
                                                log.userRole || '',
                                                log.module || '',
                                                log.action,
                                                log.details,
                                                log.ipAddress || ''
                                            ]);
                                            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
                                            const wb = XLSX.utils.book_new();
                                            XLSX.utils.book_append_sheet(wb, ws, "AuditLogs");
                                            XLSX.writeFile(wb, "audit_logs.xlsx");
                                        }}>
                                            Export to Excel
                                        </button>
                                        <button className="btn-outline" onClick={fetchAuditLogs}>Refresh</button>
                                    </div>
                                </div>
                                <div className="table-wrapper">
                                    <table className="data-table">
                                        <thead className="sticky-header">
                                            <tr>
                                                <th style={{ width: 160 }}>Timestamp</th>
                                                <th>User & Role</th>
                                                <th>Module</th>
                                                <th>Action</th>
                                                <th>Details</th>
                                                <th style={{ width: 80 }}>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs
                                                .filter(log => !auditFilters.module || log.module === auditFilters.module)
                                                .filter(log => !auditFilters.action || log.action === auditFilters.action)
                                                .length > 0 ? auditLogs
                                                    .filter(log => !auditFilters.module || log.module === auditFilters.module)
                                                    .filter(log => !auditFilters.action || log.action === auditFilters.action)
                                                    .map(log => (
                                                        <tr key={log.id}>
                                                            <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                                                {new Date(log.createdAt).toLocaleString()}
                                                            </td>
                                                            <td>
                                                                <div style={{ fontWeight: 600 }}>{log.userName}</div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{log.userRole || 'User'}</div>
                                                            </td>
                                                            <td>
                                                                {log.module ? <span className="badge blue" style={{ fontSize: 10 }}>{log.module.toUpperCase()}</span> : '-'}
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${log.action === 'DELETE' ? 'red' :
                                                                    log.action === 'CREATE' ? 'green' :
                                                                        log.action === 'EDIT' ? 'orange' : 'blue'
                                                                    }`}>
                                                                    {log.action}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontSize: 13 }}>
                                                                {log.details}
                                                                {log.ipAddress && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>IP: {log.ipAddress}</div>}
                                                            </td>
                                                            <td>
                                                                {(log.oldValue || log.newValue) && (
                                                                    <button
                                                                        className="table-action-btn primary"
                                                                        title="View Changes"
                                                                        onClick={() => setSelectedLog(log)}
                                                                    >
                                                                        <SearchIcon style={{ fontSize: 18 }} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>No audit logs found matching criteria.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {selectedLog && (
                            <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
                                <div className="modal-content" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <h3 style={{ margin: 0 }}>Audit Event Details</h3>
                                        <button className="table-action-btn danger" onClick={() => setSelectedLog(null)}><DeleteIcon style={{ rotate: '45deg' }} /></button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                                        <div className="card" style={{ background: 'var(--bg-surface)', padding: 15 }}>
                                            <h5 style={{ margin: '0 0 10px', color: 'var(--text-secondary)' }}>Event Info</h5>
                                            <div className="setting-row"><span className="setting-label">Timestamp</span><span className="setting-value">{new Date(selectedLog.createdAt).toLocaleString()}</span></div>
                                            <div className="setting-row"><span className="setting-label">Action</span><span className="setting-value">{selectedLog.action}</span></div>
                                            <div className="setting-row"><span className="setting-label">Module</span><span className="setting-value">{selectedLog.module || 'System'}</span></div>
                                        </div>
                                        <div className="card" style={{ background: 'var(--bg-surface)', padding: 15 }}>
                                            <h5 style={{ margin: '0 0 10px', color: 'var(--text-secondary)' }}>User Info</h5>
                                            <div className="setting-row"><span className="setting-label">User</span><span className="setting-value">{selectedLog.userName}</span></div>
                                            <div className="setting-row"><span className="setting-label">Role</span><span className="setting-value">{selectedLog.userRole || 'N/A'}</span></div>
                                            <div className="setting-row"><span className="setting-label">IP Address</span><span className="setting-value">{selectedLog.ipAddress || 'Unknown'}</span></div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Action Details</label>
                                        <div style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 4, fontSize: 14 }}>
                                            {selectedLog.details}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
                                        <div className="form-group">
                                            <label>Old Value</label>
                                            <pre style={{
                                                padding: 10,
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 4,
                                                fontSize: 12,
                                                maxHeight: 200,
                                                overflow: 'auto',
                                                color: '#e74c3c'
                                            }}>
                                                {selectedLog.oldValue ? JSON.stringify(selectedLog.oldValue, null, 2) : 'None'}
                                            </pre>
                                        </div>
                                        <div className="form-group">
                                            <label>New Value</label>
                                            <pre style={{
                                                padding: 10,
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 4,
                                                fontSize: 12,
                                                maxHeight: 200,
                                                overflow: 'auto',
                                                color: '#27ae60'
                                            }}>
                                                {selectedLog.newValue ? JSON.stringify(selectedLog.newValue, null, 2) : 'None'}
                                            </pre>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30 }}>
                                        <button className="btn-primary" onClick={() => setSelectedLog(null)}>Close Details</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'roles' && (
                            <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ margin: 0 }}><SecurityIcon style={{ fontSize: 22 }} /> Role & Permission Management</h3>
                                    <button className="btn-primary" onClick={() => { setEditingRole(null); setRoleForm({ name: '', permissions: {} }); setShowAddRole(true); }}>
                                        <AddIcon style={{ fontSize: 18 }} /> Add Custom Role
                                    </button>
                                </div>

                                {showAddRole && (
                                    <div className="card" style={{ background: 'var(--bg-surface)', marginBottom: 25, border: '1px solid var(--primary-color)' }}>
                                        <h4 style={{ marginTop: 0 }}>{editingRole ? 'Edit Role' : 'Create New Role'}</h4>
                                        <div className="form-grid">
                                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                <label>Role Name</label>
                                                <input className="form-control" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="e.g. Finance Manager" />
                                            </div>
                                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                <label style={{ marginBottom: 15, display: 'block' }}>Permissions per Module</label>
                                                <div className="table-wrapper">
                                                    <table className="data-table">
                                                        <thead className="sticky-header">
                                                            <tr>
                                                                <th>Module</th>
                                                                {ACTIONS.map(a => <th key={a} style={{ textAlign: 'center', fontSize: 10 }}>{a}</th>)}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {MODULES.map(m => (
                                                                <tr key={m.id}>
                                                                    <td style={{ fontWeight: 500 }}>{m.label}</td>
                                                                    {ACTIONS.map(a => (
                                                                        <td key={a} style={{ textAlign: 'center' }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={roleForm.permissions[m.id]?.includes(a)}
                                                                                onChange={e => {
                                                                                    const current = roleForm.permissions[m.id] || [];
                                                                                    const next = e.target.checked
                                                                                        ? [...current, a]
                                                                                        : current.filter(x => x !== a);
                                                                                    setRoleForm({
                                                                                        ...roleForm,
                                                                                        permissions: { ...roleForm.permissions, [m.id]: next }
                                                                                    });
                                                                                }}
                                                                            />
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                            <button className="btn-primary" onClick={async () => {
                                                const success = editingRole
                                                    ? await updateRole(editingRole.id, roleForm)
                                                    : await addRole(roleForm);
                                                if (success) setShowAddRole(false);
                                            }}>
                                                <SaveIcon style={{ fontSize: 18 }} /> {editingRole ? 'Update Role' : 'Create Role'}
                                            </button>
                                            <button className="btn-outline" onClick={() => setShowAddRole(false)}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                <div className="card" style={{ background: 'var(--bg-surface)' }}>
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead className="sticky-header">
                                                <tr>
                                                    <th>Role Name</th>
                                                    <th>Permissions Summary</th>
                                                    <th>Assigned Users</th>
                                                    <th style={{ width: 100 }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {roles.map(r => (
                                                    <tr key={r.id}>
                                                        <td style={{ fontWeight: 'bold' }}>{r.name}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                                {Object.entries(r.permissions).map(([mod, perms]) => (
                                                                    perms.length > 0 && (
                                                                        <span key={mod} className="badge blue" style={{ fontSize: 10 }}>
                                                                            {mod}: {perms.length}
                                                                        </span>
                                                                    )
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td>{r._count?.users || 0}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: 8 }}>
                                                                <button className="table-action-btn" title="Edit" onClick={() => {
                                                                    setEditingRole(r);
                                                                    setRoleForm({ name: r.name, permissions: r.permissions });
                                                                    setShowAddRole(true);
                                                                }}>
                                                                    <EditIcon style={{ fontSize: 18 }} />
                                                                </button>
                                                                {r.name !== 'Super Admin' && (r._count?.users || 0) === 0 && (
                                                                    <button className="table-action-btn danger" title="Delete" onClick={() => deleteRole(r.id)}>
                                                                        <DeleteIcon style={{ fontSize: 18 }} />
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
                            </div>
                        )}

                        {activeTab === 'approvals' && (
                            <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <div>
                                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Centralized Approval Control</h2>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>Review and authorize school financial transactions</p>
                                    </div>
                                </div>

                                <div className="grid-2" style={{ gap: 24 }}>
                                    {/* Expenditure Approvals */}
                                    <div className="card">
                                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3><PaymentIcon style={{ fontSize: 18, color: 'var(--accent-blue)' }} /> Pending Expenditures</h3>
                                            <span className="badge blue">{expenses.filter((e: any) => e.status === 'Pending').length} Pending</span>
                                        </div>
                                        <div className="card-body" style={{ padding: 0 }}>
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Request</th>
                                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                                        <th style={{ textAlign: 'right' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {expenses.filter((e: any) => e.status === 'Pending').length > 0 ? expenses.filter((e: any) => e.status === 'Pending').map((exp: any) => (
                                                        <tr key={exp.id}>
                                                            <td>
                                                                <div style={{ fontWeight: 500 }}>{exp.description}</div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>By {exp.requestedByName}</div>
                                                            </td>
                                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{exp.amount.toLocaleString()}</td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                                    <button className="btn-outline-sm" style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)', padding: '4px 8px' }} onClick={async () => {
                                                                        await tryApi('/api/finance/expenses', { method: 'PUT', body: JSON.stringify({ id: exp.id, action: 'APPROVE' }) });
                                                                        showToast('Expense Approved', 'success');
                                                                    }} title="Approve">
                                                                        <CheckCircleIcon fontSize="small" />
                                                                    </button>
                                                                    <button className="btn-outline-sm" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)', padding: '4px 8px' }} onClick={async () => {
                                                                        await tryApi('/api/finance/expenses', { method: 'PUT', body: JSON.stringify({ id: exp.id, action: 'REJECT' }) });
                                                                        showToast('Expense Rejected', 'info');
                                                                    }} title="Reject">
                                                                        <CancelIcon fontSize="small" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={3} style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>No pending expenses</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Payroll Approvals */}
                                    <div className="card">
                                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3><GroupIcon style={{ fontSize: 18, color: 'var(--accent-purple)' }} /> Payroll for Approval</h3>
                                            <span className="badge purple">{payrollEntries.filter((p: any) => p.status === 'Reviewed').length} Awaiting Review</span>
                                        </div>
                                        <div className="card-body" style={{ padding: 0 }}>
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Staff Member</th>
                                                        <th style={{ textAlign: 'right' }}>Net Pay</th>
                                                        <th style={{ textAlign: 'right' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payrollEntries.filter((p: any) => p.status === 'Reviewed').length > 0 ? payrollEntries.filter((p: any) => p.status === 'Reviewed').map((entry: any) => (
                                                        <tr key={entry.id}>
                                                            <td>
                                                                <div style={{ fontWeight: 500 }}>{entry.staff?.firstName} {entry.staff?.lastName}</div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{entry.month}/{entry.year} Payroll</div>
                                                            </td>
                                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{entry.netPay.toLocaleString()}</td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={async () => {
                                                                    await tryApi('/api/finance/payroll', { method: 'PUT', body: JSON.stringify({ id: entry.id, status: 'Approved' }) });
                                                                    showToast('Payroll Approved', 'success');
                                                                }}>
                                                                    Approve
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={3} style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>No payroll awaiting approval</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="card" style={{ marginTop: 24 }}>
                                    <div className="card-header">
                                        <h3>Recent Approval Activity</h3>
                                    </div>
                                    <div className="card-body" style={{ padding: 0 }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Type</th>
                                                    <th>Description</th>
                                                    <th style={{ textAlign: 'right' }}>Value</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    ...expenses.filter((e: any) => e.status !== 'Pending').slice(0, 5).map((e: any) => ({ date: e.updatedAt || e.createdAt, type: 'Expense', desc: e.description, val: e.amount, status: e.status, color: e.status === 'Approved' ? 'blue' : e.status === 'Paid' ? 'green' : 'red' })),
                                                    ...payrollEntries.filter((p: any) => p.status === 'Approved' || p.status === 'Locked').slice(0, 5).map((p: any) => ({ date: p.updatedAt, type: 'Payroll', desc: `Salary for ${p.staff?.lastName}`, val: p.netPay, status: p.status, color: p.status === 'Approved' ? 'blue' : 'green' }))
                                                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((act, i) => (
                                                    <tr key={i}>
                                                        <td>{new Date(act.date).toLocaleDateString()}</td>
                                                        <td><span className="badge neutral">{act.type}</span></td>
                                                        <td>{act.desc}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{act.val.toLocaleString()}</td>
                                                        <td><span className={`badge ${act.color}`}>{act.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
