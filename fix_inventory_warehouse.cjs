const fs = require('fs');
const path = '/Users/hi/Desktop/Cliks/CLIKS-BUS-FE/src/pages/BusinessInventory.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    // Live catalog items database from productsService
    const { data: items = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });`;

const replace = `    // Live catalog items database from productsService
    const { data: rawItems = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });
    
    const items = React.useMemo(() => {
        return rawItems.map(item => {
            const wId = item.warehouse_id || item.warehouse;
            const wMatch = dbWarehouses.find(w => String(w.id) === String(wId) || String(w.warehouse_id) === String(wId) || String(w.name).toLowerCase() === String(wId || '').toLowerCase());
            return {
                ...item,
                warehouse: wMatch ? (wMatch.name || wMatch.warehouse_name || wId) : (wId || 'Main Godown')
            };
        });
    }, [rawItems, dbWarehouses]);`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync(path, content);
    console.log('Successfully updated BusinessInventory.jsx warehouse name resolution');
} else {
    console.log('Could not find target strings in BusinessInventory.jsx');
}
