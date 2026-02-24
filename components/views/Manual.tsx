import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
    Description as DescriptionIcon,
    Download as DownloadIcon,
    MenuBook as MenuBookIcon,
    School as SchoolIcon,
    People as PeopleIcon,
    AutoStories as AutoStoriesIcon,
    AccountBalanceWallet as FinanceIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';

export default function Manual() {
    const { settings } = useSchool();
    const sections = [
        {
            title: 'Getting Started',
            icon: <SchoolIcon color="primary" />,
            content: 'Login using your credentials. Super Admins have full access, while teachers and other staff have role-based access. Always log out when finished for security.'
        },
        {
            title: 'Learner Management',
            icon: <PeopleIcon color="secondary" />,
            content: 'Register new learners, update their details, and manage their status. Each learner is assigned an automatic admission number in the format ELR/YEAR/SEQUENCE.'
        },
        {
            title: 'Academic & CBC',
            icon: <AutoStoriesIcon color="success" />,
            content: 'Manage exams, record results, and track CBC competencies. The system supports full CBC learning areas and assessment strands for primary and junior secondary levels.'
        },
        {
            title: 'Finance & Fees',
            icon: <FinanceIcon color="warning" />,
            content: 'Record fee payments, generate receipts, and monitor arrears. The system automatically calculates balances based on the set fee structures per grade.'
        },
        {
            title: 'System Settings',
            icon: <SettingsIcon color="action" />,
            content: 'Configure school details, enable/disable grade levels (JSS, SSS, etc.), and manage user roles and permissions in the Admin module.'
        },
        {
            title: 'Attendance',
            icon: <PeopleIcon color="info" />,
            content: 'Track daily learner attendance. Mark students as Present, Absent, Late, or Excused. Generate attendance reports per grade or term.'
        },
        {
            title: 'Communication',
            icon: <DescriptionIcon color="secondary" />,
            content: 'Send internal messages and broadcast announcements to staff members. Keep everyone updated on school events and schedule changes.'
        },
        {
            title: 'Reporting',
            icon: <DownloadIcon color="primary" />,
            content: 'Generate comprehensive reports for finances, academics, and student demographics. Export data to Excel or PDF for offline use.'
        }
    ];

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="header-content">
                    <h1>System User Manual</h1>
                    <p>Learn how to navigate and use the {settings?.schoolName || 'School Management System'} effectively.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        <DownloadIcon style={{ marginRight: 8 }} /> Download Manual (PDF)
                    </button>
                </div>
            </header>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
                {sections.map((section, idx) => (
                    <div key={idx} className="dashboard-card" style={{ height: '100%' }}>
                        <div className="dashboard-card-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {section.icon}
                            {section.title}
                        </div>
                        <div style={{ marginTop: 16, color: 'var(--text-muted)', lineHeight: '1.6', fontSize: 14 }}>
                            {section.content}
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-card" style={{ marginTop: 24 }}>
                <div className="dashboard-card-title">
                    <MenuBookIcon style={{ marginRight: 12 }} /> Detailed Documentation
                </div>
                <div style={{ marginTop: 20 }}>
                    <div className="step-item" style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                        <div className="step-number" style={{ background: 'var(--accent-blue)', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 600 }}>1</div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 16 }}>Configuration</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '8px 0 0' }}>Go to Admin {'>'} School Settings to set your logo, signature, and active grade levels. This should be the first step after deployment.</p>
                        </div>
                    </div>
                    <div className="step-item" style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                        <div className="step-number" style={{ background: 'var(--accent-blue)', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 600 }}>2</div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 16 }}>Learner Onboarding</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '8px 0 0' }}>Bulk upload learners or add them individually. Ensure each learner is assigned to the correct grade for accurate fee billing.</p>
                        </div>
                    </div>
                    <div className="step-item" style={{ display: 'flex', gap: 16 }}>
                        <div className="step-number" style={{ background: 'var(--accent-blue)', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 600 }}>3</div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 16 }}>Daily Operations</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '8px 0 0' }}>Record daily attendance and fee collections. Use the Dashboard to get a bird's eye view of the school's performance.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
