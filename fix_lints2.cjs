const fs = require('fs');

function replace(file, search, replaceStr) {
  let content = fs.readFileSync(file, 'utf8');
  if (typeof search === 'string') {
      content = content.replace(search, replaceStr);
  } else {
      content = content.replace(search, replaceStr);
  }
  fs.writeFileSync(file, content);
}

replace('src/context/CurrencyContext.jsx', '} catch (_e) {', '} catch {');

replace('src/pages/BusinessRewards.jsx', "import { useCurrency } from '../context';", "");
replace('src/pages/BusinessRewards.jsx', "const [rewardPoints] = useState(45000);", "// eslint-disable-next-line no-unused-vars\n    const [rewardPoints] = useState(45000);");

replace('src/pages/BusinessSplitCollect.jsx', '} catch (_e) {', '} catch {');

console.log("Done");
