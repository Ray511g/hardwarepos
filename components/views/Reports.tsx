import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SUBJECTS } from '../../types';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CBCProgressReportModal from '../../components/modals/CBCProgressReportModal';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export default function Reports() {
    const { students, teachers, attendance, exams, payments, results, settings, gradeFees, tryApi, activeGrades, expenses } = useSchool();
    const [selectedReport, setSelectedReport] = useState<string>('dashboard');
    const [viewingCBCStudentId, setViewingCBCStudentId] = useState<string | null>(null);
    const [reportFilter, setReportFilter] = useState({
        studentId: '',
        term: settings.currentTerm,
    });
    const [studentSearch, setStudentSearch] = useState('');
    const [financeExpenses, setFinanceExpenses] = React.useState<any[]>([]);
    const [payroll, setPayroll] = React.useState<any[]>([]);
    const [accounts, setAccounts] = React.useState<any[]>([]);
    const [loadingFinance, setLoadingFinance] = React.useState(false);

    React.useEffect(() => {
        if (selectedReport === 'finance-reports') {
            fetchFinanceData();
        }
    }, [selectedReport]);

    const fetchFinanceData = async () => {
        setLoadingFinance(true);
        try {
            const [expRes, payRes, accRes] = await Promise.all([
                tryApi('/api/finance/expenses'),
                tryApi('/api/finance/payroll?type=entries'),
                tryApi('/api/finance/accounts')
            ]);
            if (expRes) setFinanceExpenses(await expRes.json());
            if (payRes) setPayroll(await payRes.json());
            if (accRes) setAccounts(await accRes.json());
        } catch (error) {
            console.error('Failed to fetch report data');
        } finally {
            setLoadingFinance(false);
        }
    };

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const exportCSV = (data: Record<string, any>[], filename: string) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handlePrintAssessment = () => {
        const student = students.find(s => s.id === reportFilter.studentId);
        if (!student) return;

        const termResults = results.filter(r => {
            const exam = exams.find(e => e.id === r.examId);
            return r.studentId === student.id && exam?.term === reportFilter.term;
        });

        const totalMarks = termResults.reduce((sum, r) => sum + r.marks, 0);
        const averageMarks = termResults.length > 0 ? (totalMarks / termResults.length).toFixed(1) : '0.0';

        const reportHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Outfit', 'Inter', sans-serif; padding: 0; margin: 0; color: #1a1a1a; line-height: 1.6; }
                    .page { 
                        width: 210mm; 
                        min-height: 297mm; 
                        padding: 20mm; 
                        margin: 0 auto; 
                        background: white;
                        box-sizing: border-box;
                        position: relative;
                    }
                    .header { 
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 3px solid #2c3e50;
                        padding-bottom: 15px;
                        margin-bottom: 25px;
                    }
                    .school-info-header { text-align: right; }
                    .school-name { font-size: 32px; font-weight: bold; color: #2c3e50; text-transform: uppercase; margin: 0; }
                    .school-motto { font-style: italic; color: #7f8c8d; margin-top: 2px; font-size: 14px; }
                    .contact-info { font-size: 11px; color: #4a5568; margin-top: 5px; }
                    
                    .report-title { 
                        text-align: center; 
                        font-size: 22px; 
                        font-weight: 800; 
                        margin: 20px 0; 
                        color: #1a365d;
                        letter-spacing: 1px;
                        text-decoration: underline;
                    }
                    
                    .info-bar { 
                        display: grid; 
                        grid-template-columns: repeat(3, 1fr); 
                        gap: 15px; 
                        background: #f8fafc; 
                        padding: 20px; 
                        margin-bottom: 30px; 
                        border-radius: 8px; 
                        font-size: 13px;
                        border: 1px solid #e2e8f0;
                    }
                    .section-title { 
                        font-size: 16px; 
                        font-weight: 700; 
                        margin: 25px 0 12px; 
                        text-transform: uppercase; 
                        color: #1e293b;
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 5px;
                    }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background: #f1f5f9; color: #475569; text-align: left; padding: 12px; font-size: 12px; border: 1px solid #cbd5e1; }
                    td { border: 1px solid #cbd5e1; padding: 12px; font-size: 13px; }
                    
                    .summary-box { 
                        background: #1e293b; 
                        color: white; 
                        padding: 20px; 
                        border-radius: 8px; 
                        display: flex; 
                        justify-content: space-around; 
                        margin: 30px 0; 
                    }
                    .summary-item { text-align: center; }
                    .summary-label { font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; }
                    .summary-value { font-size: 22px; font-weight: bold; }
                    
                    .signature-area { 
                        margin-top: 50px; 
                        display: grid; 
                        grid-template-columns: 1fr 1fr;
                        gap: 50px;
                    }
                    .signature-box { text-align: center; }
                    .signature-img { max-width: 140px; max-height: 70px; object-fit: contain; display: block; margin: 0 auto -10px; }
                    .signature-line { border-top: 1px solid #1e293b; padding-top: 8px; font-weight: bold; font-size: 13px; color: #1e293b; }
                    
                    .fee-page { page-break-before: always; }
                    .kpsea-badge { background: #e11d48; color: white; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 800; vertical-align: middle; margin-left: 10px; }
                    
                    .footer-note { 
                        margin-top: 40px; 
                        text-align: center; 
                        font-size: 10px; 
                        color: #94a3b8;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 15px;
                    }
                    
                    @media print {
                        body { background: none; }
                        .page { padding: 15mm; margin: 0; width: 100%; border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <div style="flex: 1">
                             <h1 class="school-name">${settings.schoolName}</h1>
                             <p class="school-motto">${settings.motto}</p>
                        </div>
                        <div class="school-info-header">
                            <div class="contact-info">
                                ${settings.address}<br/>
                                Tel: ${settings.phone}<br/>
                                Email: ${settings.email}
                            </div>
                        </div>
                    </div>

                    <div class="report-title">
                        LEARNER'S ASSESSMENT REPORT ${student.grade === 'Grade 6' ? '<span class="kpsea-badge">KPSEA</span>' : ''}
                    </div>

                    <div class="info-bar">
                        <div><span style="color:#64748b">NAME:</span> <strong>${student.firstName} ${student.lastName}</strong></div>
                        <div><span style="color:#64748b">ADM NO:</span> <strong>${student.admissionNumber}</strong></div>
                        <div><span style="color:#64748b">GRADE:</span> <strong>${student.grade}</strong></div>
                        <div><span style="color:#64748b">TERM:</span> <strong>${reportFilter.term}</strong></div>
                        <div><span style="color:#64748b">YEAR:</span> <strong>${settings.currentYear}</strong></div>
                        <div><span style="color:#64748b">GENDER:</span> <strong>${student.gender}</strong></div>
                    </div>

                    <div class="section-title">Academic Competencies</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Learning Area (Subject)</th>
                                <th style="text-align:center">Marks (%)</th>
                                <th style="text-align:center">Performance Level</th>
                                <th>Teacher's Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${termResults.map(r => `
                                <tr>
                                    <td><strong>${r.subject}</strong></td>
                                    <td style="text-align:center">${r.marks}%</td>
                                    <td style="text-align:center; font-weight:600">${r.level}</td>
                                    <td>${r.remarks || 'Commendable progress'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="summary-box">
                        <div class="summary-item">
                            <div class="summary-label">Aggregate Marks</div>
                            <div class="summary-value">${totalMarks}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Percentage Score</div>
                            <div class="summary-value">${averageMarks}%</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Assessed Areas</div>
                            <div class="summary-value">${termResults.length} / ${SUBJECTS.length}</div>
                        </div>
                    </div>

                    <div class="signature-area">
                        <div class="signature-box">
                            ${settings.headteacherSignature ? `<img src="${settings.headteacherSignature}" class="signature-img" />` : '<div style="height:60px"></div>'}
                            <div class="signature-line">Headteacher's Signature & Stamp</div>
                        </div>
                        <div class="signature-box" style="visibility: hidden">
                            <div style="height:60px"></div>
                            <div class="signature-line">Class Teacher</div>
                        </div>
                    </div>

                    <div class="footer-note">
                        This is a computer-generated assessment report. For authentication, a valid school stamp is required.<br/>
                        Generated on ${new Date().toLocaleString()} | ${settings.schoolName}
                    </div>
                </div>

                <div class="page fee-page">
                    <div class="header">
                        <div style="flex: 1">
                             <h1 class="school-name">${settings.schoolName}</h1>
                             <p class="school-motto">${settings.motto}</p>
                        </div>
                        <div class="school-info-header">
                            <div class="contact-info">
                                ${settings.address}<br/>
                                Tel: ${settings.phone}
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-title">TERM ${settings.currentTerm} FEE STRUCTURE</div>
                    
                    <div class="section-title">Fee Breakdown for ${student.grade}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Description of Charges</th>
                                <th style="text-align:right">Amount (KSh)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Tuition & Learning Materials</td>
                                <td style="text-align:right">${(gradeFees[student.grade] * 0.6).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Activity & Co-curricular Funds</td>
                                <td style="text-align:right">${(gradeFees[student.grade] * 0.2).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Development Levy (Fixed)</td>
                                <td style="text-align:right">${(gradeFees[student.grade] * 0.1).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Infrastructure Maintenance</td>
                                <td style="text-align:right">${(gradeFees[student.grade] * 0.1).toLocaleString()}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr style="background:#f1f5f9; font-weight:800">
                                <td>TOTAL PAYABLE FOR TERM</td>
                                <td style="text-align:right">KSh ${gradeFees[student.grade].toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="background:#fffbeb; padding:25px; border-radius:8px; border:1px solid #fcd34d; margin-top:30px">
                        <h4 style="margin:0 0 10px; color:#92400e; display:flex; align-items:center; gap:10px">
                           <span style="font-size:20px">⚠️</span> Balance Notification
                        </h4>
                        <p style="margin:0; font-size:14px">Total Outstanding Balance for ${student.firstName} ${student.lastName}: <strong style="font-size:18px">KSh ${student.feeBalance.toLocaleString()}</strong></p>
                        <p style="margin:12px 0 0; font-size:12px; color:#92400e; font-style:italic">
                            Kindly ensure all balances are settled to avoid any disruption in the learner's academic program.
                        </p>
                    </div>

                    <div class="signature-area" style="margin-top:40px">
                        <div class="signature-box">
                            ${settings.financeSignature ? `<img src="${settings.financeSignature}" class="signature-img" />` : '<div style="height:60px"></div>'}
                            <div class="signature-line">Bursar / Finance Officer</div>
                        </div>
                        <div class="signature-box">
                            ${settings.headteacherSignature ? `<img src="${settings.headteacherSignature}" class="signature-img" />` : '<div style="height:60px"></div>'}
                            <div class="signature-line">Headteacher's Endorsement</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(reportHTML);
            win.document.close();
            win.focus();
            setTimeout(() => { win.print(); }, 1000);
        }
    };

    const reportsDashboard = [
        {
            id: 'assessment',
            title: 'Learner Assessment',
            description: 'Generate detailed performance reports with averages, KPSEA designations, and signatures.',
            icon: <DescriptionIcon />,
            color: 'var(--accent-pink)',
            bg: 'var(--accent-pink-bg)',
            count: results.length,
            onAction: () => setSelectedReport('assessment'),
        },
        {
            id: 'students',
            title: 'Student Data',
            description: 'Export student lists, contact information, and enrollment history.',
            icon: <PeopleIcon />,
            color: 'var(--accent-blue)',
            bg: 'rgba(59,130,246,0.15)',
            count: students.length,
            onAction: () => exportCSV(students.map(s => ({
                'Admission No': s.admissionNumber,
                'Name': `${s.firstName} ${s.lastName} `,
                'Grade': s.grade,
                'Balance': s.feeBalance,
            })), 'students_report'),
        },
        {
            id: 'fees',
            title: 'Fee Collection',
            description: 'Financial summaries, termly collection reports, and arrears analysis.',
            icon: <PaymentIcon />,
            color: 'var(--accent-orange)',
            bg: 'var(--accent-orange-bg)',
            count: payments.length,
            onAction: () => exportCSV(payments.map(p => ({
                'Student': p.studentName,
                'Amount': p.amount,
                'Receipt': p.receiptNumber,
            })), 'fees_report'),
        },
        {
            id: 'cbc',
            title: 'CBC Progress Report',
            description: 'Competency-based reporting showing learning areas, strands, and performance levels.',
            icon: <AssignmentIcon />,
            color: 'var(--accent-cyan)',
            bg: 'rgba(6,182,212,0.15)',
            count: 0, // We could count assessment scores
            onAction: () => setSelectedReport('cbc-assessment'),
        },
        {
            id: 'finance-main',
            title: 'Financial Ledger',
            description: 'Full financial audit reports including income, expenditures, and budget status.',
            icon: <AccountBalanceIcon />,
            color: 'var(--accent-green)',
            bg: 'rgba(16,185,129,0.15)',
            count: payments.length,
            onAction: () => setSelectedReport('finance-reports'),
        },
        {
            id: 'analytics',
            title: 'Visual Analytics',
            description: 'Interactive charts and insights on institutional growth and performance trends.',
            icon: <TrendingUpIcon />,
            color: 'var(--accent-purple)',
            bg: 'rgba(168,85,247,0.15)',
            count: 4,
            onAction: () => setSelectedReport('visual-analytics'),
        },
        {
            id: 'audit',
            title: 'Financial Audit',
            description: 'Comprehensive financial statement including income, expenses and ledger summary.',
            icon: <PrintIcon />,
            color: 'var(--accent-orange)',
            bg: 'rgba(245,158,11,0.15)',
            count: 1,
            onAction: () => handlePrintFinancialAudit(),
        },
    ];

    const handlePrintFinancialAudit = () => {
        const incomeTotal = payments.reduce((sum, p) => sum + p.amount, 0);
        const expenseTotal = (typeof expenses !== 'undefined' ? expenses : []).reduce((sum: number, e: any) => sum + e.amount, 0);
        const balance = incomeTotal - expenseTotal;

        const auditHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Financial Audit Report - ${settings.schoolName}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                    .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
                    .school-name { font-size: 28px; font-weight: 800; color: #1e3a8a; margin: 0; }
                    .report-info { text-align: right; font-size: 12px; color: #64748b; }
                    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                    .summary-card { padding: 20px; border-radius: 12px; color: white; }
                    .card-label { font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; opacity: 0.9; }
                    .card-value { font-size: 24px; font-weight: 800; }
                    .blue { background: #3b82f6; }
                    .red { background: #ef4444; }
                    .green { background: #10b981; }
                    
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; }
                    td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="school-name">${settings.schoolName}</h1>
                        <p style="margin: 5px 0; color: #64748b;">${settings.motto}</p>
                    </div>
                    <div class="report-info">
                        <strong>FINANCIAL AUDIT REPORT</strong><br/>
                        Period: ${settings.currentTerm} ${settings.currentYear}<br/>
                        Generated: ${new Date().toLocaleString()}
                    </div>
                </div>

                <div class="summary-grid">
                    <div class="summary-card blue">
                        <div class="card-label">Total Income</div>
                        <div class="card-value">KSh ${incomeTotal.toLocaleString()}</div>
                    </div>
                    <div class="summary-card red">
                        <div class="card-label">Total Expenditure</div>
                        <div class="card-value">KSh ${expenseTotal.toLocaleString()}</div>
                    </div>
                    <div class="summary-card green">
                        <div class="card-label">Net Balance</div>
                        <div class="card-value">KSh ${balance.toLocaleString()}</div>
                    </div>
                </div>

                <h3>Recent Income (Fees)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.slice(-10).reverse().map(p => `
                            <tr>
                                <td>${p.date}</td>
                                <td>${p.studentName}</td>
                                <td>${p.method} - ${p.reference}</td>
                                <td style="font-weight: 700;">KSh ${p.amount.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    This is an official financial summary generated by ${settings.schoolName} Management System.
                </div>
            </body>
            </html>
        `;

        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(auditHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 500);
    };

    if (selectedReport === 'visual-analytics') {
        const gradeData = activeGrades.map(g => {
            const gradeStudents = students.filter(s => s.grade === g);
            const gradeResults = results.filter(r => {
                const s = students.find(st => st.id === r.studentId);
                return s?.grade === g;
            });
            const avg = gradeResults.length > 0 ? gradeResults.reduce((sum, r) => sum + r.marks, 0) / gradeResults.length : 0;
            return { name: g, students: gradeStudents.length, performance: Math.round(avg) };
        });

        const financeData = [
            { name: 'Income', value: payments.reduce((sum, p) => sum + p.amount, 0) },
            { name: 'Expenditure', value: expenses.reduce((sum, e) => sum + e.amount, 0) },
        ];

        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <button className="btn-outline" style={{ marginBottom: 15 }} onClick={() => setSelectedReport('dashboard')}>
                            ← Back to Reports
                        </button>
                        <h1>Institutional Insights</h1>
                        <p>Visual representation of performance and financial health</p>
                    </div>
                </div>

                <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div className="card" style={{ height: 400 }}>
                        <div className="card-header"><h3>Student Distribution by Grade</h3></div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gradeData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(59,130,246,0.1)' }} />
                                    <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card" style={{ height: 400 }}>
                        <div className="card-header"><h3>Academic Performance Avg (%)</h3></div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={gradeData}>
                                    <defs>
                                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="performance" stroke="#10b981" fillOpacity={1} fill="url(#colorPerf)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card" style={{ height: 400 }}>
                        <div className="card-header"><h3>Cash Flow Overview</h3></div>
                        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={financeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `KSh ${value.toLocaleString()}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card" style={{ height: 400 }}>
                        <div className="card-header"><h3>Institutional KPI Summary</h3></div>
                        <div className="card-body" style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div style={{ background: 'rgba(59,130,246,0.05)', padding: 15, borderRadius: 12, border: '1px solid rgba(59,130,246,0.1)' }}>
                                    <p className="text-muted text-xs uppercase" style={{ margin: '0 0 5px' }}>Fee Collection Rate</p>
                                    <h2 style={{ margin: 0, color: '#3b82f6' }}>
                                        {Math.round((students.reduce((sum, s) => sum + s.paidFees, 0) / students.reduce((sum, s) => sum + s.totalFees, 0)) * 100) || 0}%
                                    </h2>
                                </div>
                                <div style={{ background: 'rgba(16,185,129,0.05)', padding: 15, borderRadius: 12, border: '1px solid rgba(16,185,129,0.1)' }}>
                                    <p className="text-muted text-xs uppercase" style={{ margin: '0 0 5px' }}>Avg Result Score</p>
                                    <h2 style={{ margin: 0, color: '#10b981' }}>
                                        {Math.round(results.reduce((sum, r) => sum + r.marks, 0) / (results.length || 1))}%
                                    </h2>
                                </div>
                                <div style={{ background: 'rgba(239,68,68,0.05)', padding: 15, borderRadius: 12, border: '1px solid rgba(239,68,68,0.1)' }}>
                                    <p className="text-muted text-xs uppercase" style={{ margin: '0 0 5px' }}>Operating Margin</p>
                                    <h2 style={{ margin: 0, color: '#ef4444' }}>
                                        {Math.round(((financeData[0].value - financeData[1].value) / (financeData[0].value || 1)) * 100)}%
                                    </h2>
                                </div>
                                <div style={{ background: 'rgba(6,182,212,0.05)', padding: 15, borderRadius: 12, border: '1px solid rgba(6,182,212,0.1)' }}>
                                    <p className="text-muted text-xs uppercase" style={{ margin: '0 0 5px' }}>Attendance Rate</p>
                                    <h2 style={{ margin: 0, color: '#06b6d4' }}>
                                        {Math.round((attendance.filter(a => a.status === 'Present').length / (attendance.length || 1)) * 100)}%
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedReport === 'assessment') {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <button className="btn-outline" style={{ marginBottom: 15 }} onClick={() => setSelectedReport('dashboard')}>
                            ← Back to Reports
                        </button>
                        <h1>Learner Assessment Report</h1>
                        <p>Generate termly assessment reports with fee structure attachment</p>
                    </div>
                </div>

                <div className="stat-cards-grid" style={{ marginBottom: 30 }}>
                    <div className="stat-card" style={{ padding: 25 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 20, alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="student-select">Select Student</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search student..."
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                    style={{ marginBottom: 8 }}
                                />
                                <select
                                    id="student-select"
                                    title="Student selection"
                                    className="form-control"
                                    value={reportFilter.studentId}
                                    onChange={(e) => setReportFilter({ ...reportFilter, studentId: e.target.value })}
                                >
                                    <option value="">Choose a student ({filteredStudents.length} matches)</option>
                                    {filteredStudents.map(s => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="term-select">Select Term</label>
                                <select
                                    id="term-select"
                                    title="Term selection"
                                    className="form-control"
                                    value={reportFilter.term}
                                    onChange={(e) => setReportFilter({ ...reportFilter, term: e.target.value })}
                                >
                                    <option value="Term 1">Term 1</option>
                                    <option value="Term 2">Term 2</option>
                                    <option value="Term 3">Term 3</option>
                                </select>
                            </div>
                            <button
                                className="btn-primary"
                                disabled={!reportFilter.studentId}
                                onClick={handlePrintAssessment}
                            >
                                <PrintIcon style={{ fontSize: 18, marginRight: 8 }} />
                                Preview & Print Report
                            </button>
                        </div>
                    </div>
                </div>

                {reportFilter.studentId && (
                    <div className="card">
                        <div className="card-header">
                            <h3>Performance Summary</h3>
                        </div>
                        <div className="card-body">
                            <table className="data-table">
                                <thead className="sticky-header">
                                    <tr>
                                        <th>Subject</th>
                                        <th>Level</th>
                                        <th>Marks</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.filter(r => {
                                        const exam = exams.find(e => e.id === r.examId);
                                        return r.studentId === reportFilter.studentId && exam?.term === reportFilter.term;
                                    }).map(r => (
                                        <tr key={r.id}>
                                            <td><strong>{r.subject}</strong></td>
                                            <td>{r.level}</td>
                                            <td>{r.marks}%</td>
                                            <td>{r.remarks || '-'}</td>
                                        </tr>
                                    ))}
                                    {results.filter(r => {
                                        const exam = exams.find(e => e.id === r.examId);
                                        return r.studentId === reportFilter.studentId && exam?.term === reportFilter.term;
                                    }).length === 0 && (
                                            <tr>
                                                <td colSpan={4}>
                                                    <div className="empty-state">
                                                        <AssessmentIcon className="empty-state-icon" />
                                                        <h3>Performance Data Missing</h3>
                                                        <p>No results have been recorded for the selected student in this term yet.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (selectedReport === 'finance-reports') {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <button className="btn-outline" style={{ marginBottom: 15 }} onClick={() => setSelectedReport('dashboard')}>
                            ← Back to Reports
                        </button>
                        <h1>Institutional Financial Audit</h1>
                        <p>Consolidated reports for income, expenditure, and payroll records</p>
                    </div>
                </div>

                <div className="stat-cards-grid" style={{ marginBottom: 30 }}>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => exportCSV(payments, 'income_audit')}>
                        <TrendingUpIcon style={{ color: 'var(--accent-green)' }} />
                        <h3>Income Report</h3>
                        <p>Export all fee payments & revenue records</p>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => exportCSV(expenses, 'expenditure_audit')}>
                        <TrendingDownIcon style={{ color: 'var(--accent-red)' }} />
                        <h3>Expenditure Report</h3>
                        <p>Full breakdown of school spending by category</p>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => exportCSV(payroll.map(p => ({
                        'Staff': `${p.staff?.firstName} ${p.staff?.lastName}`,
                        'Basic': p.basicSalary,
                        'Allowances': p.totalAllowances,
                        'Deductions': p.totalDeductions,
                        'Net': p.netPay,
                        'Period': `${p.month}/${p.year}`,
                        'Status': p.status
                    })), 'payroll_audit')}>
                        <PeopleIcon style={{ color: 'var(--accent-blue)' }} />
                        <h3>Payroll Summary</h3>
                        <p>Consolidated staff salary & allowance records</p>
                    </div>
                </div>

                {loadingFinance ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 15px' }}></div>
                        <p>Compiling financial data...</p>
                    </div>
                ) : (
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Comprehensive Financial Ledger</h3>
                            <button className="btn-outline-sm" onClick={() => exportCSV(accounts, 'ledger_accounts')}>Export Chart of Accounts</button>
                        </div>
                        <div className="card-body">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Narration</th>
                                        <th>Category</th>
                                        <th style={{ textAlign: 'right' }}>Amount (KSh)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ...payments.map(p => ({ date: p.date, narration: `Fee Payment: ${p.studentName}`, category: 'INCOME', amount: p.amount, status: 'Completed', type: 'green' })),
                                        ...expenses.map(e => ({ date: e.createdAt, narration: e.description, category: 'EXPENSE', amount: e.amount, status: e.status, type: e.status === 'Paid' ? 'red' : 'orange' })),
                                        ...payroll.filter(p => p.status === 'Locked').map(p => ({ date: p.updatedAt, narration: `Salary: ${p.staff?.firstName} ${p.staff?.lastName}`, category: 'PAYROLL', amount: p.netPay, status: 'Posted', type: 'red' }))
                                    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, idx) => (
                                        <tr key={idx}>
                                            <td>{new Date(entry.date).toLocaleDateString()}</td>
                                            <td>{entry.narration}</td>
                                            <td><span className={`badge ${entry.category === 'INCOME' ? 'green' : 'blue'}`}>{entry.category}</span></td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, color: entry.category === 'INCOME' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                {entry.category === 'INCOME' ? '+' : '-'} {entry.amount.toLocaleString()}
                                            </td>
                                            <td><span className={`badge ${entry.type}`}>{entry.status}</span></td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && expenses.length === 0 && payroll.length === 0 && (
                                        <tr>
                                            <td colSpan={5}>
                                                <div className="empty-state">
                                                    <AccountBalanceIcon className="empty-state-icon" />
                                                    <h3>Financial Portfolio Empty</h3>
                                                    <p>There are no recorded income, expense, or payroll entries for the current audit period.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (selectedReport === 'cbc-assessment') {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <button className="btn-outline" style={{ marginBottom: 15 }} onClick={() => setSelectedReport('dashboard')}>
                            ← Back to Reports
                        </button>
                        <h1>CBC Progress Report</h1>
                        <p>Generate detailed competency reports for the CBC curriculum</p>
                    </div>
                </div>

                <div className="card glass-card" style={{ padding: 25 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Search and Select Learner</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Start typing name or admission number..."
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                style={{ marginBottom: 12 }}
                            />
                            <select
                                title="Learner selection"
                                className="form-control"
                                value={reportFilter.studentId}
                                onChange={(e) => setReportFilter({ ...reportFilter, studentId: e.target.value })}
                            >
                                <option value="">Choose a student...</option>
                                {filteredStudents.map(s => (
                                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="btn-primary"
                            disabled={!reportFilter.studentId}
                            onClick={() => setViewingCBCStudentId(reportFilter.studentId)}
                        >
                            <DescriptionIcon style={{ fontSize: 18, marginRight: 8 }} />
                            View Competency Report
                        </button>
                    </div>
                </div>

                {viewingCBCStudentId && (
                    <CBCProgressReportModal
                        studentId={viewingCBCStudentId}
                        onClose={() => setViewingCBCStudentId(null)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>School Reports</h1>
                    <p>Academic performance, financial records, and institutional data</p>
                </div>
            </div>

            <div className="report-cards-grid">
                {reportsDashboard.map(report => (
                    <div key={report.id} className="report-card" onClick={report.onAction}>
                        <div className="report-card-icon" style={{ background: report.bg, color: report.color }}>
                            {report.icon}
                        </div>
                        <h3>{report.title}</h3>
                        <p>{report.description}</p>
                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="badge blue">{report.count} records</span>
                            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={(e) => { e.stopPropagation(); report.onAction(); }}>
                                Open
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
