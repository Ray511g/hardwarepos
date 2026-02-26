import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSchool, generateId } from '../../context/SchoolContext';
import { GRADES, StudentResult, PerformanceLevel, Exam } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import ReportFormModal from '../../components/modals/ReportFormModal';
import CBCProgressReportModal from '../../components/modals/CBCProgressReportModal';
import Pagination from '../../components/common/Pagination';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
    PieChart, Pie, Legend
} from 'recharts';

const calculateLevel = (marks: number): PerformanceLevel => {
    if (marks >= 80) return 'EE';
    if (marks >= 50) return 'ME';
    if (marks >= 30) return 'AE';
    return 'BE';
};

const getLevelColor = (level: PerformanceLevel | string) => {
    switch (level) {
        case 'EE': return '#10b981';
        case 'ME': return '#3b82f6';
        case 'AE': return '#f59e0b';
        case 'BE': return '#ef4444';
        default: return '#94a3b8';
    }
};

export default function Results() {
    const { students, exams, results, saveBulkResults, addResult, showToast, learningAreas, assessmentScores, saveAssessmentScore, saveBulkAssessmentScores, activeGrades } = useSchool();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'exams' | 'cbc' | 'analytics'>('exams');
    const [selectedGrade, setSelectedGrade] = useState('');

    // Analytics Data Prep
    const analyticsData = useMemo(() => {
        if (!selectedGrade) return [];
        const gradeResults = results.filter(r => {
            const student = students.find(s => s.id === r.studentId);
            return student?.grade === selectedGrade;
        });

        const distributions = [
            { name: 'EE', value: gradeResults.filter(r => r.level === 'EE').length, color: '#10b981' },
            { name: 'ME', value: gradeResults.filter(r => r.level === 'ME').length, color: '#3b82f6' },
            { name: 'AE', value: gradeResults.filter(r => r.level === 'AE').length, color: '#f59e0b' },
            { name: 'BE', value: gradeResults.filter(r => r.level === 'BE').length, color: '#ef4444' },
        ];
        return distributions;
    }, [results, students, selectedGrade]);

    const subjectPerformance = useMemo(() => {
        if (!selectedGrade) return [];
        const gradeExams = exams.filter(e => e.grade === selectedGrade);
        return gradeExams.map(e => {
            const examResults = results.filter(r => r.examId === e.id);
            const avg = examResults.length ? examResults.reduce((s, r) => s + r.marks, 0) / examResults.length : 0;
            return { subject: e.subject, average: Math.round(avg) };
        });
    }, [exams, results, selectedGrade]);

    // ... rest of state remain same
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

    const [bulkLevel, setBulkLevel] = useState<PerformanceLevel | ''>('');
    const [bulkRemarks, setBulkRemarks] = useState('');

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

    useEffect(() => {
        if (router.query.grade) setSelectedGrade(router.query.grade as string);
        if (router.query.examId) {
            setSelectedExamId(router.query.examId as string);
            setActiveTab('exams');
        }
    }, [router.query]);

    // Automatically load results when selections change
    useEffect(() => {
        if (selectedExamId || selectedAssessmentId) {
            handleLoadResults();
        }
    }, [selectedExamId, selectedAssessmentId]);


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

    const handleApplyBulk = () => {
        if (!bulkLevel && !bulkRemarks) return;
        const newLocal = { ...localResults };
        gradeStudents.forEach(s => {
            newLocal[s.id] = {
                ...newLocal[s.id],
                level: (bulkLevel as PerformanceLevel) || newLocal[s.id]?.level,
                remarks: bulkRemarks || newLocal[s.id]?.remarks || '',
                marks: bulkLevel === 'EE' ? 85 : bulkLevel === 'ME' ? 65 : bulkLevel === 'AE' ? 40 : bulkLevel === 'BE' ? 20 : newLocal[s.id]?.marks || 0
            };
        });
        setLocalResults(newLocal);
        showToast(`Applied bulk settings to ${gradeStudents.length} students`);
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
                <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Performance Insights</button>
            </div>

            {activeTab === 'analytics' && (
                <div className="analytics-viewport animate-in" style={{ marginTop: 24 }}>
                    {!selectedGrade ? (
                         <div className="glass-card p-40 text-center">
                            <TrendingUpIcon style={{ fontSize: 64, opacity: 0.1, marginBottom: 16 }} />
                            <h3>Select a Grade to view Analytics</h3>
                         </div>
                    ) : (
                        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24 }}>
                            <div className="chart-card glass-card">
                                <h3 className="card-title">Grade Distribution ({selectedGrade})</h3>
                                <div style={{ height: 300, width: '100%' }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={analyticsData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {analyticsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="chart-card glass-card">
                                <h3 className="card-title">Subject Average Comparison</h3>
                                <div style={{ height: 300, width: '100%' }}>
                                    <ResponsiveContainer>
                                        <BarChart data={subjectPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="subject" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                <div className="card glass-card" style={{ marginTop: 24, borderLeft: '4px solid var(--accent-blue)' }}>
                    <div className="section-header-horizontal">
                        <div className="title-group">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {activeTab === 'exams' ? (
                                    <>
                                        <AssignmentIcon style={{ color: 'var(--accent-blue)' }} />
                                        Score Entry: {selectedExam?.name}
                                    </>
                                ) : (
                                    <>
                                        <AssignmentIcon style={{ color: 'var(--accent-purple)' }} />
                                        CBC Entry: {selectedAssessment?.name}
                                    </>
                                )}
                            </h3>
                            <div style={{ display: 'flex', gap: 15, marginTop: 4, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {activeTab === 'exams' && selectedExam && (
                                    <>
                                        <span><strong>Subject:</strong> {selectedExam.subject}</span>
                                        <span><strong>Term:</strong> {selectedExam.term}</span>
                                        <span><strong>Date:</strong> {new Date(selectedExam.date).toLocaleDateString()}</span>
                                        <span><strong>Total Marks:</strong> {selectedExam.totalMarks}</span>
                                    </>
                                )}
                                <span><strong>Grade:</strong> {selectedGrade}</span>
                                <span><strong>Learners:</strong> {gradeStudents.length}</span>
                            </div>
                        </div>
                        <div className="legend-strip">
                            <span className="badge green">EE: 80-100</span>
                            <span className="badge blue">ME: 50-79</span>
                            <span className="badge orange">AE: 30-49</span>
                            <span className="badge red">BE: 0-29</span>
                        </div>
                    </div>

                    {(activeTab === 'cbc' || activeTab === 'exams') && (
                        <div className="bulk-actions-bar glass-card" style={{
                            padding: '12px 20px',
                            marginBottom: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 15,
                            border: '1px solid var(--accent-blue)',
                            background: 'rgba(59, 130, 246, 0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <HistoryIcon style={{ color: 'var(--accent-blue)', fontSize: 20 }} />
                                <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>Bulk Actions:</span>
                            </div>
                            <select
                                title="Default Level"
                                className="form-control-sm"
                                style={{ width: 180 }}
                                value={bulkLevel}
                                onChange={e => setBulkLevel(e.target.value as any)}
                            >
                                <option value="">Set Default Level...</option>
                                <option value="EE">Exceeding (EE)</option>
                                <option value="ME">Meeting (ME)</option>
                                <option value="AE">Approaching (AE)</option>
                                <option value="BE">Below (BE)</option>
                            </select>
                            <input
                                className="form-control-sm"
                                style={{ flex: 1 }}
                                placeholder="Set default remark for all students..."
                                value={bulkRemarks}
                                onChange={e => setBulkRemarks(e.target.value)}
                            />
                            <button className="btn-primary-sm" onClick={handleApplyBulk}>Apply to All {gradeStudents.length} Students</button>
                        </div>
                    )}

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
                                                <div className="table-actions">
                                                    <button
                                                        className="icon-btn-sm success"
                                                        onClick={async () => {
                                                            if (activeTab === 'exams') {
                                                                await addResult({
                                                                    studentId: student.id,
                                                                    studentName: `${student.firstName} ${student.lastName}`,
                                                                    examId: selectedExamId,
                                                                    subject: selectedExam?.subject || '',
                                                                    marks: res.marks || 0,
                                                                    level: level || 'BE',
                                                                    remarks: res.remarks || ''
                                                                });
                                                            } else {
                                                                await saveAssessmentScore({
                                                                    studentId: student.id,
                                                                    assessmentItemId: selectedAssessmentId,
                                                                    score: res.marks || 0,
                                                                    level: level || 'BE',
                                                                    remarks: res.remarks || '',
                                                                    id: generateId(),
                                                                    criteriaId: ''
                                                                } as any);
                                                            }
                                                            showToast(`Saved result for ${student.firstName}`);
                                                        }}
                                                        title="Save Individual Record"
                                                        disabled={activeTab === 'exams' ? !selectedExamId : !selectedAssessmentId}
                                                    >
                                                        <SaveIcon fontSize="small" />
                                                    </button>
                                                    <button className="icon-btn-sm" onClick={() => setViewingStudentId(student.id)} title="Download Report Form">
                                                        <FileDownloadIcon fontSize="small" />
                                                    </button>
                                                </div>
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
