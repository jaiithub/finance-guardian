// Modified version of createLogos.js using ES modules
// This script creates placeholder logo files for PWA

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public/splash directory if it doesn't exist
const splashDir = path.join(__dirname, 'public', 'splash');
if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

// Create a simple SVG logo
const createSvgLogo = (size, filename) => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#3B82F6"/>
    <text x="${size/2}" y="${size/2}" font-family="Arial" font-size="${size/4}" fill="white" text-anchor="middle" dominant-baseline="middle">FG</text>
  </svg>`;
  
  fs.writeFileSync(path.join(__dirname, 'public', filename), svg);
};

// Create splash screen images
const createSplashImage = (width, height, filename) => {
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#3B82F6"/>
    <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="${Math.min(width, height)/8}" fill="white" text-anchor="middle" dominant-baseline="middle">FinanceGuardian</text>
  </svg>`;
  
  fs.writeFileSync(path.join(splashDir, filename), svg);
};

// Create logos
createSvgLogo(192, 'logo192.png');
createSvgLogo(512, 'logo512.png');
createSvgLogo(64, 'favicon.ico');

// Create splash screens
createSplashImage(2048, 2732, 'apple-splash-2048-2732.jpg');
createSplashImage(1668, 2388, 'apple-splash-1668-2388.jpg');
createSplashImage(1536, 2048, 'apple-splash-1536-2048.jpg');
createSplashImage(1125, 2436, 'apple-splash-1125-2436.jpg');
createSplashImage(1242, 2688, 'apple-splash-1242-2688.jpg');
createSplashImage(750, 1334, 'apple-splash-750-1334.jpg');
createSplashImage(640, 1136, 'apple-splash-640-1136.jpg');

console.log('Created placeholder logo and splash screen files');
