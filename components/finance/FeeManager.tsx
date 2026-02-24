import React, { useState, useCallback, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FeePayment } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SearchIcon from '@mui/icons-material/Search';
import RecordPaymentModal from '../modals/RecordPaymentModal';
import ReceiptModal from '../modals/ReceiptModal';
import FeeStructureModal from '../modals/FeeStructureModal';
import Pagination from '../common/Pagination';

const FeeManager: React.FC = () => {
    const { students, payments, settings, updateGradeFees, deletePayment } = useSchool();
    const [showPayModal, setShowPayModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState<FeePayment | null>(null);
    const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);
    const [showStructure, setShowStructure] = useState(false);

    // Filtering & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [termFilter, setTermFilter] = useState('All');
    const [methodFilter, setMethodFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const totalFees = students.reduce((sum, s) => sum + s.totalFees, 0);
    const collected = students.reduce((sum, s) => sum + s.paidFees, 0);
    const pending = totalFees - collected;
    const collectionRate = totalFees > 0 ? Math.round((collected / totalFees) * 100) : 0;

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch = p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesTerm = termFilter === 'All' || p.term === termFilter;
            const matchesMethod = methodFilter === 'All' || p.method === methodFilter;
            return matchesSearch && matchesTerm && matchesMethod;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payments, searchQuery, termFilter, methodFilter]);

    const paginatedPayments = useMemo(() => {
        return filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredPayments, currentPage, itemsPerPage]);

    const generateStatementHTML = useCallback(() => {
        const schoolName = settings?.schoolName || 'School management system';
        const schoolPhone = settings?.phone || '+254 700 000 000';
        const schoolEmail = settings?.email || 'info@schoolsystem.ac.ke';
        const currentTerm = settings?.currentTerm || 'Term 1';
        const currentYear = settings?.currentYear || new Date().getFullYear();

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Fee Statement - ${schoolName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; background: #fff; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #1a56db; }
        .header h1 { font-size: 24px; color: #1a56db; margin-bottom: 4px; }
        .header p { font-size: 12px; color: #666; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .summary-card { padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; }
        .summary-card .value { font-size: 18px; font-weight: 700; }
        .summary-card .label { font-size: 11px; color: #666; margin-top: 4px; }
        .blue .value { color: #1a56db; }
        .green .value { color: #16a34a; }
        .red .value { color: #dc2626; }
        .purple .value { color: #7c3aed; }
        h2 { font-size: 16px; margin: 24px 0 12px; color: #1a56db; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; border: 1px solid #e2e8f0; }
        td { padding: 8px 10px; border: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .paid { color: #16a34a; font-weight: 600; }
        .pending { color: #dc2626; font-weight: 600; }
        .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; padding-top: 15px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${schoolName}</h1>
        <p>${schoolPhone} | ${schoolEmail}</p>
        <p style="margin-top: 8px; font-size: 14px; font-weight: 600;">Fee Collection Statement - ${currentTerm} ${currentYear}</p>
    </div>
    <div class="summary-grid">
        <div class="summary-card blue"><div class="value">KSh ${totalFees.toLocaleString()}</div><div class="label">Total Expected</div></div>
        <div class="summary-card green"><div class="value">KSh ${collected.toLocaleString()}</div><div class="label">Collected</div></div>
        <div class="summary-card red"><div class="value">KSh ${pending.toLocaleString()}</div><div class="label">Pending</div></div>
        <div class="summary-card purple"><div class="value">${collectionRate}%</div><div class="label">Collection Rate</div></div>
    </div>
    <table>
        <thead>
            <tr><th>Student Name</th><th>Grade</th><th>Total Fees</th><th>Paid</th><th>Balance</th></tr>
        </thead>
        <tbody>
            ${students.map(s => `
                <tr>
                    <td>${s.firstName} ${s.lastName}</td>
                    <td>${s.grade}</td>
                    <td>KSh ${s.totalFees.toLocaleString()}</td>
                    <td class="paid">KSh ${s.paidFees.toLocaleString()}</td>
                    <td class="${s.feeBalance > 0 ? 'pending' : 'paid'}">KSh ${s.feeBalance.toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
    }, [students, settings, totalFees, collected, pending, collectionRate]);

    const handlePrint = () => {
        const html = generateStatementHTML();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.onload = () => printWindow.print();
        }
    };

    return (
        <div className="fee-manager">
            <div className="finance-toolbar">
                <div className="toolbar-left">
                    <h2 className="section-title">Student Fee Management</h2>
                </div>
                <div className="finance-toolbar-right">
                    <button className="btn btn-outline" onClick={() => setShowStructure(true)} title="Set or update fee types per grade" aria-label="Fee Structure Settings">
                        <LocalAtmIcon className="mr-2" style={{ fontSize: 18 }} /> Fee Structure
                    </button>
                    <button className="btn btn-outline" onClick={handlePrint} title="Generate and print collection report" aria-label="Print Statement">
                        <PrintIcon className="mr-2" style={{ fontSize: 18 }} /> Print List
                    </button>
                    <button className="btn btn-primary green" onClick={() => setShowPayModal(true)} title="Open form to record new student payment" aria-label="Record New Payment">
                        <AddIcon className="mr-2" style={{ fontSize: 18 }} /> Record Payment
                    </button>
                </div>
            </div>

            <div className="finance-stats-container">
                <div className="stat-card blue">
                    <div className="stat-card-value">KSh {totalFees.toLocaleString()}</div>
                    <div className="stat-card-label">Total Expected</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-value">KSh {collected.toLocaleString()}</div>
                    <div className="stat-card-label">Collected</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-card-value">KSh {pending.toLocaleString()}</div>
                    <div className="stat-card-label">Pending Arrears</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-value">{collectionRate}%</div>
                    <div className="stat-card-label">Collection Rate</div>
                </div>
            </div>

            <div className="admin-section" style={{ marginBottom: 24 }}>
                <div className="finance-toolbar">
                    <h3 className="section-title">Fee Transactions History</h3>
                    <div className="finance-toolbar-right">
                        <div className="search-box-container">
                            <SearchIcon className="search-box-icon" />
                            <input
                                type="text"
                                className="form-control search-input-pl"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                title="Search transactions by name or receipt"
                                aria-label="Search transactions"
                            />
                        </div>
                        <select
                            className="form-control filter-select"
                            value={termFilter}
                            onChange={e => setTermFilter(e.target.value)}
                            title="Filter transactions by school term"
                            aria-label="Filter by Term"
                        >
                            <option value="All">All Terms</option>
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                        </select>
                        <select
                            className="form-control filter-select"
                            value={methodFilter}
                            onChange={e => setMethodFilter(e.target.value)}
                            title="Filter by payment method used"
                            aria-label="Filter by Method"
                        >
                            <option value="All">All Methods</option>
                            <option value="Cash">Cash</option>
                            <option value="M-Pesa">M-Pesa</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Receipt</th>
                                <th>Student</th>
                                <th>Grade</th>
                                <th>Term</th>
                                <th>Method</th>
                                <th>Reference</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPayments.length > 0 ? (
                                paginatedPayments.map(p => (
                                    <tr key={p.id}>
                                        <td><span className="receipt-badge">{p.receiptNumber}</span></td>
                                        <td><div className="data-table-name">{p.studentName}</div></td>
                                        <td>{p.grade}</td>
                                        <td>{p.term}</td>
                                        <td>{p.method}</td>
                                        <td className="text-muted text-xs">{p.reference || '-'}</td>
                                        <td className="data-table-amount">KSh {p.amount.toLocaleString()}</td>
                                        <td>{new Date(p.date).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons-flex">
                                                <button title="Print Receipt" className="action-btn" onClick={() => setSelectedReceipt(p)} aria-label="Print receipt"><ReceiptIcon fontSize="small" /></button>
                                                <button title="Edit Record" className="action-btn" onClick={() => setEditingPayment(p)} aria-label="Edit payment"><EditIcon fontSize="small" /></button>
                                                <button title="Delete Record" className="action-btn delete" onClick={() => { if (confirm('Are you sure you want to delete this payment record? This will adjust the student balance.')) deletePayment(p.id); }} aria-label="Delete payment"><DeleteIcon fontSize="small" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="p-10 text-center text-muted">
                                        {searchQuery || termFilter !== 'All' || methodFilter !== 'All'
                                            ? 'No transactions found matching your filters.'
                                            : 'No fee transactions recorded yet.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination
                        totalItems={filteredPayments.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            <div className="admin-section">
                <h3 className="section-title">Student Balances Overview</h3>
                <div className="scrollable-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Grade</th>
                                <th>Paid Fees</th>
                                <th>Balance Arrears</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map(s => (
                                    <tr key={s.id}>
                                        <td><div className="data-table-name">{s.firstName} {s.lastName}</div></td>
                                        <td>{s.grade}</td>
                                        <td className="data-table-amount">KES {s.paidFees.toLocaleString()}</td>
                                        <td className={`font-semibold ${s.feeBalance > 0 ? 'text-danger' : 'text-success'}`}>
                                            KES {s.feeBalance.toLocaleString()}
                                        </td>
                                        <td>
                                            <span className={`status-tag ${s.feeBalance <= 0 ? 'active' : 'pending'}`}>
                                                {s.feeBalance <= 0 ? 'Fully Paid' : 'Partial/None'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-muted">
                                        No students registered in the system.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showPayModal && <RecordPaymentModal onClose={() => setShowPayModal(false)} />}
            {editingPayment && <RecordPaymentModal payment={editingPayment} onClose={() => setEditingPayment(null)} />}
            {selectedReceipt && <ReceiptModal payment={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
            {showStructure && <FeeStructureModal onClose={() => setShowStructure(false)} />}
        </div>
    );
};

export default FeeManager;
