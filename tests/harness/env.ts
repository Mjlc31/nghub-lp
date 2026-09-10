/**
 * Test Environment & Browser Emulation Harness
 * Provides isolated DOM, window, storage, and network primitives for opaque-box testing.
 */

export interface TestViewport {
  width: number;
  height: number;
}

export interface MockElement {
  id: string;
  tagName: string;
  className: string;
  textContent: string;
  innerHTML: string;
  value: string;
  attributes: Record<string, string>;
  children: MockElement[];
  listeners: Record<string, Array<(e: any) => void>>;
  style: Record<string, string>;
  
  getAttribute(name: string): string | null;
  setAttribute(name: string, val: string): void;
  removeAttribute(name: string): void;
  addEventListener(event: string, handler: (e: any) => void): void;
  removeEventListener(event: string, handler: (e: any) => void): void;
  dispatchEvent(event: any): boolean;
  scrollIntoView(options?: any): void;
  click(): void;
  focus(): void;
  blur(): void;
  appendChild(child: MockElement): void;
}

export class MockStorage implements Storage {
  private store: Map<string, string> = new Map();
  public quotaErrorTrigger: boolean = false;

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    if (this.quotaErrorTrigger) {
      const err = new Error('QuotaExceededError: DOM Exception 22');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.store.set(key, String(value));
  }

  // Diagnostic helper
  dump(): Record<string, string> {
    return Object.fromEntries(this.store.entries());
  }
}

export function createMockElement(tagName: string = 'div', id: string = ''): MockElement {
  const listeners: Record<string, Array<(e: any) => void>> = {};
  const attributes: Record<string, string> = {};
  const style: Record<string, string> = {};
  const children: MockElement[] = [];

  const element: MockElement = {
    id,
    tagName: tagName.toUpperCase(),
    className: '',
    textContent: '',
    innerHTML: '',
    value: '',
    attributes,
    children,
    listeners,
    style,

    getAttribute(name: string) {
      return attributes[name] !== undefined ? attributes[name] : null;
    },
    setAttribute(name: string, val: string) {
      attributes[name] = val;
      if (name === 'id') element.id = val;
      if (name === 'class') element.className = val;
    },
    removeAttribute(name: string) {
      delete attributes[name];
    },
    addEventListener(event: string, handler: (e: any) => void) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    removeEventListener(event: string, handler: (e: any) => void) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(h => h !== handler);
    },
    dispatchEvent(event: any) {
      event.target = element;
      event.currentTarget = element;
      const handlers = listeners[event.type] || [];
      for (const h of handlers) {
        h(event);
      }
      return !event.defaultPrevented;
    },
    scrollIntoView(_options?: any) {
      (globalThis as any).__lastScrolledToElement = element.id || element.tagName;
    },
    click() {
      const ev = { type: 'click', target: element, preventDefault: () => {} };
      element.dispatchEvent(ev);
    },
    focus() {
      (globalThis as any).__focusedElement = element;
      element.dispatchEvent({ type: 'focus', target: element });
    },
    blur() {
      if ((globalThis as any).__focusedElement === element) {
        (globalThis as any).__focusedElement = null;
      }
      element.dispatchEvent({ type: 'blur', target: element });
    },
    appendChild(child: MockElement) {
      children.push(child);
    }
  };

  return element;
}

export interface SetupOptions {
  viewport?: TestViewport;
  initialStorage?: Record<string, string>;
  searchParams?: Record<string, string>;
}

const originalGlobals: Record<string, any> = {};

export function setupTestEnvironment(options: SetupOptions = {}) {
  const viewport = options.viewport || { width: 1440, height: 900 };
  const storage = new MockStorage();

  if (options.initialStorage) {
    for (const [k, v] of Object.entries(options.initialStorage)) {
      storage.setItem(k, v);
    }
  }

  // Backup original globals
  const keysToMock = ['window', 'document', 'localStorage', 'sessionStorage', 'location', 'KeyboardEvent', 'MouseEvent', 'CustomEvent'];
  for (const k of keysToMock) {
    if ((globalThis as any)[k] !== undefined) {
      originalGlobals[k] = (globalThis as any)[k];
    }
  }

  const elementsById: Map<string, MockElement> = new Map();
  const windowListeners: Record<string, Array<(e: any) => void>> = {};

  const queryParams = new URLSearchParams(options.searchParams || {});
  const locationMock = {
    search: queryParams.toString() ? `?${queryParams.toString()}` : '',
    pathname: '/',
    href: `http://localhost:5173/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    hash: '',
    reload: () => {
      (globalThis as any).__reloaded = true;
    }
  };

  const documentMock = {
    body: createMockElement('body', 'root-body'),
    createElement: (tag: string) => createMockElement(tag),
    getElementById: (id: string) => elementsById.get(id) || null,
    registerElement: (el: MockElement) => {
      if (el.id) elementsById.set(el.id, el);
    },
    querySelector: (selector: string) => {
      if (selector.startsWith('#')) {
        return elementsById.get(selector.slice(1)) || null;
      }
      return null;
    }
  };

  // Pre-seed known anchor elements
  const applySection = createMockElement('section', 'apply');
  elementsById.set('apply', applySection);
  const arsenalSection = createMockElement('section', 'arsenal');
  elementsById.set('arsenal', arsenalSection);

  const windowMock: any = {
    innerWidth: viewport.width,
    innerHeight: viewport.height,
    location: locationMock,
    localStorage: storage,
    sessionStorage: new MockStorage(),
    addEventListener: (event: string, handler: (e: any) => void) => {
      if (!windowListeners[event]) windowListeners[event] = [];
      windowListeners[event].push(handler);
    },
    removeEventListener: (event: string, handler: (e: any) => void) => {
      if (!windowListeners[event]) return;
      windowListeners[event] = windowListeners[event].filter(h => h !== handler);
    },
    dispatchEvent: (event: any) => {
      const handlers = windowListeners[event.type] || [];
      for (const h of handlers) {
        h(event);
      }
      return true;
    },
    confirm: (_msg: string) => true
  };

  class MockKeyboardEvent {
    public key: string;
    public ctrlKey: boolean;
    public shiftKey: boolean;
    public altKey: boolean;
    public type: string = 'keydown';

    constructor(type: string, init: { key?: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {}) {
      this.type = type;
      this.key = init.key || '';
      this.ctrlKey = !!init.ctrlKey;
      this.shiftKey = !!init.shiftKey;
      this.altKey = !!init.altKey;
    }
  }

  (globalThis as any).window = windowMock;
  (globalThis as any).document = documentMock;
  (globalThis as any).localStorage = storage;
  (globalThis as any).sessionStorage = windowMock.sessionStorage;
  (globalThis as any).location = locationMock;
  (globalThis as any).KeyboardEvent = MockKeyboardEvent;
  (globalThis as any).__lastScrolledToElement = null;
  (globalThis as any).__focusedElement = null;
  (globalThis as any).__reloaded = false;

  return {
    window: windowMock,
    document: documentMock,
    storage,
    viewport,
    resetElements: () => elementsById.clear(),
    registerElement: (el: MockElement) => documentMock.registerElement(el)
  };
}

export function cleanupTestEnvironment() {
  for (const [k, v] of Object.entries(originalGlobals)) {
    (globalThis as any)[k] = v;
  }
  delete (globalThis as any).__lastScrolledToElement;
  delete (globalThis as any).__focusedElement;
  delete (globalThis as any).__reloaded;
}
