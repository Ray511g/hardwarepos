import React, { useState, useEffect, useMemo } from 'react';
import { useSchool, generateId } from '../../context/SchoolContext';
import { GRADES, StudentResult, PerformanceLevel, Exam } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReportFormModal from '../../components/modals/ReportFormModal';
import CBCProgressReportModal from '../../components/modals/CBCProgressReportModal';
import Pagination from '../../components/common/Pagination';

const calculateLevel = (marks: number): PerformanceLevel => {
    if (marks >= 80) return 'EE';
    if (marks >= 50) return 'ME';
    if (marks >= 30) return 'AE';
    return 'BE';
};

const getLevelColor = (level: PerformanceLevel) => {
    switch (level) {
        case 'EE': return 'var(--accent-green)';
        case 'ME': return 'var(--accent-blue)';
        case 'AE': return 'var(--accent-orange)';
        case 'BE': return 'var(--accent-red)';
        default: return 'inherit';
    }
};

export default function Results() {
    const { students, exams, results, saveBulkResults, showToast, learningAreas, assessmentScores, saveBulkAssessmentScores, activeGrades } = useSchool();
    const [activeTab, setActiveTab] = useState<'exams' | 'cbc'>('exams');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedExamId, setSelectedExamId] = useState('');

    // CBC Hierarchy Selection
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [selectedStrandId, setSelectedStrandId] = useState('');
    const [selectedSubStrandId, setSelectedSubStrandId] = useState('');
    const [selectedAssessmentId, setSelectedAssessmentId] = useState('');

    const [localResults, setLocalResults] = useState<Record<string, { marks: number, remarks: string, level?: PerformanceLevel }>>({});
    const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredExams = exams.filter(e => e.grade === selectedGrade);
    const gradeStudents = students.filter(s => s.grade === selectedGrade);

    // CBC Filtering
    const gradeAreas = learningAreas.filter(a => a.grade === selectedGrade);
    const selectedArea = gradeAreas.find(a => a.id === selectedAreaId);
    const selectedStrand = selectedArea?.strands.find(s => s.id === selectedStrandId);
    const selectedSubStrand = selectedStrand?.subStrands.find(ss => ss.id === selectedSubStrandId);
    const selectedAssessment = selectedSubStrand?.assessments.find(a => a.id === selectedAssessmentId);

    const paginatedStudents = gradeStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const selectedExam = exams.find(e => e.id === selectedExamId);

    const handleLoadResults = () => {
        if (activeTab === 'exams' && selectedExamId) {
            const existing = results.filter(r => r.examId === selectedExamId);
            const newLocal: Record<string, { marks: number, remarks: string }> = {};
            existing.forEach(r => {
                newLocal[r.studentId] = { marks: r.marks, remarks: r.remarks };
            });
            setLocalResults(newLocal);
        } else if (activeTab === 'cbc' && selectedAssessmentId) {
            const existing = assessmentScores.filter(s => s.assessmentItemId === selectedAssessmentId);
            const newLocal: Record<string, { marks: number, remarks: string, level: PerformanceLevel }> = {};
            existing.forEach(s => {
                newLocal[s.studentId] = { marks: s.score || 0, remarks: s.remarks || '', level: s.level as PerformanceLevel };
            });
            setLocalResults(newLocal);
        }
    };

    const handleUpdateMark = (studentId: string, marks: number) => {
        const level = calculateLevel(marks);
        setLocalResults(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], marks, level }
        }));
    };

    const handleUpdateLevel = (studentId: string, level: PerformanceLevel) => {
        setLocalResults(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], level }
        }));
    };

    const handleUpdateRemark = (studentId: string, remarks: string) => {
        setLocalResults(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const handleSave = async () => {
        if (activeTab === 'exams' && selectedExam) {
            const toSave = gradeStudents.map(s => ({
                studentId: s.id,
                studentName: `${s.firstName} ${s.lastName}`,
                examId: selectedExam.id,
                subject: selectedExam.subject,
                marks: localResults[s.id]?.marks || 0,
                level: calculateLevel(localResults[s.id]?.marks || 0),
                remarks: localResults[s.id]?.remarks || '',
            }));
            saveBulkResults(toSave as any);
        } else if (activeTab === 'cbc' && selectedAssessmentId) {
            const toSave = gradeStudents.map(s => ({
                id: generateId(),
                studentId: s.id,
                assessmentItemId: selectedAssessmentId,
                score: localResults[s.id]?.marks || 0,
                level: localResults[s.id]?.level || calculateLevel(localResults[s.id]?.marks || 0),
                remarks: localResults[s.id]?.remarks || '',
            }));
            await saveBulkAssessmentScores(toSave as any);
        }
    };

    const generateId = () => Math.random().toString(36).substring(2, 9);

    return (
        <div className="page-container glass-overlay">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Assessment Engine</h1>
                    <p className="page-subtitle">Standardized Exam & Competency Based Assessment Management</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-primary" onClick={handleSave} disabled={activeTab === 'exams' ? !selectedExamId : !selectedAssessmentId}>
                        <SaveIcon style={{ fontSize: 18, marginRight: 8 }} />
                        Confirm & Save Scores
                    </button>
                </div>
            </div>

            <div className="tabs-container">
                <button className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>Traditional Exams</button>
                <button className={`tab-btn ${activeTab === 'cbc' ? 'active' : ''}`} onClick={() => setActiveTab('cbc')}>CBC Competencies</button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: 20 }}>
                <div className="stat-card glass-card">
                    <h3 className="card-title">Subject & Assessment Selection</h3>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Grade Level</label>
                            <select title="Grade Level" className="form-control" value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setSelectedExamId(''); setSelectedAreaId(''); }}>
                                <option value="">Select Grade</option>
                                {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        {activeTab === 'exams' ? (
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Exam / Paper</label>
                                <select title="Exam Selection" className="form-control" value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} disabled={!selectedGrade}>
                                    <option value="">Select Assessment</option>
                                    {filteredExams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.subject})</option>)}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Learning Area</label>
                                    <select title="Learning Area" className="form-control" value={selectedAreaId} onChange={e => setSelectedAreaId(e.target.value)} disabled={!selectedGrade}>
                                        <option value="">Select Area</option>
                                        {gradeAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                {selectedAreaId && (
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Strand / Sub-Strand</label>
                                        <select title="Strand / Sub-Strand" className="form-control" value={selectedSubStrandId} onChange={e => setSelectedSubStrandId(e.target.value)}>
                                            <option value="">Select Sub-Strand</option>
                                            {selectedArea?.strands.flatMap(s => s.subStrands).map(ss => (
                                                <option key={ss.id} value={ss.id}>{ss.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <div style={{ alignSelf: 'flex-end', paddingBottom: 12 }}>
                            <button className="btn-outline" onClick={handleLoadResults} disabled={activeTab === 'exams' ? !selectedExamId : !selectedSubStrandId}>Load Sync</button>
                        </div>
                    </div>

                    {activeTab === 'cbc' && selectedSubStrandId && (
                        <div className="form-row" style={{ marginTop: 12 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Specific Assessment Item</label>
                                <select title="Assessment Item" className="form-control" value={selectedAssessmentId} onChange={e => setSelectedAssessmentId(e.target.value)}>
                                    <option value="">Select Item</option>
                                    {selectedSubStrand?.assessments.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {(selectedExam || selectedAssessmentId) && (
                <div className="card glass-card" style={{ marginTop: 24 }}>
                    <div className="section-header-horizontal">
                        <div className="title-group">
                            <h3 className="card-title">Score Entry: {activeTab === 'exams' ? selectedExam?.name : selectedAssessment?.name}</h3>
                            <p className="card-subtitle">Showing {paginatedStudents.length} learners for {selectedGrade}</p>
                        </div>
                        <div className="legend-strip">
                            <span className="badge green">EE: 80-100</span>
                            <span className="badge blue">ME: 50-79</span>
                            <span className="badge orange">AE: 30-49</span>
                            <span className="badge red">BE: 0-29</span>
                        </div>
                    </div>

                    <div className="table-container overhaul-table">
                        <table className="data-table">
                            <thead className="sticky-header">
                                <tr>
                                    <th>Learner Name</th>
                                    {activeTab === 'exams' && <th style={{ width: 120 }}>Marks / {selectedExam?.totalMarks}</th>}
                                    <th style={{ width: 220 }}>CBC Performance Level</th>
                                    <th>Teacher's Remarks</th>
                                    <th style={{ width: 80 }}>Status</th>
                                    <th style={{ width: 80 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStudents.map(student => {
                                    const res = localResults[student.id] || { marks: 0, remarks: '', level: undefined };
                                    const level = res.level || (activeTab === 'exams' ? calculateLevel(res.marks) : undefined);

                                    return (
                                        <tr key={student.id} className="interactive-row">
                                            <td style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</td>
                                            {activeTab === 'exams' && (
                                                <td>
                                                    <input
                                                        type="number"
                                                        title={`Marks for ${student.firstName}`}
                                                        className="form-control-sm"
                                                        style={{ width: 80 }}
                                                        max={selectedExam?.totalMarks}
                                                        min={0}
                                                        value={res.marks || ''}
                                                        onChange={e => handleUpdateMark(student.id, Number(e.target.value))}
                                                    />
                                                </td>
                                            )}
                                            <td>
                                                <select
                                                    title={`Performance Level for ${student.firstName}`}
                                                    className={`level-select ${level || ''}`}
                                                    value={level || ''}
                                                    onChange={e => handleUpdateLevel(student.id, e.target.value as PerformanceLevel)}
                                                >
                                                    <option value="">Assess Level...</option>
                                                    <option value="EE">Exceeding Expectations (EE)</option>
                                                    <option value="ME">Meeting Expectations (ME)</option>
                                                    <option value="AE">Approaching Expectations (AE)</option>
                                                    <option value="BE">Below Expectations (BE)</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    className="form-control-sm full-width"
                                                    placeholder="Teacher's comments..."
                                                    value={res.remarks}
                                                    onChange={e => handleUpdateRemark(student.id, e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <div className={`status-pill ${res.marks || res.level ? 'success' : 'pending'}`}>
                                                    {res.marks || res.level ? 'Draft' : 'Pending'}
                                                </div>
                                            </td>
                                            <td>
                                                <button className="icon-btn-sm" onClick={() => setViewingStudentId(student.id)} title="Generate Report">
                                                    <FileDownloadIcon fontSize="small" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        totalItems={gradeStudents.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {!(selectedExam || selectedAssessmentId) && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                    <SearchIcon style={{ fontSize: 48, opacity: 0.2, marginBottom: 16 }} />
                    <p>Select a Grade and Assessment to start entering results</p>
                </div>
            )}

            {viewingStudentId && (
                activeTab === 'exams' ? (
                    <ReportFormModal
                        studentId={viewingStudentId}
                        onClose={() => setViewingStudentId(null)}
                    />
                ) : (
                    <CBCProgressReportModal
                        studentId={viewingStudentId}
                        onClose={() => setViewingStudentId(null)}
                    />
                )
            )}
        </div>
    );
}
