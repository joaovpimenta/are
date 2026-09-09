import { readFile, writeFile } from 'node:fs/promises';

const [input = 'playwright-report/results.json', output = 'flaky-tests.txt'] = process.argv.slice(2);
let report;
try {
  report = JSON.parse(await readFile(input, 'utf8'));
} catch {
  await writeFile(output, 'No Playwright JSON report was available.\n');
  process.exit(0);
}

const flaky = [];
function visitSuite(suite, parents = []) {
  const prefix = [...parents, suite.title].filter(Boolean);
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const results = test.results ?? [];
      if (results.length > 1 && results.at(-1)?.status === 'passed' && results.some((result) => result.status !== 'passed')) {
        flaky.push([...prefix, spec.title].filter(Boolean).join(' › '));
      }
    }
  }
  for (const child of suite.suites ?? []) visitSuite(child, prefix);
}
for (const suite of report.suites ?? []) visitSuite(suite);
await writeFile(output, flaky.length ? `${flaky.join('\n')}\n` : 'No flaky tests detected.\n');
if (flaky.length) console.warn(`::warning title=Flaky Playwright tests::${flaky.length} test(s) passed only after retry; see flaky-tests.txt`);
