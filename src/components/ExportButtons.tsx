import React from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScheduleRow, formatDate } from '../utils/loanCalculator';

interface SummaryData {
    totalPayment: number;
    totalPrincipal: number;
    totalInterest: number;
    totalPrepayment: number;
    completionDate: Date;
    numberOfEmis: number;
    interestSaved: number;
}

interface ExportButtonsProps {
    schedule: ScheduleRow[];
    summary: SummaryData;
    loanData: {
        principal: string;
        rate: string;
        tenure: string;
        startDate: string;
    };
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ schedule, summary, loanData }) => {
    const exportToExcel = () => {
        if (schedule.length === 0) return;

        // Schedule sheet data - only the table
        const scheduleData: (string | number)[][] = [
            ['EMI No.', 'Date', 'Opening Balance', 'EMI', 'Interest', 'Principal', 'Prepayment', 'Closing Balance']
        ];

        schedule.forEach(row => {
            scheduleData.push([
                row.month,
                formatDate(row.date),
                Math.round(row.openingBalance),
                Math.round(row.emi),
                Math.round(row.interest),
                Math.round(row.principalComponent),
                Math.round(row.prepayment),
                Math.round(row.closingBalance)
            ]);
        });

        // Create workbook with only the schedule
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(scheduleData);

        XLSX.utils.book_append_sheet(wb, ws, 'Amortization Schedule');

        XLSX.writeFile(wb, 'Home_Loan_Amortization.xlsx');
    };

    // Helper function to format currency for PDF (without special symbols)
    const formatCurrencyForPDF = (amount: number): string => {
        return 'Rs. ' + new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    };

    const exportToPDF = () => {
        if (schedule.length === 0) return;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setTextColor(109, 40, 217);
        doc.text('Home Loan Amortization Report', 14, 20);

        // Loan Details
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Loan Details', 14, 35);

        autoTable(doc, {
            startY: 40,
            head: [['Parameter', 'Value']],
            body: [
                ['Principal Amount', formatCurrencyForPDF(parseFloat(loanData.principal))],
                ['Interest Rate', `${loanData.rate}%`],
                ['Tenure', `${loanData.tenure} years`],
                ['Start Date', formatDate(loanData.startDate)],
            ],
            theme: 'grid',
            headStyles: { fillColor: [109, 40, 217] },
        });

        // Summary
        doc.text('Payment Summary', 14, (doc as any).lastAutoTable.finalY + 15);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Metric', 'Amount']],
            body: [
                ['Total Principal', formatCurrencyForPDF(summary.totalPrincipal)],
                ['Total Interest', formatCurrencyForPDF(summary.totalInterest)],
                ['Total Prepayment', formatCurrencyForPDF(summary.totalPrepayment)],
                ['Interest Saved', formatCurrencyForPDF(summary.interestSaved)],
                ['Total Amount Paid', formatCurrencyForPDF(summary.totalPayment)],
                ['Number of EMIs', summary.numberOfEmis.toString()],
                ['Last EMI Date', formatDate(summary.completionDate)],
            ],
            theme: 'grid',
            headStyles: { fillColor: [109, 40, 217] },
        });

        // Add new page for schedule
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Amortization Schedule', 14, 20);

        // Schedule table
        const scheduleRows = schedule.map(row => [
            row.month,
            formatDate(row.date),
            formatCurrencyForPDF(row.openingBalance),
            formatCurrencyForPDF(row.emi),
            formatCurrencyForPDF(row.interest),
            formatCurrencyForPDF(row.principalComponent),
            row.prepayment > 0 ? formatCurrencyForPDF(row.prepayment) : '-',
            formatCurrencyForPDF(row.closingBalance)
        ]);

        autoTable(doc, {
            startY: 30,
            head: [['EMI', 'Date', 'Opening Bal', 'EMI', 'Interest', 'Principal', 'Prepayment', 'Closing Bal']],
            body: scheduleRows,
            theme: 'striped',
            headStyles: { fillColor: [109, 40, 217], fontSize: 8 },
            bodyStyles: { fontSize: 7 },
            styles: { cellPadding: 2 },
        });

        doc.save('Home_Loan_Amortization.pdf');
    };

    return (
        <div className="export-buttons">
            <button className="btn-export btn-excel" onClick={exportToExcel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Export to Excel
            </button>
            <button className="btn-export btn-pdf" onClick={exportToPDF}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Export to PDF
            </button>
        </div>
    );
};

export default ExportButtons;
