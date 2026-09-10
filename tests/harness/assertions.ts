/**
 * Custom Opaque-Box Assertions
 * Verifies observable domain outputs against strict format and integrity rules.
 */

import assert from 'node:assert';

export function assertValidPhoneMask(formattedPhone: string) {
  // Brazilian formatted phone pattern: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  const phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  assert(
    phonePattern.test(formattedPhone),
    `Expected valid Brazilian phone mask format '(XX) XXXXX-XXXX' or '(XX) XXXX-XXXX', got '${formattedPhone}'`
  );
}

export function assertValidHexColor(hex: string) {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/;
  assert(
    hexPattern.test(hex),
    `Expected valid hex color token (e.g. #060709 or #C5A059), got '${hex}'`
  );
}

export function assertCohortStatus(statusText: string) {
  assert(
    statusText.includes('COHORT') || statusText.includes('ADMISSIONS') || statusText.includes('SELEÇÃO'),
    `Expected cohort status indicator to contain 'COHORT' or 'ADMISSIONS' or 'SELEÇÃO', got '${statusText}'`
  );
}

export function assertZodValidationError(
  schema: { parse: (data: any) => any; safeParse?: (data: any) => any },
  invalidData: any,
  expectedField: string
) {
  if (typeof schema.safeParse === 'function') {
    const res = schema.safeParse(invalidData);
    assert.strictEqual(res.success, false, `Expected validation to fail for field '${expectedField}', but it passed.`);
    const errorPaths = res.error.issues.map((i: any) => i.path.join('.'));
    assert(
      errorPaths.includes(expectedField),
      `Expected error for path '${expectedField}', but found errors for: ${errorPaths.join(', ')}`
    );
    return res.error;
  } else {
    try {
      schema.parse(invalidData);
      assert.fail(`Expected validation to throw for field '${expectedField}', but passed`);
    } catch (err: any) {
      assert(err.errors || err.issues, `Expected ZodError structure, got: ${err.message}`);
      const issues = err.errors || err.issues;
      const paths = issues.map((i: any) => i.path.join('.'));
      assert(
        paths.includes(expectedField),
        `Expected error for field '${expectedField}', got: ${paths.join(', ')}`
      );
      return err;
    }
  }
}

export function assertValidZodLead(
  schema: { parse: (data: any) => any; safeParse?: (data: any) => any },
  validData: any
) {
  if (typeof schema.safeParse === 'function') {
    const res = schema.safeParse(validData);
    assert.strictEqual(res.success, true, `Expected data to be valid, but got errors: ${JSON.stringify(res.error?.issues)}`);
    return res.data;
  } else {
    return schema.parse(validData);
  }
}
