import React from 'react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PieChartIcon from '@mui/icons-material/PieChart';

interface FinanceDashboardProps {
    stats: any;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ stats }) => {
    // Default values for cards and data to avoid 'Loading' screen
    const s = stats?.stats || {};
    const cashFlow = stats?.cashFlow || [];
    const budgets = stats?.budgets || [];

    const cards = [
        { label: 'Total Income', value: stats?.stats?.totalIncome || 0, icon: <TrendingUpIcon />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { label: 'Total Expenses', value: stats?.stats?.totalExpenses || 0, icon: <TrendingDownIcon />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
        { label: 'Payroll Total', value: stats?.stats?.payrollTotal || 0, icon: <GroupIcon />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
        { label: 'Net Balance', value: stats?.stats?.netBalance || 0, icon: <AccountBalanceWalletIcon />, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)' },
        { label: 'Outstanding Fees', value: stats?.stats?.outstandingFees || 0, icon: <ReceiptLongIcon />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        { label: 'Budget Utilized', value: `${Math.round(stats?.stats?.budgetUtilization || 0)}%`, icon: <PieChartIcon />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    ];

    return (
        <div className="finance-dashboard animate-in">
            <div className="finance-stats-container">
                {cards.map((card, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: card.bg, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{card.label}</span>
                            <span className="stat-value">KES {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-grid mt-20">
                <div className="admin-section">
                    <h3 className="section-title">Monthly Cash Flow</h3>
                    <div className="chart-container">
                        {(stats?.cashFlow || []).map((d: any, i: number) => (
                            <div key={i} className="chart-bar-group">
                                <div className="chart-bars">
                                    <div className="chart-bar income" style={{ height: `${((d.income || 0) / (stats?.stats?.totalIncome || 1)) * 100}%` }}></div>
                                    <div className="chart-bar expense" style={{ height: `${((d.expense || 0) / (stats?.stats?.totalExpenses || 1)) * 100}%` }}></div>
                                </div>
                                <span className="text-muted text-xs">{d.month}</span>
                            </div>
                        ))}
                    </div>
                    <div className="legend">
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#10b981' }}></div>
                            <span>Income</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#ef4444' }}></div>
                            <span>Expenses</span>
                        </div>
                    </div>
                </div>

                <div className="admin-section">
                    <h3 className="section-title">Budget Utilization Summary</h3>
                    <div className="budget-list">
                        {(stats?.budgets || []).length > 0 ? stats.budgets.map((b: any, i: number) => (
                            <div key={i} className="budget-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span className="data-table-name">{b.category} <span className="text-muted text-xs">({b.department})</span></span>
                                    <span style={{ fontWeight: 600 }}>{Math.round(b.utilization || 0)}%</span>
                                </div>
                                <div className="progress-container">
                                    <div className="progress-fill" style={{
                                        width: `${Math.min(b.utilization || 0, 100)}%`,
                                        background: (b.utilization || 0) > 90 ? '#ef4444' : (b.utilization || 0) > 70 ? '#f59e0b' : '#10b981'
                                    }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                                    <span>Spent: KES {(b.spentAmount || 0).toLocaleString()}</span>
                                    <span>Limit: KES {(b.allocatedAmount || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center text-muted">
                                No budgets defined for the current period.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
