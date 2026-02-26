import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generateStudentReport = async (studentName: string, elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#0a0d14', // Match the dark theme background
            logging: false,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${studentName.replace(/\s+/g, '_')}_Student_360_Report.pdf`);
    } catch (error) {
        console.error('Failed to generate PDF:', error);
    }
};
