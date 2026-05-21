/*
  Usage:
    node scripts/clean_dump.js ../dump_termin.sql dump_termin_clean.sql

  The script removes data INSERTs and LOCK/UNLOCK/ALTER KEYS blocks,
  producing a schema-only SQL dump suitable as a "clean" baseline.
*/
const fs = require('fs');
const path = require('path');

const input = process.argv[2] || path.join(__dirname, '..', 'dump_termin.sql');
const output = process.argv[3] || path.join(__dirname, '..', 'dump_termin_clean.sql');

if (!fs.existsSync(input)) {
  console.error('Input file not found:', input);
  process.exit(2);
}

const content = fs.readFileSync(input, 'utf8');
const lines = content.split(/\r?\n/);
let skipLockBlock = false;
let out = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Start/stop skipping LOCK/UNLOCK blocks
  if (/^LOCK TABLES\b/.test(line)) { skipLockBlock = true; continue; }
  if (skipLockBlock) {
    if (/^UNLOCK TABLES\b/.test(line)) { skipLockBlock = false; continue; }
    // skip any lines inside the lock block (including INSERTs, ALTER TABLE ENABLE/DISABLE KEYS)
    continue;
  }

  // Skip explicit INSERTs
  if (/^INSERT INTO\b/i.test(line)) continue;

  // Skip ALTER TABLE ... DISABLE/ENABLE KEYS lines
  if (/ALTER TABLE .*DISABLE KEYS/i.test(line)) continue;
  if (/ALTER TABLE .*ENABLE KEYS/i.test(line)) continue;

  // Skip short "Dumping data" comment lines (we keep table structure comments)
  if (/^--\s*Dumping data for table/i.test(line)) continue;

  out.push(line);
}

// Add a top-of-file note
const header = `-- Cleaned schema-only dump generated from ${path.basename(input)}\n-- Generated: ${new Date().toISOString()}\n\n`;
fs.writeFileSync(output, header + out.join('\n'));
console.log('Clean dump written to', output);
