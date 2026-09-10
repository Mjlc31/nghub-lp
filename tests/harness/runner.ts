/**
 * Test Runner Framework & CLI Reporter
 * Provides modular test suite registration, execution, metrics, and ANSI reporting.
 */

export interface TestCase {
  title: string;
  fn: () => Promise<void> | void;
  status?: 'passed' | 'failed' | 'skipped';
  durationMs?: number;
  error?: Error;
}

export interface TestSuite {
  name: string;
  cases: TestCase[];
  beforeEachHooks: Array<() => Promise<void> | void>;
  afterEachHooks: Array<() => Promise<void> | void>;
}

export interface RunResults {
  totalSuites: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  suites: Array<{
    name: string;
    cases: Array<{
      title: string;
      status: string;
      durationMs: number;
      error?: string;
    }>;
  }>;
}

class TestRegistry {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;

  describe(name: string, fn: () => void) {
    const suite: TestSuite = {
      name,
      cases: [],
      beforeEachHooks: [],
      afterEachHooks: []
    };
    this.suites.push(suite);
    const prev = this.currentSuite;
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = prev;
    }
  }

  it(title: string, fn: () => Promise<void> | void) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {
        this.it(title, fn);
      });
      return;
    }
    this.currentSuite.cases.push({ title, fn });
  }

  beforeEach(fn: () => Promise<void> | void) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachHooks.push(fn);
    }
  }

  afterEach(fn: () => Promise<void> | void) {
    if (this.currentSuite) {
      this.currentSuite.afterEachHooks.push(fn);
    }
  }

  async runAll(options: { silent?: boolean } = {}): Promise<RunResults> {
    const startTime = performance.now();
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const suiteSummaries = [];

    if (!options.silent) {
      console.log('\n\x1b[1m\x1b[36m========================================================\x1b[0m');
      console.log('\x1b[1m\x1b[36m  NG HUB LANDING PAGE — 4-TIER E2E TEST SUITE RUNNER   \x1b[0m');
      console.log('\x1b[1m\x1b[36m========================================================\x1b[0m\n');
    }

    for (const suite of this.suites) {
      if (!options.silent) {
        console.log(`\x1b[1m\x1b[35m▶ Suite: ${suite.name}\x1b[0m`);
      }

      const caseSummaries = [];

      for (const testCase of suite.cases) {
        const caseStart = performance.now();
        try {
          for (const hook of suite.beforeEachHooks) {
            await hook();
          }

          await testCase.fn();

          for (const hook of suite.afterEachHooks) {
            await hook();
          }

          const caseDuration = performance.now() - caseStart;
          testCase.status = 'passed';
          testCase.durationMs = caseDuration;
          passed++;

          if (!options.silent) {
            console.log(`  \x1b[32m✔\x1b[0m \x1b[90m[${caseDuration.toFixed(1)}ms]\x1b[0m ${testCase.title}`);
          }
          caseSummaries.push({
            title: testCase.title,
            status: 'passed',
            durationMs: caseDuration
          });
        } catch (err: any) {
          const caseDuration = performance.now() - caseStart;
          testCase.status = 'failed';
          testCase.durationMs = caseDuration;
          testCase.error = err;
          failed++;

          if (!options.silent) {
            console.log(`  \x1b[31m✖\x1b[0m \x1b[90m[${caseDuration.toFixed(1)}ms]\x1b[0m ${testCase.title}`);
            console.log(`    \x1b[31mError: ${err?.message || err}\x1b[0m`);
            if (err?.stack) {
              const stackLines = err.stack.split('\n').slice(1, 4).join('\n');
              console.log(`    \x1b[90m${stackLines}\x1b[0m`);
            }
          }
          caseSummaries.push({
            title: testCase.title,
            status: 'failed',
            durationMs: caseDuration,
            error: err?.message || String(err)
          });
        }
      }

      suiteSummaries.push({
        name: suite.name,
        cases: caseSummaries
      });
      if (!options.silent) console.log();
    }

    const totalDuration = performance.now() - startTime;
    const totalTests = passed + failed + skipped;

    if (!options.silent) {
      console.log('\x1b[1m--------------------------------------------------------\x1b[0m');
      console.log(`\x1b[1mSuites:\x1b[0m  ${this.suites.length} total`);
      console.log(`\x1b[1mTests:\x1b[0m   \x1b[32m${passed} passed\x1b[0m, ${failed > 0 ? `\x1b[31m${failed} failed\x1b[0m` : '0 failed'}, ${totalTests} total`);
      console.log(`\x1b[1mTime:\x1b[0m    ${(totalDuration / 1000).toFixed(2)}s`);
      console.log('\x1b[1m--------------------------------------------------------\x1b[0m\n');
    }

    return {
      totalSuites: this.suites.length,
      totalTests,
      passed,
      failed,
      skipped,
      durationMs: totalDuration,
      suites: suiteSummaries
    };
  }

  clear() {
    this.suites = [];
    this.currentSuite = null;
  }
}

export const registry = new TestRegistry();
export const describe = registry.describe.bind(registry);
export const it = registry.it.bind(registry);
export const beforeEach = registry.beforeEach.bind(registry);
export const afterEach = registry.afterEach.bind(registry);
