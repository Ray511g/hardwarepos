import React, { useState, useMemo } from 'react';
import { Student, FeePayment, AttendanceRecord, StudentResult, BehaviorRecord } from '../../types';
import { useSchool } from '../../context/SchoolContext';
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

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-overlay" style={{ width: '900px', maxWidth: '95vw', height: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <header className="modal-header" style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <PersonIcon fontSize="large" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{student.firstName} {student.lastName}</h2>
                            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>ADM: {student.admissionNumber} | Grade: {student.grade}</p>
                            <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.75rem', opacity: 0.8 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><LocalHospitalIcon style={{ fontSize: 14 }} /> {student.bloodGroup || 'Blood: N/A'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FlagIcon style={{ fontSize: 14 }} /> {student.allergies || 'No Allergies'}</span>
                            </div>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={onClose}><CloseIcon /></button>
                </header>

                <nav className="modal-tabs" style={{ padding: '0 30px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 20 }}>
                    <button className={`tab-btn ${activeTab === 'academics' ? 'active' : ''}`} onClick={() => setActiveTab('academics')}><TrendingUpIcon style={{ fontSize: 18 }} /> Academics</button>
                    <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}><EventAvailableIcon style={{ fontSize: 18 }} /> Attendance</button>
                    <button className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}><AccountBalanceWalletIcon style={{ fontSize: 18 }} /> Finance</button>
                    <button className={`tab-btn ${activeTab === 'behavior' ? 'active' : ''}`} onClick={() => setActiveTab('behavior')}><StarIcon style={{ fontSize: 18 }} /> Behavior</button>
                </nav>

                <div className="modal-body custom-scrollbar" style={{ flex: 1, padding: 30, overflowY: 'auto' }}>
                    {activeTab === 'academics' && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="card glass-card" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <TrendingUpIcon style={{ color: 'var(--accent-blue)' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Academic Growth Timeline</h3>
                                </div>
                                <div style={{ height: 300 }}>
                                    {performanceData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={performanceData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="name" fontSize={10} />
                                                <YAxis domain={[0, 100]} fontSize={10} />
                                                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none' }} />
                                                <Line type="monotone" dataKey="score" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No exam data available</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="card glass-card" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <EventAvailableIcon style={{ color: 'var(--accent-green)' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Overall Reliability</h3>
                                </div>
                                <div style={{ height: 300, display: 'flex', alignItems: 'center' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={attendanceStats} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                                                {attendanceStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ width: '150px' }}>
                                        {attendanceStats.map((stat, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: stat.color }}></div>
                                                <span style={{ fontSize: '0.9rem' }}>{stat.name}: {stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div className="stat-card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <label>Total Paid</label>
                                    <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 700 }}>KSh {student.paidFees.toLocaleString()}</p>
                                </div>
                                <div className="stat-card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <label>Outstanding Balance</label>
                                    <p style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 700 }}>KSh {student.feeBalance.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="card glass-card" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <PaymentIcon style={{ color: 'var(--accent-purple)' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Payment Trend</h3>
                                </div>
                                <div style={{ height: 250 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={paymentData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="date" fontSize={10} />
                                            <YAxis fontSize={10} />
                                            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none' }} />
                                            <Bar dataKey="amount" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'behavior' && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                <div className="stat-card blue">
                                    <span className="stat-label">Behavior Points</span>
                                    <div className="flex-center" style={{ gap: 10, display: 'flex', alignItems: 'center' }}>
                                        <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalPoints}</span>
                                        <VerifiedIcon style={{ color: totalPoints >= 0 ? '#10b981' : '#ef4444' }} />
                                    </div>
                                </div>
                                <div className="stat-card green" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                                    <span className="stat-label">Total Merits</span>
                                    <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{studentBehavior.filter(b => b.type === 'Merit').length}</span>
                                </div>
                                <div className="stat-card red" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                                    <span className="stat-label">Total Demerits</span>
                                    <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{studentBehavior.filter(b => b.type === 'Demerit').length}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, height: 350 }}>
                                <div className="card glass-card" style={{ padding: 20 }}>
                                    <div className="card-header"><h3 style={{ margin: 0, fontSize: '1.1rem' }}>Discipline Progress</h3></div>
                                    <div className="card-body" style={{ height: '90%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={behaviorTrendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 8 }} />
                                                <Bar dataKey="merits" name="Merits" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="demerits" name="Demerits" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <div className="card-header" style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Incidents</h3></div>
                                    <div className="card-body scrollable custom-scrollbar" style={{ padding: 0, overflowY: 'auto', flex: 1 }}>
                                        {studentBehavior.length === 0 ? (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <p className="text-muted">No incidents recorded</p>
                                            </div>
                                        ) : (
                                            <div>
                                                {[...studentBehavior].reverse().map(b => (
                                                    <div key={b.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span className={`badge ${b.type === 'Merit' ? 'green' : 'red'}`} style={{ fontSize: '0.65rem' }}>{b.category}</span>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: b.type === 'Merit' ? '#10b981' : '#ef4444' }}>
                                                                {b.points > 0 ? `+${b.points}` : b.points}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.85rem', margin: '6px 0', opacity: 0.9 }}>{b.description}</p>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6 }}>
                                                            <span>By: {b.staffName}</span>
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

                <footer style={{ padding: '20px 30px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: 2 }}>Emergency Contact</label>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}><SecurityIcon style={{ fontSize: 14, marginRight: 4, verticalAlign: 'middle' }} /> {student.emergencyContact || 'Not Set'}</span>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: 2 }}>Medical History</label>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{student.medicalConditions || 'No significant history'}</span>
                        </div>
                    </div>
                    <button className="btn btn-muted" onClick={onClose}>Close Profile</button>
                </footer>
            </div>
        </div>
    );
}
