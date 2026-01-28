const fs = require('fs');
const path = require('path');
const alasql = require('alasql');
const { parse } = require('csv-parse/sync');
const { execSync } = require('child_process');

const CSV_PATH = path.join(__dirname, 'planetary_systems.csv');
const QUERIES_PATH = path.join(__dirname, 'queries.sql');
const BENCHMARK_FILE = path.join(__dirname, 'performanceTestResult.json');

function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim();
  } catch (e) {
    return 'unknown';
  }
}

async function runBenchmark() {
  console.log('Loading Data for Benchmark...');
  const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    from_line: 97,
    cast: true
  });

  const queries = fs.readFileSync(QUERIES_PATH, 'utf8')
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);

  const iterations = 50;
  const results = {};

  console.log(`Running ${iterations} iterations for each query...`);

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const queryName = `Query ${i + 1}`;
    const timings = [];

    // Warmup & Get Row Count
    const warmupRes = alasql(query, [records]);
    const rowCount = warmupRes.length;

    for (let j = 0; j < iterations; j++) {
      const start = performance.now();
      alasql(query, [records]);
      const end = performance.now();
      timings.push(end - start);
    }

    const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
    const sorted = timings.sort((a, b) => a - b);
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    results[queryName] = { avg, p99, rows: rowCount };
    console.log(`${queryName}: Avg=${avg.toFixed(2)}ms, P99=${p99.toFixed(2)}ms, Rows=${rowCount}`);
  }

  // Save to history
  let history = [];
  if (fs.existsSync(BENCHMARK_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(BENCHMARK_FILE, 'utf8'));
    } catch (e) {}
  }

  const entry = {
    timestamp: new Date().toISOString(),
    commitHash: getGitCommit(),
    metrics: results
  };

  history.push(entry);
  fs.writeFileSync(BENCHMARK_FILE, JSON.stringify(history, null, 2));
  console.log(`Benchmark results saved to ${BENCHMARK_FILE}`);
}

runBenchmark().catch(console.error);
