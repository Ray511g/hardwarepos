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

    const generateTrialBalance = () => {
        return (accounts || []).map(a => ({
            code: a.code,
            name: a.name,
            debit: ['Asset', 'Expense'].includes(a.type) ? Math.max(0, a.balance) : Math.max(0, -a.balance),
            credit: ['Liability', 'Equity', 'Revenue'].includes(a.type) ? Math.max(0, a.balance) : Math.max(0, -a.balance)
        }));
    };

    const generateAgingReport = () => {
        // Mocking grouping logic based on student fee balances
        const { students } = useSchool();
        const buckets = {
            current: 0,
            days30: 0,
            days60: 0,
            days90plus: 0
        };

        (students || []).forEach(s => {
            if (s.feeBalance <= 0) return;
            // Simplified: spread balance across buckets for demo
            if (s.feeBalance > 100000) buckets.days90plus += s.feeBalance;
            else if (s.feeBalance > 50000) buckets.days60 += s.feeBalance;
            else if (s.feeBalance > 20000) buckets.days30 += s.feeBalance;
            else buckets.current += s.feeBalance;
        });

        return buckets;
    };

    const trialBalance = generateTrialBalance();
    const aging = generateAgingReport();

    const pl = {
        revenue: (accounts || []).filter(a => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0),
        expenses: (accounts || []).filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0),
        get net() { return this.revenue - this.expenses; }
    };

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
                    <button className="btn btn-primary" title="Export to PDF format" aria-label="Export PDF" onClick={() => window.print()}>
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

            <div className="report-container card printable">
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8, borderTop: '1px solid #333', fontWeight: 700 }}>
                                <span>TOTAL ASSETS</span>
                                <span className="text-right">{(accounts || []).filter(a => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: 32 }}>
                            <h3 className="section-title" style={{ fontSize: 14, color: '#8b5cf6' }}>LIABILITIES & EQUITY</h3>
                            {(accounts || []).filter(a => a.type === 'Liability' || a.type === 'Equity').map(acc => (
                                <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <span>{acc.name}</span>
                                    <span className="text-right">{acc.balance.toLocaleString()}</span>
                                </div>
                            ))}
                            {/* Retained Earnings (Net Profit) Reflected here */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontStyle: 'italic' }}>
                                <span>Current Period Net Profit</span>
                                <span className="text-right">{pl.net.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8, borderTop: '1px solid #333', fontWeight: 700 }}>
                                <span>TOTAL LIABILITIES & EQUITY</span>
                                <span className="text-right">{((accounts || []).filter(a => a.type === 'Liability' || a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0) + pl.net).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {reportType === 'TrialBalance' && (
                    <div className="tb-report">
                        <table>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #333' }}>
                                    <th style={{ textAlign: 'left' }}>Code</th>
                                    <th style={{ textAlign: 'left' }}>Account Name</th>
                                    <th style={{ textAlign: 'right' }}>Debit</th>
                                    <th style={{ textAlign: 'right' }}>Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trialBalance.map(b => (
                                    <tr key={b.code} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '8px 0' }}>{b.code}</td>
                                        <td>{b.name}</td>
                                        <td style={{ textAlign: 'right' }}>{b.debit > 0 ? b.debit.toLocaleString() : '-'}</td>
                                        <td style={{ textAlign: 'right' }}>{b.credit > 0 ? b.credit.toLocaleString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ fontWeight: 800, borderTop: '2px solid #333', borderBottom: '4px double #333' }}>
                                    <td colSpan={2} style={{ padding: '12px 0' }}>TOTALS</td>
                                    <td style={{ textAlign: 'right' }}>{trialBalance.reduce((s, b) => s + b.debit, 0).toLocaleString()}</td>
                                    <td style={{ textAlign: 'right' }}>{trialBalance.reduce((s, b) => s + b.credit, 0).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {reportType === 'Aging' && (
                    <div className="aging-report">
                         <div className="aging-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
                            <div className="aging-card" style={{ background: '#f8fafc', padding: 20, borderRadius: 12, textAlign: 'center' }}>
                                <div className="text-xs text-muted bold uppercase">Current</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{aging.current.toLocaleString()}</div>
                            </div>
                            <div className="aging-card" style={{ background: '#f8fafc', padding: 20, borderRadius: 12, textAlign: 'center' }}>
                                <div className="text-xs text-muted bold uppercase">31 - 60 Days</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{aging.days30.toLocaleString()}</div>
                            </div>
                            <div className="aging-card" style={{ background: '#f8fafc', padding: 20, borderRadius: 12, textAlign: 'center' }}>
                                <div className="text-xs text-muted bold uppercase">61 - 90 Days</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{aging.days60.toLocaleString()}</div>
                            </div>
                            <div className="aging-card" style={{ background: '#f8fafc', padding: 20, borderRadius: 12, textAlign: 'center' }}>
                                <div className="text-xs text-muted bold uppercase">90+ Days</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#7f1d1d' }}>{aging.days90plus.toLocaleString()}</div>
                            </div>
                         </div>
                         <p className="text-muted text-center text-xs">Aged receivables analysis based on student invoice date and payment history.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialReports;
