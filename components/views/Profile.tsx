import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SaveIcon from '@mui/icons-material/Save';

export default function Profile() {
    const { user } = useAuth();
    const { showToast } = useSchool();
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            showToast('New passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('elirama_token');
            const res = await fetch('/api/users/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            if (res.ok) {
                showToast('Password updated successfully');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to update password', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>My Account</h1>
                    <p>Manage your profile and security settings</p>
                </div>
            </div>

            <div className="admin-grid">
                <div className="admin-section">
                    <h3><PersonIcon style={{ fontSize: 22 }} /> Personal Information</h3>
                    <div className="setting-row">
                        <span className="setting-label">Full Name</span>
                        <span className="setting-value">{user?.name}</span>
                    </div>
                    <div className="setting-row">
                        <span className="setting-label">Email Address</span>
                        <span className="setting-value">{user?.email}</span>
                    </div>
                    <div className="setting-row">
                        <span className="setting-label">User Role</span>
                        <span className="setting-value"><span className="badge blue">{user?.role}</span></span>
                    </div>
                </div>

                <div className="admin-section">
                    <h3><LockIcon style={{ fontSize: 22 }} /> Security & Password</h3>
                    <form onSubmit={handlePasswordChange} style={{ marginTop: 15 }}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwords.new}
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwords.confirm}
                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 10 }}>
                            <SaveIcon style={{ fontSize: 18 }} /> {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
