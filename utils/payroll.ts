export interface PayrollInputs {
    basicSalary: number;
    allowances: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
    settings?: {
        nssfRate: number;
        nssfMax: number;
        personalRelief: number;
        housingLevyRate: number;
    };
}

export function calculatePayroll(inputs: PayrollInputs) {
    const { basicSalary, allowances, deductions, settings } = inputs;
    const nssfRate = settings?.nssfRate || 0.06;
    const nssfMax = settings?.nssfMax || 2160;
    const personalRelief = settings?.personalRelief || 2400;
    const housingLevyRate = settings?.housingLevyRate || 0.015;

    const grossSalary = basicSalary + allowances.reduce((acc, curr) => acc + curr.amount, 0);

    // 1. NSSF
    let nssf = Math.min(grossSalary * nssfRate, nssfMax);

    // 2. Housing Levy
    const housingLevy = grossSalary * housingLevyRate;

    // 2. NHIF (Simplified Scale)
    let nhif = 0;
    if (grossSalary <= 5999) nhif = 150;
    else if (grossSalary <= 7999) nhif = 300;
    else if (grossSalary <= 11999) nhif = 400;
    else if (grossSalary <= 14999) nhif = 500;
    else if (grossSalary <= 19999) nhif = 600;
    else if (grossSalary <= 24999) nhif = 750;
    else if (grossSalary <= 29999) nhif = 850;
    else if (grossSalary <= 34999) nhif = 900;
    else if (grossSalary <= 39999) nhif = 950;
    else if (grossSalary <= 44999) nhif = 1000;
    else if (grossSalary <= 49999) nhif = 1100;
    else if (grossSalary <= 59999) nhif = 1200;
    else if (grossSalary <= 69999) nhif = 1300;
    else if (grossSalary <= 79999) nhif = 1400;
    else if (grossSalary <= 89999) nhif = 1500;
    else if (grossSalary <= 99999) nhif = 1600;
    else nhif = 1700;

    // 3. PAYE (Simplified 2023/24 Brackets)
    const taxablePay = grossSalary - nssf;
    let paye = 0;

    // Brackets: 
    // First 24,000 @ 10%
    // Next 8,333 @ 25%
    // Next 467,667 @ 30%
    // Plus personal relief (Approx 2,400)

    if (taxablePay > 24000) {
        if (taxablePay <= 24000) {
            paye = taxablePay * 0.1;
        } else if (taxablePay <= 32333) {
            paye = (24000 * 0.1) + ((taxablePay - 24000) * 0.25);
        } else {
            paye = (24000 * 0.1) + (8333 * 0.25) + ((taxablePay - 32333) * 0.3);
        }
        paye = Math.max(0, paye - 2400); // Personal Relief
    } else {
        paye = 0;
    }

    const otherDeductions = inputs.deductions.reduce((acc, curr) => acc + curr.amount, 0);
    const totalDeductions = paye + nssf + nhif + housingLevy + otherDeductions;
    const netPay = grossSalary - totalDeductions;

    return {
        grossSalary,
        nssf,
        nhif,
        paye,
        housingLevy,
        totalDeductions,
        netPay
    };
}
