/**
 * Build script for dashboard
 * Copies necessary files to dist directory for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, '..', 'collector', 'data');

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy HTML, CSS, and JS files
const filesToCopy = ['index.html', 'styles.css', 'dashboard.js'];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${file} to dist/`);
}

// Copy data directory if it exists
if (fs.existsSync(dataDir)) {
  const distDataDir = path.join(distDir, 'data');
  
  if (!fs.existsSync(distDataDir)) {
    fs.mkdirSync(distDataDir, { recursive: true });
  }

  // Copy all JSON files from data directory
  const files = fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.json'));

  for (const file of files) {
    const src = path.join(dataDir, file);
    const dest = path.join(distDataDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copied data/${file} to dist/data/`);
  }
} else {
  console.warn('Warning: Data directory not found. Dashboard will show error message.');
}

console.log('\nBuild completed successfully!');
console.log(`Output directory: ${distDir}`);
