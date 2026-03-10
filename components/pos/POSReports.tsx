import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ReportData {
    totalRevenue: number;
    totalTransactions: number;
    totalItemsSold: number;
    byMethod: Record<string, number>;
    topProducts: { productId: string; name: string; qty: number; revenue: number }[];
    lowStock: { id: string; name: string; category: string; stock: number; reorderLevel: number; unit: string }[];
    hourly: Record<string, number>;
    date: string;
}

const today = new Date().toISOString().split('T')[0];

export default function POSReports() {
    const [reportDate, setReportDate] = useState(today);
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('elirama_token');
            const res = await fetch(`/api/pos/reports?date=${reportDate}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setData(await res.json());
        } catch (e) { console.error('[POS] report fetch:', e); }
        setLoading(false);
    }, [reportDate]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    // ── Hourly chart data (sorted by hour) ──────────────────────────────────
    const hourlyEntries = useMemo(() => {
        if (!data) return [];
        return Object.entries(data.hourly)
            .map(([label, amount]) => ({ label, amount }))
            .sort((a, b) => parseInt(a.label) - parseInt(b.label));
    }, [data]);

    const maxHourlyAmount = useMemo(
        () => Math.max(1, ...hourlyEntries.map(e => e.amount)),
        [hourlyEntries]
    );

    // ── CSV exports ─────────────────────────────────────────────────────────
    const downloadCSV = useCallback(() => {
        if (!data) return;
        const rows: (string | number)[][] = [
            ['Daily Sales Report', new Date(reportDate).toDateString()],
            [],
            ['Metric', 'Value'],
            ['Total Revenue (KSh)', data.totalRevenue.toFixed(2)],
            ['Transactions', data.totalTransactions],
            ['Items Sold', data.totalItemsSold],
            [],
            ['Payment Method', 'Amount (KSh)'],
            ...Object.entries(data.byMethod).map(([m, v]) => [m, v.toFixed(2)]),
            [],
            ['Top Products'],
            ['Product', 'Qty Sold', 'Revenue (KSh)'],
            ...data.topProducts.map(p => [p.name, p.qty, p.revenue.toFixed(2)]),
        ];
        triggerDownload(rows, `POS_Report_${reportDate}.csv`);
    }, [data, reportDate]);

    const downloadStockCSV = useCallback(() => {
        if (!data) return;
        const rows: (string | number)[][] = [
            ['Low Stock Report', new Date().toDateString()],
            ['Product', 'Category', 'Current Stock', 'Reorder Level', 'Unit'],
            ...data.lowStock.map(p => [p.name, p.category, p.stock, p.reorderLevel, p.unit]),
        ];
        triggerDownload(rows, `POS_StockReport_${reportDate}.csv`);
    }, [data, reportDate]);

    return (
        <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>Report Date:</label>
                    <input type="date" className="form-control" style={{ width: 200 }} value={reportDate} onChange={e => setReportDate(e.target.value)} />
                </div>
                <button className="btn-outline" onClick={fetchReport} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RefreshIcon fontSize="small" /> {loading ? 'Loading…' : 'Refresh'}
                </button>
                <button className="btn-outline" onClick={downloadCSV} disabled={!data} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DownloadIcon fontSize="small" /> Daily Sales CSV
                </button>
                <button className="btn-outline" onClick={downloadStockCSV} disabled={!data} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DownloadIcon fontSize="small" /> Stock Report CSV
                </button>
            </div>

            {!data && !loading && <div className="p-32 text-muted text-center">Select a date to generate a report</div>}
            {loading && <div className="p-32 text-muted text-center">Generating report…</div>}

            {data && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { label: 'Total Revenue', value: `KSh ${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'var(--accent-green)' },
                            { label: 'Transactions', value: data.totalTransactions, color: 'var(--accent-blue)' },
                            { label: 'Items Sold', value: data.totalItemsSold, color: 'var(--accent-purple)' },
                            { label: 'Low Stock Items', value: data.lowStock.length, color: data.lowStock.length > 0 ? '#ef4444' : 'var(--accent-green)' },
                        ].map(stat => (
                            <div key={stat.label} className="card" style={{ textAlign: 'center', padding: 20 }}>
                                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{stat.label}</div>
                                <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Payment Breakdown */}
                        <div className="card">
                            <h3 style={{ marginBottom: 16 }}>Payment Methods</h3>
                            {Object.entries(data.byMethod).length === 0
                                ? <div className="text-muted text-center">No sales on this date</div>
                                : Object.entries(data.byMethod).map(([method, amount]) => {
                                    const pct = data.totalRevenue > 0 ? (amount / data.totalRevenue) * 100 : 0;
                                    return (
                                        <div key={method} style={{ marginBottom: 14 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600 }}>{method}</span>
                                                <span>KSh {amount.toFixed(2)} ({pct.toFixed(1)}%)</span>
                                            </div>
                                            <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                                                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 4 }} />
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>

                        {/* Top Products */}
                        <div className="card">
                            <h3 style={{ marginBottom: 16 }}>Top Products</h3>
                            {data.topProducts.length === 0
                                ? <div className="text-muted text-center">No sales data</div>
                                : data.topProducts.map((p, i) => (
                                    <div key={p.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < data.topProducts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ width: 22, height: 22, background: 'var(--accent-blue)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: 13 }}>KSh {p.revenue.toFixed(2)}</div>
                                            <div style={{ fontSize: 11, color: '#64748b' }}>{p.qty} sold</div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Hourly Sales Chart */}
                    {hourlyEntries.length > 0 && (
                        <div className="card">
                            <h3 style={{ marginBottom: 16 }}>Hourly Sales Breakdown</h3>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, overflowX: 'auto', paddingBottom: 8 }}>
                                {hourlyEntries.map(entry => {
                                    const pct = (entry.amount / maxHourlyAmount) * 100;
                                    return (
                                        <div key={entry.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48, flex: '0 0 auto' }}>
                                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
                                                {entry.amount > 0 ? `${(entry.amount / 1000).toFixed(1)}k` : ''}
                                            </div>
                                            <div
                                                style={{
                                                    width: 36,
                                                    height: `${Math.max(4, pct)}%`,
                                                    background: 'var(--accent-blue)',
                                                    borderRadius: '4px 4px 0 0',
                                                    transition: 'height .3s ease',
                                                    opacity: entry.amount > 0 ? 1 : 0.2,
                                                    minHeight: 4,
                                                }}
                                                title={`KSh ${entry.amount.toFixed(2)}`}
                                            />
                                            <div style={{ fontSize: 10, color: '#64748b' }}>{entry.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Low Stock Table */}
                    {data.lowStock.length > 0 && (
                        <div className="card">
                            <h3 style={{ marginBottom: 16, color: '#ef4444' }}>⚠ Low Stock Items</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        {['Product', 'Category', 'Stock', 'Reorder Level', 'Status'].map(h => (
                                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.lowStock.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{p.name}</td>
                                            <td style={{ padding: '10px 12px' }}><span className="badge">{p.category}</span></td>
                                            <td style={{ padding: '10px 12px', color: p.stock === 0 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{p.stock} {p.unit}</td>
                                            <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.reorderLevel}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <span className="badge red">{p.stock === 0 ? 'Out of Stock' : 'Low Stock'}</span>
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

// ── Utility ──────────────────────────────────────────────────────────────────
function triggerDownload(rows: (string | number)[][], filename: string) {
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
