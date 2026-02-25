import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BadgeIcon from '@mui/icons-material/Badge';
import InfoIcon from '@mui/icons-material/Info';

export const PERMISSIONS = [
    { code: 'MANAGE_STUDENTS', label: 'Students Module' },
    { code: 'MANAGE_TEACHERS', label: 'Teachers Module' },
    { code: 'MANAGE_FINANCE', label: 'Finance & Fees' },
    { code: 'MANAGE_COMMERCIAL', label: 'Commercial & Credit' },
    { code: 'MANAGE_HR', label: 'HR & Payroll' },
    { code: 'MANAGE_WORKFLOW', label: 'Workflow & Approvals' },
    { code: 'MANAGE_ATTENDANCE', label: 'Attendance' },
    { code: 'MANAGE_EXAMS', label: 'Exams/Grades' },
    { code: 'MANAGE_REPORTS', label: 'Reports' },
    { code: 'MANAGE_COMMUNICATION', label: 'Communication' },
    { code: 'MANAGE_TIMETABLE', label: 'Timetable' },
    { code: 'MANAGE_ADMIN', label: 'Admin Settings' },
];

const navItems = [
    { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/students', icon: <PeopleIcon />, label: 'Students', permission: 'MANAGE_STUDENTS' },
    { path: '/teachers', icon: <SchoolIcon />, label: 'Teachers', permission: 'MANAGE_TEACHERS' },
    { path: '/attendance', icon: <EventNoteIcon />, label: 'Attendance', permission: 'MANAGE_ATTENDANCE' },
    { path: '/timetable', icon: <ScheduleIcon />, label: 'Timetable', permission: 'MANAGE_TIMETABLE' },
    { path: '/commercial', icon: <LocalShippingIcon />, label: 'Commercial', permission: 'MANAGE_COMMERCIAL' },
    { path: '/hr', icon: <BadgeIcon />, label: 'HR & Payroll', permission: 'MANAGE_HR' },
    { path: '/approvals', icon: <AssignmentIcon />, label: 'Workflow', permission: 'MANAGE_WORKFLOW' },
    { path: '/fees', icon: <PaymentIcon />, label: 'Finance', permission: 'MANAGE_FINANCE' },
    { path: '/grades', icon: <GradeIcon />, label: 'Grades', permission: 'MANAGE_EXAMS' },
    { path: '/exams', icon: <AssignmentIcon />, label: 'Exams', permission: 'MANAGE_EXAMS' },
    { path: '/results', icon: <AssessmentIcon />, label: 'Results', permission: 'MANAGE_REPORTS' },
    { path: '/reports', icon: <DescriptionIcon />, label: 'Reports', permission: 'MANAGE_REPORTS' },
    { path: '/communication', icon: <EmailIcon />, label: 'Communication', permission: 'MANAGE_COMMUNICATION' },
    { path: '/admin', icon: <SettingsIcon />, label: 'Admin', permission: 'MANAGE_ADMIN' },
    { path: '/manual', icon: <MenuBookIcon />, label: 'System Manual' },
    { path: '/about', icon: <InfoIcon />, label: 'About Software' },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const { logout, user, hasPermission } = useAuth();
    const { serverStatus, settings } = useSchool();
    const router = useRouter();
    const [pendingCount, setPendingCount] = React.useState(0);

    React.useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await fetch('/api/approvals?status=PENDING');
                if (res.ok) {
                    const data = await res.json();
                    setPendingCount(data.length);
                }
            } catch (e) { }
        };
        if (user) fetchPending();
    }, [user]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const isActive = (path: string) => {
        if (path === '/') return router.pathname === '/';
        return router.pathname.startsWith(path);
    };

    const filteredNavItems = navItems.filter(item => {
        if (item.path === '/') return true;
        if (!user) return false;

        // Robust role check
        const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
        if (userRole?.toLowerCase() === 'super admin') return true;

        if (!item.permission) return true;

        const modMap: Record<string, string> = {
            'MANAGE_STUDENTS': 'students',
            'MANAGE_TEACHERS': 'teachers',
            'MANAGE_FINANCE': 'finance',
            'MANAGE_COMMERCIAL': 'finance',
            'MANAGE_HR': 'academic',
            'MANAGE_WORKFLOW': 'finance',
            'MANAGE_ATTENDANCE': 'attendance',
            'MANAGE_EXAMS': 'exams',
            'MANAGE_REPORTS': 'academic',
            'MANAGE_COMMUNICATION': 'academic',
            'MANAGE_TIMETABLE': 'timetable',
            'MANAGE_ADMIN': 'settings'
        };

        const module = modMap[item.permission];
        return hasPermission(module, 'VIEW');
    });

    return (
        <>
            <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Sidebar">
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {isOpen && <div className="sidebar-overlay open" onClick={() => setIsOpen(false)} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo-container">
                        <div className="sidebar-logo">
                            {settings?.logo ? (
                                <img src={settings.logo} alt="Logo" className="logo-img" />
                            ) : (settings?.schoolName || 'S')[0]}
                        </div>
                        <div className="logo-glow"></div>
                    </div>
                    <div className="sidebar-brand">
                        <h2>{settings?.schoolName || 'School Management System'}</h2>
                        <p>{settings?.motto || 'Academic Excellence'}</p>
                    </div>
                </div>

                <nav className="sidebar-nav custom-scrollbar">
                    <div className="nav-section-label">Main Menu</div>
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                            {isActive(item.path) && <div className="active-indicator"></div>}
                        </Link>
                    ))}
                </nav>

            </aside>
        </>
    );
}
