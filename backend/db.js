import { saveChat as saveChatToAPI, getChats as getChatsFromAPI } from "./api.js";

const DB_NAME = 'chatbotDB';
const DB_VERSION = 2;
let db;

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (event.oldVersion < 1) {
        db.createObjectStore('settings', { keyPath: 'key' });
        const chatStore = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
        chatStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (event.oldVersion < 2) {
        const chatStore = db.transaction(['chats'], 'readwrite').objectStore('chats');
        chatStore.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };
  });
}

async function saveSetting(key, value, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!db) await openDB();
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });
      await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
      return;
    } catch (error) {
      if (attempt === retries) throw new Error(`Failed to save setting after ${retries} attempts: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function getSetting(key, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!db) await openDB();
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);
      const result = await new Promise((resolve, reject) => {
        request.onsuccess = (event) => resolve(event.target.result ? event.target.result.value : null);
        request.onerror = (event) => reject(event.target.error);
      });
      return result;
    } catch (error) {
      if (attempt === retries) throw new Error(`Failed to get setting after ${retries} attempts: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function saveChat(chat, sessionId, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!db) await openDB();
      const transaction = db.transaction(['chats'], 'readwrite');
      const store = transaction.objectStore('chats');
      const request = store.add({ ...chat, sessionId, timestamp: Date.now() });
      await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
      // Sync with external API
      await saveChatToAPI({ ...chat, sessionId });
      return;
    } catch (error) {
      if (attempt === retries) throw new Error(`Failed to save chat after ${retries} attempts: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function getChats(sessionId, limit = 50, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!db) await openDB();
      const transaction = db.transaction(['chats'], 'readonly');
      const store = transaction.objectStore('chats');
      const index = store.index('sessionId');
      const request = index.getAll(IDBKeyRange.only(sessionId));
      let chats = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
      });
      // Fetch from external API if local is empty
      if (!chats.length) {
        chats = await getChatsFromAPI(sessionId, limit);
        // Cache API results locally
        for (const chat of chats) {
          await saveChat(chat, sessionId);
        }
      }
      return chats.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    } catch (error) {
      if (attempt === retries) throw new Error(`Failed to get chats after ${retries} attempts: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function cleanupChats(maxAgeDays = 30, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!db) await openDB();
      const transaction = db.transaction(['chats'], 'readwrite');
      const store = transaction.objectStore('chats');
      const index = store.index('timestamp');
      const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
      const cutoff = Date.now() - maxAgeMs;
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff));
      await new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = (event) => reject(event.target.error);
      });
      return;
    } catch (error) {
      if (attempt === retries) throw new Error(`Failed to clean chats after ${retries} attempts: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}