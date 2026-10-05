const fs = require('fs');
const path = '/Users/hi/Desktop/Cliks/CLIKS-BUS-FE/src/components/inventory/BatchesExpiriesTab.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `        {/* Filter Badges */}
          <button`;

const replaceStr = `        {/* Filter Badges */}
        <div className="flex bg-gray-100/70 p-1 rounded-2xl">
          <button`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(path, content);
    console.log('Successfully fixed BatchesExpiriesTab.jsx');
} else {
    console.log('Target string not found');
}
