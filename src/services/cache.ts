/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonStatResponse } from '../data/types';

const DB_NAME = 'euro_housing_db';
const STORE_NAME = 'eurostat_cache';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export async function setCachedDataset(key: string, data: JsonStatResponse): Promise<void> {
  const db = await openDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(data, key);
        store.put(Date.now(), `${key}_timestamp`);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // Fallback to localStorage if small enough or memory
  try {
    localStorage.setItem(`euro_cache_${key}`, JSON.stringify(data));
    localStorage.setItem(`euro_cache_${key}_ts`, String(Date.now()));
  } catch {
    // Ignore quota errors
  }
}

export async function getCachedDataset(key: string): Promise<JsonStatResponse | null> {
  const db = await openDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  try {
    const raw = localStorage.getItem(`euro_cache_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getCachedTimestamp(key: string): Promise<number | null> {
  const db = await openDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(`${key}_timestamp`);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  try {
    const ts = localStorage.getItem(`euro_cache_${key}_ts`);
    return ts ? parseInt(ts, 10) : null;
  } catch {
    return null;
  }
}
