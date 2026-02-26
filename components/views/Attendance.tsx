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
    const [searchQuery, setSearchQuery] = useState('');
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
        return students.filter(s =>
            s.status === 'Active' &&
            (!selectedGrade || s.grade === selectedGrade) &&
            (`${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [students, selectedGrade, searchQuery]);

    // Initialize from existing attendance and check lock status
    React.useEffect(() => {
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

    const { presentCount, absentCount, lateCount, excusedCount } = useMemo(() => {
        const vals = Array.from(records.values());
        return {
            presentCount: vals.filter(v => v === 'Present').length,
            absentCount: vals.filter(v => v === 'Absent').length,
            lateCount: vals.filter(v => v === 'Late').length,
            excusedCount: vals.filter(v => v === 'Excused').length,
        };
    }, [records]);
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

    const insightsData = useMemo(() => {
        const overallRate = Math.round((attendance.filter(a => a.status === 'Present').length / (attendance.length || 1)) * 100);

        const gradeRates = activeGrades.map(g => {
            const gradeAtt = attendance.filter(a => a.grade === g);
            return gradeAtt.length > 0 ? Math.round((gradeAtt.filter(a => a.status === 'Present').length / gradeAtt.length) * 100) : 0;
        });
        const bestGradeRate = Math.max(...gradeRates, 0);

        const trendData = [...new Set(attendance.map(a => a.date))].sort().slice(-30).map(date => {
            const dateAtt = attendance.filter(a => a.date === date);
            return {
                date,
                presence: Math.round((dateAtt.filter(a => a.status === 'Present').length / dateAtt.length) * 100)
            };
        });

        return { overallRate, bestGradeRate, trendData };
    }, [attendance, activeGrades]);

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

                    <div className="attendance-filters animate-up" style={{ background: 'var(--bg-surface-opaque)', padding: 16, borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="attendance-date" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date</label>
                            <input id="attendance-date" name="attendance-date" type="date" className="filter-select" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="attendance-grade" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Grade</label>
                            <select id="attendance-grade" title="Select grade for attendance" className="filter-select" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                                <option value="">All Grades</option>
                                {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, flexGrow: 1 }}>
                            <label htmlFor="attendance-search" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Search Student</label>
                            <div style={{ position: 'relative' }}>
                                <TrendingUpIcon style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.5 }} />
                                <input
                                    id="attendance-search"
                                    type="text"
                                    className="filter-select"
                                    style={{ paddingLeft: 36, width: '100%' }}
                                    placeholder="Type name..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="attendance-actions" style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
                            <button className="btn-premium outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => markAll('Present')} disabled={isLocked}>Mark All Present</button>
                            <button className="btn-outline danger" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => markAll('Absent')} disabled={isLocked}>Mark All Absent</button>
                        </div>
                    </div>

                    {isLocked && (
                        <div className="alert info" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <InfoIcon />
                            <span>Attendance for this date and grade has already been marked and is now locked.</span>
                        </div>
                    )}

                    <div className="attendance-list-header animate-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CalendarTodayIcon style={{ fontSize: 18, color: 'var(--accent-blue)' }} />
                                Mark Attendance - {filteredStudents.length} Students
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.6, fontWeight: 500 }}>
                                {Array.from(records.keys()).filter(id => filteredStudents.some(s => s.id === id)).length} of {filteredStudents.length} marked found matching search
                            </p>
                        </div>
                        {!isLocked && (
                            <button className="btn-premium" onClick={handleSave}>
                                <SaveIcon style={{ fontSize: 18 }} /> Save Changes
                            </button>
                        )}
                    </div>

                    <div className="attendance-marking-list animate-up" style={{ display: 'grid', gap: 12 }}>
                        {filteredStudents.length === 0 ? (
                            <div className="empty-state">
                                <GroupIcon className="empty-state-icon" />
                                <h3>Attendance List Empty</h3>
                                <p>No students match your current selection or search query. Please adjust your filters.</p>
                            </div>
                        ) : (
                            filteredStudents.map(student => (
                                <div key={student.id} className="premium-card flex-between" style={{ padding: '12px 20px', background: 'var(--bg-card-opaque)' }}>
                                    <div className="flex-row" style={{ gap: 16 }}>
                                        <div className="avatar-circle small" style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.75rem' }}>
                                            {student.firstName[0]}{student.lastName[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{student.firstName} {student.lastName}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{student.grade} • #{student.id.slice(-4)}</div>
                                        </div>
                                    </div>
                                    <div className="attendance-status-btns" style={{ gap: 8 }}>
                                        {[
                                            { label: 'Present', color: '#10b981' },
                                            { label: 'Absent', color: '#f43f5e' },
                                            { label: 'Late', color: '#f59e0b' },
                                            { label: 'Excused', color: '#06b6d4' }
                                        ].map(status => (
                                            <button
                                                key={status.label}
                                                className={`attendance-status-btn-premium ${records.get(student.id) === status.label ? 'active' : ''}`}
                                                onClick={() => !isLocked && setStatus(student.id, status.label)}
                                                disabled={isLocked}
                                                style={{
                                                    '--active-color': status.color,
                                                    opacity: isLocked && records.get(student.id) !== status.label ? 0.4 : 1
                                                } as React.CSSProperties}
                                            >
                                                {status.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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
                <div className="insights-section animate-up">
                    <div className="premium-stats-grid" style={{ marginBottom: 30 }}>
                        <div className="premium-stat-card">
                            <div className="premium-stat-card-top">
                                <div className="premium-stat-icon-wrapper" style={{ color: 'var(--accent-blue)' }}>
                                    <CheckCircleIcon />
                                </div>
                            </div>
                            <div className="premium-stat-label">Overall Presence Rate</div>
                            <div className="premium-stat-value">{insightsData.overallRate}%</div>
                            <div className="premium-stat-footer">Across all terms</div>
                        </div>
                        <div className="premium-stat-card">
                            <div className="premium-stat-card-top">
                                <div className="premium-stat-icon-wrapper" style={{ color: 'var(--accent-green)' }}>
                                    <TrendingUpIcon />
                                </div>
                            </div>
                            <div className="premium-stat-label">Best Performing Grade</div>
                            <div className="premium-stat-value">{insightsData.bestGradeRate}%</div>
                            <div className="premium-stat-footer">Highest attendance</div>
                        </div>
                    </div>

                    <div className="premium-card" style={{ height: 400, marginBottom: 24, padding: 24 }}>
                        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 700 }}>Daily Attendance Trend (Last 30 Days)</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={insightsData.trendData}>
                                    <defs>
                                        <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="date" fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                                    <YAxis fontSize={11} stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ background: '#1a1f2e', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="presence" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#attendanceGradient)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="premium-card" style={{ height: 400, padding: 24 }}>
                        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 700 }}>Attendance by Grade</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={activeGrades.map(g => {
                                        const gradeAtt = attendance.filter(a => a.grade === g);
                                        return {
                                            name: g,
                                            presence: gradeAtt.length > 0 ? Math.round((gradeAtt.filter(a => a.status === 'Present').length / gradeAtt.length) * 100) : 0
                                        };
                                    })}
                                >
                                    <Tooltip contentStyle={{ background: '#1a1f2e', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
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

