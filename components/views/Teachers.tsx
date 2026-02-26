import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Teacher } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClassIcon from '@mui/icons-material/Class';
import AddTeacherModal from '../../components/modals/AddTeacherModal';
import Pagination from '../../components/common/Pagination';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Teachers() {
    const { teachers, deleteTeacher } = useSchool();
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filtered = (teachers || []).filter(t =>
        `${t.firstName} ${t.lastName} ${(t.subjects || []).join(' ')}`.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedTeachers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const active = (teachers || []).filter(t => t.status === 'Active').length;
    const totalSubjects = new Set((teachers || []).flatMap(t => t.subjects || [])).size;

    const handleEdit = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingTeacher(null);
    };

    return (
        <div className="page-container glass-overlay" style={{ padding: '24px 32px' }}>
            <div className="page-header animate-up">
                <div className="page-header-left">
                    <h1 className="page-title text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Teaching Faculty</h1>
                    <p className="page-subtitle" style={{ opacity: 0.7, fontWeight: 500 }}>Manage pedagogical staff, subject assignments, and operational status</p>
                </div>
                <div className="page-header-right">
                    <button className="btn-premium" onClick={() => setShowAddModal(true)}>
                        <AddIcon style={{ fontSize: 18 }} /> Register New Teacher
                    </button>
                </div>
            </div>

            <div className="premium-stats-grid animate-up">
                <div className="premium-stat-card">
                    <div className="premium-stat-card-top">
                        <div className="premium-stat-icon-wrapper" style={{ color: 'var(--accent-purple)' }}>
                            <GroupIcon />
                        </div>
                        <div className="premium-stat-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 20 + 80 }))}>
                                    <Area type="monotone" dataKey="val" stroke="var(--accent-purple)" fill="var(--accent-purple)" fillOpacity={0.1} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="premium-stat-label">Total Faculty</div>
                    <div className="premium-stat-value">{teachers?.length || 0}</div>
                    <div className="premium-stat-footer">
                        <div className="stat-indicator-dot" style={{ background: 'var(--accent-purple)' }}></div>
                        Registered Staff
                    </div>
                </div>

                <div className="premium-stat-card">
                    <div className="premium-stat-card-top">
                        <div className="premium-stat-icon-wrapper" style={{ color: '#10b981' }}>
                            <CheckCircleIcon />
                        </div>
                        <div className="premium-stat-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 10 + 90 }))}>
                                    <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="premium-stat-label">Active Duty</div>
                    <div className="premium-stat-value">{active}</div>
                    <div className="premium-stat-footer">
                        <div className="stat-indicator-dot" style={{ background: '#10b981' }}></div>
                        Verified & Active
                    </div>
                </div>

                <div className="premium-stat-card">
                    <div className="premium-stat-card-top">
                        <div className="premium-stat-icon-wrapper" style={{ color: 'var(--accent-blue)' }}>
                            <ClassIcon />
                        </div>
                        <div className="premium-stat-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 20 + 30 }))}>
                                    <Area type="monotone" dataKey="val" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.1} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="premium-stat-label">Curriculum Scope</div>
                    <div className="premium-stat-value">{totalSubjects}</div>
                    <div className="premium-stat-footer">
                        <div className="stat-indicator-dot" style={{ background: 'var(--accent-blue)' }}></div>
                        Unique Subjects
                    </div>
                </div>
            </div>

            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, subject or email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <div className="data-table-wrapper">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <SchoolIcon className="empty-state-icon" />
                        <h3>Faculty Records Empty</h3>
                        <p>No faculty members match your current search or filter. Try clearing your search to see all members.</p>
                        <button className="btn-outline mt-15" onClick={() => setSearch('')}>Clear Search</button>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Faculty Member</th>
                                <th>Contact Details</th>
                                <th>Qualification</th>
                                <th>Curriculum Focus</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTeachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td>
                                        <div className="flex-row">
                                            <div className="avatar-circle" style={{ background: 'var(--accent-purple-bg)', color: 'var(--accent-purple)' }}>
                                                {(teacher.firstName?.[0] || '') + (teacher.lastName?.[0] || '')}
                                            </div>
                                            <div style={{ marginLeft: 12 }}>
                                                <div className="fw-600 fs-14">{teacher.firstName} {teacher.lastName}</div>
                                                <div className="fs-11 opacity-60 uppercase tracking-widest">{teacher.id.slice(-6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fs-13">{teacher.email}</div>
                                        <div className="fs-11 opacity-60">{teacher.phone}</div>
                                    </td>
                                    <td>
                                        <div className="badge blue-light fs-11" style={{ borderRadius: 6 }}>{teacher.qualification || 'K.C.P.E/K.C.S.E'}</div>
                                    </td>
                                    <td>
                                        <div className="flex-row" style={{ flexWrap: 'wrap', gap: 4 }}>
                                            {(teacher.subjects || []).slice(0, 2).map(s => (
                                                <span key={s} className="fs-10 fw-600 px-8 py-2 bg-surface rounded-sm border-1 border-color">{s}</span>
                                            ))}
                                            {(teacher.subjects || []).length > 2 && <span className="fs-10 opacity-60">+{teacher.subjects.length - 2} more</span>}
                                        </div>
                                        <div className="fs-10 mt-4 opacity-50">Grades: {(teacher.grades || []).join(', ')}</div>
                                    </td>
                                    <td>
                                        <span className={`status-tag ${teacher.status?.toLowerCase() === 'active' ? 'active' : 'error'}`}>
                                            {teacher.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="table-actions justify-end">
                                            <button className="table-action-btn" title="Edit Profile" onClick={() => handleEdit(teacher)}>
                                                <EditIcon style={{ fontSize: 16 }} />
                                            </button>
                                            <button className="table-action-btn danger" title="Remove Record" onClick={() => {
                                                if (window.confirm(`Are you sure you want to remove ${teacher.firstName} ${teacher.lastName}?`)) {
                                                    deleteTeacher(teacher.id);
                                                }
                                            }}>
                                                <DeleteIcon style={{ fontSize: 16 }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex-between mt-24">
                <div className="fs-13 opacity-60">
                    Showing {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} faculty members
                </div>
                <Pagination
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {showAddModal && <AddTeacherModal teacher={editingTeacher} onClose={handleCloseModal} />}
        </div>
    );
}
