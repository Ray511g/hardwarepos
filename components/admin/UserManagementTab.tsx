import React, { useState } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BadgeIcon from '@mui/icons-material/Badge';
import { useSchool } from '../../context/SchoolContext';

export const UserManagementTab: React.FC = () => {
    const { systemUsers, addSystemUser, updateSystemUser, deleteSystemUser, resetUserPassword, roles } = useSchool();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userForm, setUserForm] = useState({
        firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Teacher', roleId: '', permissions: [] as string[]
    });

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
        const nameParts = (u.name || '').split(' ');
        const fName = nameParts[0] || '';
        const lName = nameParts.slice(1).join(' ') || '';
        setUserForm({
            firstName: u.firstName || fName,
            lastName: u.lastName || lName,
            username: u.username || '',
            password: '',
            name: u.name,
            email: u.email,
            role: u.role,
            roleId: u.roleId || '',
            permissions: u.permissions || []
        });
        setShowAddUser(true);
    };

    const filteredUsers = (systemUsers || []).filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-section">
            <div className="flex-between m-0" style={{ marginBottom: 20 }}>
                <h3 className="m-0"><BadgeIcon className="nav-icon" /> System User Directory</h3>
                <div className="flex-row gap-10">
                    <div className="search-box">
                        <SearchIcon style={{ fontSize: 18, color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Filter accounts..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => { setEditingUser(null); setUserForm({ firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Teacher', roleId: '', permissions: [] }); setShowAddUser(true); }}>
                        <AddIcon style={{ fontSize: 18 }} /> Create Account
                    </button>
                </div>
            </div>

            {showAddUser && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <h4 className="m-0">{editingUser ? 'Editing Account' : 'New Institutional Account'}</h4>
                    </div>
                    <div className="card-body">
                        <div className="grid-3">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" className="form-control" value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" className="form-control" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="form-control" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" className="form-control" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} />
                            </div>
                            {!editingUser && (
                                <div className="form-group">
                                    <label>Initial Password</label>
                                    <input type="password" placeholder="At least 6 characters" className="form-control" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Primary Role</label>
                                <select className="form-control" value={userForm.roleId} onChange={e => {
                                    const role = roles.find(r => r.id === e.target.value);
                                    setUserForm({ ...userForm, roleId: e.target.value, role: role?.name || 'Teacher', permissions: Array.isArray(role?.permissions) ? role.permissions : [] });
                                }}>
                                    <option value="">Select Defined Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex-row mt-20">
                            <button className="btn-primary" onClick={handleAddUser}>{editingUser ? 'Save Updates' : 'Provision Account'}</button>
                            <button className="btn-outline" onClick={() => setShowAddUser(false)}>Discard</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card p-0">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Institutional User</th>
                            <th>Identity</th>
                            <th>Department/Role</th>
                            <th>Level</th>
                            <th className="text-right">Management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="flex-row">
                                        <div className="avatar-mini" style={{ background: 'var(--accent-blue)', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>
                                            {(u.name || 'U').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="fw-600 fs-14">{u.name}</div>
                                            <div className="fs-12 opacity-60">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <code className="fs-12">{u.username}</code>
                                </td>
                                <td>
                                    <span className="badge blue-light" style={{ fontWeight: 500 }}>{u.role}</span>
                                </td>
                                <td>
                                    <span className={`badge ${u.status === 'Active' ? 'green' : 'gray'}`}>{u.status || 'Active'}</span>
                                </td>
                                <td className="text-right">
                                    <div className="flex-row justify-end gap-10">
                                        <button className="btn-icon" onClick={() => startEditUser(u)} title="Modify Account"><EditIcon fontSize="small" /></button>
                                        <button className="btn-icon" onClick={() => resetUserPassword(u.id)} title="Reset Security" style={{ color: '#f59e0b' }}><LockIcon fontSize="small" /></button>
                                        <button className="btn-icon" onClick={() => deleteSystemUser(u.id)} title="Revoke Access" style={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
