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

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Simple download logic
        const blob = new Blob([JSON.stringify(filteredPayments, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FeePayments_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    return (
        <div className="finance-content animate-in">
            <div className="finance-stats-container" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 32 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><LocalAtmIcon /></div>
                    <div className="stat-info">
                        <span className="stat-label">Expected Total</span>
                        <span className="stat-value">KSh {totalFees.toLocaleString()}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><PaymentIcon /></div>
                    <div className="stat-info">
                        <span className="stat-label">Collected Total</span>
                        <span className="stat-value">KSh {collected.toLocaleString()}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><ReceiptIcon /></div>
                    <div className="stat-info">
                        <span className="stat-label">Outstanding Bal.</span>
                        <span className="stat-value">KSh {pending.toLocaleString()}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><PrintIcon /></div>
                    <div className="stat-info">
                        <span className="stat-label">Collection Rate</span>
                        <span className="stat-value">{collectionRate}%</span>
                    </div>
                </div>
            </div>

            <div className="finance-nav-row">
                <div className="search-box-container">
                    <SearchIcon className="search-box-icon" />
                    <input
                        type="text"
                        className="form-control search-input-pl"
                        placeholder="Search student or receipt..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        title="Search within payments"
                        aria-label="Search"
                    />
                </div>
                <div className="finance-toolbar-right">
                    <button className="btn btn-outline" onClick={() => setShowStructure(true)} title="Set fees for grades">
                        <EditIcon className="mr-2" style={{ fontSize: 18 }} /> Structure
                    </button>
                    <button className="btn btn-outline" onClick={handleDownload} title="Export payment list">
                        <DownloadIcon className="mr-2" style={{ fontSize: 18 }} /> Export
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowPayModal(true)} title="Record a fee payment">
                        <AddIcon className="mr-2" style={{ fontSize: 18 }} /> Record Payment
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Receipt</th>
                            <th>Term / Year</th>
                            <th>Method</th>
                            <th className="text-right">Amount</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPayments.length === 0 ? (
                            <tr><td colSpan={6} className="p-40 text-center text-muted">No matching payments found</td></tr>
                        ) : paginatedPayments.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <div className="data-table-name">{p.studentName}</div>
                                    <div className="text-xs text-muted">Grade: {p.grade || 'N/A'}</div>
                                </td>
                                <td>
                                    <div className="data-table-name">{p.receiptNumber}</div>
                                    <div className="text-xs text-muted">{new Date(p.date).toLocaleDateString()}</div>
                                </td>
                                <td>{p.term} {p.academicYear}</td>
                                <td><span className="badge blue">{p.method}</span></td>
                                <td className="text-right" style={{ fontWeight: 600 }}>KSh {p.amount.toLocaleString()}</td>
                                <td className="text-right">
                                    <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                        <button className="action-btn" title="View/Print Receipt" onClick={() => setSelectedReceipt(p)}>
                                            <PrintIcon style={{ fontSize: 20 }} />
                                        </button>
                                        <button className="action-btn" title="Edit Payment" onClick={() => { setEditingPayment(p); setShowPayModal(true); }}>
                                            <EditIcon style={{ fontSize: 20 }} />
                                        </button>
                                        <button className="action-btn" style={{ color: '#ef4444' }} title="Delete Record" onClick={() => { if (confirm('Delete this payment?')) deletePayment(p.id); }}>
                                            <DeleteIcon style={{ fontSize: 20 }} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: 24 }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredPayments.length / itemsPerPage)}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {showPayModal && (
                <RecordPaymentModal
                    onClose={() => { setShowPayModal(false); setEditingPayment(null); }}
                    editData={editingPayment || undefined}
                />
            )}

            {selectedReceipt && (
                <ReceiptModal
                    payment={selectedReceipt}
                    onClose={() => setSelectedReceipt(null)}
                />
            )}

            {showStructure && (
                <FeeStructureModal
                    onClose={() => setShowStructure(false)}
                />
            )}
        </div>
    );
};

export default FeeManager;
