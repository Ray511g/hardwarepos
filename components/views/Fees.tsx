import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';

// Components
import FinanceDashboard from '../finance/FinanceDashboard';
import FeeManager from '../finance/FeeManager';
import ExpenditureManager from '../finance/ExpenditureManager';
import SupplierManager from '../finance/SupplierManager';
import PayrollManager from '../finance/PayrollManager';
import GeneralLedger from '../finance/GeneralLedger';
import BudgetPlanner from '../finance/BudgetPlanner';
import FinancialReports from '../finance/FinancialReports';

export default function FeesPage() {
    const context = useSchool();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    const refreshData = () => {
        context.refreshData();
    };

    return (
        <div className="finance-page animate-in">
            <div className="page-header">
                <div className="header-content">
                    <h1>Financial Administration</h1>
                    <p className="text-muted">Master Ledger, Accounts Receivable, and Treasury Management</p>
                </div>
            </div>

            <div className="tab-nav-container">
                <div className="tab-nav scrollable">
                    <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} title="Financial Overview" aria-label="Dashboard Tab">
                        <BarChartIcon /> <span>Dashboard</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => setActiveTab('fees')} title="Student Fee Management" aria-label="Fees Tab">
                        <ReceiptIcon /> <span>Fees & Billing</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')} title="Expenditure Control" aria-label="Expenses Tab">
                        <PaymentsIcon /> <span>Expenditure</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')} title="Payroll & HR Finance" aria-label="Payroll Tab">
                        <PeopleIcon /> <span>Payroll</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')} title="Accounts Payable" aria-label="Suppliers Tab">
                        <AssignmentIcon /> <span>Suppliers</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')} title="Double-entry Accounting" aria-label="Ledger Tab">
                        <AccountBalanceIcon /> <span>General Ledger</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => setActiveTab('budgets')} title="Budgetary Controls" aria-label="Budgets Tab">
                        <HistoryIcon /> <span>Budgets</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')} title="Financial Statements" aria-label="Reports Tab">
                        <BarChartIcon /> <span>Reports</span>
                    </button>
                </div>
            </div>

            <div className="finance-content">
                {activeTab === 'dashboard' && <FinanceDashboard stats={context.financeStats} />}
                {activeTab === 'fees' && <FeeManager />}
                {activeTab === 'expenses' && <ExpenditureManager />}
                {activeTab === 'suppliers' && <SupplierManager />}
                {activeTab === 'payroll' && <PayrollManager />}
                {activeTab === 'ledger' && <GeneralLedger />}
                {activeTab === 'budgets' && <BudgetPlanner />}
                {activeTab === 'reports' && <FinancialReports />}
            </div>
        </div>
    );
}
