import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, TERMS, Exam } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleExamModal from '../../components/modals/ScheduleExamModal';
import Pagination from '../../components/common/Pagination';

export default function Exams() {
    const { exams, deleteExam, activeGrades } = useSchool();
    const [gradeFilter, setGradeFilter] = useState('');
    const [termFilter, setTermFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filtered = exams.filter(e => {
        return (!gradeFilter || e.grade === gradeFilter) && (!termFilter || e.term === termFilter);
    });

    const paginatedExams = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const scheduled = exams.filter(e => e.status === 'Scheduled').length;
    const completed = exams.filter(e => e.status === 'Completed').length;

    const handleEdit = (exam: Exam) => {
        setEditingExam(exam);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingExam(null);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Exam Management</h1>
                    <p>Schedule and track examinations</p>
                </div>
                <div className="page-header-right">
                    <button className="btn-primary green" onClick={() => setShowAddModal(true)}>
                        <AddIcon style={{ fontSize: 18 }} /> Schedule Exam
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Exams</span>
                        <AssignmentIcon className="stat-card-icon" />
                    </div>
                    <div className="stat-card-value">{exams.length}</div>
                    <div className="stat-card-sub">All examinations</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Scheduled</span>
                        <AssignmentIcon className="stat-card-icon" />
                    </div>
                    <div className="stat-card-value">{scheduled}</div>
                    <div className="stat-card-sub">Upcoming exams</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Completed</span>
                        <AssignmentIcon className="stat-card-icon" />
                    </div>
                    <div className="stat-card-value">{completed}</div>
                    <div className="stat-card-sub">Finished exams</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Results</span>
                        <AssignmentIcon className="stat-card-icon" />
                    </div>
                    <div className="stat-card-value">{completed}</div>
                    <div className="stat-card-sub">Recorded results</div>
                </div>
            </div>

            <div className="search-filter-bar">
                <div className="form-group" style={{ marginBottom: 0, minWidth: 180 }}>
                    <label htmlFor="exam-grade">Grade Level</label>
                    <select id="exam-grade" title="Filter exams by grade" className="filter-select" value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} style={{ width: '100%' }}>
                        <option value="">All Grades</option>
                        {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0, minWidth: 180 }}>
                    <label htmlFor="exam-term">Term</label>
                    <select id="exam-term" title="Filter exams by term" className="filter-select" value={termFilter} onChange={e => setTermFilter(e.target.value)} style={{ width: '100%' }}>
                        <option value="">All Terms</option>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="data-table-wrapper">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <AssignmentIcon className="empty-state-icon" />
                        <p>No exams found</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead className="sticky-header">
                            <tr>
                                <th>Exam Name</th>
                                <th>Subject</th>
                                <th>Grade</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Term</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedExams.map(exam => (
                                <tr key={exam.id}>
                                    <td>{exam.name}</td>
                                    <td>{exam.subject}</td>
                                    <td>{exam.grade}</td>
                                    <td>{new Date(exam.date).toLocaleDateString()}</td>
                                    <td><span className="badge blue">{exam.type}</span></td>
                                    <td>{exam.term}</td>
                                    <td>
                                        <span className={`badge ${exam.status === 'Completed' ? 'green' : exam.status === 'Scheduled' ? 'orange' : 'red'}`}>
                                            {exam.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="table-action-btn"
                                                title="Enter Results"
                                                onClick={() => {
                                                    window.location.href = `/results?examId=${exam.id}&grade=${encodeURIComponent(exam.grade)}`;
                                                }}
                                            >
                                                <AssignmentIcon style={{ fontSize: 16, color: 'var(--accent-blue)' }} />
                                            </button>
                                            <button className="table-action-btn" title="Edit" onClick={() => handleEdit(exam)}>
                                                <EditIcon style={{ fontSize: 16 }} />
                                            </button>
                                            <button className="table-action-btn danger" title="Delete" onClick={() => deleteExam(exam.id)}>
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

            {showAddModal && <ScheduleExamModal exam={editingExam} onClose={handleCloseModal} />}
        </div>
    );
}
