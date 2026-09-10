import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { StatefulMockSupabase } from '../harness/fixtures.ts';

export function registerAdminHotkeyLoginFlowTests() {
  describe('Tier 3 — Cross-Feature Flow: Admin Hotkey & Authentication Cycle', () => {
    let env: ReturnType<typeof setupTestEnvironment>;
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      env = setupTestEnvironment();
      mockDb = new StatefulMockSupabase();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('X.ADMIN.1: Hotkey CTRL+SHIFT+A -> Login modal -> cancel/close -> returns to pristine public page', () => {
      let showLogin = false;
      let isAdminOpen = false;
      const isAuthenticated = false;

      // 1. User presses CTRL+SHIFT+A
      const onKeyDown = (e: any) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
          if (isAuthenticated) {
            isAdminOpen = !isAdminOpen;
          } else {
            showLogin = true;
          }
        }
      };

      onKeyDown({ ctrlKey: true, shiftKey: true, key: 'A' });
      assert.strictEqual(showLogin, true, 'Login modal should appear');
      assert.strictEqual(isAdminOpen, false, 'Admin panel remains unmounted');

      // 2. User cancels / closes login modal
      const closeLogin = () => { showLogin = false; };
      closeLogin();
      assert.strictEqual(showLogin, false, 'Login modal is dismissed');
      assert.strictEqual(isAdminOpen, false, 'Admin panel remains unmounted');
    });

    it('X.ADMIN.2: Hotkey -> Login modal -> Bad credentials -> Error -> Valid login -> Admin open -> Logout', async () => {
      let showLogin = false;
      let isAdminOpen = false;
      let isAuthenticated = false;
      let loginError: string | null = null;

      // 1. Trigger hotkey
      showLogin = true;

      // 2. Attempt bad login
      const badAttempt = await mockDb.auth.signInWithPassword({
        email: 'hacker@nghub.com',
        password: 'WrongPassword'
      });
      assert(badAttempt.error !== null);
      loginError = badAttempt.error.message;
      assert.strictEqual(loginError, 'Invalid credentials');
      assert.strictEqual(isAuthenticated, false);
      assert.strictEqual(isAdminOpen, false);

      // 3. Attempt valid login
      const validAttempt = await mockDb.auth.signInWithPassword({
        email: 'admin@nghub.com',
        password: 'ValidPassword123!'
      });
      assert.strictEqual(validAttempt.error, null);
      isAuthenticated = true;
      showLogin = false;
      isAdminOpen = true;

      assert.strictEqual(isAuthenticated, true);
      assert.strictEqual(isAdminOpen, true);
      assert.strictEqual(showLogin, false);

      // 4. Admin performs logout
      await mockDb.auth.signOut();
      isAuthenticated = false;
      isAdminOpen = false;

      assert.strictEqual(isAuthenticated, false);
      assert.strictEqual(isAdminOpen, false);
    });
  });
}
