const fs = require('fs');
const path = '/Users/hi/Desktop/Cliks/CLIKS-BUS-FE/src/pages/BusinessStock.jsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `    // Safe unified mapping of DB products & stock items with strict Damaged Godown exclusion
    const stocks = React.useMemo(() => {
        const list = [];
        const seenNames = new Set();

        const safeProds = Array.isArray(dbProducts) ? dbProducts : [];
        safeProds.forEach(p => {
            if (!p) return;
            const nameKey = (p.name || '').toLowerCase().trim();
            if (nameKey) seenNames.add(nameKey);

            const warehouseName = p.warehouse_id || p.warehouse || 'Main Godown';`;

const replace1 = `    // Safe unified mapping of DB products & stock items with strict Damaged Godown exclusion
    const stocks = React.useMemo(() => {
        const list = [];
        const seenNames = new Set();
        
        const resolveWarehouseName = (wIdOrName) => {
            if (!wIdOrName) return 'Main Godown';
            const found = (dbWarehouses || []).find(w => String(w.id) === String(wIdOrName) || String(w.warehouse_id) === String(wIdOrName) || String(w.name).toLowerCase() === String(wIdOrName).toLowerCase());
            return found ? (found.name || found.warehouse_name || wIdOrName) : wIdOrName;
        };

        const safeProds = Array.isArray(dbProducts) ? dbProducts : [];
        safeProds.forEach(p => {
            if (!p) return;
            const nameKey = (p.name || '').toLowerCase().trim();
            if (nameKey) seenNames.add(nameKey);

            const warehouseName = resolveWarehouseName(p.warehouse_id || p.warehouse);`;

const target2 = `    }, [dbProducts, dbStocks]);`;
const replace2 = `    }, [dbProducts, dbStocks, dbWarehouses]);`;

if (content.includes(target1) && content.includes(target2)) {
    content = content.replace(target1, replace1).replace(target2, replace2);
    fs.writeFileSync(path, content);
    console.log('Successfully updated BusinessStock.jsx warehouse name resolution');
} else {
    console.log('Could not find target strings in BusinessStock.jsx');
}
