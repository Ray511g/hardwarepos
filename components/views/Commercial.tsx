import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SearchIcon from '@mui/icons-material/Search';
import AddPromissoryNoteModal from '../../components/modals/AddPromissoryNoteModal';
import AddServiceOrderModal from '../../components/modals/AddServiceOrderModal';
import AddCreditAgreementModal from '../../components/modals/AddCreditAgreementModal';
import AddPurchaseOrderModal from '../../components/modals/AddPurchaseOrderModal';
import PurchaseOrderDetailsModal from '../../components/modals/PurchaseOrderDetailsModal';
import ServiceOrderDetailsModal from '../../components/modals/ServiceOrderDetailsModal';
import PromissoryNoteDetailsModal from '../../components/modals/PromissoryNoteDetailsModal';
import CreditScheduleModal from '../../components/modals/CreditScheduleModal';
import { useSchool } from '../../context/SchoolContext';

export default function CommercialPage() {
    const { user } = useAuth();
    const { students, tryApi } = useSchool();
    const [activeTab, setActiveTab] = useState('credit');
    const [loading, setLoading] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [datasets, setDatasets] = useState({
        credit: [] as any[],
        notes: [] as any[],
        services: [] as any[],
        procurement: [] as any[]
    });
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [selectedCredit, setSelectedCredit] = useState<any>(null);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [creditRes, notesRes, servicesRes, poRes] = await Promise.all([
                tryApi('/api/commercial/credit'),
                tryApi('/api/commercial/notes'),
                tryApi('/api/commercial/services'),
                tryApi('/api/commercial/po')
            ]);

            const [credit, notes, services, po] = await Promise.all([
                creditRes?.ok ? creditRes.json() : [],
                notesRes?.ok ? notesRes.json() : [],
                servicesRes?.ok ? servicesRes.json() : [],
                poRes?.ok ? poRes.json() : []
            ]);

            setDatasets({
                credit,
                notes,
                services,
                procurement: po
            });
        } catch (e) {
            console.error('Failed to fetch commercial data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const data = datasets[activeTab as keyof typeof datasets] || [];

    const filteredData = (data || []).filter(item => {
        if (!item) return false;
        const search = searchTerm.toLowerCase();

        // Basic fields
        const matchesBasic =
            (item.studentName?.toLowerCase().includes(search)) ||
            (item.guardianName?.toLowerCase().includes(search)) ||
            (item.poNumber?.toLowerCase().includes(search)) ||
            (item.noteNumber?.toLowerCase().includes(search)) ||
            (item.supplierName?.toLowerCase().includes(search)) ||
            (item.serviceType?.toLowerCase().includes(search));

        if (matchesBasic) return true;

        // If it's a service order, search within the linked student
        if (activeTab === 'services' && item.studentId) {
            const student = students.find(s => s.id === item.studentId);
            if (student) {
                return (
                    student.firstName?.toLowerCase().includes(search) ||
                    student.lastName?.toLowerCase().includes(search) ||
                    student.admissionNumber?.toLowerCase().includes(search)
                );
            }
        }

        return false;
    });

    return (
        <div className="finance-page animate-in">
            <div className="page-header">
                <div className="header-content">
                    <h1>Commercial & Credit Control</h1>
                    <p className="text-muted">Commitments, Credit Risk, and Procurement Management</p>
                </div>
            </div>

            <div className="finance-stats-container">
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <AccountBalanceWalletIcon />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Active Credit Agreements</span>
                        <span className="stat-value">{datasets.credit.filter(i => i.status === 'Active' || i.status === 'PENDING').length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <AssignmentIcon />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Promissory Notes</span>
                        <span className="stat-value">{datasets.notes.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <ShoppingCartIcon />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Current POs</span>
                        <span className="stat-value">{datasets.procurement.length}</span>
                    </div>
                </div>
            </div>

            <div className="tab-nav-container">
                <div className="tab-nav scrollable">
                    <button className={`tab-btn ${activeTab === 'credit' ? 'active' : ''}`} onClick={() => setActiveTab('credit')} title="View student credit agreements" aria-label="Student Credit Tab">
                        <AccountBalanceWalletIcon /> <span>Student Credit</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')} title="Manage promissory notes" aria-label="Promissory Notes Tab">
                        <ListAltIcon /> <span>Promissory Notes</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')} title="Recurring service orders" aria-label="Service Orders Tab">
                        <LocalShippingIcon /> <span>Service Orders</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'procurement' ? 'active' : ''}`} onClick={() => setActiveTab('procurement')} title="Procurement and POs" aria-label="Procurement Tab">
                        <ShoppingCartIcon /> <span>Procurement</span>
                    </button>
                </div>
            </div>

            <div className="finance-content">
                <div className="finance-nav-row">
                    <div className="search-box-container">
                        <SearchIcon className="search-box-icon" />
                        <input
                            type="text"
                            className="form-control search-input-pl"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            title={`Search within ${activeTab}`}
                            aria-label="Search"
                        />
                    </div>
                    <div className="finance-toolbar-right">
                        <button className="btn btn-primary" onClick={() => {
                            if (activeTab === 'notes') setShowNoteModal(true);
                            else if (activeTab === 'services') setShowServiceModal(true);
                            else if (activeTab === 'credit') setShowCreditModal(true);
                            else if (activeTab === 'procurement') setShowPurchaseModal(true);
                        }} title={`Create new ${activeTab} record`} aria-label={`Add ${activeTab}`}>
                            <AddIcon className="mr-2" style={{ fontSize: 18 }} /> Create {activeTab.toUpperCase()}
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="p-40 text-center text-muted">Loading data...</div>
                    ) : (
                        <table className="data-table">
                            {activeTab === 'credit' && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Guardian</th>
                                            <th>Commitment</th>
                                            <th>Installments</th>
                                            <th>Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center p-40 text-muted">No agreements found</td></tr>
                                        ) : filteredData.map(item => (
                                            <tr key={item.id}>
                                                <td><div className="data-table-name">{item.studentName || 'Unknown'}</div></td>
                                                <td>{item.guardianName || 'N/A'}</td>
                                                <td>KSh {(item.totalAmount || 0).toLocaleString()}</td>
                                                <td>{item.installments?.length || 0} Scheduled</td>
                                                <td><span className={`badge ${item.status === 'Active' ? 'green' : 'blue'}`}>{item.status || 'Pending'}</span></td>
                                                <td className="text-right">
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '4px 10px', fontSize: 12 }}
                                                        onClick={() => setSelectedCredit(item)}
                                                    >
                                                        View Schedule
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                            {activeTab === 'procurement' && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>PO Number</th>
                                            <th>Supplier</th>
                                            <th className="text-right">Total</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center p-40 text-muted">No purchase orders found</td></tr>
                                        ) : filteredData.map(item => (
                                            <tr key={item.id}>
                                                <td><div className="data-table-name">{item.poNumber || 'N/A'}</div></td>
                                                <td>{item.supplierName || 'Unknown Supplier'}</td>
                                                <td className="text-right">KSh {(item.totalAmount || 0).toLocaleString()}</td>
                                                <td>{item.department || 'N/A'}</td>
                                                <td><span className={`badge ${item.status === 'Approved' ? 'green' : 'orange'}`}>{item.status || 'Draft'}</span></td>
                                                <td className="text-right">
                                                    <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '4px 10px', fontSize: 12 }}
                                                            onClick={() => setSelectedPO(item)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '4px 10px', fontSize: 12 }}
                                                            onClick={() => setSelectedPO(item)}
                                                        >
                                                            Print
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                            {activeTab === 'notes' && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Note #</th>
                                            <th>Guardian</th>
                                            <th className="text-right">Amount</th>
                                            <th>Issue Date</th>
                                            <th>Maturity</th>
                                            <th>Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center p-40 text-muted">No promissory notes found</td></tr>
                                        ) : filteredData.map(item => (
                                            <tr key={item.id}>
                                                <td><div className="data-table-name">{item.noteNumber || 'N/A'}</div></td>
                                                <td>{item.guardianName || 'N/A'}</td>
                                                <td className="text-right">KSh {(item.amount || 0).toLocaleString()}</td>
                                                <td>{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : 'N/A'}</td>
                                                <td>{item.maturityDate ? new Date(item.maturityDate).toLocaleDateString() : 'N/A'}</td>
                                                <td><span className={`badge ${item.status === 'Active' ? 'green' : 'blue'}`}>{item.status || 'Draft'}</span></td>
                                                <td className="text-right">
                                                    <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '4px 10px', fontSize: 12 }}
                                                            onClick={() => setSelectedNote(item)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '4px 10px', fontSize: 12 }}
                                                            onClick={() => setSelectedNote(item)}
                                                        >
                                                            Print
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                            {activeTab === 'services' && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Type</th>
                                            <th className="text-right">Amount</th>
                                            <th>Recurring</th>
                                            <th>Next Billing</th>
                                            <th>Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center p-40 text-muted">No service orders found</td></tr>
                                        ) : filteredData.map(item => {
                                            const student = students.find(s => s.id === item.studentId);
                                            return (
                                                <tr key={item.id}>
                                                    <td><div className="data-table-name">{student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}</div></td>
                                                    <td>{item.serviceType || 'N/A'}</td>
                                                    <td className="text-right">KSh {(item.amount || 0).toLocaleString()}</td>
                                                    <td>{item.recurring ? `Yes (${item.frequency || 'N/A'})` : 'No'}</td>
                                                    <td>{item.nextBillingDate ? new Date(item.nextBillingDate).toLocaleDateString() : 'N/A'}</td>
                                                    <td><span className={`badge ${item.status === 'Active' ? 'green' : 'blue'}`}>{item.status || 'Active'}</span></td>
                                                    <td className="text-right">
                                                        <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                                            <button
                                                                className="btn btn-outline"
                                                                style={{ padding: '4px 10px', fontSize: 12 }}
                                                                onClick={() => setSelectedService(item)}
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                className="btn btn-outline"
                                                                style={{ padding: '4px 10px', fontSize: 12 }}
                                                                onClick={() => setSelectedService(item)}
                                                            >
                                                                Print
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </>
                            )}
                        </table>
                    )}
                </div>
            </div>

            {showNoteModal && <AddPromissoryNoteModal onClose={() => setShowNoteModal(false)} onAdd={fetchAllData} />}
            {showServiceModal && <AddServiceOrderModal onClose={() => setShowServiceModal(false)} onAdd={fetchAllData} />}
            {showCreditModal && <AddCreditAgreementModal onClose={() => setShowCreditModal(false)} onAdd={fetchAllData} />}
            {showPurchaseModal && <AddPurchaseOrderModal onClose={() => setShowPurchaseModal(false)} onAdd={fetchAllData} />}
            {selectedPO && <PurchaseOrderDetailsModal po={selectedPO} onClose={() => setSelectedPO(null)} />}
            {selectedService && (
                <ServiceOrderDetailsModal
                    order={selectedService}
                    student={students.find(s => s.id === selectedService.studentId)}
                    onClose={() => setSelectedService(null)}
                />
            )}
            {selectedNote && <PromissoryNoteDetailsModal note={selectedNote} onClose={() => setSelectedNote(null)} />}
            {selectedCredit && <CreditScheduleModal agreement={selectedCredit} onClose={() => setSelectedCredit(null)} />}
        </div>
    );
}
