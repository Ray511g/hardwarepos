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
                <div className="modal-body p-20">
                    <div className="receipt-content">
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6', letterSpacing: 1 }}>
                                {settings.schoolName}
                            </div>
                            <div className="text-muted text-xs" style={{ marginTop: 4 }}>
                                {settings.address} | {settings.phone}
                            </div>
                            <span className="badge blue" style={{ marginTop: 8, display: 'inline-block', letterSpacing: 1 }}>
                                OFFICIAL RECEIPT
                            </span>
                        </div>

                        <hr className="receipt-divider" />

                        <div className="receipt-row">
                            <span className="label">Receipt No:</span>
                            <span style={{ fontWeight: 700 }}>{payment.receiptNumber}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Date:</span>
                            <span>{new Date(payment.date).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Term:</span>
                            <span>{payment.term}</span>
                        </div>

                        <hr className="receipt-divider" />

                        <div className="receipt-row">
                            <span className="label">Student:</span>
                            <span style={{ fontWeight: 600 }}>{payment.studentName}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Grade:</span>
                            <span>{payment.grade}</span>
                        </div>

                        <hr className="receipt-divider" />

                        <div className="receipt-row">
                            <span className="label">Payment Method:</span>
                            <span><span className="badge blue">{payment.method}</span></span>
                        </div>
                        {payment.reference && (
                            <div className="receipt-row">
                                <span className="label">Reference:</span>
                                <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{payment.reference}</span>
                            </div>
                        )}

                        <hr className="receipt-divider" />

                        <div style={{
                            background: 'rgba(16,185,129,0.05)',
                            border: '2px solid #10b981',
                            borderRadius: 10,
                            padding: '16px',
                            textAlign: 'center',
                            margin: '12px 0'
                        }}>
                            <div className="text-muted text-xs uppercase" style={{ letterSpacing: 1 }}>Amount Paid</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                                KSh {payment.amount.toLocaleString()}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <span style={{
                                display: 'inline-block',
                                border: '2px solid #10b981',
                                color: '#10b981',
                                padding: '4px 20px',
                                borderRadius: 4,
                                fontWeight: 700,
                                fontSize: 13,
                                transform: 'rotate(-5deg)',
                                letterSpacing: 1
                            }}>✓ PAID</span>
                        </div>

                        <p className="text-center text-muted text-xs" style={{ marginTop: 16 }}>
                            Thank you for your payment. This is an official receipt.
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
