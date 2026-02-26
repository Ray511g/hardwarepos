import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, AttendanceRecord } from '../../types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PrintIcon from '@mui/icons-material/Print';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import Pagination from '../../components/common/Pagination';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';

export default function Attendance() {
    const { students, attendance, saveAttendance, settings, activeGrades } = useSchool();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [records, setRecords] = useState<Map<string, string>>(new Map());
    const [activeTab, setActiveTab] = useState<'mark' | 'reports' | 'insights'>('mark');

    // Report Filters
    const [reportDate, setReportDate] = useState('');
    const [reportTerm, setReportTerm] = useState('');
    const [reportStudent, setReportStudent] = useState('');
    const [reportGrade, setReportGrade] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredStudents = useMemo(() => {
        return students.filter(s => s.status === 'Active' && (!selectedGrade || s.grade === selectedGrade));
    }, [students, selectedGrade]);

    // Initialize from existing attendance and check lock status
    useMemo(() => {
        const existing = attendance.filter(a => a.date === selectedDate && (!selectedGrade || a.grade === selectedGrade));
        const newMap = new Map<string, string>();
        existing.forEach(a => newMap.set(a.studentId, a.status));
        setRecords(newMap);
        setIsLocked(existing.length > 0);
    }, [selectedDate, selectedGrade, attendance]);

    const setStatus = (studentId: string, status: string) => {
        setRecords(prev => {
            const next = new Map(prev);
            next.set(studentId, status);
            return next;
        });
    };

    const markAll = (status: string) => {
        const next = new Map(records);
        filteredStudents.forEach(s => next.set(s.id, status));
        setRecords(next);
    };

    const handleSave = () => {
        const attendanceRecords: AttendanceRecord[] = filteredStudents
            .filter(s => records.has(s.id))
            .map(s => ({
                id: `${s.id}-${selectedDate}`,
                studentId: s.id,
                studentName: `${s.firstName} ${s.lastName}`,
                grade: s.grade,
                date: selectedDate,
                status: records.get(s.id) as AttendanceRecord['status'],
            }));
        saveAttendance(attendanceRecords);
    };

    const presentCount = Array.from(records.values()).filter(v => v === 'Present').length;
    const absentCount = Array.from(records.values()).filter(v => v === 'Absent').length;
    const lateCount = Array.from(records.values()).filter(v => v === 'Late').length;
    const excusedCount = Array.from(records.values()).filter(v => v === 'Excused').length;
    const filteredAttendance = useMemo(() => {
        return attendance.filter(a => {
            return (!reportDate || a.date === reportDate) &&
                (!reportTerm || a.term === reportTerm) &&
                (!reportGrade || a.grade === reportGrade) &&
                (!reportStudent || a.studentName.toLowerCase().includes(reportStudent.toLowerCase()));
        });
    }, [attendance, reportDate, reportTerm, reportGrade, reportStudent]);

    const paginatedAttendance = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAttendance.slice(start, start + itemsPerPage);
    }, [filteredAttendance, currentPage]);

    const printAttendanceSheet = () => {
        const schoolName = settings.schoolName;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = `
            <html>
            <head>
                <title>Attendance Sheet - ${selectedGrade} - ${selectedDate}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .sign { margin-top: 50px; display: flex; justify-content: space-between; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${schoolName}</h1>
                    <h2>Daily Attendance Sheet</h2>
                    <p>Grade: ${selectedGrade || 'All Grades'} | Date: ${selectedDate}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Grade</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredStudents.map(s => `
                            <tr>
                                <td>${s.firstName} ${s.lastName}</td>
                                <td>${s.grade}</td>
                                <td>${records.get(s.id) || 'Not Marked'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="sign">
                    <p>Class Teacher: ___________________</p>
                    <p>Headteacher: ___________________</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="page-container glass-overlay" style={{ padding: '24px 32px' }}>
            <div className="page-header animate-up" style={{ marginBottom: '24px' }}>
                <div className="page-header-left">
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Attendance</h1>
                    <div className="tabs" style={{ marginTop: 8 }}>
                        <button className={`tab-btn ${activeTab === 'mark' ? 'active' : ''}`} onClick={() => setActiveTab('mark')}>Mark Attendance</button>
                        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Reports</button>
                        <button className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>Insights</button>
                    </div>
                </div>
                <div className="page-header-right">
                    {activeTab === 'mark' && (
                        <button className="btn-premium outline" onClick={printAttendanceSheet}>
                            <PrintIcon style={{ fontSize: 18 }} /> Print Sheet
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'mark' ? (
                <>
                    <div className="premium-stats-grid animate-up">
                        <div className="premium-stat-card">
                            <div className="premium-stat-card-top">
                                <div className="premium-stat-icon-wrapper" style={{ color: '#10b981' }}>
                                    <CheckCircleIcon />
                                </div>
                                <div className="premium-stat-chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 20 + 70 }))}>
                                            <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="premium-stat-label">Present</div>
                            <div className="premium-stat-value">{presentCount}</div>
                            <div className="premium-stat-footer">
                                <div className="stat-indicator-dot" style={{ background: '#10b981' }}></div>
                                Attending Today
                            </div>
                        </div>

                        <div className="premium-stat-card">
                            <div className="premium-stat-card-top">
                                <div className="premium-stat-icon-wrapper" style={{ color: '#f43f5e' }}>
                                    <CancelIcon />
                                </div>
                                <div className="premium-stat-chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 10 + 5 }))}>
                                            <Area type="monotone" dataKey="val" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="premium-stat-label">Absent</div>
                            <div className="premium-stat-value">{absentCount}</div>
                            <div className="premium-stat-footer">
                                <div className="stat-indicator-dot" style={{ background: '#f43f5e' }}></div>
                                Not in Class
                            </div>
                        </div>

                        <div className="premium-stat-card">
                            <div className="premium-stat-card-top">
                                <div className="premium-stat-icon-wrapper" style={{ color: '#f59e0b' }}>
                                    <AccessTimeIcon />
                                </div>
                                <div className="premium-stat-chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 15 + 10 }))}>
                                            <Area type="monotone" dataKey="val" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="premium-stat-label">Late</div>
                            <div className="premium-stat-value">{lateCount}</div>
                            <div className="premium-stat-footer">
                                <div className="stat-indicator-dot" style={{ background: '#f59e0b' }}></div>
                                Delayed Arrivals
                            </div>
                        </div>

                        <div className="premium-stat-card">
                            <div className="premium-stat-card-top">
                                <div className="premium-stat-icon-wrapper" style={{ color: '#06b6d4' }}>
                                    <InfoIcon />
                                </div>
                                <div className="premium-stat-chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[...Array(6)].map((_, i) => ({ val: Math.random() * 5 + 5 }))}>
                                            <Area type="monotone" dataKey="val" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="premium-stat-label">Excused</div>
                            <div className="premium-stat-value">{excusedCount}</div>
                            <div className="premium-stat-footer">
                                <div className="stat-indicator-dot" style={{ background: '#06b6d4' }}></div>
                                Authorized Absence
                            </div>
                        </div>
                    </div>

                    <div className="attendance-filters">
                        <div className="form-group">
                            <label htmlFor="attendance-date">Date</label>
                            <input id="attendance-date" name="attendance-date" type="date" className="form-control" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="attendance-grade">Grade</label>
                            <select id="attendance-grade" title="Select grade for attendance" className="filter-select" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                                <option value="">All Grades</option>
                                {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="attendance-actions">
                            <button className="btn-primary green" onClick={() => markAll('Present')} disabled={isLocked}>Mark All Present</button>
                            <button className="btn-primary red" onClick={() => markAll('Absent')} disabled={isLocked}>Mark All Absent</button>
                        </div>
                    </div>

                    {isLocked && (
                        <div className="alert info" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <InfoIcon />
                            <span>Attendance for this date and grade has already been marked and is now locked.</span>
                        </div>
                    )}

                    <div className="attendance-list-header animate-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CalendarTodayIcon style={{ fontSize: 18, color: 'var(--accent-blue)' }} />
                            Mark Attendance - {filteredStudents.length} Students
                        </h3>
                        {!isLocked && (
                            <button className="btn-premium" onClick={handleSave}>
                                <SaveIcon style={{ fontSize: 18 }} /> Save Changes
                            </button>
                        )}
                    </div>

                    {filteredStudents.length === 0 ? (
                        <div className="empty-state">
                            <p>No students found. Add students first to mark attendance.</p>
                        </div>
                    ) : (
                        filteredStudents.map(student => (
                            <div key={student.id} className="attendance-student-row">
                                <div className="attendance-student-info">
                                    <span style={{ fontWeight: 500 }}>{student.firstName} {student.lastName}</span>
                                    <span className="badge blue">{student.grade}</span>
                                </div>
                                <div className="attendance-status-btns">
                                    {['Present', 'Absent', 'Late', 'Excused'].map(status => (
                                        <button
                                            key={status}
                                            className={`attendance-status-btn ${status.toLowerCase()} ${records.get(student.id) === status ? 'active' : ''}`}
                                            onClick={() => !isLocked && setStatus(student.id, status)}
                                            disabled={isLocked}
                                            style={{ opacity: isLocked && records.get(student.id) !== status ? 0.5 : 1 }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </>
            ) : activeTab === 'reports' ? (
                <div className="reports-section">
                    <div className="attendance-filters" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="form-group">
                            <label htmlFor="reportTerm">Term</label>
                            <select id="reportTerm" title="Select term for report" className="filter-select" value={reportTerm} onChange={e => setReportTerm(e.target.value)}>
                                <option value="">All Terms</option>
                                <option value="Term 1">Term 1</option>
                                <option value="Term 2">Term 2</option>
                                <option value="Term 3">Term 3</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="reportGrade">Grade</label>
                            <select id="reportGrade" title="Select grade for report" className="filter-select" value={reportGrade} onChange={e => setReportGrade(e.target.value)}>
                                <option value="">All Grades</option>
                                {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="reportDate">Date</label>
                            <input id="reportDate" name="reportDate" type="date" className="filter-select" value={reportDate} onChange={e => setReportDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reportStudent">Student Name</label>
                            <input id="reportStudent" name="reportStudent" type="text" className="filter-select" placeholder="Search student..." value={reportStudent} onChange={e => setReportStudent(e.target.value)} />
                        </div>
                    </div>

                    <div className="table-wrapper" style={{ marginTop: 20 }}>
                        <table className="data-table">
                            <thead className="sticky-header">
                                <tr>
                                    <th>Date</th>
                                    <th>Student</th>
                                    <th>Grade</th>
                                    <th>Term</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAttendance.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>No attendance records found for these filters</td></tr>
                                ) : (
                                    paginatedAttendance.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.date}</td>
                                            <td style={{ fontWeight: 600 }}>{a.studentName}</td>
                                            <td>{a.grade}</td>
                                            <td>{a.term || 'N/A'}</td>
                                            <td>
                                                <span className={`status-pill ${a.status.toLowerCase()}`}>{a.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        totalItems={filteredAttendance.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            ) : (
                <div className="insights-section">
                    <div className="stats-grid" style={{ marginBottom: 30 }}>
                        <div className="stat-card blue">
                            <div className="stat-card-header">
                                <div className="stat-card-value">{Math.round((attendance.filter(a => a.status === 'Present').length / (attendance.length || 1)) * 100)}%</div>
                                <CheckCircleIcon style={{ color: 'var(--accent-blue)', fontSize: 28 }} />
                            </div>
                            <div className="stat-card-label">Overall Presence Rate</div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-card-header">
                                <div className="stat-card-value">
                                    {Math.max(...activeGrades.map(g => {
                                        const gradeAtt = attendance.filter(a => a.grade === g);
                                        return gradeAtt.length > 0 ? Math.round((gradeAtt.filter(a => a.status === 'Present').length / gradeAtt.length) * 100) : 0;
                                    }))}%
                                </div>
                                <TrendingUpIcon style={{ color: 'var(--accent-green)', fontSize: 28 }} />
                            </div>
                            <div className="stat-card-label">Best Performing Grade</div>
                        </div>
                    </div>

                    <div className="card" style={{ height: 400, marginBottom: 24 }}>
                        <div className="card-header"><h3>Daily Attendance Trend (Last 30 Days)</h3></div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={
                                    [...new Set(attendance.map(a => a.date))].sort().slice(-30).map(date => {
                                        const dateAtt = attendance.filter(a => a.date === date);
                                        return {
                                            date,
                                            presence: Math.round((dateAtt.filter(a => a.status === 'Present').length / dateAtt.length) * 100)
                                        };
                                    })
                                }>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="date" fontSize={10} />
                                    <YAxis fontSize={12} domain={[0, 100]} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="presence" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card" style={{ height: 400 }}>
                        <div className="card-header"><h3>Attendance Presence by Grade (%)</h3></div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={
                                    activeGrades.map(g => {
                                        const gradeAtt = attendance.filter(a => a.grade === g);
                                        return {
                                            name: g,
                                            presence: gradeAtt.length > 0 ? Math.round((gradeAtt.filter(a => a.status === 'Present').length / gradeAtt.length) * 100) : 0
                                        };
                                    })
                                }>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" fontSize={10} />
                                    <YAxis fontSize={12} domain={[0, 100]} />
                                    <Tooltip />
                                    <Bar dataKey="presence" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

