import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HistoryIcon from '@mui/icons-material/History';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

export default function ApprovalCenterPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/approvals?status=${filter}`);
            if (res.ok) {
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
            const res = await fetch(`/api/approvals/${requestId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    approverId: user?.id,
                    approverName: user?.name,
                    action,
                    comment
                })
            });

            if (res.ok) {
                fetchRequests();
            } else {
                alert('Action failed');
            }
        } catch (error) {
            console.error('Approval action error');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Enterprise Approval Center</h1>
                    <p className="subtitle">Centralized workflow orchestration for all school modules</p>
                </div>
            </div>

            <div className="tabs-container" style={{ marginBottom: 20 }}>
                <div className="tabs">
                    <button className={`tab-btn ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>
                        <PendingActionsIcon style={{ fontSize: 18, marginRight: 8 }} /> Pending Tasks
                    </button>
                    <button className={`tab-btn ${filter === 'APPROVED' ? 'active' : ''}`} onClick={() => setFilter('APPROVED')}>
                        <CheckCircleOutlineIcon style={{ fontSize: 18, marginRight: 8 }} /> Approved History
                    </button>
                    <button className={`tab-btn ${filter === 'REJECTED' ? 'active' : ''}`} onClick={() => setFilter('REJECTED')}>
                        <HighlightOffIcon style={{ fontSize: 18, marginRight: 8 }} /> Rejected
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-shimmer" style={{ height: 400 }}></div>
            ) : (
                <div className="approval-list card">
                    {requests.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px 0' }}>
                            <HistoryIcon style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
                            <h3>No {filter.toLowerCase()} requests</h3>
                            <p>You are all caught up!</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Requester</th>
                                        <th>Summary</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Level</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req.id}>
                                            <td><span className="badge blue">{req.entityType.replace('_', ' ')}</span></td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{req.requestedByName}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {req.requestedById}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: 13 }}>
                                                    {req.entityType === 'PURCHASE_ORDER' && `PO for ${req.details?.supplier}`}
                                                    {req.entityType === 'FEE_AGREEMENT' && `Credit: ${req.details?.student}`}
                                                    {req.entityType === 'PAYROLL' && `Payroll Run: ${req.details?.period}`}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>KSh {req.details?.total?.toLocaleString() || req.details?.totalNetPay?.toLocaleString() || '-'}</td>
                                            <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                            <td>Lvl {req.currentLevel}</td>
                                            <td>
                                                {filter === 'PENDING' ? (
                                                    <div className="action-btns">
                                                        <button className="btn-icon green" title="Approve" onClick={() => handleAction(req.id, 'APPROVED')}><CheckCircleOutlineIcon /></button>
                                                        <button className="btn-icon orange" title="Revision" onClick={() => handleAction(req.id, 'REVISION')}><HistoryIcon /></button>
                                                        <button className="btn-icon red" title="Reject" onClick={() => handleAction(req.id, 'REJECTED')}><HighlightOffIcon /></button>
                                                    </div>
                                                ) : (
                                                    <span className={`status-pill ${req.status.toLowerCase()}`}>{req.status}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
