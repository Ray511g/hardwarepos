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

    const filtered = students.filter(s => {
        const matchSearch = `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(search.toLowerCase());
        const matchGrade = !gradeFilter || s.grade === gradeFilter;
        return matchSearch && matchGrade;
    });

    const paginatedStudents = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const active = students.filter(s => s.status === 'Active').length;
    const male = students.filter(s => s.gender === 'Male').length;
    const female = students.filter(s => s.gender === 'Female').length;

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingStudent(null);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Students</h1>
                    <p>Manage student information and records</p>
                </div>
                <div className="page-header-right">
                    {hasPermission('students', 'CREATE') && (
                        <button className="btn-primary green" onClick={() => setShowAddModal(true)}>
                            <AddIcon style={{ fontSize: 18 }} /> Add Student
                        </button>
                    )}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-card-value">{students.length}</div>
                    <div className="stat-card-label">Total Students</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-value">{active}</div>
                    <div className="stat-card-label">Active Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value">{male}</div>
                    <div className="stat-card-label">Male</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value">{female}</div>
                    <div className="stat-card-label">Female</div>
                </div>
            </div>

            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <SearchIcon className="search-icon" />
                    <input
                        id="searchStudents"
                        name="searchStudents"
                        type="text"
                        className="search-input"
                        placeholder="Search by name or admission number..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    id="gradeFilter"
                    name="gradeFilter"
                    title="Filter students by grade"
                    className="filter-select"
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
