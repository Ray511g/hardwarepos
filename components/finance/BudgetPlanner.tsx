import React, { useState } from 'react';
import PieChartIcon from '@mui/icons-material/PieChart';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

interface BudgetPlannerProps {
    budgets: any[];
    onUpdate: (data: any) => void;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ budgets, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        year: new Date().getFullYear(),
        department: 'Academic',
        category: 'Utilities',
        allocatedAmount: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.allocatedAmount <= 0) {
            alert('Allocation amount must be greater than zero');
            return;
        }
        onUpdate(form);
        setShowForm(false);
    };

    return (
        <div className="budget-planner animate-in">
            <div className="finance-toolbar">
                <div>
                    <h2 className="section-title">Budget Management</h2>
                    <p className="text-muted text-xs">Allocate and track departmental financial limits</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)} title="Add new budget allocation" aria-label="New Allocation">
                    <AddIcon className="mr-2" style={{ fontSize: 18 }} />
                    New Allocation
                </button>
            </div>

            {showForm && (
                <div className="admin-section animate-in" style={{ marginBottom: 24, border: '1px solid #3b82f6' }}>
                    <h3 className="section-title" style={{ marginBottom: 20 }}>Allocate Budget</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-3">
                            <div className="form-group">
                                <label htmlFor="deptSelect">Department</label>
                                <select
                                    id="deptSelect"
                                    className="form-control"
                                    value={form.department}
                                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                                    title="Choose department"
                                    aria-label="Department Select"
                                >
                                    <option>Academic</option>
                                    <option>Administration</option>
                                    <option>Operations</option>
                                    <option>Extracurricular</option>
                                    <option>Feeding</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="catSelect">Category</label>
                                <select
                                    id="catSelect"
                                    className="form-control"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    title="Choose expense category"
                                    aria-label="Category Select"
                                >
                                    <option>Utilities</option>
                                    <option>Maintenance</option>
                                    <option>Feeding</option>
                                    <option>Academic Materials</option>
                                    <option>Salaries</option>
                                    <option>Transport</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="allocAmt">Allocation (KES)</label>
                                <input
                                    id="allocAmt"
                                    className="form-control"
                                    type="number"
                                    value={form.allocatedAmount || ''}
                                    onChange={(e) => setForm({ ...form, allocatedAmount: parseFloat(e.target.value) || 0 })}
                                    required
                                    min="1"
                                    title="Enter allocation amount"
                                />
                            </div>
                        </div>
                        <div className="grid-3" style={{ marginTop: 20 }}>
                            <div className="form-group">
                                <label htmlFor="finYear">Financial Year</label>
                                <input
                                    id="finYear"
                                    className="form-control"
                                    type="number"
                                    value={form.year || ''}
                                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
                                    required
                                    title="Financial Year"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} title="Cancel allocation">Cancel</button>
                            <button type="submit" className="btn btn-primary" title="Save budget allocation">Save Allocation</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="finance-stats-container">
                {budgets.length > 0 ? budgets.map((b, i) => (
                    <div key={i} className="stat-card blue" style={{ height: 'auto', textAlign: 'left', display: 'block' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: 16 }}>{b.category}</h4>
                                <span className="badge blue" style={{ marginTop: 8 }}>{b.department} • {b.year}</span>
                            </div>
                            <div className={`badge ${b.utilization > 90 ? 'red' : b.utilization > 75 ? 'orange' : 'green'}`}>
                                {b.utilization > 90 && <WarningIcon style={{ fontSize: 14, marginRight: 4 }} />}
                                {Math.round(b.utilization)}% Utilized
                            </div>
                        </div>

                        <div className="progress-container" style={{ marginTop: 20 }}>
                            <div className="progress-fill" style={{
                                width: `${Math.min(b.utilization, 100)}%`,
                                background: b.utilization > 90 ? '#ef4444' : b.utilization > 80 ? '#f59e0b' : '#3b82f6'
                            }}></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                            <div>
                                <span className="text-muted text-xs uppercase block">Spent</span>
                                <span style={{ fontWeight: 600 }}>KES {b.spentAmount.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-muted text-xs uppercase block">Remaining</span>
                                <span style={{ fontWeight: 600, color: (b.allocatedAmount - b.spentAmount) < 0 ? '#ef4444' : 'inherit' }}>
                                    KES {(b.allocatedAmount - b.spentAmount).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="p-20 text-center text-muted" style={{ gridColumn: '1 / -1', background: 'var(--bg-secondary)', borderRadius: 12, width: '100%' }}>
                        <PieChartIcon style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
                        <h3 style={{ margin: 0 }}>No budgets defined for the current period</h3>
                        <p style={{ fontSize: 14 }}>Click "New Allocation" to set up your first budget.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetPlanner;
