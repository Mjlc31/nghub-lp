import assert from 'node:assert';
import { z } from 'zod';
import { describe, it } from '../harness/runner.ts';
import { VALID_FOUNDER_APPLICATION } from '../harness/fixtures.ts';
import { assertValidZodLead } from '../harness/assertions.ts';

const leadSchema = z.object({
  full_name: z.string().min(3),
  whatsapp: z.string().min(14),
  instagram: z.string().min(2),
  niche: z.string().min(2),
  revenue_range: z.string().min(2),
  biggest_challenge: z.string().min(5)
});

export function registerPayloadBoundariesTests() {
  describe('Tier 2 — Boundary Cases: Payloads, Unicode & Security Strings', () => {
    it('B.PAYLOAD.1: processes 10,000-character text in challenge field without crashing', () => {
      const longChallenge = 'Escalando operações globais '.repeat(350); // ~9800 chars
      assert(longChallenge.length > 9000);

      const payload = {
        ...VALID_FOUNDER_APPLICATION,
        biggest_challenge: longChallenge
      };

      const result = assertValidZodLead(leadSchema, payload);
      assert.strictEqual(result.biggest_challenge.length, longChallenge.length);
    });

    it('B.PAYLOAD.2: handles SQL injection payload strings safely as literal data', () => {
      const sqliPayload = {
        ...VALID_FOUNDER_APPLICATION,
        full_name: "Robert'); DROP TABLE leads; --",
        biggest_challenge: "1' OR '1'='1"
      };

      const result = assertValidZodLead(leadSchema, sqliPayload);
      assert.strictEqual(result.full_name, "Robert'); DROP TABLE leads; --");
      assert.strictEqual(result.biggest_challenge, "1' OR '1'='1");
    });

    it('B.PAYLOAD.3: preserves XSS strings as harmless text literals', () => {
      const xssPayload = {
        ...VALID_FOUNDER_APPLICATION,
        niche: "<script>alert('pwned')</script>",
        instagram: "@<img src=x onerror=alert(1)>"
      };

      const result = assertValidZodLead(leadSchema, xssPayload);
      assert.strictEqual(result.niche, "<script>alert('pwned')</script>");
      assert.strictEqual(result.instagram, "@<img src=x onerror=alert(1)>");
    });

    it('B.PAYLOAD.4: supports multi-byte Unicode characters, emojis, and math symbols', () => {
      const unicodePayload = {
        ...VALID_FOUNDER_APPLICATION,
        full_name: "佐藤 健 🚀 // NG Hub ⚡️",
        niche: "AI & Quantum ⚛️ ∑(x_i)",
        biggest_challenge: "Expandir para APAC 🇯🇵 & EMEA 🇬🇧 com faturamento de €10M+."
      };

      const result = assertValidZodLead(leadSchema, unicodePayload);
      assert.strictEqual(result.full_name, "佐藤 健 🚀 // NG Hub ⚡️");
      assert(result.biggest_challenge.includes('🇯🇵'));
    });

    it('B.PAYLOAD.5: tolerates multiline strings with various newline conventions (\\n, \\r\\n)', () => {
      const multilineChallenge = "Linha 1: Diagnóstico\r\nLinha 2: Estratégia\nLinha 3: Execução";
      const payload = {
        ...VALID_FOUNDER_APPLICATION,
        biggest_challenge: multilineChallenge
      };

      const result = assertValidZodLead(leadSchema, payload);
      assert.strictEqual(result.biggest_challenge, multilineChallenge);
    });
  });
}
