import fs from 'fs';
import path from 'path';

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

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('window.confirm')) return;

    // Determine import path
    let importPath = '';
    const depth = file.split('/').length - 2; // src/pages/file.jsx -> 1 -> '../utils/customConfirm'
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

    // Pattern 1: onClick={() => { if(window.confirm...
    content = content.replace(/onClick=\{\s*\(\)\s*=>\s*\{\s*if\s*\(\s*window\.confirm\((.*?)\)\s*\)/g, 'onClick={async () => { if(await customConfirm($1))');
    
    // Pattern 2: onClick={(e) => { if(window.confirm...
    content = content.replace(/onClick=\{\s*\((\w+)\)\s*=>\s*\{\s*if\s*\(\s*window\.confirm\((.*?)\)\s*\)/g, 'onClick={async ($1) => { if(await customConfirm($2))');

    // Pattern 3: const handleDelete = (id) => { if (window.confirm...
    content = content.replace(/(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?)if\s*\(\s*window\.confirm\((.*?)\)\s*\)/g, (match, p1, p2) => {
        // We need to add async to the function definition if it's not there
        if (!p1.includes('async ')) {
            p1 = p1.replace(/=\s*\(/, '= async (');
            p1 = p1.replace(/=\s*(\w+)\s*=>/, '= async ($1) =>'); // if no parens
        }
        return p1 + `if (await customConfirm(${p2}))`;
    });

    // Pattern 4: const shouldSimulate = window.confirm...
    content = content.replace(/(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?)const\s+(\w+)\s*=\s*window\.confirm\((.*?)\)/g, (match, p1, p2, p3) => {
        if (!p1.includes('async ')) {
            p1 = p1.replace(/=\s*\(/, '= async (');
            p1 = p1.replace(/=\s*(\w+)\s*=>/, '= async ($1) =>'); // if no parens
        }
        return p1 + `const ${p2} = await customConfirm(${p3})`;
    });

    // Replace any remaining ones with await customConfirm, and we'll fix the async part manually via linting errors if any
    content = content.replace(/window\.confirm/g, 'await customConfirm');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
});
