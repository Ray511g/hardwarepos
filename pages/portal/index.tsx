import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function ParentDashboard() {
    const [student, setStudent] = useState<any>(null);
    const [records, setRecords] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const studentData = localStorage.getItem('portal_student');
        if (!studentData) {
            router.push('/portal/login');
        } else {
            setStudent(JSON.parse(studentData));
            fetchRecords(JSON.parse(studentData).id);
        }
    }, []);

    const fetchRecords = async (id: string) => {
        try {
            const res = await fetch(`/api/students/${id}`);
            if (res.ok) setRecords(await res.json());
        } catch (e) {}
    };

    const handleLogout = () => {
        localStorage.removeItem('portal_token');
        localStorage.removeItem('portal_student');
        router.push('/portal/login');
    };

    if (!student) return null;

    return (
        <div className="portal-dashboard">
            <header className="portal-nav">
                <div className="portal-container nav-flex">
                    <div className="portal-branding">
                        <SchoolIcon style={{ color: '#3b82f6' }} />
                        <span className="brand-text">Elirama Portal</span>
                    </div>
                    <div className="portal-user-nav">
                        <div className="user-persona">
                            <div className="p-avatar">{student.name[0]}</div>
                            <div className="p-meta">
                                <span className="p-name">{student.name}</span>
                                <span className="p-grade">{student.grade}</span>
                            </div>
                        </div>
                        <button className="p-logout" onClick={handleLogout}><LogoutIcon style={{ fontSize: 18 }} /></button>
                    </div>
                </div>
            </header>

            <main className="portal-container portal-main">
                <div className="portal-welcome-banner glass-card">
                    <div className="banner-content">
                        <h2>Welcome back, Parent of {student.name.split(' ')[0]}</h2>
                        <p>Track your child's continuous progress and stay updated with school communications.</p>
                    </div>
                    <div className="balance-widget">
                        <div className="bw-label">Fee Balance</div>
                        <div className="bw-amount">KES {student.feeBalance.toLocaleString()}</div>
                        <button className="bw-pay-btn">Pay Fees Online</button>
                    </div>
                </div>

                <div className="portal-grid">
                    <div className="portal-column">
                        <div className="portal-card">
                            <div className="card-header">
                                <HistoryIcon style={{ color: '#6366f1' }} />
                                <h3>Recent Payments</h3>
                            </div>
                            <div className="portal-list">
                                {records?.payments?.length > 0 ? records.payments.map((p: any) => (
                                    <div key={p.id} className="list-item">
                                        <div className="li-info">
                                            <span className="li-title">{p.term} - {p.method}</span>
                                            <span className="li-sub">{new Date(p.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="li-amount">+{p.amount.toLocaleString()}</div>
                                    </div>
                                )) : <p className="empty-msg">No recent payments found.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="portal-column">
                        <div className="portal-card">
                            <div className="card-header">
                                <TrendingUpIcon style={{ color: '#10b981' }} />
                                <h3>Academic Quick View</h3>
                            </div>
                            <div className="performance-summary">
                                <div className="stat-row">
                                    <span>Average Performance</span>
                                    <span className="badge badge-success">Meeting Expectations</span>
                                </div>
                                <div className="stat-row">
                                    <span>Attendance Rate</span>
                                    <span className="badge badge-primary">94%</span>
                                </div>
                                <button className="full-report-btn" onClick={() => router.push('/portal/results')}>View Full Progress Report</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .portal-dashboard { min-height: 100vh; background: #f8fafc; color: #1e293b; font-family: 'Outfit', sans-serif; }
                .portal-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
                .portal-nav { background: white; border-bottom: 1px solid #e2e8f0; padding: 16px 0; position: sticky; top: 0; z-index: 100; }
                .nav-flex { display: flex; justify-content: space-between; align-items: center; }
                .portal-branding { display: flex; align-items: center; gap: 12px; }
                .brand-text { font-weight: 800; font-size: 20px; color: #0f172a; }
                .portal-user-nav { display: flex; align-items: center; gap: 20px; }
                .user-persona { display: flex; align-items: center; gap: 12px; }
                .p-avatar { width: 40px; height: 40px; background: #eff6ff; color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
                .p-name { display: block; font-weight: 700; font-size: 14px; }
                .p-grade { font-size: 12px; color: #64748b; }
                .p-logout { border: none; background: none; color: #94a3b8; cursor: pointer; padding: 8px; border-radius: 8px; transition: all 0.2s; }
                .p-logout:hover { background: #fee2e2; color: #ef4444; }

                .portal-main { padding-top: 40px; padding-bottom: 60px; }
                .portal-welcome-banner { background: linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius: 24px; padding: 40px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .banner-content h2 { margin: 0; font-size: 28px; font-weight: 800; }
                .banner-content p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
                
                .balance-widget { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); min-width: 280px; text-align: center; }
                .bw-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
                .bw-amount { font-size: 32px; font-weight: 900; margin: 8px 0 16px; }
                .bw-pay-btn { width: 100%; background: white; color: #1d4ed8; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .bw-pay-btn:hover { background: #f8fafc; transform: scale(1.02); }

                .portal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
                .portal-card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; padding: 32px; height: 100%; }
                .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
                .card-header h3 { margin: 0; font-size: 18px; font-weight: 800; }

                .portal-list { display: flex; flex-direction: column; gap: 16px; }
                .list-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
                .li-title { display: block; font-weight: 700; font-size: 14px; }
                .li-sub { font-size: 12px; color: #94a3b8; }
                .li-amount { font-weight: 800; color: #10b981; }

                .performance-summary { display: flex; flex-direction: column; gap: 16px; }
                .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 12px; font-weight: 600; font-size: 14px; }
                .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; text-transform: uppercase; border: 1px solid transparent; }
                .badge-success { background: #ecfdf5; color: #10b981; border-color: #d1fae5; }
                .badge-primary { background: #eff6ff; color: #3b82f6; border-color: #dbeafe; }
                .full-report-btn { margin-top: 8px; width: 100%; background: #f1f5f9; color: #475569; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .full-report-btn:hover { background: #e2e8f0; }
                .empty-msg { color: #94a3b8; font-size: 14px; text-align: center; padding: 20px 0; }
            `}</style>
        </div>
    );
}
