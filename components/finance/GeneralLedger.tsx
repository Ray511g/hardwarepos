import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import LockIcon from '@mui/icons-material/Lock';

const GeneralLedger: React.FC = () => {
    const { user: authUser } = useAuth();
    const {
        accounts, journalEntries,
        addChartOfAccount, updateChartOfAccount,
        addJournalEntry, approveJournalEntry, reverseJournalEntry
    } = useSchool();

    const [activeTab, setActiveTab] = useState<'accounts' | 'journal'>('journal');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [journalForm, setJournalForm] = useState({
        description: '',
        accountId: '',
        debit: 0,
        credit: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const filteredEntries = (journalEntries || []).filter(e =>
        (e?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e?.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e?.account?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAccounts = (accounts || []).filter(a =>
        (a?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a?.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleJournalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (journalForm.debit === 0 && journalForm.credit === 0) {
            alert('Must have either a debit or credit amount');
            return;
        }
        await addJournalEntry({ ...journalForm, requestedBy: authUser?.name || 'System' });
        setShowForm(false);
    };

    const exportCSV = () => {
        const data = activeTab === 'journal' ? filteredEntries : filteredAccounts;
        if (data.length === 0) return;

        let headers: string[] = [];
        let rows: any[] = [];

        if (activeTab === 'journal') {
            headers = ['Date', 'Transaction ID', 'Account', 'Code', 'Description', 'Debit', 'Credit', 'Status'];
            rows = filteredEntries.map(e => [
                new Date(e.date).toLocaleDateString(),
                e.transactionId,
                e.account?.name,
                e.account?.code,
                e.description,
                e.debit,
                e.credit,
                e.status
            ]);
        } else {
            headers = ['Code', 'Account Name', 'Type', 'Category', 'Balance'];
            rows = filteredAccounts.map(a => [
                a.code,
                a.name,
                a.type,
                a.category,
                a.balance
            ]);
        }

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map((v: any) => `"${v ?? ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="general-ledger animate-in">
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('journal')}
                    title="View Journal Posting History"
                    aria-label="Journal Entries Tab"
                >
                    <ReceiptLongIcon style={{ fontSize: 20 }} /> Journal Entries
                </button>
                <button
                    className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accounts')}
                    title="View Chart of Accounts & Balances"
                    aria-label="Chart of Accounts Tab"
                >
                    <AccountTreeIcon style={{ fontSize: 20 }} /> Chart of Accounts
                </button>
            </div>

            <div className="finance-nav-row">
                <div className="search-box-container">
                    <SearchIcon className="search-box-icon" />
                    <input
                        type="text"
                        className="form-control search-input-pl"
                        placeholder={`Search ${activeTab === 'journal' ? 'entries' : 'accounts'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        title={`Search ${activeTab}`}
                        aria-label={`Search ${activeTab}`}
                    />
                </div>
                <div className="finance-toolbar-right">
                    {activeTab === 'journal' && (
                        <button className="btn btn-primary" onClick={() => setShowForm(true)} title="Add manual journal entry" aria-label="New Posting">
                            <AddIcon className="mr-2" style={{ fontSize: 18 }} />
                            New Posting
                        </button>
                    )}
                    <button className="btn btn-outline" onClick={exportCSV} title="Download current view as CSV" aria-label="Export Data">
                        <FileDownloadIcon className="mr-2" style={{ fontSize: 18 }} />
                        Export CSV
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="admin-section animate-in" style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>Manual Journal Posting</h3>
                    <form onSubmit={handleJournalSubmit}>
                        <div className="grid-3">
                            <div className="form-group">
                                <label htmlFor="targetAcc">Target Account</label>
                                <select
                                    id="targetAcc"
                                    className="form-control"
                                    value={journalForm.accountId}
                                    onChange={e => setJournalForm({ ...journalForm, accountId: e.target.value })}
                                    required
                                    title="Select the account to post to"
                                >
                                    <option value="">Select Account...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="postDate">Date</label>
                                <input
                                    id="postDate"
                                    type="date"
                                    className="form-control"
                                    value={journalForm.date}
                                    onChange={e => setJournalForm({ ...journalForm, date: e.target.value })}
                                    required
                                    title="Date of transaction"
                                />
                            </div>
                        </div>
                        <div className="grid-3" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <input
                                    id="description"
                                    className="form-control"
                                    value={journalForm.description}
                                    onChange={e => setJournalForm({ ...journalForm, description: e.target.value })}
                                    placeholder="Purpose of entry..."
                                    required
                                    title="Brief explanation of entry"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="debitVal">Debit (KES)</label>
                                <input
                                    id="debitVal"
                                    type="number"
                                    className="form-control"
                                    value={journalForm.debit}
                                    onChange={e => setJournalForm({ ...journalForm, debit: parseFloat(e.target.value), credit: 0 })}
                                    title="Amount to debit"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="creditVal">Credit (KES)</label>
                                <input
                                    id="creditVal"
                                    type="number"
                                    className="form-control"
                                    value={journalForm.credit}
                                    onChange={e => setJournalForm({ ...journalForm, credit: parseFloat(e.target.value), debit: 0 })}
                                    title="Amount to credit"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} title="Cancel entry creation">Cancel</button>
                            <button type="submit" className="btn btn-primary" title="Post entry to ledger">Post Entry</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                {activeTab === 'journal' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>Account</th>
                                <th>Description</th>
                                <th className="text-right">Debit</th>
                                <th className="text-right">Credit</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.length > 0 ? filteredEntries.map((entry, i) => (
                                <tr key={entry.id || i}>
                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                    <td><code className="text-xs">{entry.transactionId}</code></td>
                                    <td>
                                        <div className="data-table-name">{entry.account?.name}</div>
                                        <div className="text-muted text-xs">{entry.account?.code}</div>
                                    </td>
                                    <td>{entry.description}</td>
                                    <td className="text-right" style={{ color: entry.debit > 0 ? '#10b981' : 'inherit', fontWeight: entry.debit > 0 ? 600 : 400 }}>
                                        {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                                    </td>
                                    <td className="text-right" style={{ color: entry.credit > 0 ? '#ef4444' : 'inherit', fontWeight: entry.credit > 0 ? 600 : 400 }}>
                                        {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge ${entry.status === 'Approved' ? 'green' : entry.status === 'Pending' ? 'orange' : 'red'}`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                            {entry.status === 'Pending' && (
                                                <button className="action-btn" onClick={() => approveJournalEntry(entry.id)} title="Approve & Post" aria-label="Approve posting">
                                                    <CheckCircleIcon style={{ fontSize: 16, color: '#10b981' }} />
                                                </button>
                                            )}
                                            {entry.status === 'Approved' && (
                                                <button className="action-btn delete" onClick={() => { if (confirm('Reverse this transaction? This will create an offsetting entry.')) reverseJournalEntry(entry.id); }} title="Reverse Entry" aria-label="Reverse posting">
                                                    <UndoIcon style={{ fontSize: 16 }} />
                                                </button>
                                            )}
                                            {entry.status === 'Reversed' && <LockIcon style={{ fontSize: 16, opacity: 0.3 }} titleAccess="Entry Locked" />}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-muted">
                                        No journal entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Account Name</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th className="text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccounts.map((acc) => (
                                <tr key={acc.id}>
                                    <td><code>{acc.code}</code></td>
                                    <td className="data-table-name">{acc.name}</td>
                                    <td><span className={`badge blue`}>{acc.type}</span></td>
                                    <td>{acc.category}</td>
                                    <td className="text-right" style={{ fontWeight: 600 }}>
                                        {acc.balance.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default GeneralLedger;
