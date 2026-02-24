import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HistoryIcon from '@mui/icons-material/History';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SearchIcon from '@mui/icons-material/Search';
import { useSchool } from '../../context/SchoolContext';

export default function ApprovalCenterPage() {
    const { user } = useAuth();
    const { tryApi, showToast } = useSchool();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await tryApi(`/api/approvals?status=${filter}`);
            if (res) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch approvals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const handleAction = async (requestId: string, action: string) => {
        const comment = window.prompt(`Enter comment for ${action.toLowerCase()}:`);
        if (comment === null) return;

        try {
            const res = await tryApi(`/api/approvals/${requestId}`, {
                method: 'POST',
                body: JSON.stringify({
                    approverId: user?.id,
                    approverName: user?.name,
                    action,
                    comment
                })
            });

            if (res) {
                showToast(`Request ${action.toLowerCase()} successfully`, 'success');
                fetchRequests();
            }
        } catch (error) {
            showToast('Failed to process approval action', 'error');
        }
    };

    const filteredRequests = requests.filter(req =>
        req.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="finance-page animate-in">
            <div className="page-header">
                <div className="header-content">
                    <h1>Enterprise Workflow & Approval Center</h1>
                    <p className="text-muted">Centralized orchestration for fiscal and operational compliance</p>
                </div>
            </div>

            <div className="tab-nav-container">
                <div className="tab-nav scrollable">
                    <button className={`tab-btn ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')} title="Requests awaiting your action" aria-label="Pending Tab">
                        <PendingActionsIcon /> <span>Pending Actions</span>
                    </button>
                    <button className={`tab-btn ${filter === 'APPROVED' ? 'active' : ''}`} onClick={() => setFilter('APPROVED')} title="Track approved history" aria-label="Approved Tab">
                        <CheckCircleOutlineIcon /> <span>Audit History</span>
                    </button>
                    <button className={`tab-btn ${filter === 'REJECTED' ? 'active' : ''}`} onClick={() => setFilter('REJECTED')} title="View rejected requests" aria-label="Rejected Tab">
                        <HighlightOffIcon /> <span>Declined / Rejected</span>
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
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            title="Search by requester or type"
                            aria-label="Search Approvals"
                        />
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="p-40 text-center text-muted">Scanning workflow queue...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="p-60 text-center">
                            <HistoryIcon style={{ fontSize: 64, color: 'rgba(59, 130, 246, 0.2)', marginBottom: 20 }} />
                            <h3>Workflow Queue Empty</h3>
                            <p className="text-muted">You are all caught up! No requests currently match the selected status.</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Requester</th>
                                    <th>Summary Description</th>
                                    <th className="text-right">Value / Amount</th>
                                    <th>Date</th>
                                    <th>Level</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map(req => (
                                    <tr key={req.id}>
                                        <td><span className="badge blue">{req.entityType.replace('_', ' ')}</span></td>
                                        <td>
                                            <div className="data-table-name">{req.requestedByName}</div>
                                            <div className="text-muted text-xs">ID: {req.requestedById}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>
                                                {req.entityType === 'PURCHASE_ORDER' && `PO for ${req.details?.supplier}`}
                                                {req.entityType === 'FEE_AGREEMENT' && `Credit Agreement: ${req.details?.student}`}
                                                {req.entityType === 'PAYROLL' && `Payroll Period: ${req.details?.period}`}
                                                {req.entityType === 'EXPENDITURE' && req.details?.description}
                                            </div>
                                        </td>
                                        <td className="text-right" style={{ fontWeight: 600 }}>
                                            KSh {req.details?.total?.toLocaleString() || req.details?.totalNetPay?.toLocaleString() || req.details?.amount?.toLocaleString() || '-'}
                                        </td>
                                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td><span className="badge">Lvl {req.currentLevel}</span></td>
                                        <td className="text-right">
                                            {filter === 'PENDING' ? (
                                                <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                                    <button className="action-btn" title="Examine & Approve" style={{ color: '#10b981' }} onClick={() => handleAction(req.id, 'APPROVED')}>
                                                        <CheckCircleOutlineIcon style={{ fontSize: 20 }} />
                                                    </button>
                                                    <button className="action-btn" title="Request Revision" style={{ color: '#f59e0b' }} onClick={() => handleAction(req.id, 'REVISION')}>
                                                        <HistoryIcon style={{ fontSize: 20 }} />
                                                    </button>
                                                    <button className="action-btn" title="Decline Request" style={{ color: '#ef4444' }} onClick={() => handleAction(req.id, 'REJECTED')}>
                                                        <HighlightOffIcon style={{ fontSize: 20 }} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`badge ${req.status === 'APPROVED' ? 'green' : 'orange'}`}>{req.status}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
