import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
    Student, Teacher, AttendanceRecord, Exam, StudentResult, FeePayment, TimetableEntry,
    SchoolSettings, GradeLevel, GRADES, SUBJECTS, TERMS, PerformanceLevel, User, Role,
    FeeStructureItem, AuditLogItem, TimeSlot,
    LearningArea, Strand, SubStrand, AssessmentItem, AssessmentScore, Staff // CBC
} from '../types';
import * as XLSX from 'xlsx';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface SchoolContextType {
    students: Student[];
    teachers: Teacher[];
    attendance: AttendanceRecord[];
    exams: Exam[];
    payments: FeePayment[];
    timetable: TimetableEntry[];
    staff: Staff[];
    budgets: any[];
    settings: SchoolSettings;
    gradeFees: Record<string, number>;
    timeSlots: TimeSlot[];
    results: StudentResult[];
    expenses: any[]; // Added
    payrollEntries: any[]; // Added
    toasts: Toast[];
    loading: boolean;
    // CBC State
    learningAreas: LearningArea[];
    assessmentScores: AssessmentScore[];
    addStudent: (student: Omit<Student, 'id'>) => void;
    updateStudent: (id: string, data: Partial<Student>) => void;
    deleteStudent: (id: string) => void;
    addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
    updateTeacher: (id: string, data: Partial<Teacher>) => void;
    deleteTeacher: (id: string) => void;
    saveAttendance: (records: AttendanceRecord[]) => void;
    addExam: (exam: Omit<Exam, 'id'>) => void;
    updateExam: (id: string, data: Partial<Exam>) => void;
    deleteExam: (id: string) => void;
    addStaff: (staff: Omit<Staff, 'id'>) => Promise<void>;
    updateStaff: (id: string, updates: Partial<Staff>) => Promise<void>;
    deleteStaff: (id: string) => Promise<void>;
    addPayment: (payment: Omit<FeePayment, 'id' | 'receiptNumber'>) => void;
    updatePayment: (id: string, data: Partial<FeePayment>) => void;
    deletePayment: (id: string) => void;
    addResult: (result: Omit<StudentResult, 'id'>) => void;
    saveBulkResults: (results: Omit<StudentResult, 'id'>[]) => void;
    addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
    updateTimetableEntry: (id: string, updates: Partial<TimetableEntry>) => void;
    deleteTimetableEntry: (id: string) => void;
    updateTimetable: (entries: TimetableEntry[]) => void;
    updateSettings: (data: Partial<SchoolSettings>) => Promise<boolean>;
    updateGradeFees: (grade: string, amount: number) => void;
    uploadStudents: (file: File) => Promise<void>;
    uploadTeachers: (file: File) => Promise<void>;
    uploadExams: (file: File) => Promise<void>;
    systemUsers: User[];
    addSystemUser: (user: Omit<User, 'id' | 'lastLogin' | 'status'>) => void;
    updateSystemUser: (id: string, updates: Partial<User>) => void;
    deleteSystemUser: (id: string) => void;
    resetUserPassword: (userId: string) => void;
    changeUserPassword: (userId: string, newPassword: string) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    refreshData: () => void;
    clearAllData: () => void;
    // New Features
    feeStructures: FeeStructureItem[];
    auditLogs: AuditLogItem[];
    addFeeStructure: (item: Omit<FeeStructureItem, 'id' | 'status'>) => void;
    updateFeeStructure: (id: string, updates: Partial<FeeStructureItem>) => void;
    deleteFeeStructure: (id: string) => void;
    applyFeeStructure: (grade?: string) => Promise<void>;
    revertFeeStructure: (grade: string) => Promise<void>;
    fetchAuditLogs: () => Promise<void>;
    // CBC Methods
    saveLearningArea: (area: Omit<LearningArea, 'id'>) => Promise<boolean>;
    saveAssessmentScore: (score: AssessmentScore) => Promise<boolean>;
    saveBulkAssessmentScores: (scores: AssessmentScore[]) => Promise<boolean>;
    isSyncing: boolean;
    serverStatus: 'connected' | 'disconnected' | 'checking';
    activeGrades: GradeLevel[];
    roles: Role[];
    addRole: (role: Omit<Role, 'id'>) => Promise<boolean>;
    updateRole: (id: string, updates: Partial<Role>) => Promise<boolean>;
    deleteRole: (id: string) => Promise<boolean>;
    tryApi: (url: string, options?: RequestInit) => Promise<Response | null>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const defaultTimeSlots: TimeSlot[] = [
    { id: '1', label: '8:00 - 8:40', type: 'Lesson', order: 1 },
    { id: '2', label: '8:40 - 9:20', type: 'Lesson', order: 2 },
    { id: '3', label: '9:20 - 10:00', type: 'Lesson', order: 3 },
    { id: '4', label: '10:00 - 10:30', type: 'Break', order: 4 },
    { id: '5', label: '10:30 - 11:10', type: 'Lesson', order: 5 },
    { id: '6', label: '11:10 - 11:50', type: 'Lesson', order: 6 },
    { id: '7', label: '11:50 - 12:30', type: 'Lesson', order: 7 },
    { id: '8', label: '12:30 - 1:10', type: 'Lunch', order: 8 },
    { id: '9', label: '1:10 - 1:50', type: 'Lesson', order: 9 },
    { id: '10', label: '1:50 - 2:30', type: 'Lesson', order: 10 },
];

const defaultSettings: SchoolSettings = {
    schoolName: 'School Management System',
    motto: 'Academic Excellence',
    phone: '+254 700 000 000',
    telephone: '',
    email: 'info@elirama.ac.ke',
    address: 'Nairobi, Kenya',
    poBox: '',
    currentTerm: 'Term 1',
    currentYear: 2026,
    paybillNumber: '123456',
    timeSlots: defaultTimeSlots,
    earlyYearsEnabled: true,
    primaryEnabled: true,
    jssEnabled: false,
    sssEnabled: false,
    autoTimetableEnabled: false,
    manualTimetableBuilderEnabled: true,
    headOfSchoolTitle: 'Headteacher'
};

const STORAGE_KEY = 'elirama_school_data';

function loadFromStorage(): any {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveToStorage(data: any) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { console.warn('Failed to save to localStorage:', e); }
}

export function SchoolProvider({ children }: { children: ReactNode }) {
    // Always start with seed data for SSR consistency — load localStorage in useEffect
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [payments, setPayments] = useState<FeePayment[]>([]);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
    const [gradeFees, setGradeFees] = useState<Record<string, number>>({});
    const [results, setResults] = useState<StudentResult[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]); // Added budgets state
    // CBC State
    const [learningAreas, setLearningAreas] = useState<LearningArea[]>([]);
    const [assessmentScores, setAssessmentScores] = useState<AssessmentScore[]>([]);
    // New Features State
    const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]); // Added
    const [payrollEntries, setPayrollEntries] = useState<any[]>([]); // Added
    const [roles, setRoles] = useState<Role[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
    const [systemUsers, setSystemUsers] = useState<User[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
    const lastSyncRef = useRef<string>('');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
    const dbAvailableRef = useRef<boolean | null>(null); // null = untested
    const hydratedRef = useRef(false);

    // Load data from localStorage on mount
    useEffect(() => {
        const stored = loadFromStorage();
        if (stored) {
            if (stored.settings) setSettings(stored.settings);
            if (stored.gradeFees) setGradeFees(stored.gradeFees);
        }
        hydratedRef.current = true;
    }, []);

    // Persist settings to localStorage whenever they change
    useEffect(() => {
        if (!hydratedRef.current) return;
        saveToStorage({ settings, gradeFees });
    }, [settings, gradeFees]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = generateId();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    // Use a ref to prevent overlapping requests
    const isFetchingRef = useRef(false);

    // Try to sync with the database if available
    const fetchData = useCallback(async (isInitial = false) => {
        // Prevent stacking requests
        if (isFetchingRef.current && !isInitial) return;

        const token = localStorage.getItem('elirama_token');
        if (!token) {
            setServerStatus('disconnected');
            return;
        }

        // Retry connection logic: If disconnected, only retry occasionally (e.g. every 5th poll) or if isInitial
        // For now, we'll let it retry but respect the locking

        isFetchingRef.current = true;
        try {
            if (!isInitial) {
                const statusRes = await fetch(`${API_URL}/sync/status?t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // We are connected if we get a response, even if status is not ok (server is alive)
                setServerStatus(statusRes.ok ? 'connected' : 'disconnected');
                dbAvailableRef.current = statusRes.ok;

                if (!statusRes.ok) return;

                const { lastUpdated } = await statusRes.json();
                if (lastSyncRef.current === lastUpdated) return;
                lastSyncRef.current = lastUpdated;
            }

            // Pull fresh data in a single batch
            const res = await fetch(`${API_URL}/sync/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setStudents(data.students);
                setTeachers(data.teachers);
                setExams(data.exams);
                setSettings(data.settings || defaultSettings);
                setResults(data.results);
                setSystemUsers(data.users);
                setTimetable(data.timetable);
                setFeeStructures(data.feeStructures);
                setStaff(data.staff || []);
                setBudgets(data.budgets || []);
                setExpenses(data.expenses || []); // Added
                setPayrollEntries(data.payrollEntries || []); // Added
                setRoles(data.roles);
                lastSyncRef.current = data.lastUpdated;
            }

            setServerStatus('connected');
            dbAvailableRef.current = true;

            if (isInitial) {
                const statusRes = await fetch(`${API_URL}/sync/status?t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statusRes.ok) {
                    const { lastUpdated } = await statusRes.json();
                    lastSyncRef.current = lastUpdated;
                }
            }
        } catch (error) {
            console.warn('Database connection lost:', error);
            setServerStatus('disconnected');
            dbAvailableRef.current = false;
        } finally {
            setIsSyncing(false);
            isFetchingRef.current = false;
        }
    }, [API_URL]);

    useEffect(() => {
        setLoading(true);
        fetchData(true).finally(() => setLoading(false));
    }, [fetchData]);

    useEffect(() => {
        const interval = setInterval(() => fetchData(false), 10000); // Poll every 10 seconds instead of 1s
        return () => clearInterval(interval);
    }, [fetchData]);

    const refreshData = () => fetchData();

    // Helper: try API call, fall back to local operation
    async function tryApi(url: string, options: RequestInit = {}): Promise<Response | null> {
        const token = localStorage.getItem('elirama_token');
        try {
            const res = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...(options.headers || {}),
                },
            });

            if (res.status === 401) {
                // Invalid token - clear session and redirect
                localStorage.removeItem('elirama_token');
                localStorage.removeItem('elirama_user');
                setServerStatus('disconnected');
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return null;
            }

            if (res.ok) return res;

            // Try to extract error message if available
            try {
                const errData = await res.json();
                if (errData.error) showToast(errData.error, 'error');
            } catch {
                showToast(`Operation failed with status ${res.status}`, 'error');
            }
            return null;
        } catch (err) {
            console.error('API Error:', err);
            showToast('Network error or server unreachable', 'error');
            return null;
        }
    }

    // STUDENTS
    const addStudent = async (student: Omit<Student, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/students`, { method: 'POST', body: JSON.stringify(student) });
        if (apiRes) {
            const data = await apiRes.json();
            setStudents(prev => [...prev, data]);
            showToast('Student added successfully', 'success');
        }
    };

    const updateStudent = async (id: string, data: Partial<Student>) => {
        if (!id) {
            showToast('Cannot update student: Missing ID', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/students/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
        if (apiRes) {
            const updated = await apiRes.json();
            setStudents(prev => prev.map(s => s.id === id ? updated : s));
            showToast('Student updated successfully', 'success');
        }
    };

    const deleteStudent = async (id: string) => {
        if (!id) {
            showToast('Cannot delete student: Missing ID', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/students/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (apiRes) {
            setStudents(prev => prev.filter(s => s.id !== id));
            setPayments(prev => prev.filter(p => p.studentId !== id));
            showToast('Student deleted successfully', 'info');
        }
    };

    const updateTimetable = async (newEntries: TimetableEntry[]) => {
        // Save all entries via bulk API
        const apiRes = await tryApi(`${API_URL}/timetable/bulk`, {
            method: 'POST',
            body: JSON.stringify(newEntries)
        });
        if (apiRes) {
            setTimetable(newEntries);
            showToast('Timetable updated successfully');
        } else {
            showToast('Failed to update timetable', 'error');
        }
    };

    // TEACHERS
    const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/teachers`, { method: 'POST', body: JSON.stringify(teacher) });
        if (apiRes) {
            const data = await apiRes.json();
            setTeachers(prev => [...prev, data]);
            showToast('Teacher added successfully', 'success');
        }
    };

    const updateTeacher = async (id: string, data: Partial<Teacher>) => {
        const apiRes = await tryApi(`${API_URL}/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        if (apiRes) {
            const updated = await apiRes.json();
            setTeachers(prev => prev.map(t => t.id === id ? updated : t));
            showToast('Teacher updated successfully', 'success');
        }
    };

    const deleteTeacher = async (id: string) => {
        const apiRes = await tryApi(`${API_URL}/teachers/${id}`, { method: 'DELETE' });
        if (apiRes) {
            setTeachers(prev => prev.filter(t => t.id !== id));
            showToast('Teacher deleted successfully', 'info');
        }
    };

    // ATTENDANCE
    const saveAttendance = async (records: AttendanceRecord[]) => {
        const apiRes = await tryApi(`${API_URL}/attendance`, { method: 'POST', body: JSON.stringify({ records }) });
        if (apiRes) {
            const dateStr = records[0]?.date;
            setAttendance(prev => [...prev.filter(r => r.date !== dateStr), ...records]);
            showToast('Attendance saved successfully');
        } else {
            showToast('Failed to save attendance', 'error');
        }
    };

    // EXAMS
    const addExam = async (exam: Omit<Exam, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/exams`, { method: 'POST', body: JSON.stringify(exam) });
        if (apiRes) {
            const data = await apiRes.json();
            setExams(prev => [...prev, data]);
            showToast('Exam created successfully', 'success');
        }
    };

    const updateExam = async (id: string, data: Partial<Exam>) => {
        const apiRes = await tryApi(`${API_URL}/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        if (apiRes) {
            const updated = await apiRes.json();
            setExams(prev => prev.map(e => e.id === id ? updated : e));
            showToast('Exam updated successfully', 'success');
        }
    };

    const deleteExam = async (id: string) => {
        const apiRes = await tryApi(`${API_URL}/exams/${id}`, { method: 'DELETE' });
        if (apiRes) {
            setExams(prev => prev.filter(e => e.id !== id));
            showToast('Exam deleted successfully', 'info');
        }
    };

    // PAYMENTS
    const addPayment = async (payment: Omit<FeePayment, 'id' | 'receiptNumber'>) => {
        const apiRes = await tryApi(`${API_URL}/fees`, { method: 'POST', body: JSON.stringify(payment) });
        if (apiRes) {
            const data = await apiRes.json();
            setPayments(prev => [...prev, data]);
            // Update student locally to reflect new balance immediately
            setStudents(prev => prev.map(s => {
                if (s.id === payment.studentId) {
                    const newPaid = s.paidFees + payment.amount;
                    return { ...s, paidFees: newPaid, feeBalance: s.totalFees - newPaid };
                }
                return s;
            }));
            showToast(`Payment of KSh ${payment.amount.toLocaleString()} recorded`, 'success');
        }
    };

    const updatePayment = async (id: string, data: Partial<FeePayment>) => {
        const apiRes = await tryApi(`${API_URL}/fees/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        if (apiRes) {
            const updated = await apiRes.json();
            const old = payments.find(p => p.id === id);
            setPayments(prev => prev.map(p => p.id === id ? updated : p));
            if (old && data.amount !== undefined && data.amount !== old.amount) {
                const diff = data.amount - old.amount;
                setStudents(prev => prev.map(s => {
                    if (s.id === old.studentId) {
                        const newPaid = s.paidFees + diff;
                        return { ...s, paidFees: newPaid, feeBalance: s.totalFees - newPaid };
                    }
                    return s;
                }));
            }
            showToast('Payment updated successfully', 'success');
        }
    };

    const deletePayment = async (id: string) => {
        const payment = payments.find(p => p.id === id);
        if (payment) {
            const apiRes = await tryApi(`${API_URL}/fees/${id}`, { method: 'DELETE' });
            if (apiRes) {
                setPayments(prev => prev.filter(p => p.id !== id));

                // Reverse the fee balance adjustment
                setStudents(prev => prev.map(s => {
                    if (s.id === payment.studentId) {
                        const newPaid = s.paidFees - payment.amount;
                        return { ...s, paidFees: newPaid, feeBalance: s.totalFees - newPaid };
                    }
                    return s;
                }));

                showToast('Payment deleted and fee balance adjusted', 'info');
            }
        }
    };

    // RESULTS
    const addResult = async (result: Omit<StudentResult, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/results`, { method: 'POST', body: JSON.stringify(result) });
        if (apiRes) {
            const data = await apiRes.json();
            setResults(prev => [...prev.filter(r => !(r.studentId === result.studentId && r.examId === result.examId)), data]);
            showToast('Result saved', 'success');
        }
    };

    const saveBulkResults = async (newResults: Omit<StudentResult, 'id'>[]) => {
        const apiRes = await tryApi(`${API_URL}/results`, { method: 'POST', body: JSON.stringify(newResults) });
        if (apiRes) {
            const data = await apiRes.json();
            setResults(prev => {
                const filtered = prev.filter(r => !newResults.some(nr => nr.studentId === r.studentId && nr.examId === r.examId));
                return [...filtered, ...data];
            });
            showToast(`Saved ${newResults.length} results`);
        } else {
            showToast('Failed to save results to server', 'error');
        }
    };

    // CBC METHODS
    const saveLearningArea = async (area: Omit<LearningArea, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/cbc/learning-areas`, { method: 'POST', body: JSON.stringify(area) });
        if (apiRes) {
            const data = await apiRes.json();
            setLearningAreas(prev => [...prev.filter(a => a.id !== data.id), data]);
            showToast('Learning Area saved', 'success');
            return true;
        }
        return false;
    };

    const saveAssessmentScore = async (score: AssessmentScore) => {
        const apiRes = await tryApi(`${API_URL}/cbc/scores`, { method: 'POST', body: JSON.stringify(score) });
        if (apiRes) {
            const data = await apiRes.json();
            setAssessmentScores(prev => [...prev.filter(s => !(s.studentId === data.studentId && s.assessmentItemId === data.assessmentItemId)), data]);
            return true;
        }
        return false;
    };

    const saveBulkAssessmentScores = async (scores: AssessmentScore[]) => {
        const apiRes = await tryApi(`${API_URL}/cbc/scores/bulk`, { method: 'POST', body: JSON.stringify(scores) });
        if (apiRes) {
            const data = await apiRes.json();
            setAssessmentScores(prev => {
                const filtered = prev.filter(s => !scores.some(ns => ns.studentId === s.studentId && ns.assessmentItemId === s.assessmentItemId));
                return [...filtered, ...data];
            });
            showToast(`Saved ${scores.length} scores`, 'success');
            return true;
        }
        return false;
    };

    const uploadResults = async (newResults: Omit<StudentResult, 'id'>[]) => {
        const apiRes = await tryApi(`${API_URL}/results/bulk`, { method: 'POST', body: JSON.stringify(newResults) });
        if (apiRes) {
            const data = await apiRes.json();
            setResults(prev => {
                const filtered = prev.filter(p => !newResults.some(n => n.studentId === p.studentId && n.examId === p.examId));
                return [...filtered, ...data];
            });
            showToast(`Uploaded ${newResults.length} results`, 'success');
        }
    };

    // STAFF
    const addStaff = async (staffData: Omit<Staff, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/finance/payroll?type=staff`, { method: 'POST', body: JSON.stringify(staffData) });
        if (apiRes) {
            const data = await apiRes.json();
            setStaff(prev => [...prev, data]);
            showToast('Staff member added', 'success');
            refreshData();
        }
    };

    const updateStaff = async (id: string, updates: Partial<Staff>) => {
        const apiRes = await tryApi(`${API_URL}/finance/payroll?id=${id}&type=staff`, { method: 'PUT', body: JSON.stringify(updates) });
        if (apiRes) {
            const data = await apiRes.json();
            setStaff(prev => prev.map(s => s.id === id ? data : s));
            showToast('Staff profile updated', 'success');
            refreshData();
        }
    };

    const deleteStaff = async (id: string) => {
        const apiRes = await tryApi(`${API_URL}/finance/payroll?id=${id}&type=staff`, { method: 'DELETE' });
        if (apiRes) {
            setStaff(prev => prev.filter(s => s.id !== id));
            showToast('Staff record removed', 'success');
            refreshData();
        }
    };

    // ATTENDANCE
    const markAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/attendance`, { method: 'POST', body: JSON.stringify(record) });
        if (apiRes) {
            const data = await apiRes.json();
            setAttendance(prev => {
                const filtered = prev.filter(a => !(a.studentId === record.studentId && a.date === record.date));
                return [...filtered, data];
            });
            showToast('Attendance marked successfully', 'success');
        }
    };

    // EXCEL UPLOADS
    const readFile = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    resolve(XLSX.utils.sheet_to_json(worksheet));
                } catch (err) { reject(err); }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const uploadStudents = async (file: File) => {
        try {
            const data = await readFile(file);
            const studentsToUpload = data.map((row: any) => ({
                admissionNumber: row['Admission No'] || row['AdmissionNumber'] || `ADM-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
                firstName: row['First Name'] || row['FirstName'] || '',
                lastName: row['Last Name'] || row['LastName'] || '',
                gender: (row['Gender'] || 'Male') as any,
                grade: row['Grade'] || 'Grade 1',
                dateOfBirth: row['DOB'] || row['DateOfBirth'] || '',
                parentName: row['Parent Name'] || row['ParentName'] || '',
                parentPhone: row['Phone'] || row['ParentPhone'] || '',
                parentEmail: row['Email'] || row['ParentEmail'] || '',
                address: row['Address'] || '',
                status: 'Active' as any,
                enrollmentDate: new Date().toISOString().split('T')[0],
                totalFees: Number(row['Total Fees']) || gradeFees[row['Grade']] || 15000,
                paidFees: 0,
                feeBalance: Number(row['Total Fees']) || gradeFees[row['Grade']] || 15000,
            }));
            for (const s of studentsToUpload) { await addStudent(s); }
            showToast(`Imported ${studentsToUpload.length} students`);
        } catch (err) { showToast('Failed to import students', 'error'); }
    };

    const uploadTeachers = async (file: File) => {
        try {
            const data = await readFile(file);
            const teachersToUpload = data.map((row: any) => ({
                firstName: row['First Name'] || row['FirstName'] || '',
                lastName: row['Last Name'] || row['LastName'] || '',
                email: row['Email'] || '',
                phone: row['Phone'] || '',
                subjects: (row['Subjects'] || '').split(',').map((s: string) => s.trim()),
                grades: (row['Grades'] || '').split(',').map((g: string) => g.trim()),
                status: 'Active' as any,
                joinDate: new Date().toISOString().split('T')[0],
                qualification: row['Qualification'] || '',
                maxLessonsDay: 8,
                maxLessonsWeek: 40,
            }));
            for (const t of teachersToUpload) { await addTeacher(t); }
            showToast(`Imported ${teachersToUpload.length} teachers`);
        } catch (err) { showToast('Failed to import teachers', 'error'); }
    };

    const uploadExams = async (file: File) => {
        try {
            const data = await readFile(file);
            const examsToUpload = data.map((row: any) => ({
                name: row['Exam Name'] || row['Name'] || '',
                subject: row['Subject'] || '',
                grade: row['Grade'] || '',
                date: row['Date'] || '',
                term: row['Term'] || settings.currentTerm,
                type: (row['Type'] || 'Final') as any,
                status: 'Scheduled' as any,
                totalMarks: Number(row['Total Marks']) || 100,
            }));
            for (const e of examsToUpload) { await addExam(e); }
            showToast(`Imported ${examsToUpload.length} exams`);
        } catch (err) { showToast('Failed to import exams', 'error'); }
    };

    // USERS
    const addSystemUser = async (user: Omit<User, 'id' | 'lastLogin' | 'status'>) => {
        const apiRes = await tryApi(`${API_URL}/users`, { method: 'POST', body: JSON.stringify(user) });
        if (apiRes) {
            const data = await apiRes.json();
            setSystemUsers(prev => [...prev, data]);
            showToast(`User ${user.name} added successfully`, 'success');
        }
    };

    const updateSystemUser = async (id: string, updates: Partial<User>) => {
        const apiRes = await tryApi(`${API_URL}/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
        if (apiRes) {
            const data = await apiRes.json();
            setSystemUsers(prev => prev.map(u => (u.id === id ? data : u)));
            showToast('User updated successfully', 'success');
        }
    };

    const deleteSystemUser = async (id: string) => {
        await tryApi(`${API_URL}/users/${id}`, { method: 'DELETE' });
        setSystemUsers(prev => prev.filter(u => u.id !== id));
        showToast('User deleted successfully', 'info');
    };

    const resetUserPassword = (userId: string) => {
        const user = systemUsers.find(u => u.id === userId);
        if (user) {
            showToast(`Password for ${user.username} has been reset to default`);
        }
    };

    const changeUserPassword = async (userId: string, newPassword: string) => {
        const apiRes = await tryApi(`${API_URL}/users/${userId}/password`, {
            method: 'PUT',
            body: JSON.stringify({ password: newPassword })
        });

        if (apiRes) {
            showToast('Password changed successfully');
        } else {
            setSystemUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword, updatedAt: new Date().toLocaleDateString() } : u));
            showToast('Password changed locally');
        }
    };

    // TIMETABLE
    const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/timetable`, { method: 'POST', body: JSON.stringify(entry) });
        if (apiRes) {
            const data = await apiRes.json();
            setTimetable(prev => [...prev, data]);
        } else {
            const newEntry: TimetableEntry = { ...entry, id: generateId() } as TimetableEntry;
            setTimetable(prev => [...prev, newEntry]);
        }
        showToast('Timetable entry added');
    };

    const updateTimetableEntry = async (id: string, updates: Partial<TimetableEntry>) => {
        const apiRes = await tryApi(`${API_URL}/timetable/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
        if (apiRes) {
            const data = await apiRes.json();
            setTimetable(prev => prev.map(t => (t.id === id ? data : t)));
        } else {
            setTimetable(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
        }
        showToast('Timetable entry updated');
    };

    const deleteTimetableEntry = async (id: string) => {
        await tryApi(`${API_URL}/timetable/${id}`, { method: 'DELETE' });
        setTimetable(prev => prev.filter(t => t.id !== id));
    };

    // SETTINGS
    const updateSettings = async (data: Partial<SchoolSettings>) => {
        const apiRes = await tryApi(`${API_URL}/settings`, { method: 'PUT', body: JSON.stringify(data) });
        if (apiRes) {
            const updated = await apiRes.json();
            setSettings(updated);
            showToast('Settings updated successfully', 'success');
            refreshData(); // Proactive re-sync
            return true;
        } else {
            return false;
        }
    };

    const updateGradeFees = (grade: string, amount: number) => {
        setGradeFees(prev => ({ ...prev, [grade]: amount }));
        setStudents(prev => prev.map(s => {
            if (s.grade === grade) {
                return { ...s, totalFees: amount, feeBalance: amount - s.paidFees };
            }
            return s;
        }));
        showToast(`Fees for ${grade} updated to KSh ${amount.toLocaleString()} `);
    };

    // FEE STRUCTURE
    const addFeeStructure = async (item: Omit<FeeStructureItem, 'id' | 'status'>) => {
        const apiRes = await tryApi(`${API_URL}/fees/structure`, { method: 'POST', body: JSON.stringify(item) });
        if (apiRes) {
            const data = await apiRes.json();
            setFeeStructures(prev => [...prev, data]);
            showToast('Fee item added to draft');
        }
    };

    const updateFeeStructure = async (id: string, updates: Partial<FeeStructureItem>) => {
        const apiRes = await tryApi(`${API_URL}/fees/structure?id=${id}`, { method: 'PUT', body: JSON.stringify(updates) });
        if (apiRes) {
            const data = await apiRes.json();
            setFeeStructures(prev => prev.map(f => f.id === id ? data : f));
            showToast('Fee item updated in draft');
        }
    };

    const deleteFeeStructure = async (id: string) => {
        const apiRes = await tryApi(`${API_URL}/fees/structure?id=${id}`, { method: 'DELETE' });
        if (apiRes) {
            setFeeStructures(prev => prev.filter(f => f.id !== id));
            showToast('Fee item removed from draft');
        }
    };

    const applyFeeStructure = async (grade?: string) => {
        setLoading(true);
        const url = grade ? `${API_URL}/fees/apply?grade=${encodeURIComponent(grade)}` : `${API_URL}/fees/apply`;
        const apiRes = await tryApi(url, { method: 'POST' });
        if (apiRes) {
            const data = await apiRes.json();
            showToast(`Fee structure published${grade ? ` for ${grade}` : ''}! Updated ${data.updatedCount} students.`);

            // Update local state to show items as Published
            setFeeStructures(prev => prev.map(f => {
                if (!grade || f.grade === grade) return { ...f, status: 'Published' };
                return f;
            }));

            await fetchData(true); // Pull fresh student data with new balances
        } else {
            showToast('Failed to publish fee structure', 'error');
        }
        setLoading(false);
    };

    const revertFeeStructure = async (grade: string) => {
        const apiRes = await tryApi(`${API_URL}/fees/revert?grade=${encodeURIComponent(grade)}`, { method: 'POST' });
        if (apiRes) {
            setFeeStructures(prev => prev.map(f => f.grade === grade ? { ...f, status: 'Draft' } : f));
            showToast(`Fee structure for ${grade} reverted to draft`);
        }
    };

    // AUDIT LOGS
    const fetchAuditLogs = async () => {
        const apiRes = await tryApi(`${API_URL}/audit`, { method: 'GET' });
        if (apiRes) {
            setAuditLogs(await apiRes.json());
        }
    };

    const addRole = async (role: Omit<Role, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/roles`, {
            method: 'POST',
            body: JSON.stringify(role)
        });
        if (apiRes) {
            const newRole = await apiRes.json();
            setRoles(prev => [...prev, newRole]);
            showToast('Role created successfully', 'success');
            return true;
        }
        return false;
    };

    const updateRole = async (id: string, updates: Partial<Role>) => {
        const apiRes = await tryApi(`${API_URL}/roles`, {
            method: 'PUT',
            body: JSON.stringify({ id, ...updates })
        });
        if (apiRes) {
            const updatedRole = await apiRes.json();
            setRoles(prev => prev.map(r => r.id === id ? updatedRole : r));
            showToast('Role updated successfully', 'success');
            return true;
        }
        return false;
    };

    const deleteRole = async (id: string) => {
        const apiRes = await tryApi(`${API_URL}/roles?id=${id}`, { method: 'DELETE' });
        if (apiRes) {
            setRoles(prev => prev.filter(r => r.id !== id));
            showToast('Role deleted successfully', 'success');
            return true;
        }
        return false;
    };

    const clearAllData = async () => {
        if (!confirm('This will permanently delete ALL students, teachers, results, and settings. This cannot be undone. Are you sure?')) return;

        setLoading(true);
        const token = localStorage.getItem('elirama_token');
        if (token) {
            try {
                await fetch(`${API_URL}/settings/reset`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            } catch (error) {
                console.warn('Global reset API not available');
            }
        }

        setStudents([]);
        setTeachers([]);
        setAttendance([]);
        setExams([]);
        setPayments([]);
        setTimetable([]);
        setResults([]);
        setSystemUsers([{ id: '1', firstName: 'Admin', lastName: 'User', username: 'admin', name: 'Admin User', email: 'admin@elirama.ac.ke', role: 'Super Admin', permissions: [], status: 'Active', lastLogin: 'Never', updatedAt: new Date().toISOString() }]);
        setSettings(defaultSettings);
        localStorage.removeItem(STORAGE_KEY);
        setLoading(false);
        showToast('All system data has been cleared', 'info');
        window.location.reload();
    };

    const timeSlots = settings.timeSlots && settings.timeSlots.length > 0 ? settings.timeSlots : defaultTimeSlots;

    const activeGrades = useMemo(() => {
        const grades: GradeLevel[] = [];
        if (settings.earlyYearsEnabled) {
            grades.push('Play Group', 'PP1', 'PP2');
        }
        if (settings.primaryEnabled) {
            grades.push('Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6');
        }
        if (settings.jssEnabled) {
            grades.push('Grade 7', 'Grade 8', 'Grade 9');
        }
        if (settings.sssEnabled) {
            grades.push('Form 1', 'Form 2', 'Form 3', 'Form 4');
        }
        return grades;
    }, [settings.earlyYearsEnabled, settings.primaryEnabled, settings.jssEnabled, settings.sssEnabled]);

    return (
        <SchoolContext.Provider value={{
            students,
            teachers,
            attendance,
            exams,
            payments,
            timetable,
            staff,
            budgets,
            settings,
            gradeFees,
            timeSlots: settings.timeSlots || defaultTimeSlots,
            results,
            toasts,
            loading,
            addStaff,
            updateStaff,
            deleteStaff,
            addStudent,
            updateStudent,
            deleteStudent,
            addTeacher,
            updateTeacher,
            deleteTeacher,
            saveAttendance,
            addExam,
            updateExam,
            deleteExam,
            addPayment,
            updatePayment,
            deletePayment,
            addResult,
            saveBulkResults,
            addTimetableEntry,
            updateTimetableEntry,
            deleteTimetableEntry,
            updateTimetable,
            updateSettings,
            updateGradeFees,
            uploadStudents,
            uploadTeachers,
            uploadExams,
            systemUsers,
            addSystemUser,
            updateSystemUser,
            deleteSystemUser,
            resetUserPassword,
            changeUserPassword,
            showToast,
            refreshData,
            clearAllData,
            feeStructures,
            auditLogs,
            addFeeStructure,
            updateFeeStructure,
            deleteFeeStructure,
            applyFeeStructure,
            revertFeeStructure,
            fetchAuditLogs,
            tryApi,
            isSyncing,
            serverStatus,
            activeGrades,
            roles,
            addRole,
            updateRole,
            deleteRole,
            expenses, // Added
            payrollEntries, // Added
            // CBC
            learningAreas,
            assessmentScores,
            saveLearningArea,
            saveAssessmentScore,
            saveBulkAssessmentScores
        }}>
            {children}
        </SchoolContext.Provider>
    );
}

export function useSchool() {
    const context = useContext(SchoolContext);
    if (!context) throw new Error('useSchool must be used within SchoolProvider');
    return context;
}
