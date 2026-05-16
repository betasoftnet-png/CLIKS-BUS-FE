import fs from 'fs';

const files = [
    'src/components/common/CalcPopover.jsx',
    'src/pages/BusinessBilling.jsx',
    'src/pages/BusinessCRM.jsx',
    'src/pages/BusinessFinancialPlan.jsx',
    'src/pages/BusinessInventory.jsx',
    'src/pages/BusinessPOS.jsx',
    'src/pages/BusinessPeople.jsx',
    'src/pages/BusinessPurposeWallet.jsx',
    'src/pages/BusinessSalesOrders.jsx',
    'src/pages/BusinessSegregation.jsx',
    'src/pages/BusinessSplitCollect.jsx',
    'src/pages/BusinessStaffing.jsx',
    'src/pages/BusinessSubscription.jsx',
    'src/pages/BusinessSuppliers.jsx',
    'src/pages/BusinessWallet.jsx',
    'src/pages/admin/AdminDashboard.jsx',
    'src/pages/admin/AdminModeration.jsx',
    'src/pages/admin/AdminSalesTeam.jsx',
    'src/pages/admin/AdminSettings.jsx',
    'src/pages/admin/AdminUsers.jsx'
];

const signatureFixes = [
    ['const handleDelete = (id) => {', 'const handleDelete = async (id) => {'],
    ['const handleDeleteContact = (id) => {', 'const handleDeleteContact = async (id) => {'],
    ['const handleDeleteEmployee = (empId) => {', 'const handleDeleteEmployee = async (empId) => {'],
    ['const clearCart = () => {', 'const clearCart = async () => {'],
    ['const deleteHeldCart = (holdId) => {', 'const deleteHeldCart = async (holdId) => {'],
    ['const restoreCart = (holdId) => {', 'const restoreCart = async (holdId) => {'],
    ['const handleSystemArm = () => {', 'const handleSystemArm = async () => {']
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('window.confirm')) return;

    // Determine import path
    let importPath = '';
    const depth = file.split('/').length - 2;
    if (depth === 1) importPath = '../utils/customConfirm';
    else if (depth === 2) importPath = '../../utils/customConfirm';

    // Add import statement after the last import
    if (!content.includes('customConfirm')) {
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine) + `\nimport { customConfirm } from '${importPath}';` + content.slice(endOfLine);
        } else {
            content = `import { customConfirm } from '${importPath}';\n` + content;
        }
    }

    // Fix signatures
    for (const [find, replace] of signatureFixes) {
        content = content.split(find).join(replace);
    }

    // Fix inline onClicks
    content = content.replace(/onClick=\{\(\)\s*=>\s*\{\s*if\s*\(\s*window\.confirm/g, 'onClick={async () => { if(await customConfirm');

    // Replace all remaining window.confirm
    content = content.replace(/window\.confirm/g, 'await customConfirm');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
});
