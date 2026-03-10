import React, { useState, useMemo, useCallback } from 'react';
import { POSProduct, POSCartItem, POSTill } from '@/types/index';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '@/context/AuthContext';

interface Props {
    products: POSProduct[];
    tills: POSTill[];
    onSaleComplete: () => void;
}

const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks', 'Stationery', 'Uniform', 'Other'] as const;

const CATEGORY_EMOJI: Record<string, string> = {
    Food: '🍱', Drinks: '🥤', Snacks: '🍿', Stationery: '📝', Uniform: '👕',
};

/** Generate a compact thermal-style receipt HTML */
function buildReceiptHtml(sale: any): string {
    return `<!DOCTYPE html><html><head><title>Receipt</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:12px;padding:16px;max-width:300px}
    h2{text-align:center;font-size:14px;margin-bottom:4px}.center{text-align:center}.divider{border-top:1px dashed #000;margin:8px 0}
    .row{display:flex;justify-content:space-between;margin:3px 0}.bold{font-weight:bold}.total{font-size:14px;font-weight:bold}
    </style></head><body>
    <h2>POS RECEIPT</h2>
    <div class="center">${sale.receiptNumber}</div>
    <div class="center">${new Date(sale.createdAt).toLocaleString()}</div>
    <div class="center">Cashier: ${sale.cashierName || ''}</div>
    <div class="divider"></div>
    ${(sale.items as any[]).map(i =>
        `<div class="row"><span>${i.productName} x${i.quantity}</span><span>KSh ${Number(i.total).toFixed(2)}</span></div>`
    ).join('')}
    <div class="divider"></div>
    <div class="row total"><span>TOTAL</span><span>KSh ${sale.total.toFixed(2)}</span></div>
    <div class="row"><span>Paid (${sale.paymentMethod})</span><span>KSh ${sale.amountPaid.toFixed(2)}</span></div>
    ${sale.change > 0 ? `<div class="row"><span>Change</span><span>KSh ${sale.change.toFixed(2)}</span></div>` : ''}
    ${sale.mpesaRef ? `<div class="row"><span>M-Pesa Ref</span><span>${sale.mpesaRef}</span></div>` : ''}
    <div class="divider"></div>
    <div class="center">Thank you!</div>
    </body></html>`;
}

export function printReceipt(sale: any) {
    const w = window.open('', '_blank', 'width=340,height=600');
    if (w) {
        w.document.write(buildReceiptHtml(sale));
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 400);
    }
}

export default function POSTerminal({ products, tills, onSaleComplete }: Props) {
    const { user } = useAuth();
    const [cart, setCart] = useState<POSCartItem[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('All');
    const [payMethod, setPayMethod] = useState<'Cash' | 'M-Pesa' | 'Card' | 'Till'>('Cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [mpesaRef, setMpesaRef] = useState('');
    const [tillRef, setTillRef] = useState('');
    const [selectedTill, setSelectedTill] = useState('');
    const [processing, setProcessing] = useState(false);

    // ── Memoised product list ───────────────────────────────────────────────
    const activeProducts = useMemo(
        () => products.filter(p => p.isActive && p.stock > 0),
        [products]
    );

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return activeProducts.filter(p => {
            const matchCat = category === 'All' || p.category === category;
            const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q);
            return matchCat && matchSearch;
        });
    }, [activeProducts, category, search]);

    // ── Cart helpers ────────────────────────────────────────────────────────
    const addToCart = useCallback((product: POSProduct) => {
        setCart(prev => {
            const existing = prev.find(c => c.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map(c =>
                    c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
                );
            }
            return [...prev, { product, quantity: 1, discount: 0 }];
        });
    }, []);

    const updateQty = useCallback((id: string, delta: number) => {
        setCart(prev => prev.map(c => {
            if (c.product.id !== id) return c;
            const newQty = c.quantity + delta;
            if (newQty <= 0 || newQty > c.product.stock) return c;
            return { ...c, quantity: newQty };
        }));
    }, []);

    const removeItem = useCallback((id: string) => setCart(prev => prev.filter(c => c.product.id !== id)), []);

    const clearCart = useCallback(() => setCart([]), []);

    // ── Totals ──────────────────────────────────────────────────────────────
    const { subtotal, total, change } = useMemo(() => {
        const sub = cart.reduce((s, c) => {
            const price = c.product.price * c.quantity;
            return s + price - (price * c.discount / 100);
        }, 0);
        return { subtotal: sub, total: sub, change: Number(amountPaid) - sub };
    }, [cart, amountPaid]);

    // ── Checkout ────────────────────────────────────────────────────────────
    const handleCheckout = async () => {
        if (!cart.length) return;
        if (payMethod === 'Cash' && Number(amountPaid) < total) {
            alert('Amount paid is less than total!');
            return;
        }
        setProcessing(true);
        try {
            const token = localStorage.getItem('elirama_token');
            const body = {
                tillId: selectedTill || null,
                items: cart.map(c => ({
                    productId: c.product.id,
                    productName: c.product.name,
                    quantity: c.quantity,
                    unitPrice: c.product.price,
                    discount: c.discount,
                    total: c.product.price * c.quantity * (1 - c.discount / 100),
                })),
                subtotal,
                tax: 0,
                discount: 0,
                total,
                amountPaid: payMethod === 'Cash' ? Number(amountPaid) : total,
                change: payMethod === 'Cash' ? change : 0,
                paymentMethod: payMethod,
                mpesaRef: mpesaRef || null,
                tillRef: tillRef || null,
            };
            const res = await fetch('/api/pos/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const sale = await res.json();
                clearCart();
                setAmountPaid('');
                setMpesaRef('');
                setTillRef('');
                onSaleComplete();
                printReceipt(sale);
            } else {
                const err = await res.json();
                alert(err.error || 'Checkout failed');
            }
        } catch {
            alert('Network error — please try again');
        }
        setProcessing(false);
    };

    const activeTills = useMemo(() => tills.filter(t => t.isActive), [tills]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, height: 'calc(100vh - 200px)' }}>
            {/* Product Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <SearchIcon style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 18 }} />
                    <input
                        className="form-control"
                        style={{ paddingLeft: 36 }}
                        placeholder="Search products, SKU…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Category tabs */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`tab-btn ${category === cat ? 'active' : ''}`}
                            style={{ padding: '6px 14px', fontSize: 13 }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, padding: 4 }}>
                    {filtered.map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="card"
                            style={{ padding: 16, textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'all .15s', background: 'var(--bg-surface)' }}
                        >
                            <div style={{ fontSize: 28, marginBottom: 8 }}>
                                {CATEGORY_EMOJI[product.category] ?? '📦'}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{product.name}</div>
                            <div style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: 15 }}>
                                KSh {product.price.toFixed(2)}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                Stock: {product.stock} {product.unit}
                            </div>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-32 text-muted text-center" style={{ gridColumn: '1/-1' }}>
                            No products found
                        </div>
                    )}
                </div>
            </div>

            {/* Cart / Checkout */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: 16 }}>
                    🛒 Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                    {cart.length === 0 && (
                        <div className="text-muted text-center" style={{ padding: 32 }}>Add products to cart</div>
                    )}
                    {cart.map(item => (
                        <div key={item.product.id} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{item.product.name}</div>
                                <button
                                    onClick={() => removeItem(item.product.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                                    aria-label={`Remove ${item.product.name}`}
                                >
                                    <DeleteIcon fontSize="small" />
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button onClick={() => updateQty(item.product.id, -1)} className="btn-outline" style={{ padding: '2px 6px', minWidth: 28 }} aria-label="Decrease">
                                        <RemoveIcon fontSize="small" />
                                    </button>
                                    <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateQty(item.product.id, 1)} className="btn-outline" style={{ padding: '2px 6px', minWidth: 28 }} aria-label="Increase">
                                        <AddIcon fontSize="small" />
                                    </button>
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                                    KSh {(item.product.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}
                                </div>
                            </div>
                            {item.discount > 0 && (
                                <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 3 }}>{item.discount}% discount applied</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Checkout panel */}
                <div style={{ padding: 16, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
                        <span>TOTAL</span>
                        <span style={{ color: 'var(--accent-green)' }}>KSh {total.toFixed(2)}</span>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: 12 }}>Payment Method</label>
                        <select className="form-control" value={payMethod} onChange={e => setPayMethod(e.target.value as typeof payMethod)}>
                            <option value="Cash">Cash</option>
                            <option value="M-Pesa">M-Pesa</option>
                            <option value="Card">Card</option>
                            <option value="Till">Till</option>
                        </select>
                    </div>

                    {payMethod === 'Cash' && (
                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: 12 }}>Amount Paid (KSh)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={amountPaid}
                                onChange={e => setAmountPaid(e.target.value)}
                                placeholder="0.00"
                                min={total}
                            />
                            {Number(amountPaid) >= total && total > 0 && (
                                <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginTop: 4, fontSize: 13 }}>
                                    Change: KSh {change.toFixed(2)}
                                </div>
                            )}
                        </div>
                    )}

                    {payMethod === 'M-Pesa' && (
                        <input
                            className="form-control"
                            placeholder="M-Pesa Transaction Code"
                            value={mpesaRef}
                            onChange={e => setMpesaRef(e.target.value)}
                        />
                    )}

                    {payMethod === 'Till' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <select className="form-control" value={selectedTill} onChange={e => setSelectedTill(e.target.value)}>
                                <option value="">Select Till</option>
                                {activeTills.map(t => <option key={t.id} value={t.id}>{t.tillNumber}</option>)}
                            </select>
                            <input
                                className="form-control"
                                placeholder="Till Reference"
                                value={tillRef}
                                onChange={e => setTillRef(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 700, background: cart.length === 0 ? '#334155' : undefined }}
                        onClick={handleCheckout}
                        disabled={processing || cart.length === 0}
                    >
                        {processing ? 'Processing…' : `Checkout — KSh ${total.toFixed(2)}`}
                    </button>

                    {cart.length > 0 && (
                        <button className="btn-outline" style={{ width: '100%' }} onClick={clearCart}>
                            Clear Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
