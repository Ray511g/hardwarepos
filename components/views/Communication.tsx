import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import SendIcon from '@mui/icons-material/Send';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';

export default function Communication() {
    const { students, results, settings, showToast } = useSchool();
    const [selectedGrade, setSelectedGrade] = useState<string>('All');
    const [messageType, setMessageType] = useState<'SMS' | 'Email'>('SMS');
    const [messageBody, setMessageBody] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(s => {
        const matchesGrade = selectedGrade === 'All' || s.grade === selectedGrade;
        const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesGrade && matchesSearch;
    });

    const studentsWithBalance = filteredStudents.filter(s => s.feeBalance > 0);

    const handleSendReminders = () => {
        if (!messageBody) {
            showToast('Please enter a message body', 'error');
            return;
        }
        showToast(`Sent ${messageType} reminders to ${studentsWithBalance.length} parents`);
        setMessageBody('');
    };

    const handlePrintFeeStatements = () => {
        const studentsToPrint = selectedGrade === 'All' ? studentsWithBalance : students.filter(s => s.grade === selectedGrade && s.feeBalance > 0);

        if (studentsToPrint.length === 0) {
            showToast('No students with outstanding balances found', 'info');
            return;
        }

        const combinedHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fee Statements - ${selectedGrade}</title>
                <style>
                    @page { size: A4; margin: 0; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; margin: 0; color: #333; line-height: 1.4; }
                    .page { 
                        width: 210mm; 
                        height: 297mm; 
                        padding: 20mm; 
                        margin: 0 auto; 
                        page-break-after: always; 
                        box-sizing: border-box; 
                        position: relative;
                        background: white;
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
                    .statement-title { 
                        font-size: 24px; 
                        font-weight: bold; 
                        margin-top: 20px; 
                        background: #fdf2f2; 
                        color: #c53030;
                        padding: 12px; 
                        text-align: center;
                        border-radius: 6px;
                        letter-spacing: 1px;
                    }
                    .info-box { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin: 25px 0;
                        font-size: 15px;
                        background: #f8fafc;
                        padding: 15px;
                        border-radius: 8px;
                    }
                    .info-item { margin-bottom: 6px; }
                    .label { font-weight: bold; color: #64748b; margin-right: 8px; }
                    .balance-section { 
                        text-align: center; 
                        padding: 30px; 
                        border: 2px dashed #cbd5e1; 
                        background: #f1f5f9;
                        border-radius: 10px;
                        margin: 30px 0;
                    }
                    .balance-amount { font-size: 38px; font-weight: bold; color: #1e293b; }
                    .payment-instructions { 
                        margin-top: 25px; 
                        padding: 20px; 
                        background: #ecfdf5; 
                        border: 1px solid #10b981;
                        border-radius: 8px;
                        font-size: 14px;
                    }
                    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 60px; }
                    .signature-line { border-top: 1px solid #333; text-align: center; padding-top: 8px; font-weight: bold; font-size: 14px; }
                    .footer { 
                        position: absolute; 
                        bottom: 15mm; 
                        left: 20mm; 
                        right: 20mm; 
                        text-align: center; 
                        font-size: 10px; 
                        color: #94a3b8; 
                        border-top: 1px solid #e2e8f0; 
                        padding-top: 8px; 
                    }
                    @media print { 
                        .page { margin: 0; border: none; } 
                        body { background: none; }
                    }
                </style>
            </head>
            <body>
                ${studentsToPrint.map(student => `
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
                            
                            <div class="statement-title">FEE STATEMENT</div>

                            <div class="info-box">
                                <div>
                                    <div class="info-item"><span class="label">Ref:</span> FS/${student.admissionNumber}/${settings.currentYear}</div>
                                    <div class="info-item"><span class="label">Date:</span> ${new Date().toLocaleDateString()}</div>
                                    <div class="info-item"><span class="label">Student:</span> <strong>${student.firstName} ${student.lastName}</strong></div>
                                </div>
                                <div>
                                    <div class="info-item"><span class="label">Adm No:</span> ${student.admissionNumber}</div>
                                    <div class="info-item"><span class="label">Grade:</span> ${student.grade}</div>
                                    <div class="info-item"><span class="label">Term:</span> ${settings.currentTerm} - ${settings.currentYear}</div>
                                </div>
                            </div>

                            <div class="balance-section">
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 5px; text-transform: uppercase; font-weight: 600;">Outstanding Balance Due</div>
                                <div class="balance-amount">KSh ${student.feeBalance.toLocaleString()}</div>
                            </div>

                            <div class="payment-instructions">
                                <h4 style="margin: 0 0 10px 0; color: #059669; display: flex; align-items: center; gap: 8px;">
                                    PAYMENT METHODS:
                                </h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                    <div>
                                        <strong>M-Pesa Paybill:</strong><br/>
                                        Business No: ${settings.paybillNumber || '123456'}<br/>
                                        Account: ${student.firstName} ${student.lastName}
                                    </div>
                                    <div>
                                        <strong>Bank Deposit:</strong><br/>
                                        Account Name: ${settings.schoolName}<br/>
                                        Account No: [Bank Details]
                                    </div>
                                </div>
                            </div>

                            <div class="signature-grid">
                                <div style="text-align: center">
                                    ${settings.financeSignature ? `<img src="${settings.financeSignature}" style="height:60px; display:block; margin:0 auto -10px" alt="Bursar Signature" />` : '<div style="height:50px"></div>'}
                                    <div class="signature-line">School Bursar / Finance</div>
                                </div>
                                <div style="text-align: center">
                                    ${settings.headteacherSignature ? `<img src="${settings.headteacherSignature}" style="height:60px; display:block; margin:0 auto -10px" alt="Headteacher Signature" />` : '<div style="height:50px"></div>'}
                                    <div class="signature-line">Headteacher / School Stamp</div>
                                </div>
                            </div>

                            <div class="footer">
                                This is a computer generated document. For any inquiries, please contact the school administration.
                            </div>
                        </div>
                    `).join('')}
            </body>
            </html>
        `;

        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(combinedHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 1000);
    };

    const draftFeeReminder = (student: typeof students[0]) => {
        const msg = `Dear Parent, this is a reminder that ${student.firstName} has an outstanding fee balance of KSh ${student.feeBalance.toLocaleString()}. Please clear it soon. - Elirama School`;
        setMessageBody(msg);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Communication</h1>
                    <p>Send fee reminders and bulk messages to parents</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn-outline" onClick={handlePrintFeeStatements}>
                        <PrintIcon style={{ fontSize: 18, marginRight: 8 }} />
                        Print {selectedGrade !== 'All' ? selectedGrade : 'All'} Fee Statements
                    </button>
                </div>
            </div>

            <div className="admin-grid">
                <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header" style={{ marginBottom: 20 }}>
                        <h3><MessageIcon /> Bulk Message Composer</h3>
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="recipient-grade">Recipients (Grade)</label>
                            <select
                                id="recipient-grade"
                                title="Recipient selection by grade"
                                className="form-control"
                                value={selectedGrade}
                                onChange={e => setSelectedGrade(e.target.value)}
                            >
                                <option value="All">All Students ({students.length})</option>
                                {[...new Set(students.map(s => s.grade))].sort().map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="message-type">Message Type</label>
                            <select
                                id="message-type"
                                title="Type of communication"
                                className="form-control"
                                value={messageType}
                                onChange={e => setMessageType(e.target.value as any)}
                            >
                                <option value="SMS">SMS Message</option>
                                <option value="Email">Email Notification</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Message Content</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Type your message here..."
                            value={messageBody}
                            onChange={e => setMessageBody(e.target.value)}
                        ></textarea>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                            {messageBody.length} characters | ~{Math.ceil(messageBody.length / 160)} SMS units
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button className="btn-outline" onClick={() => setMessageBody('')}>Clear</button>
                        <button className="btn-primary" onClick={handleSendReminders}>
                            <SendIcon style={{ fontSize: 18, marginRight: 8 }} />
                            Send to {studentsWithBalance.length} Parents (with balance)
                        </button>
                    </div>
                </div>

                <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3><GroupIcon /> Fee Balance List</h3>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div className="search-bar" style={{ maxWidth: 300 }}>
                                <SearchIcon />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead className="sticky-header">
                                <tr>
                                    <th>Student</th>
                                    <th>Grade</th>
                                    <th>Parent</th>
                                    <th>Phone</th>
                                    <th>Balance</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsWithBalance.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>{s.firstName} {s.lastName}</strong><br /><small>{s.admissionNumber}</small></td>
                                        <td>{s.grade}</td>
                                        <td>{s.parentName}</td>
                                        <td>{s.parentPhone}</td>
                                        <td><span className="badge pink">KSh {s.feeBalance.toLocaleString()}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn-outline"
                                                style={{ padding: '4px 8px', fontSize: 12 }}
                                                onClick={() => draftFeeReminder(s)}
                                            >
                                                Draft Reminder
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {studentsWithBalance.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                                            No students found with outstanding balances.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
