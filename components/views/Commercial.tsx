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
    const { students, tryApi } = useSchool();
    const [activeTab, setActiveTab] = useState('credit');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        let endpoint = '/api/commercial/credit';
        if (activeTab === 'procurement') endpoint = '/api/commercial/po';
        if (activeTab === 'notes') endpoint = '/api/commercial/notes';
        if (activeTab === 'services') endpoint = '/api/commercial/services';

        try {
            const res = await tryApi(endpoint);
            if (res) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const filteredData = data.filter(item => {
        const search = searchTerm.toLowerCase();
        return (
            (item.studentName?.toLowerCase().includes(search)) ||
            (item.guardianName?.toLowerCase().includes(search)) ||
            (item.poNumber?.toLowerCase().includes(search)) ||
            (item.noteNumber?.toLowerCase().includes(search)) ||
            (item.supplierName?.toLowerCase().includes(search))
        );
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
                        <span className="stat-value">12</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <AssignmentIcon />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Pending Purchase Orders</span>
                        <span className="stat-value">5</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <ShoppingCartIcon />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Outstanding Commitment</span>
                        <span className="stat-value">KSh 1.2M</span>
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
                            else alert(`New ${activeTab} Form would open here`);
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
                                                <td><div className="data-table-name">{item.studentName}</div></td>
                                                <td>{item.guardianName || 'N/A'}</td>
                                                <td>KSh {item.totalAmount.toLocaleString()}</td>
                                                <td>{item.installments?.length || 0} Scheduled</td>
                                                <td><span className={`badge ${item.status === 'Active' ? 'green' : 'blue'}`}>{item.status}</span></td>
                                                <td className="text-right">
                                                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12 }}>View Schedule</button>
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
                                                <td><div className="data-table-name">{item.poNumber}</div></td>
                                                <td>{item.supplierName}</td>
                                                <td className="text-right">KSh {item.totalAmount.toLocaleString()}</td>
                                                <td>{item.department}</td>
                                                <td><span className={`badge ${item.status === 'Approved' ? 'green' : 'orange'}`}>{item.status}</span></td>
                                                <td className="text-right">
                                                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12 }}>Details</button>
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center p-40 text-muted">No promissory notes found</td></tr>
                                        ) : filteredData.map(item => (
                                            <tr key={item.id}>
                                                <td><div className="data-table-name">{item.noteNumber}</div></td>
                                                <td>{item.guardianName}</td>
                                                <td className="text-right">KSh {item.amount.toLocaleString()}</td>
                                                <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                                                <td>{new Date(item.maturityDate).toLocaleDateString()}</td>
                                                <td><span className={`badge ${item.status === 'Active' ? 'green' : 'blue'}`}>{item.status}</span></td>
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center p-40 text-muted">No service orders found</td></tr>
                                        ) : filteredData.map(item => {
                                            const student = students.find(s => s.id === item.studentId);
                                            return (
                                                <tr key={item.id}>
                                                    <td><div className="data-table-name">{student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}</div></td>
                                                    <td>{item.serviceType}</td>
                                                    <td className="text-right">KSh {item.amount.toLocaleString()}</td>
                                                    <td>{item.recurring ? `Yes (${item.frequency})` : 'No'}</td>
                                                    <td>{item.nextBillingDate ? new Date(item.nextBillingDate).toLocaleDateString() : 'N/A'}</td>
                                                    <td><span className={`badge ${item.status === 'Active' ? 'green' : 'blue'}`}>{item.status}</span></td>
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
