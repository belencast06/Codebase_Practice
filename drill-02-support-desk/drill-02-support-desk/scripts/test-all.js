// Runs the server and client test suites one after the other and prints a summary.
// Usage:
//   node scripts/test-all.js            -> bug-fix tests (Part 1)
//   node scripts/test-all.js --feature  -> feature tests (Part 2)
const { spawnSync } = require('child_process');

const feature = process.argv.includes('--feature');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const script = feature ? 'test:feature' : 'test';

const results = [];
for (const ws of ['server', 'client']) {
  console.log(`\n========== ${ws.toUpperCase()} (${feature ? 'feature' : 'bugs'}) ==========\n`);
  const r = spawnSync(npm, ['run', script, '--workspace', ws], { stdio: 'inherit', shell: process.platform === 'win32' });
  results.push({ ws, ok: r.status === 0 });
}

console.log('\n========== SUMMARY ==========');
for (const { ws, ok } of results) console.log(`${ok ? 'PASS' : 'FAIL'}  ${ws}`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
