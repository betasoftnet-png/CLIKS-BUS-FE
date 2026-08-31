import * as XLSX from 'xlsx';

/**
 * Bank Statement Parser Utility
 * Supports HDFC Bank, SBI, ICICI, Axis Bank, and Generic CSV/Excel/Text Statement formats.
 */

// Helper to clean numerical values (e.g. "2,40,000.00 Cr" -> 240000)
const parseAmount = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return Math.abs(val);
    const str = String(val).replace(/,/g, '').replace(/INR/gi, '').replace(/[^\d.-]/g, '').trim();
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.abs(num);
};

// Helper to format date strings into standard YYYY-MM-DD
const parseDate = (val) => {
    if (!val) return new Date().toISOString().split('T')[0];
    if (val instanceof Date && !isNaN(val)) {
        return val.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    // Excel Serial Date Number
    if (/^\d{5}(\.\d+)?$/.test(str)) {
        const d = XLSX.SSF.parse_date_code(parseFloat(str));
        if (d) {
            const pad = (n) => String(n).padStart(2, '0');
            return `${d.y}-${pad(d.m)}-${pad(d.d)}`;
        }
    }

    // Try parsing DD/MM/YY, DD/MM/YYYY, DD-MM-YYYY
    const parts = str.split(/[/.\-]/);
    if (parts.length === 3) {
        let [day, month, year] = parts;
        if (day.length === 4) {
            // YYYY-MM-DD format
            return `${day}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        if (year.length === 2) {
            year = `20${year}`;
        }
        if (parseInt(day, 10) > 12) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        } else if (parseInt(month, 10) > 12) {
            return `${year}-${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}`;
        } else {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
};

/**
 * Main parser for Bank Statements (Excel Buffer or Raw File)
 */
export const parseBankStatementFile = async (file, bankPreset = 'HDFC', password = '') => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

                if (!jsonRows || jsonRows.length === 0) {
                    return resolve([]);
                }

                // Locate header row dynamically
                let headerRowIdx = -1;
                for (let i = 0; i < Math.min(jsonRows.length, 30); i++) {
                    const rowStr = jsonRows[i].map(c => String(c).toLowerCase()).join(' ');
                    if (
                        rowStr.includes('date') || 
                        rowStr.includes('narration') || 
                        rowStr.includes('particulars') || 
                        rowStr.includes('description') ||
                        rowStr.includes('withdrawal') ||
                        rowStr.includes('debit')
                    ) {
                        headerRowIdx = i;
                        break;
                    }
                }

                if (headerRowIdx === -1) headerRowIdx = 0;

                const headers = jsonRows[headerRowIdx].map(h => String(h).trim());
                const rawDataRows = jsonRows.slice(headerRowIdx + 1);

                // Column index mapping
                const colMap = {
                    date: -1,
                    narration: -1,
                    refNo: -1,
                    debit: -1,
                    credit: -1,
                    amount: -1,
                    type: -1,
                    balance: -1
                };

                headers.forEach((h, idx) => {
                    const lower = h.toLowerCase();
                    if (colMap.date === -1 && (lower.includes('date') || lower.includes('dt'))) colMap.date = idx;
                    if (colMap.narration === -1 && (lower.includes('narration') || lower.includes('particular') || lower.includes('desc') || lower.includes('remark'))) colMap.narration = idx;
                    if (colMap.refNo === -1 && (lower.includes('ref') || lower.includes('chq') || lower.includes('tran id') || lower.includes('cheque'))) colMap.refNo = idx;
                    if (colMap.debit === -1 && (lower.includes('withdrawal') || lower.includes('debit') || lower.includes('dr'))) colMap.debit = idx;
                    if (colMap.credit === -1 && (lower.includes('deposit') || lower.includes('credit') || lower.includes('cr'))) colMap.credit = idx;
                    if (colMap.balance === -1 && (lower.includes('balance') || lower.includes('bal'))) colMap.balance = idx;
                    if (colMap.amount === -1 && (lower.includes('amount') || lower.includes('amt'))) colMap.amount = idx;
                    if (colMap.type === -1 && (lower === 'type' || lower.includes('dr/cr'))) colMap.type = idx;
                });

                const parsedTransactions = [];

                rawDataRows.forEach((row, rowIndex) => {
                    if (!row || row.length === 0) return;
                    
                    const dateRaw = colMap.date !== -1 ? row[colMap.date] : '';
                    const narrationRaw = colMap.narration !== -1 ? String(row[colMap.narration]).trim() : '';
                    if (!dateRaw && !narrationRaw) return; // Skip empty header/footer lines

                    const refNoRaw = colMap.refNo !== -1 ? String(row[colMap.refNo]).trim() : '';
                    let debitVal = colMap.debit !== -1 ? parseAmount(row[colMap.debit]) : 0;
                    let creditVal = colMap.credit !== -1 ? parseAmount(row[colMap.credit]) : 0;
                    const balanceVal = colMap.balance !== -1 ? parseAmount(row[colMap.balance]) : 0;

                    // If single amount column exists
                    if (debitVal === 0 && creditVal === 0 && colMap.amount !== -1) {
                        const amtRaw = row[colMap.amount];
                        const parsedAmt = parseAmount(amtRaw);
                        const typeRaw = colMap.type !== -1 ? String(row[colMap.type]).toUpperCase() : '';

                        if (typeRaw.includes('CR') || typeRaw.includes('CREDIT') || String(amtRaw).includes('+')) {
                            creditVal = parsedAmt;
                        } else {
                            debitVal = parsedAmt;
                        }
                    }

                    if (debitVal === 0 && creditVal === 0) return; // Skip non-transaction summary rows

                    const isCredit = creditVal > 0;
                    const txnAmount = isCredit ? creditVal : debitVal;

                    parsedTransactions.push({
                        id: `bank_stmt_${Date.now()}_${rowIndex}`,
                        date: parseDate(dateRaw),
                        narration: narrationRaw || 'Bank Transaction',
                        refNo: refNoRaw || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
                        debit: debitVal,
                        credit: creditVal,
                        amount: txnAmount,
                        type: isCredit ? 'Credit' : 'Debit',
                        balance: balanceVal,
                        bankPreset
                    });
                });

                resolve(parsedTransactions);
            } catch (err) {
                console.error('[Bank Statement Parser Error]:', err);
                reject(new Error('Failed to parse statement. Please ensure it is a valid bank statement Excel, CSV, or text file.'));
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Generates sample structured bank statement data matching the HDFC / Bank statement layout
 */
export const getSampleHdfcStatementData = (bankName = 'HDFC BANK') => {
    return [
        {
            id: 'sample_1',
            date: '2026-08-01',
            narration: 'NEFT CR-RATN0000190-AMIT VOHRA-NETBANK',
            refNo: 'N091180509271680',
            debit: 0,
            credit: 240000,
            amount: 240000,
            type: 'Credit',
            balance: 1545700,
            bankPreset: bankName
        },
        {
            id: 'sample_2',
            date: '2026-08-02',
            narration: 'PIS AMC CHARGES 1000',
            refNo: '0000000000000000',
            debit: 1000,
            credit: 0,
            amount: 1000,
            type: 'Debit',
            balance: 1544700,
            bankPreset: bankName
        },
        {
            id: 'sample_3',
            date: '2026-08-04',
            narration: 'Salary paid to arun kumar for July 2026',
            refNo: 'NCB1809232527957',
            debit: 39100,
            credit: 0,
            amount: 39100,
            type: 'Debit',
            balance: 1505600,
            bankPreset: bankName
        },
        {
            id: 'sample_4',
            date: '2026-08-14',
            narration: 'NEFT CR-SBIN0030126-MASTER NIKHIL SOLANKI',
            refNo: 'SBIN918145392565',
            debit: 0,
            credit: 200000,
            amount: 200000,
            type: 'Credit',
            balance: 1705600,
            bankPreset: bankName
        },
        {
            id: 'sample_5',
            date: '2026-08-20',
            narration: 'NHDF6390959767/BILLDKINDIANCLEARING',
            refNo: '0000181653430374',
            debit: 25000,
            credit: 0,
            amount: 25000,
            type: 'Debit',
            balance: 1680600,
            bankPreset: bankName
        }
    ];
};
