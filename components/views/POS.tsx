import React, { useState, useEffect, useCallback, useRef } from 'react';
import POSTerminal from '../pos/POSTerminal';
import POSInventory from '../pos/POSInventory';
import POSSalesHistory from '../pos/POSSalesHistory';
import POSReports from '../pos/POSReports';
import POSTillSetup from '../pos/POSTillSetup';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TuneIcon from '@mui/icons-material/Tune';
import { POSProduct, POSSale, POSTill } from '../../types';

export type POSTab = 'terminal' | 'inventory' | 'sales' | 'reports' | 'setup';

const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('elirama_token') ?? '' : '';

export default function POSView() {
    const [activeTab, setActiveTab] = useState<POSTab>('terminal');
    const [products, setProducts] = useState<POSProduct[]>([]);
    const [sales, setSales] = useState<POSSale[]>([]);
    const [tills, setTills] = useState<POSTill[]>([]);

    // Track which resources have been loaded at least once
    const loaded = useRef({ products: false, sales: false, tills: false });
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingSales, setLoadingSales] = useState(false);
    const [loadingTills, setLoadingTills] = useState(false);

    // ── Fetchers ────────────────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            const res = await fetch('/api/pos/products', {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) { setProducts(await res.json()); loaded.current.products = true; }
        } catch (e) { console.error('[POS] products fetch:', e); }
        setLoadingProducts(false);
    }, []);

    const fetchSales = useCallback(async () => {
        setLoadingSales(true);
        try {
            const res = await fetch('/api/pos/sales?limit=200', {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) { setSales(await res.json()); loaded.current.sales = true; }
        } catch (e) { console.error('[POS] sales fetch:', e); }
        setLoadingSales(false);
    }, []);

    const fetchTills = useCallback(async () => {
        setLoadingTills(true);
        try {
            const res = await fetch('/api/pos/tills', {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) { setTills(await res.json()); loaded.current.tills = true; }
        } catch (e) { console.error('[POS] tills fetch:', e); }
        setLoadingTills(false);
    }, []);

    // Called after a completed sale — only refresh the data that changed
    const onSaleComplete = useCallback(() => {
        fetchProducts(); // stock decremented
        fetchSales();    // new sale in list
    }, [fetchProducts, fetchSales]);

    // Refresh helper per tab
    const refreshCurrentTab = useCallback(() => {
        if (activeTab === 'terminal' || activeTab === 'inventory') fetchProducts();
        if (activeTab === 'sales') fetchSales();
        if (activeTab === 'setup') fetchTills();
    }, [activeTab, fetchProducts, fetchSales, fetchTills]);

    // ── Lazy loading: fetch only what the active tab needs ─────────────────
    useEffect(() => {
        // Terminal needs products + tills
        if (activeTab === 'terminal') {
            if (!loaded.current.products) fetchProducts();
            if (!loaded.current.tills) fetchTills();
        }
        // Inventory needs products
        if (activeTab === 'inventory' && !loaded.current.products) fetchProducts();
        // Sales needs sales
        if (activeTab === 'sales' && !loaded.current.sales) fetchSales();
        // Reports manages its own fetch via reportDate state
        // Setup needs tills
        if (activeTab === 'setup' && !loaded.current.tills) fetchTills();
    }, [activeTab, fetchProducts, fetchSales, fetchTills]);

    // ── Tab config ─────────────────────────────────────────────────────────
    const tabs: { id: POSTab; label: string; icon: React.ReactNode }[] = [
        { id: 'terminal', label: 'POS Terminal', icon: <PointOfSaleIcon /> },
        { id: 'inventory', label: 'Inventory', icon: <InventoryIcon /> },
        { id: 'sales', label: 'Sales History', icon: <ReceiptLongIcon /> },
        { id: 'reports', label: 'Reports', icon: <AssessmentIcon /> },
        { id: 'setup', label: 'Till Setup', icon: <TuneIcon /> },
    ];

    const isLoading =
        (activeTab === 'terminal' && (loadingProducts || loadingTills)) ||
        (activeTab === 'inventory' && loadingProducts) ||
        (activeTab === 'sales' && loadingSales) ||
        (activeTab === 'setup' && loadingTills);

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Hardware POS</h1>
                    <p>Point of Sale — Canteen &amp; Shop Management</p>
                </div>
                <button
                    className="btn-outline"
                    onClick={refreshCurrentTab}
                    disabled={isLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                    title="Refresh current tab data"
                >
                    {isLoading ? '⟳ Loading…' : '⟳ Refresh'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {isLoading && (
                <div className="p-32 text-center text-muted">Loading POS data…</div>
            )}

            {!isLoading && (
                <>
                    {activeTab === 'terminal' && (
                        <POSTerminal products={products} tills={tills} onSaleComplete={onSaleComplete} />
                    )}
                    {activeTab === 'inventory' && (
                        <POSInventory products={products} onRefresh={fetchProducts} />
                    )}
                    {activeTab === 'sales' && (
                        <POSSalesHistory sales={sales} onRefresh={fetchSales} />
                    )}
                    {activeTab === 'reports' && (
                        <POSReports />
                    )}
                    {activeTab === 'setup' && (
                        <POSTillSetup tills={tills} onRefresh={fetchTills} />
                    )}
                </>
            )}
        </div>
    );
}
