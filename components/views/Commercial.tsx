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
import { useSchool } from '../../context/SchoolContext';

export default function CommercialPage() {
    const { user } = useAuth();
    const { students } = useSchool();
    const [activeTab, setActiveTab] = useState('credit');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        let endpoint = '/api/commercial/credit';
        if (activeTab === 'procurement') endpoint = '/api/commercial/po';
        if (activeTab === 'notes') endpoint = '/api/commercial/notes';
        if (activeTab === 'services') endpoint = '/api/commercial/services';

        try {
            const res = await fetch(endpoint);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Commercial & Credit Control</h1>
                    <p className="subtitle">Commitments, Credit Risk, and Procurement Management</p>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card blue">
                    <div className="stat-card-header">
                        <div className="stat-card-value">12</div>
                        <AccountBalanceWalletIcon style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <div className="stat-card-label">Active Credit Agreements</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-card-header">
                        <div className="stat-card-value">5</div>
                        <AssignmentIcon style={{ color: 'var(--accent-orange)' }} />
                    </div>
                    <div className="stat-card-label">Pending Purchase Orders</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-card-header">
                        <div className="stat-card-value">KSh 1.2M</div>
                        <ShoppingCartIcon style={{ color: 'var(--accent-red)' }} />
                    </div>
                    <div className="stat-card-label">Outstanding Commitment</div>
                </div>
            </div>

            <div className="tabs-container" style={{ marginBottom: 20 }}>
                <div className="tabs glass-overlay">
                    <button className={`tab-btn ${activeTab === 'credit' ? 'active' : ''}`} onClick={() => setActiveTab('credit')}>
                        <AccountBalanceWalletIcon style={{ fontSize: 18, marginRight: 8 }} /> Student Credit
                    </button>
                    <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                        <ListAltIcon style={{ fontSize: 18, marginRight: 8 }} /> Promissory Notes
                    </button>
                    <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
                        <LocalShippingIcon style={{ fontSize: 18, marginRight: 8 }} /> Service Orders
                    </button>
                    <button className={`tab-btn ${activeTab === 'procurement' ? 'active' : ''}`} onClick={() => setActiveTab('procurement')}>
                        <ShoppingCartIcon style={{ fontSize: 18, marginRight: 8 }} /> Procurement
                    </button>
                </div>
            </div>

            <div className="commercial-content card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', padding: '6px 15px', borderRadius: 8, width: 300 }}>
                        <SearchIcon style={{ fontSize: 18, color: 'var(--text-muted)', marginRight: 10 }} />
                        <input type="text" placeholder="Search entries..." style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none' }} />
                    </div>
                    <button className="btn-primary" onClick={() => {
                        if (activeTab === 'notes') setShowNoteModal(true);
                        else if (activeTab === 'services') setShowServiceModal(true);
                        else alert(`New ${activeTab} Form would open here`);
                    }}>
                        <AddIcon style={{ fontSize: 18, marginRight: 8 }} /> Create {activeTab.toUpperCase()}
                    </button>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-shimmer" style={{ height: 300 }}></div>
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
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No agreements found</td></tr>
                                        ) : data.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 600 }}>{item.studentName}</td>
                                                <td>{item.guardianName || 'N/A'}</td>
                                                <td>KSh {item.totalAmount.toLocaleString()}</td>
                                                <td>{item.installments?.length || 0} Scheduled</td>
                                                <td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td>
                                                <td><button className="text-btn">View Schedule</button></td>
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
                                            <th>Total</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No purchase orders found</td></tr>
                                        ) : data.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 600 }}>{item.poNumber}</td>
                                                <td>{item.supplierName}</td>
                                                <td>KSh {item.totalAmount.toLocaleString()}</td>
                                                <td>{item.department}</td>
                                                <td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td>
                                                <td><button className="text-btn">Details</button></td>
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
                                            <th>Amount</th>
                                            <th>Issue Date</th>
                                            <th>Maturity</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No promissory notes found</td></tr>
                                        ) : data.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 600 }}>{item.noteNumber}</td>
                                                <td>{item.guardianName}</td>
                                                <td>KSh {item.amount.toLocaleString()}</td>
                                                <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                                                <td>{new Date(item.maturityDate).toLocaleDateString()}</td>
                                                <td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td>
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
                                            <th>Amount</th>
                                            <th>Recurring</th>
                                            <th>Next Billing</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No service orders found</td></tr>
                                        ) : data.map(item => {
                                            const student = students.find(s => s.id === item.studentId);
                                            return (
                                                <tr key={item.id}>
                                                    <td style={{ fontWeight: 600 }}>{student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}</td>
                                                    <td>{item.serviceType}</td>
                                                    <td>KSh {item.amount.toLocaleString()}</td>
                                                    <td>{item.recurring ? `Yes (${item.frequency})` : 'No'}</td>
                                                    <td>{item.nextBillingDate ? new Date(item.nextBillingDate).toLocaleDateString() : 'N/A'}</td>
                                                    <td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td>
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

            {showNoteModal && <AddPromissoryNoteModal onClose={() => setShowNoteModal(false)} onAdd={fetchData} />}
            {showServiceModal && <AddServiceOrderModal onClose={() => setShowServiceModal(false)} onAdd={fetchData} />}
        </div>
    );
}
