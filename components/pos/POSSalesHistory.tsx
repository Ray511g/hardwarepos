import React, { useState, useMemo, useCallback } from 'react';
import { POSSale } from '@/types/index';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { printReceipt } from './POSTerminal';

interface Props { sales: POSSale[]; onRefresh: () => void; }

const PAYMENT_METHODS = ['All', 'Cash', 'M-Pesa', 'Card', 'Till'] as const;

export default function POSSalesHistory({ sales, onRefresh }: Props) {
    const [search, setSearch] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterMethod, setFilterMethod] = useState<typeof PAYMENT_METHODS[number]>('All');

    // ── Memoised filtered list ──────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return sales.filter(s => {
            const matchSearch = !q ||
                s.receiptNumber.toLowerCase().includes(q) ||
                (s.cashierName ?? '').toLowerCase().includes(q) ||
                (s.customerName ?? '').toLowerCase().includes(q);
            const matchDate = !filterDate || s.createdAt.startsWith(filterDate);
            const matchMethod = filterMethod === 'All' || s.paymentMethod === filterMethod;
            return matchSearch && matchDate && matchMethod;
        });
    }, [sales, search, filterDate, filterMethod]);

    const totalRevenue = useMemo(
        () => filtered.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.total, 0),
        [filtered]
    );

    // ── Actions ─────────────────────────────────────────────────────────────
    const handleVoid = useCallback(async (saleId: string) => {
        if (!confirm('Void this sale? Stock will be restored.')) return;
        const token = localStorage.getItem('elirama_token');
        const res = await fetch('/api/pos/sales', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id: saleId, status: 'VOIDED' }),
        });
        if (res.ok) onRefresh();
        else alert('Failed to void sale');
    }, [onRefresh]);

    // ── CSV export ───────────────────────────────────────────────────────────
    const downloadCSV = useCallback(() => {
        const rows: (string | number)[][] = [
            ['Receipt #', 'Date', 'Items', 'Total (KSh)', 'Method', 'Cashier', 'Customer', 'Status'],
            ...filtered.map(s => [
                s.receiptNumber,
                new Date(s.createdAt).toLocaleString(),
                (s.items ?? []).length,
                s.total,
                s.paymentMethod,
                s.cashierName ?? '',
                s.customerName ?? '',
                s.status,
            ]),
        ];
        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `POS_Sales${filterDate ? `_${filterDate}` : ''}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [filtered, filterDate]);

    return (
        <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <SearchIcon style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 18 }} />
                    <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Search receipt, cashier…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <input type="date" className="form-control" style={{ width: 180 }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                <select className="form-control" style={{ width: 160 }} value={filterMethod} onChange={e => setFilterMethod(e.target.value as typeof filterMethod)}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m === 'All' ? 'All Methods' : m}</option>)}
                </select>
                <button className="btn-outline" onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }} title="Export current view to CSV">
                    <DownloadIcon fontSize="small" /> Export CSV
                </button>
                <div style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--accent-green)', whiteSpace: 'nowrap' }}>
                    {filtered.length} sale{filtered.length !== 1 ? 's' : ''} — KSh {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            </div>

            {/* Sales table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                            {['Receipt #', 'Date & Time', 'Items', 'Total', 'Method', 'Cashier', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(sale => (
                            <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>{sale.receiptNumber}</td>
                                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{new Date(sale.createdAt).toLocaleString()}</td>
                                <td style={{ padding: '12px 16px' }}>{(sale.items ?? []).length}</td>
                                <td style={{ padding: '12px 16px', fontWeight: 700, color: sale.status === 'VOIDED' ? '#ef4444' : 'var(--accent-green)' }}>
                                    KSh {sale.total.toFixed(2)}
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span className={`badge ${sale.paymentMethod === 'M-Pesa' ? 'green' : sale.paymentMethod === 'Card' ? 'blue' : ''}`}>
                                        {sale.paymentMethod}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: 12 }}>{sale.cashierName ?? '-'}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span className={`badge ${sale.status === 'COMPLETED' ? 'green' : sale.status === 'REFUNDED' ? 'blue' : 'red'}`}>
                                        {sale.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                                    <button className="action-btn" onClick={() => printReceipt(sale)} title="Print Receipt">
                                        <PrintIcon fontSize="small" />
                                    </button>
                                    {sale.status === 'COMPLETED' && (
                                        <button className="action-btn delete" onClick={() => handleVoid(sale.id)} title="Void Sale" style={{ fontSize: 11 }}>
                                            Void
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>No sales found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
