const fs = require('fs');
const path = '/Users/hi/Desktop/Cliks/CLIKS-BUS-FE/src/pages/BusinessInventory.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `            has_expiry: Boolean(item.has_expiry || item.is_perishable || (item.expiry_date && item.expiry_date !== '2029-01-10')),
            is_perishable: Boolean(item.has_expiry || item.is_perishable || (item.expiry_date && item.expiry_date !== '2029-01-10')),`;

const replace = `            has_expiry: Boolean(
                item.has_expiry === true || String(item.has_expiry) === '1' || String(item.has_expiry) === 'true' ||
                item.is_perishable === true || String(item.is_perishable) === '1' || String(item.is_perishable) === 'true' ||
                (item.expiry_date && item.expiry_date !== '2029-01-10' && String(item.is_perishable) !== '0' && String(item.is_perishable) !== 'false')
            ),
            is_perishable: Boolean(
                item.has_expiry === true || String(item.has_expiry) === '1' || String(item.has_expiry) === 'true' ||
                item.is_perishable === true || String(item.is_perishable) === '1' || String(item.is_perishable) === 'true' ||
                (item.expiry_date && item.expiry_date !== '2029-01-10' && String(item.is_perishable) !== '0' && String(item.is_perishable) !== 'false')
            ),`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync(path, content);
    console.log('Fixed BusinessInventory.jsx has_expiry population');
} else {
    console.log('Target not found in BusinessInventory.jsx');
}
