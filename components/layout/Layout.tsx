import React, { useState, ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toasts, isSyncing, settings, changeUserPassword } = useSchool();
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('elirama_token');
        if (!token) return;

        try {
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                // Invalid token - clear session
                localStorage.removeItem('elirama_token');
                localStorage.removeItem('elirama_user');
                // setServerStatus('disconnected'); // This line is commented out as setServerStatus is not available in this component's context
                // Redirect if not already on login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return; // Changed from return null; as fetchNotifications doesn't return a value
            }

            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.read).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const markAsRead = async (id: string) => {
        const token = localStorage.getItem('elirama_token');
        if (!token) return;

        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                body: JSON.stringify({ id }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchNotifications();
        } catch (error) { }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // 30s refresh
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleChangePassword = () => {
        if (!newPassword || newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (user) {
            changeUserPassword(user.id, newPassword);
            setShowChangePassword(false);
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <main className="main-content">
                <header className="top-bar">
                    <div className="top-bar-left">
                        <div className="school-breadcrumb">
                            {settings?.schoolName} • <span style={{ color: 'var(--accent-blue)' }}>Dashboard</span>
                        </div>
                    </div>
                    <div className="top-bar-right">
                        <div className="top-bar-actions">
                            <div className="icon-badge-wrapper" onClick={() => setShowNotifications(!showNotifications)}>
                                <NotificationsIcon className="top-bar-icon" />
                                {unreadCount > 0 && <span className="icon-badge">{unreadCount}</span>}
                            </div>

                            {showNotifications && (
                                <div className="notifications-dropdown glass-overlay">
                                    <div className="dropdown-header">
                                        <h4>Notifications</h4>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <div className="notification-list" style={{ maxHeight: 400, overflowY: 'auto' }}>
                                        {notifications.length > 0 ? notifications.map((notif: any) => (
                                            <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => markAsRead(notif.id)}>
                                                {!notif.read && <div className="notif-dot"></div>}
                                                <div className="notif-content">
                                                    <p><strong>{notif.title}</strong></p>
                                                    <span>{notif.message}</span>
                                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                    <div className="dropdown-footer">
                                        <button className="text-btn">View All</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="user-profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                            <div className="user-avatar-wrapper">
                                <div className="user-avatar">
                                    {user?.name?.charAt(0) || <AccountCircleIcon />}
                                </div>
                                <div className="status-dot online"></div>
                            </div>
                            <div className="user-info-text">
                                <span className="user-name">{user?.name || 'User'}</span>
                                <span className="user-role">{user?.role || 'Staff'}</span>
                            </div>
                        </div>

                        {showProfileMenu && (
                            <div className="profile-dropdown glass-overlay">
                                <div className="dropdown-header">
                                    <p className="dropdown-user-name">{user?.name || 'User'}</p>
                                    <p className="dropdown-user-email">{user?.email || 'No email'}</p>
                                    <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                        {(() => {
                                            const role = typeof user?.role === 'string' ? user.role : (user?.role as any)?.name;
                                            return role?.toLowerCase() === 'super admin';
                                        })() && (
                                                <span className="badge gold-badge">SUPER ADMIN</span>
                                            )}
                                        <span className="badge version-badge">v1.5.0</span>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item" onClick={() => { setShowChangePassword(true); setShowProfileMenu(false); }}>
                                    Security Settings
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item logout-accent" onClick={logout}>
                                    Sign Out
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <div className="page-wrapper">
                    {children}
                </div>
            </main>

            {showChangePassword && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 400 }}>
                        <h3>Change Password</h3>
                        <div className="form-group" style={{ marginTop: 20 }}>
                            <label>New Password</label>
                            <input
                                className="form-control"
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: 15 }}>
                            <label>Confirm Password</label>
                            <input
                                className="form-control"
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 25 }}>
                            <button className="btn-outline" onClick={() => setShowChangePassword(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleChangePassword}>Update Password</button>
                        </div>
                    </div>
                </div>
            )}

            {toasts.length > 0 && (
                <div className="toast-container">
                    {toasts.map(toast => (
                        <div key={toast.id} className={`toast ${toast.type}`}>
                            {toast.type === 'success' && <CheckCircleIcon style={{ color: 'var(--accent-green)', fontSize: 20 }} />}
                            {toast.type === 'error' && <ErrorIcon style={{ color: 'var(--accent-red)', fontSize: 20 }} />}
                            {toast.type === 'info' && <InfoIcon style={{ color: 'var(--accent-blue)', fontSize: 20 }} />}
                            <p>{toast.message}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="sync-indicator">
                {isSyncing && <span className="syncing">Syncing...</span>}
            </div>
        </div>
    );
}
