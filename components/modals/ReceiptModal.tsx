import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';

interface FeePayment {
    id: string;
    studentId: string;
    studentName: string;
    grade: string;
    amount: number;
    method: string;
    reference: string;
    date: string;
    term: string;
    receiptNumber: string;
}

interface Props {
    payment: FeePayment;
    onClose: () => void;
}

export default function ReceiptModal({ payment, onClose }: Props) {
    const { settings } = useSchool();

    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt ${payment.receiptNumber}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
                .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 12px; padding: 32px; }
                .header { text-align: center; margin-bottom: 24px; }
                .school-name { font-size: 22px; font-weight: 800; color: #4f46e5; letter-spacing: 1px; }
                .school-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
                .badge { display: inline-block; background: #4f46e5; color: white; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-top: 8px; }
                .divider { border: none; border-top: 1px dashed #cbd5e1; margin: 16px 0; }
                .row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; }
                .row .label { color: #64748b; font-weight: 500; }
                .row .value { font-weight: 600; color: #1e293b; }
                .amount-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; }
                .amount-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
                .amount-value { font-size: 28px; font-weight: 800; color: #16a34a; margin-top: 4px; }
                .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8; }
                .stamp { display: inline-block; border: 2px solid #22c55e; color: #16a34a; padding: 4px 16px; border-radius: 4px; font-weight: 700; font-size: 13px; margin-top: 8px; transform: rotate(-5deg); }
                @media print {
                    body { padding: 20px; }
                    .receipt { border: 1px solid #ccc; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <div class="school-name">${settings.schoolName}</div>
                    <div class="school-sub">${settings.address} | ${settings.phone}</div>
                    <div class="school-sub">${settings.email}</div>
                    <div class="badge">OFFICIAL RECEIPT</div>
                </div>
                <hr class="divider" />
                <div class="row"><span class="label">Receipt No:</span><span class="value">${payment.receiptNumber}</span></div>
                <div class="row"><span class="label">Date:</span><span class="value">${new Date(payment.date).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
                <div class="row"><span class="label">Term:</span><span class="value">${payment.term}</span></div>
                <hr class="divider" />
                <div class="row"><span class="label">Student Name:</span><span class="value">${payment.studentName}</span></div>
                <div class="row"><span class="label">Grade:</span><span class="value">${payment.grade}</span></div>
                <hr class="divider" />
                <div class="row"><span class="label">Payment Method:</span><span class="value">${payment.method}</span></div>
                ${payment.reference ? `<div class="row"><span class="label">Reference:</span><span class="value">${payment.reference}</span></div>` : ''}
                <div class="amount-box">
                    <div class="amount-label">Amount Paid</div>
                    <div class="amount-value">KSh ${payment.amount.toLocaleString()}</div>
                </div>
                <div style="text-align:center">
                    <div class="stamp">✓ PAID</div>
                </div>
                <div class="footer">
                    <p>Thank you for your payment.</p>
                    <p>This is an official receipt from ${settings.schoolName}.</p>
                    <p style="margin-top:8px;font-size:10px;">Generated: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const handlePrint = () => {
        const win = window.open('', '_blank', 'width=500,height=700');
        if (!win) return;
        win.document.write(receiptHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 500);
    };

    const handleDownload = () => {
        const win = window.open('', '_blank', 'width=500,height=700');
        if (!win) return;
        win.document.write(receiptHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                <div className="receipt-modal-header">
                    <h2>Payment Receipt</h2>
                    <button className="modal-close" onClick={onClose} title="Close receipt" aria-label="Close modal"><CloseIcon /></button>
                </div>
                <div className="modal-body overhaul-modal-body" style={{ background: '#f1f5f9', padding: '30px' }}>
                    <div className="receipt-content paper-sheet" style={{ margin: '0 auto', minHeight: 'auto', padding: '32px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#4f46e5', letterSpacing: 1 }}>
                                {settings.schoolName}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '12px', marginTop: 4 }}>
                                {settings.address} | {settings.phone}
                            </div>
                            <span className="badge blue" style={{ marginTop: 12, display: 'inline-block', letterSpacing: 1, padding: '4px 16px' }}>
                                OFFICIAL RECEIPT
                            </span>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '20px 0' }} />

                        <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Receipt No:</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{payment.receiptNumber}</span>
                        </div>
                        <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Date:</span>
                            <span style={{ color: '#1e293b' }}>{new Date(payment.date).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Term:</span>
                            <span style={{ color: '#1e293b' }}>{payment.term}</span>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '20px 0' }} />

                        <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Student:</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{payment.studentName}</span>
                        </div>
                        <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Grade:</span>
                            <span style={{ color: '#1e293b' }}>{payment.grade}</span>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '20px 0' }} />

                        <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Payment Method:</span>
                            <span style={{ fontWeight: 600, color: '#4f46e5' }}>{payment.method}</span>
                        </div>
                        {payment.reference && (
                            <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>Reference:</span>
                                <span style={{ fontFamily: 'monospace', color: '#1e293b' }}>{payment.reference}</span>
                            </div>
                        )}

                        <div style={{
                            background: '#f0fdf4',
                            border: '2px solid #22c55e',
                            borderRadius: 10,
                            padding: '16px',
                            textAlign: 'center',
                            margin: '20px 0'
                        }}>
                            <div style={{ color: '#16a34a', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Amount Paid</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
                                KSh {payment.amount.toLocaleString()}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <span style={{
                                display: 'inline-block',
                                border: '2px solid #22c55e',
                                color: '#22c55e',
                                padding: '4px 24px',
                                borderRadius: 4,
                                fontWeight: 800,
                                fontSize: 14,
                                transform: 'rotate(-5deg)',
                                letterSpacing: 1,
                                opacity: 0.8
                            }}>✓ PAID</span>
                        </div>

                        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '10px', marginTop: 24 }}>
                            Thank you for your payment. This is an official digital receipt.
                        </p>
                    </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px dashed var(--border-color)' }}>
                    <button className="btn btn-outline" onClick={onClose} title="Dismiss receipt">Close</button>
                    <button className="btn btn-outline" onClick={handleDownload} title="Save as PDF" aria-label="Download PDF">
                        <DownloadIcon className="mr-2" style={{ fontSize: 18 }} /> PDF
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint} title="Print direct to printer" aria-label="Print receipt">
                        <PrintIcon className="mr-2" style={{ fontSize: 18 }} /> Print
                    </button>
                </div>
            </div>
        </div>
    );
}
