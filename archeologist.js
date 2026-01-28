const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BENCHMARK_FILE = path.join(__dirname, 'performanceTestResult.json');

async function main() {
  console.log('Running Planet Archeologist...');
  
  // 1. Run Benchmark
  execSync('node benchmark.js', { cwd: __dirname, stdio: 'inherit' });

  // 2. Analyze
  const history = JSON.parse(fs.readFileSync(BENCHMARK_FILE, 'utf8'));
  if (history.length < 2) {
    console.log('Not enough history to detect regressions.');
    return;
  }

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];

  console.log('\n--- Performance Analysis ---');
  let regressionDetected = false;

  for (const queryName of Object.keys(latest.metrics)) {
    const curr = latest.metrics[queryName].avg;
    const prev = previous.metrics[queryName].avg;
    
    // Avoid division by zero
    if (prev === 0) continue;

    const diff = (curr - prev) / prev;
    const diffPercent = (diff * 100).toFixed(2);
    
    console.log(`${queryName}: ${prev.toFixed(2)}ms -> ${curr.toFixed(2)}ms (${diffPercent}%)`);

    if (diff > 0.20) { // 20% Threshold
      console.log(`\x1b[31m[ALERT] Regression detected in ${queryName}!\x1b[0m`);
      regressionDetected = true;
    }
  }

  if (regressionDetected) {
     console.log('\nArcheologist: "I have detected a disturbance in the force (performance)."');
     // In a real scenario, we would now git blame/diff
  } else {
     console.log('\nArcheologist: "The systems are operating within normal parameters."');
  }
}

main().catch(console.error);
