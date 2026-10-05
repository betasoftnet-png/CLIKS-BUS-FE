const fs = require('fs');
const filePath = '/Users/hi/Desktop/Cliks/CLIKS-BUS-FE/src/pages/BusinessAccounting.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<script>\s*window\.onload\s*=\s*function\(\)\s*\{\s*window\.print\(\);\s*setTimeout\(function\(\)\s*\{\s*window\.close\(\);\s*\}, 500\);\s*\}\s*<\/script>/g;

const replacement = `<script>
    setTimeout(function() {
        window.print();
        window.close();
    }, 250);
</script>`;

content = content.replace(regex, replacement);
fs.writeFileSync(filePath, content);
console.log('Replaced all occurrences');
