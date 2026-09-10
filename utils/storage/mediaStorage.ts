/**
 * utils/storage/mediaStorage.ts
 * High-capacity client-side media storage powered by IndexedDB with in-memory fallback.
 * Prevents LocalStorage QuotaExceededError by storing binary/Base64 image blobs in IndexedDB.
 */

const DB_NAME = 'nghub_media_db';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

// In-memory fallback for SSR or environments where IndexedDB is blocked
const memoryStore = new Map<string, Blob>();

export function dataURLToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = typeof atob === 'function' ? atob(parts[1] || '') : Buffer.from(parts[1] || '', 'base64').toString('binary');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      // Node.js fallback
      blob.arrayBuffer().then((buf) => {
        const base64 = Buffer.from(buf).toString('base64');
        resolve(`data:${blob.type || 'image/jpeg'};base64,${base64}`);
      }).catch(reject);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in current environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store an image Blob, File, or Data URL in IndexedDB
 * @param key unique identifier (e.g. "hero", "quoteParallax", "gallery_0")
 * @param data image data as Blob, File, or Base64 data URL string
 */
export async function saveMediaBlob(key: string, data: Blob | File | string): Promise<string> {
  const cleanKey = key.replace(/^idb:\/\//, '');
  const blob = typeof data === 'string' ? dataURLToBlob(data) : data;

  try {
    const db = await openMediaDB();
    return await new Promise<string>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, cleanKey);
      req.onsuccess = () => resolve(`idb://${cleanKey}`);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Graceful fallback to memory store
    memoryStore.set(cleanKey, blob);
    return `idb://${cleanKey}`;
  }
}

/**
 * Retrieve an image Blob from IndexedDB or memory fallback
 */
export async function getMediaBlob(key: string): Promise<Blob | null> {
  const cleanKey = key.replace(/^idb:\/\//, '');
  if (memoryStore.has(cleanKey)) {
    return memoryStore.get(cleanKey) || null;
  }

  try {
    const db = await openMediaDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cleanKey);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Retrieve an image as Data URL from IndexedDB or memory fallback
 */
export async function getMediaDataURL(key: string): Promise<string | null> {
  const blob = await getMediaBlob(key);
  if (!blob) return null;
  return blobToDataURL(blob);
}

/**
 * Delete a media blob by key
 */
export async function deleteMediaBlob(key: string): Promise<void> {
  const cleanKey = key.replace(/^idb:\/\//, '');
  memoryStore.delete(cleanKey);

  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(cleanKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore cleanup error
  }
}

/**
 * Clear all media blobs from IndexedDB and memory fallback
 */
export async function clearAllMediaBlobs(): Promise<void> {
  memoryStore.clear();
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore cleanup error
  }
}
