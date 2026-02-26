import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useRouter } from 'next/router';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AddStudentModal from '../../components/modals/AddStudentModal';
import { useAuth } from '../../context/AuthContext';
import { generateStudentReport } from '../../utils/pdfUtils';
import {
    AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';

function Sparkline({ data, color }: { data: any[], color: string }) {
    return (
        <div style={{ height: 40, width: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <Area type="monotone" dataKey="val" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function Dashboard() {
    const { students, teachers, exams, settings, behavior, auditLogs } = useSchool();
    const { hasPermission: hasAuthPermission, user } = useAuth();
    const router = useRouter();
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const stats = useMemo(() => [
        {
            label: 'Total Students',
            value: students.length,
            color: '#3b82f6',
            icon: <PeopleIcon />,
            sub: `${students.filter(s => s.status === 'Active').length} Active`,
            spark: Array.from({ length: 6 }, () => ({ val: 10 + Math.random() * 20 }))
        },
        {
            label: 'Staff Members',
            value: teachers.length,
            color: '#a855f7',
            icon: <SchoolIcon />,
            sub: 'Teaching & Admin',
            spark: Array.from({ length: 6 }, () => ({ val: 15 + Math.random() * 10 }))
        },
        {
            label: 'Behavior Score',
            value: behavior.reduce((acc, curr) => acc + curr.points, 0),
            color: '#10b981',
            icon: <TrendingUpIcon />,
            sub: 'School Average',
            spark: Array.from({ length: 6 }, () => ({ val: 5 + Math.random() * 15 }))
        },
        {
            label: 'Term Progress',
            value: '65%',
            color: '#f59e0b',
            icon: <EventAvailableIcon />,
            sub: settings.currentTerm,
            spark: Array.from({ length: 6 }, () => ({ val: 2 + Math.random() * 8 }))
        },
    ], [students, teachers, behavior, settings]);

    const performanceData = [
        { name: 'Jan', val: 65 }, { name: 'Feb', val: 72 }, { name: 'Mar', val: 68 },
        { name: 'Apr', val: 85 }, { name: 'May', val: 82 }, { name: 'Jun', val: 90 }
    ];

    const quickActions = [
        { label: 'Add Student', path: '/students?action=add', color: 'var(--accent-blue)', icon: <PersonAddIcon />, desc: 'Register a new learner', permission: { module: 'students', action: 'CREATE' } },
        { label: 'Record Fees', path: '/fees?action=record', color: 'var(--accent-green)', icon: <AccountBalanceWalletIcon />, desc: 'Process payment', permission: { module: 'fees', action: 'CREATE' } },
        { label: 'Mark Attendance', path: '/attendance', color: 'var(--accent-purple)', icon: <EventAvailableIcon />, desc: 'Daily roll call', permission: { module: 'academic', action: 'EDIT' } },
        { label: 'Data Reports', path: '/reports', color: 'var(--accent-orange)', icon: <FileDownloadIcon />, desc: 'Export analytics', permission: { module: 'academic', action: 'VIEW' } },
    ];

    const handleExportSummary = async () => {
        setIsExporting(true);
        await generateStudentReport('School_Executive_Summary', 'dashboard-main-content');
        setIsExporting(false);
    };

    return (
        <div id="dashboard-main-content" className="page-container glass-overlay custom-scrollbar" style={{ padding: '32px' }}>
            <header className="page-header mb-32" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="animate-up">
                    <h1 className="page-title text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>School Insights</h1>
                    <p className="page-subtitle" style={{ fontSize: '1.1rem', opacity: 0.8 }}>
                        Welcome back, <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name || 'Administrator'}</span>
                    </p>
                </div>
            </header>

            <div className="premium-stats-grid animate-up">
                {stats.map((stat, i) => (
                    <div key={i} className="premium-stat-card">
                        <div className="premium-stat-card-top">
                            <div className="premium-stat-icon-wrapper" style={{ color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="premium-stat-chart-container">
                                <Sparkline data={stat.spark} color={stat.color} />
                            </div>
                        </div>
                        <div className="premium-stat-label">{stat.label}</div>
                        <div className="premium-stat-value">{stat.value}</div>
                        <div className="premium-stat-footer">
                            <div className="stat-indicator-dot" style={{ background: stat.color }}></div>
                            {stat.sub}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }} className="animate-up">
                <section className="premium-card" style={{ padding: '32px' }}>
                    <div className="flex-between mb-32">
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Academic Growth</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>Across all grades this semester</p>
                        </div>
                        <div className="flex" style={{ gap: 12 }}>
                            <div className="flex" style={{ gap: 6, alignItems: 'center', fontSize: '0.8rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '2px', background: 'var(--accent-blue)' }}></div>
                                Mean Target
                            </div>
                        </div>
                    </div>
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="name" fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                                <YAxis fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#1a1f2e', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="val" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#dashboardGradient)" strokeWidth={4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <section className="premium-card" style={{ flex: 1 }}>
                        <h3 className="mb-24" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {quickActions.map((action, i) => {
                                if (action.permission && !hasAuthPermission(action.permission.module, action.permission.action)) return null;
                                return (
                                    <button
                                        key={i}
                                        className="premium-card"
                                        onClick={() => router.push(action.path)}
                                        style={{
                                            background: 'rgba(255,255,255,0.02)',
                                            padding: '20px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{ color: action.color }}>{action.icon}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{action.label}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>{action.desc}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="premium-card" style={{ flex: 1, padding: 0 }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="flex-between">
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Pulse Registry</h3>
                            <button className="btn-muted" style={{ fontSize: '0.75rem' }} onClick={() => router.push('/approvals')}>View All</button>
                        </div>
                        <div className="custom-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {auditLogs.length === 0 ? (
                                <div className="p-32 text-center text-muted text-sm">Synchronizing latest registry entries...</div>
                            ) : (
                                auditLogs.slice(0, 5).map((log, i) => (
                                    <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="flex-between">
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{log.action}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{log.module} • {new Date(log.createdAt).toLocaleTimeString()}</div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)' }}>{log.userName}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} />}
        </div>
    );
}
