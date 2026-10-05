const fs = require('fs');
const path = '/Users/hi/Desktop/Cliks/CLIKS-BUS-FE/src/pages/BusinessStock.jsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `            const isPerishableProduct = Boolean(
                p.has_expiry === true ||
                p.is_perishable === true ||
                (p.expiry_date && p.expiry_date !== '2029-01-10')
            );`;
const replace1 = `            const isPerishableProduct = Boolean(
                p.has_expiry === true || String(p.has_expiry) === '1' || String(p.has_expiry) === 'true' ||
                p.is_perishable === true || String(p.is_perishable) === '1' || String(p.is_perishable) === 'true' ||
                (p.expiry_date && p.expiry_date !== '2029-01-10' && String(p.is_perishable) !== '0' && String(p.is_perishable) !== 'false')
            );`;

const target2 = `            const isPerishableStock = Boolean(
                s.has_expiry === true ||
                s.is_perishable === true ||
                (s.expiry_date && s.expiry_date !== '2029-01-10')
            );`;
const replace2 = `            const isPerishableStock = Boolean(
                s.has_expiry === true || String(s.has_expiry) === '1' || String(s.has_expiry) === 'true' ||
                s.is_perishable === true || String(s.is_perishable) === '1' || String(s.is_perishable) === 'true' ||
                (s.expiry_date && s.expiry_date !== '2029-01-10' && String(s.is_perishable) !== '0' && String(s.is_perishable) !== 'false')
            );`;

if (content.includes(target1)) {
    content = content.replace(target1, replace1);
}
if (content.includes(target2)) {
    content = content.replace(target2, replace2);
}

fs.writeFileSync(path, content);
console.log('Fixed BusinessStock.jsx isPerishable parsing');
