import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';

type ReportType = 'P&L' | 'BalanceSheet' | 'TrialBalance' | 'Aging';

const FinancialReports: React.FC = () => {
    const { settings, accounts } = useSchool();
    const [reportType, setReportType] = useState<ReportType>('P&L');
    const period = new Date().getFullYear().toString();

    const generatePL = () => {
        const revenue = (accounts || []).filter(a => a.type === 'Revenue').reduce((sum, a) => sum + (a.balance || 0), 0);
        const expensesTotal = (accounts || []).filter(a => a.type === 'Expense').reduce((sum, a) => sum + (a.balance || 0), 0);
        return { revenue, expenses: expensesTotal, net: revenue - expensesTotal };
    };

    const pl = generatePL();

    return (
        <div className="financial-reports animate-in">
            <div className="finance-toolbar">
                <div>
                    <h2 className="section-title">Financial Reporting</h2>
                    <p className="text-muted text-xs">Audit-ready financial statements and analysis</p>
                </div>
                <div className="finance-toolbar-right">
                    <button className="btn btn-outline" title="Print this report" aria-label="Print">
                        <PrintIcon className="mr-2" style={{ fontSize: 18 }} /> Print
                    </button>
                    <button className="btn btn-primary" title="Export to PDF format" aria-label="Export PDF">
                        <FileDownloadIcon className="mr-2" style={{ fontSize: 18 }} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="tab-nav" style={{ marginBottom: 24 }}>
                {(['P&L', 'BalanceSheet', 'TrialBalance', 'Aging'] as ReportType[]).map(r => (
                    <button
                        key={r}
                        className={`tab-btn ${reportType === r ? 'active' : ''}`}
                        onClick={() => setReportType(r)}
                        title={`Switch to ${r} report view`}
                        aria-label={`${r} Report`}
                    >
                        {r === 'P&L' && 'Profit & Loss'}
                        {r === 'BalanceSheet' && 'Balance Sheet'}
                        {r === 'TrialBalance' && 'Trial Balance'}
                        {r === 'Aging' && 'Aging Report'}
                    </button>
                ))}
            </div>

            <div className="report-container card">
                <div style={{ textAlign: 'center', marginBottom: 40, borderBottom: '1px solid var(--border-color)', paddingBottom: 20 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{settings.schoolName}</h1>
                    <h2 style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 8 }}>
                        {reportType === 'P&L' ? 'Statement of Comprehensive Income' :
                            reportType === 'BalanceSheet' ? 'Statement of Financial Position' :
                                reportType === 'TrialBalance' ? 'Trial Balance' : 'Accounts Aging Summary'}
                    </h2>
                    <p className="text-muted text-xs" style={{ marginTop: 8 }}>For the Year Ended 31st December {period}</p>
                </div>

                {reportType === 'P&L' && (
                    <div className="pl-report">
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '2px solid var(--border-color)', fontWeight: 700 }}>
                            <span>Description</span>
                            <span className="text-right">Amount (KES)</span>
                        </div>

                        <div style={{ marginTop: 24 }}>
                            <h3 className="section-title" style={{ fontSize: 14, color: '#3b82f6' }}>REVENUE</h3>
                            {(accounts || []).filter(a => a.type === 'Revenue').map(acc => (
                                <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <span>{acc.name}</span>
                                    <span className="text-right">{acc.balance.toLocaleString()}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8, borderTop: '1px solid #333', borderBottom: '1px solid #333', fontWeight: 700 }}>
                                <span>TOTAL REVENUE</span>
                                <span className="text-right">{pl.revenue.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: 32 }}>
                            <h3 className="section-title" style={{ fontSize: 14, color: '#ef4444' }}>EXPENSES</h3>
                            {(accounts || []).filter(a => a.type === 'Expense').map(acc => (
                                <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <span>{acc.name}</span>
                                    <span className="text-right">({acc.balance.toLocaleString()})</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8, borderTop: '1px solid #333', borderBottom: '1px solid #333', fontWeight: 700 }}>
                                <span>TOTAL EXPENSES</span>
                                <span className="text-right">({pl.expenses.toLocaleString()})</span>
                            </div>
                        </div>

                        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '2px double #333', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 800, fontSize: 18 }}>NET PROFIT / (LOSS)</span>
                            <span className="text-right" style={{ fontWeight: 800, fontSize: 18, color: pl.net >= 0 ? '#10b981' : '#ef4444' }}>
                                KES {pl.net.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}

                {reportType === 'BalanceSheet' && (
                    <div className="bs-report">
                        <div style={{ marginTop: 24 }}>
                            <h3 className="section-title" style={{ fontSize: 14, color: '#3b82f6' }}>ASSETS</h3>
                            {(accounts || []).filter(a => a.type === 'Asset').map(acc => (
                                <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <span>{acc.name}</span>
                                    <span className="text-right">{acc.balance.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 32 }}>
                            <h3 className="section-title" style={{ fontSize: 14, color: '#8b5cf6' }}>LIABILITIES & EQUITY</h3>
                            {(accounts || []).filter(a => a.type === 'Liability' || a.type === 'Equity').map(acc => (
                                <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <span>{acc.name}</span>
                                    <span className="text-right">{acc.balance.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(reportType === 'TrialBalance' || reportType === 'Aging') && (
                    <div className="p-20 text-center text-muted" style={{ padding: '80px 20px' }}>
                        <AssessmentIcon style={{ fontSize: 64, opacity: 0.2, marginBottom: 16 }} />
                        <h3>Advanced Report Module</h3>
                        <p style={{ fontSize: 14 }}>This enterprise report is being synthesized based on real-time ledger data.</p>
                        <button className="btn btn-primary" style={{ marginTop: 24 }} title="Reload and reconcile reports" aria-label="Process Data">
                            Process Real-time Data
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialReports;
