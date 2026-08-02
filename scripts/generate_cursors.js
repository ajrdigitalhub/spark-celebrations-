const fs = require('fs');
const path = require('path');

const arrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffdf00"/>
      <stop offset="100%" stop-color="#d4af37"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#ffffff" flood-opacity="0.9"/>
    </filter>
  </defs>
  <path d="M6 6 L16 28 L19 19 L28 16 Z" fill="url(#gold)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" filter="url(#glow)"/>
</svg>`;

const handSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffdf00"/>
      <stop offset="100%" stop-color="#d4af37"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#ffffff" flood-opacity="0.9"/>
    </filter>
  </defs>
  <path d="M 15 16 
           V 6 a 1.5 1.5 0 0 1 3 0 
           V 12 
           V 7 a 1.5 1.5 0 0 1 3 0 
           V 13 
           V 9 a 1.5 1.5 0 0 1 3 0 
           V 14 
           V 11 a 1.5 1.5 0 0 1 3 0 
           V 18 
           c 0 4 -3 7 -6 7 h -3 
           c -3 0 -5 -2 -7 -5 
           l -3 -4 
           a 1.5 1.5 0 0 1 2 -2 
           l 5 5 
           V 16 Z" 
        fill="url(#gold)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" filter="url(#glow)"/>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'cursor.svg'), arrowSvg);
fs.writeFileSync(path.join(publicDir, 'pointer.svg'), handSvg);
console.log('Cursors successfully generated in public/images');
