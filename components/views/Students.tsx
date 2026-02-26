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

            <div className="stats-grid animate-up" style={{ gap: '20px', marginBottom: '32px' }}>
                <div className="premium-card" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Students</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '4px 0' }}>{stats.total}</div>
                </div>
                <div className="premium-card" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Students</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-green)', margin: '4px 0' }}>{stats.active}</div>
                </div>
                <div className="premium-card" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Male</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{stats.male}</div>
                </div>
                <div className="premium-card" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Female</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{stats.female}</div>
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
