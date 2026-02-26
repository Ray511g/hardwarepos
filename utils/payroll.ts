export interface ComplianceBracket {
    min: number;
    max: number;
    rate?: number; // As a decimal (0.1 for 10%)
    amount?: number; // Fixed amount
}

export interface PayrollInputs {
    basicSalary: number;
    allowances: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
    settings?: {
        nssfRate: number;
        nssfMax: number;
        personalRelief: number;
        housingLevyRate: number;
        shifEnabled?: boolean;
        nhifConfig?: any; // ComplianceBracket[]
        payeConfig?: any; // ComplianceBracket[]
    };
}

export function calculatePayroll(inputs: PayrollInputs) {
    const { basicSalary, allowances, deductions, settings } = inputs;
    const nssfRate = settings?.nssfRate || 0.06;
    const nssfMax = settings?.nssfMax || 2160;
    const personalRelief = settings?.personalRelief || 2400;
    const housingLevyRate = settings?.housingLevyRate || 0.015;

    const grossSalary = basicSalary + allowances.reduce((acc, curr) => acc + curr.amount, 0);

    // 1. NSSF (Usually flat rate % with a cap)
    let nssf = Math.min(grossSalary * nssfRate, nssfMax);

    // 2. Housing Levy (Usually flat rate %)
    const housingLevy = grossSalary * housingLevyRate;

    // 3. NHIF / SHIF (Dynamic Brackets or Flat Rate)
    let nhif = 0;
    if (settings?.shifEnabled) {
        // SHIF is typically 2.75% of gross
        nhif = grossSalary * 0.0275;
    } else if (settings?.nhifConfig && Array.isArray(settings.nhifConfig)) {
        const brackets: ComplianceBracket[] = settings.nhifConfig;
        const bracket = brackets.find(b => grossSalary >= b.min && (b.max === -1 || grossSalary <= b.max));
        if (bracket) {
            nhif = bracket.amount || (grossSalary * (bracket.rate || 0));
        }
    } else {
        // Default legacy NHIF scale
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
    }

    // 4. PAYE (Dynamic Tiered Brackets)
    const taxablePay = grossSalary - nssf;
    let paye = 0;

    if (settings?.payeConfig && Array.isArray(settings.payeConfig)) {
        const brackets: ComplianceBracket[] = settings.payeConfig;
        let remainingTaxable = taxablePay;
        
        // Sort brackets by min
        const sortedBrackets = [...brackets].sort((a, b) => a.min - b.min);
        
        for (const bracket of sortedBrackets) {
            const bracketSize = bracket.max === -1 ? Infinity : (bracket.max - bracket.min + 1);
            const amountInBracket = Math.min(remainingTaxable, bracketSize);
            
            if (amountInBracket > 0) {
                paye += amountInBracket * (bracket.rate || 0);
                remainingTaxable -= amountInBracket;
            }
            if (remainingTaxable <= 0) break;
        }
        paye = Math.max(0, paye - personalRelief);
    } else {
        // Default legacy PAYE
        if (taxablePay > 24000) {
            if (taxablePay <= 32333) {
                paye = (24000 * 0.1) + ((taxablePay - 24000) * 0.25);
            } else {
                paye = (24000 * 0.1) + (8333 * 0.25) + ((taxablePay - 32333) * 0.3);
            }
            paye = Math.max(0, paye - personalRelief);
        }
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
