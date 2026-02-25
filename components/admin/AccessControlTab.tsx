import React, { useState } from 'react';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ShieldIcon from '@mui/icons-material/Shield';
import { useSchool } from '../../context/SchoolContext';
import { PERMISSIONS } from '../../components/layout/Sidebar';
import { Role } from '../../types';

export const AccessControlTab: React.FC = () => {
    const { roles, addRole, updateRole, deleteRole } = useSchool();
    const [showAddRole, setShowAddRole] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] as string[] });

    const handleSaveRole = () => {
        if (!roleForm.name) return;
        if (editingRole) {
            updateRole(editingRole.id, roleForm as any);
        } else {
            addRole(roleForm as any);
        }
        setRoleForm({ name: '', description: '', permissions: [] });
        setEditingRole(null);
        setShowAddRole(false);
    };

    const togglePermission = (code: string) => {
        setRoleForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(code)
                ? prev.permissions.filter(p => p !== code)
                : [...prev.permissions, code]
        }));
    };

    return (
        <div className="admin-section">
            <div className="flex-between" style={{ marginBottom: 20 }}>
                <h3 className="m-0"><ShieldIcon className="nav-icon" /> Role-Based Access Control</h3>
                <button className="btn-primary" onClick={() => { setEditingRole(null); setRoleForm({ name: '', description: '', permissions: [] }); setShowAddRole(true); }}>
                    <AddIcon style={{ fontSize: 18 }} /> Define New Role
                </button>
            </div>

            {showAddRole && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <h4 className="m-0">{editingRole ? `Editing Role: ${editingRole.name}` : 'Provision New System Role'}</h4>
                    </div>
                    <div className="card-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Role Nomenclature</label>
                                <input type="text" className="form-control" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="e.g. Academic Registrar" />
                            </div>
                            <div className="form-group">
                                <label>Operational Description</label>
                                <input type="text" className="form-control" value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Responsibilities and scope" />
                            </div>
                        </div>

                        <div className="mt-20">
                            <label className="fw-600 fs-14" style={{ display: 'block', marginBottom: 12 }}>Privilege Mapping</label>
                            <div className="card-grid">
                                {PERMISSIONS.map(pref => (
                                    <label key={pref.code} className="flex-row pointer" style={{ padding: '10px 15px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                                        <input type="checkbox" checked={(roleForm.permissions || []).includes(pref.code)} onChange={() => togglePermission(pref.code)} />
                                        <span className="fs-13">{pref.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex-row mt-24">
                            <button className="btn-primary" onClick={handleSaveRole}>Commit Role Logic</button>
                            <button className="btn-outline" onClick={() => setShowAddRole(false)}>Discard</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card p-0">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Security Role</th>
                            <th>Functional Description</th>
                            <th>Authorization Matrix</th>
                            <th className="text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(roles || []).map(r => (
                            <tr key={r.id}>
                                <td className="fw-600" style={{ color: 'var(--accent-blue)' }}>{r.name}</td>
                                <td className="fs-13">{r.description || 'General system access'}</td>
                                <td>
                                    <div className="flex-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                                        {(Array.isArray(r.permissions) ? r.permissions : []).slice(0, 5).map((p: any) => {
                                            const label = typeof p === 'string' ? p : (p as any)?.label || JSON.stringify(p);
                                            return <span key={typeof p === 'string' ? p : Math.random()} className="badge blue-light" style={{ fontSize: 10, borderRadius: 4 }}>{label}</span>
                                        })}
                                        {(r.permissions?.length || 0) > 5 && <span className="fs-10 opacity-60">+{r.permissions.length - 5} more</span>}
                                    </div>
                                </td>
                                <td className="text-right">
                                    <div className="flex-row gap-10 justify-end">
                                        <button className="btn-icon" title="Edit Role" onClick={() => { setEditingRole(r); setRoleForm({ name: r.name, description: r.description || '', permissions: Array.isArray(r.permissions) ? r.permissions : [] }); setShowAddRole(true); }}><EditIcon fontSize="small" /></button>
                                        <button className="btn-icon" title="Delete Role" onClick={() => deleteRole(r.id)} style={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></button>
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
