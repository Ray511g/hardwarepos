import React, { useState, useMemo, useCallback } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, DAYS, TIME_SLOTS, TimetableEntry, TimeSlot } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import TimetableEntryModal from '../../components/modals/TimetableEntryModal';

export default function Timetable() {
    const { timetable, settings, activeGrades, updateTimetable, teachers, showToast } = useSchool();
    const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grade' | 'teacher'>('grade');

    const gradeEntries = useMemo(() =>
        viewMode === 'grade'
            ? timetable.filter(e => e.grade === selectedGrade)
            : timetable.filter(e => e.teacherId === selectedTeacherId),
        [timetable, viewMode, selectedGrade, selectedTeacherId]
    );

    const selectedTeacher = useMemo(() =>
        teachers.find(t => t.id === selectedTeacherId),
        [teachers, selectedTeacherId]
    );

    // Sort and filter active slots
    const slots: TimeSlot[] = useMemo(() =>
        (settings.timeSlots || [])
            .filter(s => s.isActive !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0)),
        [settings.timeSlots]
    );

    // Optimized O(1) lookup map for the grid
    const entryMap = useMemo(() => {
        const map: Record<string, TimetableEntry> = {};
        gradeEntries.forEach(e => {
            const key = `${e.day}-${e.slotId || e.timeSlot}`;
            map[key] = e;
        });
        return map;
    }, [gradeEntries]);

    const getEntry = useCallback((day: string, slotId: string, slotLabel: string) => {
        return entryMap[`${day}-${slotId}`] || entryMap[`${day}-${slotLabel}`];
    }, [entryMap]);

    const handleEdit = (entry: TimetableEntry) => {
        setEditingEntry(entry);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingEntry(null);
    };

    const handleQuickAdd = (day: string, slot: TimeSlot) => {
        setEditingEntry({
            id: '',
            grade: selectedGrade,
            day,
            slotId: slot.id,
            timeSlot: slot.label,
            subject: '',
            teacherId: '',
            teacherName: '',
        });
        setShowAddModal(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const generateAutoTimetable = () => {
        if (!confirm('This will overwrite the current timetable with a newly generated one. Are you sure?')) return;

        // Diagnostics
        if (teachers.length === 0) {
            showToast('Cannot generate timetable: No teachers found in the system.', 'error');
            return;
        }

        if (activeGrades.length === 0) {
            showToast('Cannot generate timetable: No active grades enabled in settings.', 'error');
            return;
        }

        const lessonSlots = slots.filter(s => s.type === 'Lesson');
        if (lessonSlots.length === 0) {
            showToast('Cannot generate timetable: No slots of type "Lesson" defined.', 'error');
            return;
        }

        const teachersWithGrades = teachers.filter(t => t.grades && t.grades.length > 0);
        if (teachersWithGrades.length === 0) {
            showToast('Cannot generate timetable: No teachers have been assigned to any grades. Please assign grades to teachers first.', 'error');
            return;
        }

        const newEntries: TimetableEntry[] = [];
        const teacherDailyCount: Record<string, Record<string, number>> = {};
        const teacherWeeklyCount: Record<string, number> = {};
        const usedSlots: Record<string, Set<string>> = {};

        // Pre-index teachers by grade for faster lookup
        const teachersByGrade: Record<string, typeof teachers> = {};
        activeGrades.forEach(grade => {
            teachersByGrade[grade] = teachers.filter(t => t.grades.includes(grade));
        });

        teachers.forEach(t => {
            teacherDailyCount[t.id] = {};
            DAYS.forEach(d => teacherDailyCount[t.id][d] = 0);
            teacherWeeklyCount[t.id] = 0;
        });

        activeGrades.forEach(grade => {
            const gradeTeachers = teachersByGrade[grade] || [];
            DAYS.forEach(day => {
                lessonSlots.forEach(slot => {
                    const key = `${day}-${slot.id}`;
                    if (!usedSlots[key]) usedSlots[key] = new Set();

                    // Find available teachers for THIS grade and THIS slot
                    const availableTeachers = gradeTeachers.filter(t =>
                        !usedSlots[key].has(t.id) &&
                        teacherDailyCount[t.id][day] < (t.maxLessonsDay || 8) &&
                        teacherWeeklyCount[t.id] < (t.maxLessonsWeek || 40)
                    );

                    if (availableTeachers.length > 0) {
                        // Sort by weekly count to balance load
                        const selectedTeacher = availableTeachers.sort((a, b) =>
                            teacherWeeklyCount[a.id] - teacherWeeklyCount[b.id]
                        )[0];

                        const subject = selectedTeacher.subjects[0];

                        newEntries.push({
                            id: Math.random().toString(36).substr(2, 9),
                            grade,
                            day,
                            slotId: slot.id,
                            timeSlot: slot.label,
                            subject: subject || 'General',
                            teacherId: selectedTeacher.id,
                            teacherName: `${selectedTeacher.firstName} ${selectedTeacher.lastName}`,
                        });

                        teacherDailyCount[selectedTeacher.id][day]++;
                        teacherWeeklyCount[selectedTeacher.id]++;
                        usedSlots[key].add(selectedTeacher.id);
                    }
                });
            });
        });

        if (newEntries.length === 0) {
            showToast('Could not generate any entries. Check if teacher grade/subject assignments match active grades.', 'error');
            return;
        }

        updateTimetable(newEntries);
        showToast(`Timetable auto-generated with ${newEntries.length} entries`, 'success');
    };

    if (slots.length === 0) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <h1>Timetable</h1>
                    <p>Structure not configured</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <h3>Timetable Structure Not Set</h3>
                    <p>Please go to Admin &rarr; Timetable Structure to define your school's periods and breaks.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header no-print">
                <div className="page-header-left">
                    <h1>Timetable</h1>
                    <p>Weekly class schedule</p>
                </div>
                <div className="page-header-right">
                    <button className="btn-outline" onClick={handlePrint} style={{ marginRight: 10 }}>
                        Print Timetable
                    </button>
                    <select
                        title="View Mode"
                        className="filter-select"
                        value={viewMode}
                        onChange={e => setViewMode(e.target.value as any)}
                        style={{ marginRight: 10 }}
                    >
                        <option value="grade">View by Grade</option>
                        <option value="teacher">View by Teacher</option>
                    </select>

                    {viewMode === 'grade' ? (
                        <select
                            title="Select grade for timetable view"
                            className="filter-select"
                            value={selectedGrade}
                            onChange={e => setSelectedGrade(e.target.value)}
                        >
                            {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    ) : (
                        <select
                            title="Select teacher for timetable view"
                            className="filter-select"
                            value={selectedTeacherId}
                            onChange={e => setSelectedTeacherId(e.target.value)}
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                        </select>
                    )}
                    {settings.autoTimetableEnabled && (
                        <button className="btn-primary purple" onClick={() => generateAutoTimetable()} style={{ marginRight: 10 }}>
                            Auto Generate
                        </button>
                    )}
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        <AddIcon style={{ fontSize: 18 }} /> Add Entry
                    </button>
                </div>
            </div>

            <div className="print-only">
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    {settings.logo && <img src={settings.logo} style={{ height: 60, marginBottom: 10 }} alt="School Logo" />}
                    <h1 style={{ margin: 0 }}>{settings.schoolName}</h1>
                    <p style={{ margin: 5 }}>{settings.motto}</p>
                    <h2 style={{ marginTop: 20 }}>
                        {viewMode === 'grade' ? `${selectedGrade} Timetable` : `${selectedTeacher?.firstName} ${selectedTeacher?.lastName}'s Schedule`}
                    </h2>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="timetable-grid timetable-min-w">
                    {/* Header row */}
                    <div className="timetable-cell header sticky-header">Time</div>
                    {DAYS.map(day => (
                        <div key={day} className="timetable-cell header sticky-header">{day}</div>
                    ))}

                    {/* Body rows */}
                    {slots.map(slot => {
                        const isBreak = slot.type === 'Break' || slot.type === 'Lunch' || slot.type === 'Assembly';
                        const timeDisplay = slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : slot.label;

                        if (isBreak) {
                            const icon = slot.type === 'Break' ? '☕' : (slot.type === 'Lunch' ? '🍽️' : (slot.type === 'Assembly' ? '📢' : '🔔'));
                            const displayName = slot.name || slot.label;
                            return (
                                <React.Fragment key={slot.id}>
                                    <div className="timetable-cell time-slot">{timeDisplay}</div>
                                    <div className="timetable-cell break-row" style={{ gridColumn: 'span 5' }}>
                                        {icon} {displayName}
                                    </div>
                                </React.Fragment>
                            );
                        }

                        return (
                            <React.Fragment key={slot.id}>
                                <div className="timetable-cell time-slot">{timeDisplay}</div>
                                {DAYS.map(day => {
                                    const entry = getEntry(day, slot.id, slot.label);
                                    return (
                                        <div
                                            key={`${day}-${slot.id}`}
                                            className={`timetable-cell ${!entry ? 'empty-slot' : ''}`}
                                            onClick={() => !entry && settings.manualTimetableBuilderEnabled && handleQuickAdd(day, slot)}
                                            style={{ cursor: !entry && settings.manualTimetableBuilderEnabled ? 'pointer' : 'default' }}
                                        >
                                            {entry ? (
                                                <div className="timetable-entry" onClick={(e) => { e.stopPropagation(); handleEdit(entry); }} style={{ cursor: 'pointer' }} title="Click to edit">
                                                    <div className="subject">{entry.subject}</div>
                                                    <div className="teacher">{viewMode === 'grade' ? entry.teacherName : entry.grade}</div>
                                                </div>
                                            ) : (
                                                settings.manualTimetableBuilderEnabled && <div className="quick-add-hint">+</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {showAddModal && <TimetableEntryModal grade={selectedGrade} entry={editingEntry} onClose={handleCloseModal} />}

            <style jsx>{`
                @media print {
                    @page { 
                        size: landscape;
                        margin: 10mm;
                    }
                    .no-print { display: none !important; }
                    .sidebar, .sidebar-overlay, .mobile-header { display: none !important; }
                    .main-content { margin: 0 !important; padding: 0 !important; width: 100% !important; height: auto !important; overflow: visible !important; }
                    .page-container { padding: 0 !important; background: white !important; width: 100% !important; }
                    .page-header { display: none !important; }
                    .timetable-wrapper { margin: 0 !important; border: none !important; box-shadow: none !important; width: 100% !important; }
                    .timetable-grid { 
                        border: 1px solid #000 !important; 
                        grid-template-columns: 120px repeat(5, 1fr) !important;
                        width: 100% !important;
                    }
                    .timetable-cell { 
                        border: 1px solid #000 !important; 
                        color: #000 !important; 
                        padding: 8px 4px !important;
                        min-height: 50px !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important;
                    }
                    .timetable-cell.header { background: #eee !important; font-weight: bold !important; text-align: center !important; }
                    .timetable-entry { background: none !important; border: none !important; box-shadow: none !important; padding: 2px !important; text-align: center !important; }
                    .subject { font-weight: bold !important; color: #000 !important; font-size: 14px !important; }
                    .teacher { color: #333 !important; font-size: 12px !important; }
                    .break-row { 
                        background: #f9f9f9 !important; 
                        font-weight: bold !important; 
                        border: 1px solid #000 !important;
                        text-align: center !important;
                    }
                }
                .empty-slot:hover {
                    background: var(--bg-light);
                }
                .quick-add-hint {
                    display: none;
                    color: var(--text-muted);
                    font-size: 20px;
                    text-align: center;
                }
                .empty-slot:hover .quick-add-hint {
                    display: block;
                }
            `}</style>
        </div>
    );
}
