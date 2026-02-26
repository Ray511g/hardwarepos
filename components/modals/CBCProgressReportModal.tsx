import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { PerformanceLevel } from '../../types';

interface Props {
    studentId: string;
    onClose: () => void;
}

const getLevelName = (level: PerformanceLevel | string | undefined) => {
    switch (level) {
        case 'EE': return 'Exceeding Expectations';
        case 'ME': return 'Meeting Expectations';
        case 'AE': return 'Approaching Expectations';
        case 'BE': return 'Below Expectations';
        default: return 'Not Assessed';
    }
};

const getLevelColor = (level: string | undefined) => {
    switch (level) {
        case 'EE': return '#10b981';
        case 'ME': return '#3b82f6';
        case 'AE': return '#f59e0b';
        case 'BE': return '#ef4444';
        default: return '#94a3b8';
    }
};

export default function CBCProgressReportModal({ studentId, onClose }: Props) {
    const { students, learningAreas, assessmentScores, settings } = useSchool();
    const student = students.find(s => s.id === studentId);

    if (!student) return null;

    const studentScores = assessmentScores.filter(s => s.studentId === studentId);
    const gradeAreas = learningAreas.filter(a => a.grade === student.grade);

    const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>CBC Progress Report - ${student.firstName} ${student.lastName}</title>
            <style>
                body { font-family: 'Outfit', 'Inter', sans-serif; padding: 0; margin: 0; color: #1e293b; line-height: 1.5; }
                .page { padding: 20mm; background: white; max-width: 210mm; margin: auto; }
                .header { 
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 4px solid #1e3a8a;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .school-name { font-size: 32px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin: 0; letter-spacing: -0.5px; }
                .school-motto { font-style: italic; color: #64748b; margin-top: 4px; font-size: 14px; font-weight: 500; }
                .contact-info { text-align: right; font-size: 11px; color: #64748b; font-weight: 500; }
                
                .report-title-container { text-align: center; margin-bottom: 30px; }
                .report-title { 
                    display: inline-block;
                    background: #1e3a8a;
                    color: white;
                    padding: 8px 30px;
                    border-radius: 50px;
                    font-size: 18px; 
                    font-weight: 800; 
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .info-grid { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 20px; 
                    background: #f1f5f9; 
                    padding: 20px; 
                    margin-bottom: 35px; 
                    border-radius: 12px; 
                    font-size: 13px;
                }
                .info-item label { display: block; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 10px; margin-bottom: 4px; }
                .info-item span { font-weight: 800; color: #1e293b; font-size: 15px; }
                
                .area-section { margin-bottom: 40px; }
                .area-header { 
                    background: #334155; 
                    color: white; 
                    padding: 10px 20px; 
                    border-radius: 8px; 
                    font-weight: 800; 
                    font-size: 16px;
                    margin-bottom: 15px;
                    display: flex;
                    justify-content: space-between;
                }
                
                .strand-card { border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 15px; overflow: hidden; }
                .strand-name { background: #f8fafc; padding: 10px 20px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                
                table { width: 100%; border-collapse: collapse; }
                th { background: white; color: #94a3b8; text-align: left; padding: 12px 20px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
                td { padding: 12px 20px; font-size: 13px; border-top: 1px solid #f1f5f9; }
                
                .level-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; }
                .level-text { font-weight: 700; font-size: 12px; }

                .summary-box { 
                    margin-top: 40px; 
                    padding: 25px; 
                    background: #fff; 
                    border: 2px solid #f1f5f9; 
                    border-radius: 15px;
                }
                .summary-title { font-weight: 800; font-size: 14px; color: #1e3a8a; margin-bottom: 15px; text-transform: uppercase; }
                .summary-line { border-bottom: 1px dashed #cbd5e1; height: 30px; margin-bottom: 10px; }

                .footer { 
                    margin-top: 50px; 
                    display: flex; 
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .sig-box { text-align: center; width: 200px; }
                .sig-line { border-top: 2px solid #1e293b; padding-top: 8px; font-weight: 800; font-size: 12px; }
                .stamp-placeholder { width: 100px; height: 100px; border: 2px dashed #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #cbd5e1; margin: 0 auto 10px; }

                @media print {
                    body { background: white; }
                    .page { padding: 0; margin: 0; max-width: none; }
                }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="header">
                    <div>
                         <h1 class="school-name">${settings.schoolName}</h1>
                         <p class="school-motto">${settings.motto}</p>
                    </div>
                    <div class="contact-info">
                        ${settings.address}<br/>
                        ${settings.phone} | ${settings.email}
                    </div>
                </div>

                <div class="report-title-container">
                    <div class="report-title">Curriculum Progress Report Form</div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <label>Learner Name</label>
                        <span>${student.firstName} ${student.lastName}</span>
                    </div>
                    <div class="info-item">
                        <label>Admission No</label>
                        <span>${student.admissionNumber}</span>
                    </div>
                    <div class="info-item">
                        <label>Current Grade</label>
                        <span>${student.grade}</span>
                    </div>
                    <div class="info-item">
                        <label>Assessment Period</label>
                        <span>${settings.currentTerm}, ${settings.currentYear}</span>
                    </div>
                    <div class="info-item">
                        <label>Gender</label>
                        <span>${student.gender}</span>
                    </div>
                    <div class="info-item">
                        <label>Unique System ID</label>
                        <span style="font-family: monospace; font-size: 10px;">${student.id.toUpperCase()}</span>
                    </div>
                </div>

                ${gradeAreas.map(area => `
                    <div class="area-section">
                        <div class="area-header">
                            <span>${area.name}</span>
                        </div>
                        
                        ${area.strands.map(strand => `
                            <div class="strand-card">
                                <div class="strand-name">Strand: ${strand.name}</div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style="width: 50%">Competency / Sub-Strand</th>
                                            <th style="width: 20%; text-align:center">Level</th>
                                            <th style="width: 30%">Teacher Feedback</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${strand.subStrands.flatMap(ss => ss.assessments.map(a => {
        const score = studentScores.find(s => s.assessmentItemId === a.id);
        return `
                                                <tr>
                                                    <td><strong>${ss.name}</strong><br/><span style="font-size:11px; color:#64748b">${a.name}</span></td>
                                                    <td style="text-align:center">
                                                        <div class="level-dot" style="background: ${getLevelColor(score?.level)}"></div>
                                                        <span class="level-text" style="color: ${getLevelColor(score?.level)}">${score?.level || 'N/A'}</span>
                                                    </td>
                                                    <td style="font-style: italic; color: #475569; font-size: 11px;">
                                                        ${score?.remarks || 'Observation in progress...'}
                                                    </td>
                                                </tr>
                                            `;
    })).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}

                <div class="summary-box">
                    <div class="summary-title">Summative Performance Explanation</div>
                    <div style="display: flex; gap: 20px; font-size: 11px; margin-bottom: 20px;">
                        <div><span class="level-dot" style="background:#10b981"></span> <strong>EE:</strong> Exceeding Expectations</div>
                        <div><span class="level-dot" style="background:#3b82f6"></span> <strong>ME:</strong> Meeting Expectations</div>
                        <div><span class="level-dot" style="background:#f59e0b"></span> <strong>AE:</strong> Approaching Expectations</div>
                        <div><span class="level-dot" style="background:#ef4444"></span> <strong>BE:</strong> Below Expectations</div>
                    </div>
                    
                    <div class="summary-title">Class Teacher's General Remarks</div>
                    <div class="summary-line"></div>
                    <div class="summary-line"></div>
                    
                    <div class="summary-title" style="margin-top:20px">Headteacher's Comment</div>
                    <div class="summary-line"></div>
                </div>

                <div class="footer">
                    <div class="sig-box">
                         <div style="height:40px"></div>
                         <div class="sig-line">Class Teacher Signature</div>
                    </div>
                    <div class="sig-box">
                        <div class="stamp-placeholder">SCHOOL STAMP</div>
                        <div class="sig-line">Headteacher</div>
                    </div>
                </div>

                <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center;">
                    Generated on ${new Date().toLocaleDateString()} | © ${settings.schoolName} Academic Engine
                </div>
            </div>
        </body>
        </html>
    `;

    const handlePrint = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(reportHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 500);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 900, width: '95%' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="title-group">
                        <h2 className="modal-title">CBC Curriculum Progress Report</h2>
                        <p className="modal-subtitle">Comprehensive competency assessment for ${student.firstName}</p>
                    </div>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>

                <div className="modal-body overhaul-modal-body">
                    <div className="action-banner glass-card" style={{ marginBottom: 24, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="student-profile-mini">
                            <h3 style={{ margin: 0, fontSize: 18 }}>{student.firstName} {student.lastName}</h3>
                            <div style={{ display: 'flex', gap: 12, marginTop: 4, color: 'var(--text-secondary)', fontSize: 13 }}>
                                <span>{student.grade}</span>
                                <span>•</span>
                                <span>{student.admissionNumber}</span>
                            </div>
                        </div>
                        <div className="btn-group">
                            <button className="btn-outline" onClick={handlePrint}>
                                <DownloadIcon style={{ fontSize: 18, marginRight: 8 }} />
                                Preview PDF
                            </button>
                            <button className="btn-primary" onClick={handlePrint} style={{ marginLeft: 12 }}>
                                <PrintIcon style={{ fontSize: 18, marginRight: 8 }} />
                                Print Report
                            </button>
                        </div>
                    </div>

                    <div className="report-preview-container" style={{
                        background: '#f8fafc',
                        padding: 40,
                        borderRadius: 16,
                        border: '1px solid var(--border-color)',
                        maxHeight: '60vh',
                        overflowY: 'auto'
                    }}>
                        <div dangerouslySetInnerHTML={{ __html: reportHTML }} style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }} />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose}>Dismiss</button>
                    <button className="btn-primary" onClick={handlePrint}>Confirm & Print</button>
                </div>
            </div>
        </div>
    );
}
