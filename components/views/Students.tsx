import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, Student } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import AddStudentModal from '../../components/modals/AddStudentModal';
import Pagination from '../../components/common/Pagination';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import Student360Modal from '../../components/modals/Student360Modal';
import AddBehaviorModal from '../../components/modals/AddBehaviorModal';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

import { useAuth } from '../../context/AuthContext';

export default function Students() {
    const { students, deleteStudent, activeGrades } = useSchool();
    const { hasPermission } = useAuth();
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
    const [recordingBehavior, setRecordingBehavior] = useState<Student | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const router = React.useMemo(() => typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null, []);

    React.useEffect(() => {
        if (router?.get('action') === 'add') {
            setShowAddModal(true);
        }
    }, [router]);

    const { filtered, stats } = React.useMemo(() => {
        const filteredList = students.filter(s => {
            const matchSearch = `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(search.toLowerCase());
            const matchGrade = !gradeFilter || s.grade === gradeFilter;
            return matchSearch && matchGrade;
        });

        const activeCount = students.filter(s => s.status === 'Active').length;
        const maleCount = students.filter(s => s.gender === 'Male').length;
        const femaleCount = students.filter(s => s.gender === 'Female').length;

        return {
            filtered: filteredList,
            stats: {
                total: students.length,
                active: activeCount,
                male: maleCount,
                female: femaleCount
            }
        };
    }, [students, search, gradeFilter]);

    const paginatedStudents = React.useMemo(() =>
        filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [filtered, currentPage]
    );

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingStudent(null);
    };

    return (
        <div className="page-container glass-overlay" style={{ padding: '24px 32px' }}>
            <div className="page-header animate-up">
                <div className="page-header-left">
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Students</h1>
                    <p style={{ opacity: 0.7, fontWeight: 500 }}>Manage student information and records</p>
                </div>
                <div className="page-header-right">
                    {hasPermission('students', 'CREATE') && (
                        <button className="btn-premium" onClick={() => setShowAddModal(true)}>
                            <AddIcon style={{ fontSize: 18 }} /> Add Student
                        </button>
                    )}
                </div>
            </div>

            <div className="premium-stats-grid animate-up">
                <div className="premium-stat-card">
                    <div className="premium-stat-card-top">
                        <div className="premium-stat-icon-wrapper" style={{ color: 'var(--accent-blue)' }}>
                            <GroupIcon />
                        </div>
                        <div className="premium-stat-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 20 + 80 }))}>
                                    <Area type="monotone" dataKey="val" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.1} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="premium-stat-label">Total Students</div>
                    <div className="premium-stat-value">{stats.total}</div>
                    <div className="premium-stat-footer">
                        <div className="stat-indicator-dot" style={{ background: 'var(--accent-blue)' }}></div>
                        {stats.active} Active Members
                    </div>
                </div>

                <div className="premium-stat-card">
                    <div className="premium-stat-card-top">
                        <div className="premium-stat-icon-wrapper" style={{ color: 'var(--accent-green)' }}>
                            <SchoolIcon />
                        </div>
                        <div className="premium-stat-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 10 + 90 }))}>
                                    <Area type="monotone" dataKey="val" stroke="var(--accent-green)" fill="var(--accent-green)" fillOpacity={0.1} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="premium-stat-label">Active Ratio</div>
                    <div className="premium-stat-value">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</div>
                    <div className="premium-stat-footer">
                        <div className="stat-indicator-dot" style={{ background: 'var(--accent-green)' }}></div>
                        Current Enrollment
                    </div>
                </div>

                <div className="premium-stat-card">
                    <div className="premium-stat-card-top">
                        <div className="premium-stat-icon-wrapper" style={{ color: 'var(--accent-purple)' }}>
                            <MaleIcon />
                        </div>
                        <div className="premium-stat-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 20 + 30 }))}>
                                    <Area type="monotone" dataKey="val" stroke="var(--accent-purple)" fill="var(--accent-purple)" fillOpacity={0.1} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="premium-stat-label">Male Students</div>
                    <div className="premium-stat-value">{stats.male}</div>
                    <div className="premium-stat-footer">
                        <div className="stat-indicator-dot" style={{ background: 'var(--accent-purple)' }}></div>
                        Total Count
                    </div>
                </div>

                <div className="premium-stat-card">
                    <div className="premium-stat-card-top">
                        <div className="premium-stat-icon-wrapper" style={{ color: 'var(--accent-orange)' }}>
                            <FemaleIcon />
                        </div>
                        <div className="premium-stat-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 20 + 30 }))}>
                                    <Area type="monotone" dataKey="val" stroke="var(--accent-orange)" fill="var(--accent-orange)" fillOpacity={0.1} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="premium-stat-label">Female Students</div>
                    <div className="premium-stat-value">{stats.female}</div>
                    <div className="premium-stat-footer">
                        <div className="stat-indicator-dot" style={{ background: 'var(--accent-orange)' }}></div>
                        Total Count
                    </div>
                </div>
            </div>

            <div className="search-filter-bar animate-up" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                <div className="search-input-wrapper" style={{ flex: 1 }}>
                    <SearchIcon className="search-icon" />
                    <input
                        id="searchStudents"
                        name="searchStudents"
                        type="text"
                        className="search-input"
                        placeholder="Search by name or admission number..."
                        style={{ background: 'transparent' }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    id="gradeFilter"
                    name="gradeFilter"
                    title="Filter students by grade"
                    className="filter-select"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
                    value={gradeFilter}
                    onChange={e => setGradeFilter(e.target.value)}
                >
                    <option value="">All Grades</option>
                    {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>

            <div className="data-table-wrapper">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <PeopleIcon className="empty-state-icon" />
                        <p>No students found</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead className="sticky-header">
                            <tr>
                                <th>Adm No</th>
                                <th>Name</th>
                                <th>Grade</th>
                                <th>Gender</th>
                                <th>Parent</th>
                                <th>Status</th>
                                <th>Fee Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStudents.map(student => (
                                <tr key={student.id}>
                                    <td>{student.admissionNumber}</td>
                                    <td>{student.firstName} {student.lastName}</td>
                                    <td>{student.grade}</td>
                                    <td>{student.gender}</td>
                                    <td>{student.parentName}</td>
                                    <td><span className={`badge ${student.status === 'Active' ? 'green' : 'red'}`}>{student.status}</span></td>
                                    <td>KSh {student.feeBalance.toLocaleString()}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="table-action-btn" title="View 360 Profile" onClick={() => setViewingStudent(student)}>
                                                <VisibilityIcon style={{ fontSize: 16, color: 'var(--accent-blue)' }} />
                                            </button>
                                            {hasPermission('students', 'EDIT') && (
                                                <button className="table-action-btn" title="Record Behavior" onClick={() => setRecordingBehavior(student)}>
                                                    <StarIcon style={{ fontSize: 16, color: '#f59e0b' }} />
                                                </button>
                                            )}
                                            {hasPermission('students', 'EDIT') && (
                                                <button className="table-action-btn" title="Edit" onClick={() => handleEdit(student)}>
                                                    <EditIcon style={{ fontSize: 16 }} />
                                                </button>
                                            )}
                                            {hasPermission('students', 'DELETE') && (
                                                <button className="table-action-btn danger" title="Delete" onClick={() => deleteStudent(student.id)}>
                                                    <DeleteIcon style={{ fontSize: 16 }} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Pagination
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            {showAddModal && <AddStudentModal student={editingStudent} onClose={handleCloseModal} />}
            {viewingStudent && <Student360Modal student={viewingStudent} onClose={() => setViewingStudent(null)} />}
            {recordingBehavior && <AddBehaviorModal student={recordingBehavior} onClose={() => setRecordingBehavior(null)} />}
        </div>
    );
}
