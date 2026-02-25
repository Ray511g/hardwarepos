import React, { useState, useMemo } from 'react';
import { Student, FeePayment, AttendanceRecord, StudentResult, BehaviorRecord } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { generateStudentReport } from '../../utils/pdfUtils';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SecurityIcon from '@mui/icons-material/Security';
import FlagIcon from '@mui/icons-material/Flag';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface Student360ModalProps {
    student: Student;
    onClose: () => void;
}

export default function Student360Modal({ student, onClose }: Student360ModalProps) {
    const { payments, attendance, results, exams, behavior } = useSchool();
    const [activeTab, setActiveTab] = useState<'academics' | 'attendance' | 'finance' | 'behavior'>('academics');
    const [isDownloading, setIsDownloading] = useState(false);

    const studentPayments = payments.filter(p => p.studentId === student.id);
    const studentAttendance = attendance.filter(a => a.studentId === student.id);
    const studentResults = results.filter(r => r.studentId === student.id);
    const studentBehavior = behavior.filter(b => b.studentId === student.id);
    const totalPoints = studentBehavior.reduce((acc, curr) => acc + curr.points, 0);

    const performanceData = studentResults.map(r => {
        const exam = exams.find(e => e.id === r.examId);
        return {
            name: exam ? `${exam.name.substring(0, 10)}...` : 'N/A',
            score: r.marks,
            fullDate: exam?.date || ''
        };
    }).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

    const attendanceStats = [
        { name: 'Present', value: studentAttendance.filter(a => a.status === 'Present').length, color: '#10b981' },
        { name: 'Absent', value: studentAttendance.filter(a => a.status === 'Absent').length, color: '#ef4444' },
        { name: 'Late', value: studentAttendance.filter(a => a.status === 'Late').length, color: '#f59e0b' },
    ];

    const paymentData = studentPayments.map(p => ({
        date: new Date(p.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        amount: p.amount
    })).slice(-5);

    const behaviorTrendData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        const last3MonthsIdx = [
            (currentMonthIdx - 2 + 12) % 12,
            (currentMonthIdx - 1 + 12) % 12,
            currentMonthIdx
        ];

        return last3MonthsIdx.map(idx => {
            const monthName = months[idx];
            return {
                month: monthName,
                merits: studentBehavior.filter(b => b.type === 'Merit' && months[new Date(b.date).getMonth()] === monthName).length,
                demerits: studentBehavior.filter(b => b.type === 'Demerit' && months[new Date(b.date).getMonth()] === monthName).length,
            };
        });
    }, [studentBehavior]);

    const handleDownloadReport = async () => {
        setIsDownloading(true);
        await generateStudentReport(`${student.firstName} ${student.lastName}`, 'student-360-content');
        setIsDownloading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-up" style={{ width: '1000px', maxWidth: '95vw', height: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <header className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 60, height: 60, borderRadius: '16px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}>
                            <PersonIcon style={{ fontSize: 32 }} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }} className="text-gradient">{student.firstName} {student.lastName}</h2>
                            <p style={{ margin: 0, opacity: 0.7, fontSize: '1rem', fontWeight: 500 }}>ADM: {student.admissionNumber} • {student.grade}</p>
                            <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.8rem' }}>
                                <span className="flex-center" style={{ gap: 4, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', color: '#10b981' }}><LocalHospitalIcon style={{ fontSize: 14 }} /> {student.bloodGroup || 'O+'}</span>
                                <span className="flex-center" style={{ gap: 4, background: 'rgba(244, 63, 94, 0.1)', padding: '2px 8px', borderRadius: '4px', color: '#f43f5e' }}><FlagIcon style={{ fontSize: 14 }} /> {student.allergies || 'None'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex" style={{ gap: 12 }}>
                        <button className="btn-premium outline" onClick={handleDownloadReport} disabled={isDownloading}>
                            <FileDownloadIcon style={{ fontSize: 20 }} /> {isDownloading ? 'Generating...' : 'Export PDF'}
                        </button>
                        <button className="icon-btn" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)' }}><CloseIcon /></button>
                    </div>
                </header>

                <nav className="modal-tabs" style={{ padding: '0 32px', background: 'rgba(0,0,0,0.05)', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: 8 }}>
                    {[
                        { id: 'academics', label: 'Academics', icon: <TrendingUpIcon /> },
                        { id: 'attendance', label: 'Attendance', icon: <EventAvailableIcon /> },
                        { id: 'finance', label: 'Finance', icon: <AccountBalanceWalletIcon /> },
                        { id: 'behavior', label: 'Behavior', icon: <StarIcon /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '16px 20px',
                                borderBottom: activeTab === tab.id ? '3px solid var(--accent-blue)' : '3px solid transparent',
                                opacity: activeTab === tab.id ? 1 : 0.6
                            }}
                        >
                            <span className="flex-center" style={{ gap: 8 }}>{tab.icon} {tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div id="student-360-content" className="modal-body custom-scrollbar" style={{ flex: 1, padding: '32px', overflowY: 'auto', background: '#0a0d14' }}>
                    {activeTab === 'academics' && (
                        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div className="profile-stats-grid">
                                <div className="stat-item">
                                    <span className="label">Mean Grade</span>
                                    <span className="value">B+</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Term Rank</span>
                                    <span className="value">4 / 42</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Exams Taken</span>
                                    <span className="value">{performanceData.length}</span>
                                </div>
                            </div>

                            <div className="premium-card">
                                <div className="flex-between mb-24">
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <TrendingUpIcon style={{ color: 'var(--accent-blue)' }} /> Academic Growth Timeline
                                    </h3>
                                </div>
                                <div style={{ height: 350 }}>
                                    {performanceData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={performanceData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="name" fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 100]} fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                                <Line type="monotone" dataKey="score" stroke="var(--accent-blue)" strokeWidth={4} dot={{ r: 6, fill: 'var(--accent-blue)', strokeWidth: 2, stroke: '#0a0d14' }} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex-center h-full text-muted">No academic data available for this term</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div className="profile-stats-grid">
                                <div className="stat-item">
                                    <span className="label">Attendance Rate</span>
                                    <span className="value" style={{ color: '#10b981' }}>94.2%</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Days Absent</span>
                                    <span className="value">3</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Late Arrivals</span>
                                    <span className="value">1</span>
                                </div>
                            </div>
                            <div className="premium-card">
                                <div className="flex-between mb-24">
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <EventAvailableIcon style={{ color: 'var(--accent-green)' }} /> Overall Reliability
                                    </h3>
                                </div>
                                <div style={{ height: 350, display: 'flex', alignItems: 'center' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={attendanceStats} innerRadius={100} outerRadius={130} paddingAngle={8} dataKey="value" stroke="none">
                                                {attendanceStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        {attendanceStats.map((stat, i) => (
                                            <div key={i} className="flex-between" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                <div className="flex" style={{ gap: 12, alignItems: 'center' }}>
                                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: stat.color }}></div>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{stat.name}</span>
                                                </div>
                                                <span style={{ fontWeight: 700 }}>{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div className="profile-stats-grid">
                                <div className="stat-item" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                    <span className="label" style={{ color: '#10b981' }}>Total Paid</span>
                                    <span className="value" style={{ color: '#10b981' }}>KSh {student.paidFees.toLocaleString()}</span>
                                </div>
                                <div className="stat-item" style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
                                    <span className="label" style={{ color: '#f43f5e' }}>Outstanding</span>
                                    <span className="value" style={{ color: '#f43f5e' }}>KSh {student.feeBalance.toLocaleString()}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Payment Status</span>
                                    <span className="value" style={{ fontSize: '1rem' }}>
                                        <span className={`badge ${student.feeBalance === 0 ? 'green' : 'orange'}`}>
                                            {student.feeBalance === 0 ? 'Cleared' : 'Partial'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className="premium-card">
                                <div className="flex-between mb-24">
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <PaymentIcon style={{ color: 'var(--accent-purple)' }} /> Payment Lifecycle
                                    </h3>
                                </div>
                                <div style={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={paymentData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                                            <YAxis fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ background: '#1a1f2e', border: 'none', borderRadius: '12px' }} />
                                            <Bar dataKey="amount" fill="var(--accent-purple)" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'behavior' && (
                        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div className="profile-stats-grid">
                                <div className="stat-item blue">
                                    <span className="label">Behavior Score</span>
                                    <div className="flex" style={{ gap: 10, alignItems: 'center' }}>
                                        <span className="value">{totalPoints}</span>
                                        <VerifiedIcon style={{ color: totalPoints >= 0 ? '#10b981' : '#f43f5e', fontSize: 20 }} />
                                    </div>
                                </div>
                                <div className="stat-item green">
                                    <span className="label">Merit Awards</span>
                                    <span className="value" style={{ color: '#10b981' }}>{studentBehavior.filter(b => b.type === 'Merit').length}</span>
                                </div>
                                <div className="stat-item red">
                                    <span className="label">Demerits</span>
                                    <span className="value" style={{ color: '#f43f5e' }}>{studentBehavior.filter(b => b.type === 'Demerit').length}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32, height: 400 }}>
                                <div className="premium-card">
                                    <h3 className="mb-24" style={{ margin: 0, fontSize: '1.1rem' }}>Longitudinal Trend</h3>
                                    <div style={{ height: '90%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={behaviorTrendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="month" fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                                                <YAxis fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1f2e', border: 'none', borderRadius: 12 }} />
                                                <Bar dataKey="merits" name="Merits" fill="#10b981" radius={[6, 6, 0, 0]} />
                                                <Bar dataKey="demerits" name="Demerits" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="premium-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chronological Log</h3>
                                    </div>
                                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                                        {studentBehavior.length === 0 ? (
                                            <div className="flex-center h-full text-muted">No behavior entries recorded</div>
                                        ) : (
                                            <div>
                                                {[...studentBehavior].reverse().map(b => (
                                                    <div key={b.id} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <div className="flex-between">
                                                            <span className={`badge ${b.type === 'Merit' ? 'green' : 'red'}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{b.category}</span>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: b.type === 'Merit' ? '#10b981' : '#f43f5e' }}>
                                                                {b.points > 0 ? `+${b.points}` : b.points} pts
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.9rem', margin: '10px 0', opacity: 0.9, lineHeight: 1.5 }}>{b.description}</p>
                                                        <div className="flex-between" style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                                            <span>Reported by: {b.staffName}</span>
                                                            <span>{new Date(b.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <footer style={{ padding: '24px 32px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', gap: 40 }}>
                        <div className="info-block">
                            <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.4, fontWeight: 600, marginBottom: 4 }}>Primary Emergency</label>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><SecurityIcon style={{ fontSize: 16, color: 'var(--accent-blue)' }} /> {student.emergencyContact || '+254 7XX XXX XXX'}</span>
                        </div>
                        <div className="info-block">
                            <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.4, fontWeight: 600, marginBottom: 4 }}>Medical History</label>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{student.medicalConditions || 'No significant conditions'}</span>
                        </div>
                    </div>
                    <button className="btn-muted" onClick={onClose} style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Close Explorer</button>
                </footer>
            </div>
        </div>
    );
}
