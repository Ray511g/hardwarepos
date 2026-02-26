export interface Student {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    gender: 'Male' | 'Female';
    grade: string;
    dateOfBirth: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    address: string;
    status: 'Active' | 'Inactive';
    enrollmentDate: string;
    feeBalance: number;
    totalFees: number;
    paidFees: number;
    medicalConditions?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    allergies?: string;
}

export interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    type: 'TEACHER' | 'BOM_TEACHER' | 'SUPPORT_STAFF' | 'ADMIN';
    role: string;
    department?: string;
    email?: string;
    phone?: string;
    kraPin?: string;
    nssfNumber?: string;
    salaryType: 'Fixed' | 'Hourly';
    basicSalary: number;
    allowances?: any[];
    deductions?: any[];
    bankName?: string;
    accountNumber?: string;
    status: 'Active' | 'Inactive';
    createdAt?: string;
    updatedAt?: string;
}

export interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subjects: string[];
    grades: string[];
    status: 'Active' | 'Inactive';
    joinDate: string;
    qualification: string;
    maxLessonsDay: number;
    maxLessonsWeek: number;
    availability?: any; // JSON from prisma
}

export interface AttendanceRecord {
    id: string;
    studentId: string;
    studentName: string;
    grade: string;
    date: string;
    term?: string;
    period?: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
}

export interface Exam {
    id: string;
    name: string;
    subject: string;
    grade: string;
    date: string;
    term: string;
    type: 'Midterm' | 'Final' | 'Quiz' | 'Assignment';
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    totalMarks: number;
}

export type PerformanceLevel = 'EE' | 'ME' | 'AE' | 'BE';

export interface StudentResult {
    id: string;
    studentId: string;
    studentName: string;
    examId: string;
    subject: string;
    marks: number;
    level: PerformanceLevel;
    remarks: string;
}

export interface FeePayment {
    id: string;
    studentId: string;
    studentName: string;
    grade: string;
    amount: number;
    method: 'Cash' | 'M-Pesa' | 'Bank Transfer' | 'Cheque';
    reference: string;
    date: string;
    term: string;
    receiptNumber: string;
}

export interface TimetableEntry {
    id: string;
    grade: string;
    day: string;
    timeSlot: string;
    slotId?: string; // Relation to TimeSlot
    subject: string;
    teacherId: string;
    teacherName: string;
}

export interface TimeSlot {
    id: string;
    label: string; // The display name, e.g. "Lesson 1" or "8:00 - 8:40"
    name?: string;  // Optional custom name, e.g. "Tea Break"
    startTime?: string;
    endTime?: string;
    type: 'Lesson' | 'Break' | 'Lunch' | 'Assembly' | 'Other';
    order: number;
    isActive?: boolean;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    name: string; // Keep as fullName for display
    email: string;
    role: string;
    roleId?: string;
    roleData?: Role;
    permissions: string[];
    status: 'Active' | 'Inactive';
    lastLogin: string;
    password?: string;
    updatedAt?: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    _count?: {
        users: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface SchoolSettings {
    schoolName: string;
    motto: string;
    phone: string;
    telephone?: string;
    email: string;
    address: string;
    poBox?: string;
    currentTerm: string;
    currentYear: number;
    headteacherSignature?: string; // Base64 or URL
    financeSignature?: string;     // Base64 or URL
    paybillNumber?: string;
    logo?: string;
    schoolStamp?: string;         // Base64 or URL
    timeSlots?: TimeSlot[];
    earlyYearsEnabled: boolean;
    primaryEnabled: boolean;
    jssEnabled: boolean;
    sssEnabled: boolean;
    autoTimetableEnabled: boolean;
    manualTimetableBuilderEnabled: boolean;
    headOfSchoolTitle?: 'Headteacher' | 'Principal' | 'Chief Principal';
    sssNaming?: 'Form' | 'Grade';
    nssfRate: number;
    nssfMax: number;
    housingLevyRate: number;
    personalRelief: number;
    nhifConfig?: any;
    payeConfig?: any;
    shifEnabled?: boolean;
}

export type GradeLevel =
    | 'Play Group' | 'PP1' | 'PP2'
    | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5' | 'Grade 6'
    | 'Grade 7' | 'Grade 8' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12'
    | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';

export const GRADES: GradeLevel[] = [
    'Play Group', 'PP1', 'PP2',
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
    'Form 1', 'Form 2', 'Form 3', 'Form 4'
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TIME_SLOTS = [
    '8:00 - 8:40',
    '8:40 - 9:20',
    '9:20 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:10',
    '11:10 - 11:50',
    '11:50 - 12:30',
    '12:30 - 1:10',
    '1:10 - 1:50',
    '1:50 - 2:30',
];

export const SUBJECTS = [
    'Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies',
    'CRE', 'Creative Arts', 'Physical Education', 'Music', 'Agriculture',
];

export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

export interface AuditLogItem {
    id: string;
    userId: string;
    userName: string;
    userRole?: string;
    action: string;
    module?: string;
    details: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    deviceInfo?: string;
    createdAt: string;
}

export interface FeeStructureItem {
    id: string;
    grade: string;
    name: string;
    amount: number;
    term: string;
    status: 'Draft' | 'Published';
}

// CBC Infrastructure
export interface LearningArea {
    id: string;
    name: string;
    grade: string;
    strands: Strand[];
}

export interface Strand {
    id: string;
    name: string;
    learningAreaId: string;
    subStrands: SubStrand[];
}

export interface SubStrand {
    id: string;
    name: string;
    strandId: string;
    assessments: AssessmentItem[];
}

export interface AssessmentItem {
    id: string;
    name: string;
    type: 'Formative' | 'Summative' | 'Project';
    weight: number;
    subStrandId: string;
}

export interface AssessmentScore {
    id: string;
    studentId: string;
    assessmentItemId: string;
    score?: number;
    level?: PerformanceLevel;
    remarks?: string;
}
// Enterprise Finance Module
export interface Supplier {
    id: string;
    name: string;
    kraPin: string;
    contactPerson: string;
    phone: string;
    email: string;
    bankName: string;
    accountNumber: string;
    paymentTerms: string;
    status: 'Active' | 'Inactive';
    createdAt?: string;
}

export interface ChartOfAccount {
    id: string;
    code: string;
    name: string;
    type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
    category: string;
    balance: number;
    parentCode?: string;
}

export interface JournalEntry {
    id: string;
    transactionId: string;
    date: string;
    description: string;
    accountId: string;
    account?: ChartOfAccount;
    debit: number;
    credit: number;
    status: 'Pending' | 'Approved' | 'Reversed';
    requestedBy: string;
    approvedBy?: string;
}

export interface Expenditure {
    id: string;
    supplierId?: string;
    supplier?: Supplier;
    category: string;
    description: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
    requestedBy: string;
    requestedByName: string;
    department?: string;
    paymentMethod?: 'Bank' | 'Cash' | 'M-Pesa';
    attachmentUrl?: string;
    createdAt: string;
}

export interface Budget {
    id: string;
    year: number;
    term?: string;
    department: string;
    category: string;
    allocated: number;
    spent: number;
}

export interface PromissoryNote {
    id: string;
    noteNumber: string;
    studentId: string;
    guardianName: string;
    amount: number;
    issueDate: string;
    maturityDate: string;
    status: 'ACTIVE' | 'OVERDUE' | 'SETTLED' | 'DEFAULTED';
}

export interface SchoolServiceOrder {
    id: string;
    studentId: string;
    serviceType: string;
    amount: number;
    recurring: boolean;
    frequency?: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'COMPLETED';
}

export interface BehaviorRecord {
    id: string;
    studentId: string;
    type: 'Merit' | 'Demerit' | 'Neutral';
    category: string;
    points: number;
    description: string;
    date: string;
    staffId: string;
    staffName: string;
}

export type IncidentCategory =
    | 'Academics'
    | 'Discipline'
    | 'Leadership'
    | 'Sportsmanship'
    | 'Social'
    | 'Hygiene'
    | 'Other';
