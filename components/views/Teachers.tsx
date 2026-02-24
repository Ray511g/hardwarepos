import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Teacher } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import AddTeacherModal from '../../components/modals/AddTeacherModal';
import Pagination from '../../components/common/Pagination';

export default function Teachers() {
    const { teachers, deleteTeacher } = useSchool();
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filtered = teachers.filter(t =>
        `${t.firstName} ${t.lastName} ${t.subjects.join(' ')}`.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedTeachers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const active = teachers.filter(t => t.status === 'Active').length;
    const totalSubjects = new Set(teachers.flatMap(t => t.subjects)).size;

    const handleEdit = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingTeacher(null);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Teachers</h1>
                    <p>Manage teaching staff and assignments</p>
                </div>
                <div className="page-header-right">
                    <button className="btn-primary purple" onClick={() => setShowAddModal(true)}>
                        <AddIcon style={{ fontSize: 18 }} /> Add Teacher
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-card-value">{teachers.length}</div>
                    <div className="stat-card-label">Total Teachers</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-value">{active}</div>
                    <div className="stat-card-label">Active Teachers</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-value">{totalSubjects}</div>
                    <div className="stat-card-label">Subjects Taught</div>
                </div>
            </div>

            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search teachers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="data-table-wrapper">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <SchoolIcon className="empty-state-icon" />
                        <p>No teachers found</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead className="sticky-header">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Subjects</th>
                                <th>Grades</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTeachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td>{teacher.firstName} {teacher.lastName}</td>
                                    <td>{teacher.email}</td>
                                    <td>{teacher.phone}</td>
                                    <td>{teacher.subjects.join(', ')}</td>
                                    <td>{teacher.grades.join(', ')}</td>
                                    <td><span className={`badge ${teacher.status === 'Active' ? 'green' : 'red'}`}>{teacher.status}</span></td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="table-action-btn" title="Edit" onClick={() => handleEdit(teacher)}>
                                                <EditIcon style={{ fontSize: 16 }} />
                                            </button>
                                            <button className="table-action-btn danger" title="Delete" onClick={() => deleteTeacher(teacher.id)}>
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

            <Pagination
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            {showAddModal && <AddTeacherModal teacher={editingTeacher} onClose={handleCloseModal} />}
        </div>
    );
}
