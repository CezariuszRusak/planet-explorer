const fs = require('fs');
const path = require('path');
const alasql = require('alasql');
const { parse } = require('csv-parse/sync');

const CSV_PATH = path.join(__dirname, 'planetary_systems.csv');
const QUERIES_PATH = path.join(__dirname, 'queries.sql');

async function main() {
  console.log('Loading Planetary Data...');
  const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
  
  // The CSV has 96 lines of comments/headers before the real header.
  // We need to parse correctly.
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    from_line: 97, // Based on our cat/head investigation
    cast: true
  });

  console.log(`Loaded ${records.length} planetary records.`);

  const queries = fs.readFileSync(QUERIES_PATH, 'utf8')
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`
--- Running Query ${i + 1} ---`);
    console.log(query.split('\n').filter(l => l.startsWith('--')).join('\n'));
    
    const start = performance.now();
    const res = alasql(query, [records]);
    const end = performance.now();
    
    console.log(`Result Count: ${res.length}`);
    console.log(`Time: ${(end - start).toFixed(2)}ms`);
    if (res.length > 0) {
      console.log('Top 3 Results:', JSON.stringify(res.slice(0, 3), null, 2));
    }
  }
}

main().catch(console.error);
