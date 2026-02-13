import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('/Users/vib/claude/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp');
import { readFileSync } from 'fs';

const WIDTH = 1200;
const HEIGHT = 630;
const BG = '#07080c';
const TEAL = '#00e5c8';
const TEAL_DIM = '#00b4d8';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${TEAL}" stop-opacity="0"/>
      <stop offset="20%" stop-color="${TEAL}" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="${TEAL}" stop-opacity="1"/>
      <stop offset="80%" stop-color="${TEAL_DIM}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${TEAL_DIM}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="30%">
      <stop offset="0%" stop-color="${TEAL}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${TEAL}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="topBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${TEAL}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${TEAL}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${TEAL}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ffffff" stroke-width="0.3" stroke-opacity="0.04"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>

  <!-- Subtle grid overlay for terminal feel -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>

  <!-- Radial glow -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="${WIDTH}" height="2" fill="url(#topBar)"/>

  <!-- Logo mark, centered and scaled to ~80px -->
  <g transform="translate(${WIDTH / 2 - 40}, 165) scale(1.667)">
    <path d="M14 8 L34 8 L34 14 L20 14 L20 20 L32 20 L32 26 L20 26 L20 40 L14 40 Z" fill="${TEAL}" opacity="0.9"/>
    <path d="M24 12 L38 24 L24 36 L24 28 L16 28 L16 20 L24 20 Z" fill="${TEAL_DIM}" opacity="0.5"/>
    <circle cx="38" cy="8" r="2.5" fill="${TEAL}"/>
  </g>

  <!-- "Sola" in white, "FX" in teal -->
  <text x="${WIDTH / 2}" y="335" text-anchor="middle" font-family="'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace" font-size="72" font-weight="700" letter-spacing="4">
    <tspan fill="#e8eaed">Sola</tspan><tspan fill="${TEAL}">FX</tspan>
  </text>

  <!-- Gradient accent line -->
  <rect x="350" y="365" width="500" height="2" rx="1" fill="url(#lineGrad)"/>

  <!-- Tagline -->
  <text x="${WIDTH / 2}" y="410" text-anchor="middle" font-family="'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace" font-size="24" font-weight="400" fill="#8b929f" letter-spacing="6">
    Global FX on Solana
  </text>

  <!-- Bottom decorative dots (terminal-style) -->
  <g transform="translate(${WIDTH / 2 - 30}, 480)" opacity="0.3">
    <circle cx="0"  cy="0" r="3" fill="${TEAL}"/>
    <circle cx="20" cy="0" r="3" fill="${TEAL}" opacity="0.6"/>
    <circle cx="40" cy="0" r="3" fill="${TEAL}" opacity="0.3"/>
    <circle cx="60" cy="0" r="3" fill="#8b929f" opacity="0.2"/>
  </g>

  <!-- Corner bracket decorations (terminal aesthetic) -->
  <g stroke="${TEAL}" stroke-width="1.5" fill="none" opacity="0.15">
    <path d="M 30 30 L 30 15 L 45 15"/>
    <path d="M ${WIDTH - 30} 30 L ${WIDTH - 30} 15 L ${WIDTH - 45} 15"/>
    <path d="M 30 ${HEIGHT - 30} L 30 ${HEIGHT - 15} L 45 ${HEIGHT - 15}"/>
    <path d="M ${WIDTH - 30} ${HEIGHT - 30} L ${WIDTH - 30} ${HEIGHT - 15} L ${WIDTH - 45} ${HEIGHT - 15}"/>
  </g>
</svg>`;

const outputPath = '/Users/vib/claude/apps/web/public/og-image.png';

sharp(Buffer.from(svg))
  .resize(WIDTH, HEIGHT)
  .png({ compressionLevel: 9 })
  .toFile(outputPath)
  .then(info => {
    console.log('OG image generated successfully');
    console.log('  Path:', outputPath);
    console.log('  Dimensions:', info.width + 'x' + info.height);
    console.log('  Format:', info.format);
    console.log('  File size:', (info.size / 1024).toFixed(1), 'KB');
  })
  .catch(err => {
    console.error('Failed to generate OG image:', err);
    process.exit(1);
  });
