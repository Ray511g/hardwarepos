import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutorenewIcon from '@mui/icons-material/Autorenew';

type OpTab = 'inventory' | 'library' | 'transport';

export default function OperationsPage() {
    const { tryApi } = useSchool();
    const [activeTab, setActiveTab] = useState<OpTab>('inventory');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        inventory: [] as any[],
        library: [] as any[],
        transport: [] as any[]
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, libRes, transRes] = await Promise.all([
                tryApi('/api/inventory'),
                tryApi('/api/library'),
                tryApi('/api/transport')
            ]);
            setData({
                inventory: invRes?.ok ? await invRes.json() : [],
                library: libRes?.ok ? await libRes.json() : [],
                transport: transRes?.ok ? await transRes.json() : []
            });
        } catch (e) {}
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const activeData = data[activeTab] || [];
    const filteredData = activeData.filter((item: any) => {
        const s = searchTerm.toLowerCase();
        return (item.name || item.title || item.plateNumber || '').toLowerCase().includes(s);
    });

    return (
        <div className="operations-view animate-in">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Institutional Operations</h1>
                    <p className="view-subtitle">Manage school assets, logistics, and resource circulation</p>
                </div>
                <div className="view-actions">
                    <button className="btn btn-primary" onClick={() => {
                        const name = prompt(`Enter ${activeTab} item name:`);
                        if (name) {
                            tryApi(`/api/${activeTab}`, {
                                method: 'POST',
                                body: JSON.stringify(activeTab === 'inventory' ? { name, category: 'General', quantity: 10, unitPrice: 0 } :
                                            activeTab === 'library' ? { title: name, author: 'Unknown', totalCopies: 1 } :
                                            { plateNumber: name, status: 'Active' })
                            }).then(() => fetchData());
                        }
                    }}>
                        <AddIcon className="mr-2" style={{ fontSize: 18 }} />
                        {activeTab === 'inventory' ? 'Add Item' : activeTab === 'library' ? 'Add Book' : 'Register Vehicle'}
                    </button>
                </div>
            </div>

            <div className="ops-stats-grid">
                <div className="ops-stat-card glass-card">
                    <div className="stat-label">Total Inventory Value</div>
                    <div className="stat-value">KES 1.4M</div>
                    <div className="stat-delta up"><TrendingUpIcon /> +4% this month</div>
                </div>
                <div className="ops-stat-card glass-card">
                    <div className="stat-label">Books in Circulation</div>
                    <div className="stat-value">2,840</div>
                    <div className="stat-footer">12 Overdue Items</div>
                </div>
                <div className="ops-stat-card glass-card">
                    <div className="stat-label">Active Transport Routes</div>
                    <div className="stat-value">12</div>
                    <div className="stat-footer">850 Students assigned</div>
                </div>
            </div>

            <div className="tab-nav-wrapper">
                <div className="tab-nav">
                    <button className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
                        <InventoryIcon className="mr-2" /> Inventory & Store
                    </button>
                    <button className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
                        <MenuBookIcon className="mr-2" /> Library Center
                    </button>
                    <button className={`tab-btn ${activeTab === 'transport' ? 'active' : ''}`} onClick={() => setActiveTab('transport')}>
                        <LocalShippingIcon className="mr-2" /> Transport & Logistics
                    </button>
                </div>
                
                <div className="search-bar-mini">
                    <SearchIcon style={{ position: 'absolute', left: 12, top: 10, fontSize: 18, color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="ops-table-container card">
                {loading ? (
                    <div className="p-40 text-center"><AutorenewIcon className="animate-spin" /> Loading assets...</div>
                ) : (
                    <table className="ops-table">
                        <thead>
                            {activeTab === 'inventory' && (
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Stock Level</th>
                                    <th>Status</th>
                                    <th>Unit Price</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            )}
                            {activeTab === 'library' && (
                                <tr>
                                    <th>Book Title</th>
                                    <th>Author</th>
                                    <th>ISBN</th>
                                    <th>Available</th>
                                    <th>Location</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            )}
                            {activeTab === 'transport' && (
                                <tr>
                                    <th>Plate Number</th>
                                    <th>Driver / Phone</th>
                                    <th>Assigned Route</th>
                                    <th>Capacity</th>
                                    <th>Condition</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((item: any) => (
                                <tr key={item.id}>
                                    {activeTab === 'inventory' && (
                                        <>
                                            <td className="font-bold">{item.name}</td>
                                            <td>{item.category}</td>
                                            <td>
                                                <div className="stock-level">
                                                    <span className={`pill ${item.quantity < item.reorderLevel ? 'pill-danger' : 'pill-success'}`}>
                                                        {item.quantity} in stock
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{item.quantity < item.reorderLevel ? 'Reorder Needed' : 'Healthy'}</td>
                                            <td>KES {item.unitPrice}</td>
                                        </>
                                    )}
                                    {activeTab === 'library' && (
                                        <>
                                            <td className="font-bold">{item.title}</td>
                                            <td>{item.author}</td>
                                            <td className="text-xs font-mono">{item.isbn}</td>
                                            <td>{item.availableCopies} / {item.totalCopies}</td>
                                            <td>Shelf {item.category}</td>
                                        </>
                                    )}
                                    {activeTab === 'transport' && (
                                        <>
                                            <td className="font-bold">{item.plateNumber}</td>
                                            <td>
                                                <div className="text-sm font-bold">{item.driverName}</div>
                                                <div className="text-xs text-muted">{item.driverPhone}</div>
                                            </td>
                                            <td>{item.routes?.[0]?.name || 'Not Assigned'}</td>
                                            <td>{item.capacity} seats</td>
                                            <td><span className="pill pill-success">{item.status}</span></td>
                                        </>
                                    )}
                                    <td className="text-right">
                                        <button className="btn-icon"><MoreVertIcon style={{ fontSize: 20 }} /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '100px 0' }}>
                                        <div className="empty-state">
                                            <InventoryIcon style={{ fontSize: 64, opacity: 0.1 }} />
                                            <h3>No {activeTab} records found</h3>
                                            <p>Register records to start tracking school operations automatically.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <style jsx>{`
                .operations-view { padding: 40px; }
                .ops-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0; }
                .ops-stat-card { padding: 24px; border-radius: 20px; transition: all 0.3s; }
                .ops-stat-card:hover { transform: translateY(-5px); border-color: #3b82f6; }
                .stat-label { font-size: 13px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
                .stat-value { font-size: 32px; font-weight: 800; margin: 12px 0; color: var(--text-primary); }
                .stat-footer { font-size: 13px; color: var(--text-secondary); }
                .stat-delta { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; }
                .stat-delta.up { color: #10b981; }

                .tab-nav-wrapper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .search-bar-mini { position: relative; width: 300px; }
                .search-bar-mini input {
                    width: 100%;
                    padding: 10px 16px 10px 40px;
                    border: 1px solid var(--border-color);
                    background: var(--card-bg);
                    border-radius: 12px;
                    color: var(--text-primary);
                    outline: none;
                }
                
                .ops-table-container { overflow-x: auto; }
                .ops-table { width: 100%; border-collapse: collapse; }
                .ops-table th { text-align: left; padding: 16px 20px; background: #f8fafc; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
                .ops-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .ops-table tr:last-child td { border-bottom: none; }
                .ops-table tr:hover td { background: #f8fafc; }

                .pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .pill-success { background: #ecfdf5; color: #10b981; }
                .pill-danger { background: #fee2e2; color: #ef4444; }
                
                @media (max-width: 1024px) {
                    .ops-stats-grid { grid-template-columns: 1fr; }
                    .tab-nav-wrapper { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .search-bar-mini { width: 100%; }
                }
            `}</style>
        </div>
    );
}
