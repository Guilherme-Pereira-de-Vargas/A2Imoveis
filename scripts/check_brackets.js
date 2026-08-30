const fs = require('fs');
const path = process.argv[2];
if (!path) {
  console.error('Usage: node check_brackets.js <file>');
  process.exit(2);
}
const text = fs.readFileSync(path, 'utf8');
const counts = { '(':0, ')':0, '{':0, '}':0, '[':0, ']':0, '<':0, '>':0 };
for (let i=0;i<text.length;i++){
  const ch = text[i];
  if (counts.hasOwnProperty(ch)) counts[ch]++;
}
console.log('Counts for', path);
console.log(counts);

// find first position where cumulative counts go negative for any bracket
const stack = [];
for (let i=0;i<text.length;i++){
  const ch = text[i];
  if (ch==='('||ch==='{'||ch==='[') stack.push({ch,i});
  else if (ch===')'||ch==='}'||ch===']'){
    if (stack.length===0){ console.log('Unmatched closing', ch, 'at', i); break; }
    const top = stack.pop();
    const open = top.ch;
    if ((open==='('&&ch!==')')||(open==='{'&&ch!=='}')||(open==='['&&ch!==']')){
      console.log('Mismatched', open, 'at', top.i, 'with', ch, 'at', i);
      break;
    }
  }
}
if (stack.length>0) console.log('Unclosed openings:', stack.map(s=>s.ch+'@'+s.i));
else console.log('No bracket imbalance for (), {}, []');

// simple JSX tag balance: count occurrences of '<' that look like start tag vs '</'
let openTags = 0;
for (let i=0;i<text.length;i++){
  if (text.slice(i,i+2)==='</') openTags--;
  else if (text[i]==='<' && /<[A-Za-z]/.test(text.slice(i,i+2))) openTags++;
}
console.log('Approx JSX tag balance (starts - closes):', openTags);
