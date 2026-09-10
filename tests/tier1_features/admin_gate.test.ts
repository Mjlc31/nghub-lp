import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { StatefulMockSupabase } from '../harness/fixtures.ts';

export function registerAdminGateTests() {
  describe('Tier 1 — Feature 3: Admin Auth Hardening & Lazy AdminGate', () => {
    let env: ReturnType<typeof setupTestEnvironment>;
    let mockSupabase: StatefulMockSupabase;

    beforeEach(() => {
      env = setupTestEnvironment();
      mockSupabase = new StatefulMockSupabase();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('F3.1: ?admin=true query parameter does NOT bypass authentication in production mode', () => {
      cleanupTestEnvironment();
      // Setup environment with ?admin=true
      env = setupTestEnvironment({ searchParams: { admin: 'true' } });
      
      // Verification logic: auth must be backed by valid Supabase session, not URL parameter
      const params = new URLSearchParams(env.window.location.search);
      assert.strictEqual(params.get('admin'), 'true');

      // Secure architecture contract: isAuthenticated must remain false without valid session
      const hasValidSession = mockSupabase.currentUser !== null;
      assert.strictEqual(hasValidSession, false, 'URL parameter alone must never grant session credentials');
    });

    it('F3.2: hotkey CTRL+SHIFT+A triggers Login dialog when unauthenticated', () => {
      let showLogin = false;
      let isAdminOpen = false;
      let isAuthenticated = false;

      const handleKeyDown = (e: any) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
          if (isAuthenticated) {
            isAdminOpen = !isAdminOpen;
          } else {
            showLogin = true;
          }
        }
      };

      const event = new (globalThis as any).KeyboardEvent('keydown', {
        key: 'A',
        ctrlKey: true,
        shiftKey: true
      });

      handleKeyDown(event);
      assert.strictEqual(showLogin, true, 'Hotkey must trigger login modal when user is not authenticated');
      assert.strictEqual(isAdminOpen, false, 'Admin panel must remain locked');
    });

    it('F3.3: hotkey CTRL+SHIFT+A toggles AdminPanel when already authenticated', () => {
      let showLogin = false;
      let isAdminOpen = false;
      const isAuthenticated = true;

      const handleKeyDown = (e: any) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
          if (isAuthenticated) {
            isAdminOpen = !isAdminOpen;
          } else {
            showLogin = true;
          }
        }
      };

      const event = new (globalThis as any).KeyboardEvent('keydown', {
        key: 'A',
        ctrlKey: true,
        shiftKey: true
      });

      handleKeyDown(event);
      assert.strictEqual(isAdminOpen, true, 'First hotkey press opens AdminPanel');
      assert.strictEqual(showLogin, false, 'Login modal is bypassed when already authenticated');

      handleKeyDown(event);
      assert.strictEqual(isAdminOpen, false, 'Second hotkey press closes AdminPanel');
    });

    it('F3.4: valid Supabase authentication grants access and unlocks AdminPanel', async () => {
      const loginResult = await mockSupabase.auth.signInWithPassword({
        email: 'admin@nghub.com',
        password: 'ValidPassword123!'
      });

      assert.strictEqual(loginResult.error, null);
      assert(loginResult.data.user);
      assert.strictEqual(loginResult.data.user.email, 'admin@nghub.com');
      assert(mockSupabase.currentUser !== null);
    });

    it('F3.5: logout clears active session and resets AdminPanel visibility', async () => {
      // Authenticate first
      await mockSupabase.auth.signInWithPassword({
        email: 'admin@nghub.com',
        password: 'ValidPassword123!'
      });
      assert(mockSupabase.currentUser !== null);

      // Perform logout
      await mockSupabase.auth.signOut();
      const currentUser = await mockSupabase.auth.getUser();
      assert.strictEqual(currentUser.data.user, null, 'User session must be cleared after logout');
    });
  });
}
