const fs = require('fs');
const { execSync } = require('child_process');

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="#10332C"/>
  <g fill="#C99E69">
    <!-- Top-Left Corner Bracket -->
    <path d="M 265 240 L 265 390 L 305 390 L 305 280 L 450 280 L 450 240 Z" />
    
    <!-- Overlapping Rounded D shape -->
    <path fill-rule="evenodd" d="M 320 285 L 435 285 C 495 285 535 325 535 385 C 535 445 495 485 435 485 L 320 485 Z M 360 325 L 360 445 L 430 445 C 468 445 495 420 495 385 C 495 350 468 325 430 325 Z" />
  </g>
  <!-- FRIDAY Wordmark -->
  <text x="400" y="590" fill="#C99E69" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="95" font-weight="900" letter-spacing="14" text-anchor="middle">FRIDAY</text>
</svg>`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="#10332C"/>
  <g fill="#C99E69" transform="translate(0, 50)">
    <!-- Top-Left Corner Bracket -->
    <path d="M 265 240 L 265 390 L 305 390 L 305 280 L 450 280 L 450 240 Z" />
    
    <!-- Overlapping Rounded D shape -->
    <path fill-rule="evenodd" d="M 320 285 L 435 285 C 495 285 535 325 535 385 C 535 445 495 485 435 485 L 320 485 Z M 360 325 L 360 445 L 430 445 C 468 445 495 420 495 385 C 495 350 468 325 430 325 Z" />
  </g>
</svg>`;

fs.writeFileSync('public/assets/aistudio/logo_friday.svg', logoSvg);
fs.writeFileSync('public/assets/aistudio/icone_friday.svg', iconSvg);

// Convert SVG to high quality JPEG matching user paths
execSync('convert -density 150 public/assets/aistudio/logo_friday.svg -quality 95 public/assets/aistudio/logo_friday_de00ddef.jpg');
execSync('convert -density 150 public/assets/aistudio/icone_friday.svg -quality 95 public/assets/aistudio/icone_friday_13e5679f.jpg');

console.log('Generated Friday assets successfully!');
