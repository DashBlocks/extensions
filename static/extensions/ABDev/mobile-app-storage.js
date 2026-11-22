/* Author: ABDev */
(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Mobile App Ultra Pro: This extension must run unsandboxed.');
    }

    const BlockType = Scratch.BlockType;
    const ArgumentType = Scratch.ArgumentType;

    const root = typeof window !== 'undefined' ? window : globalThis;
    if (!root.MobileAppUltra) root.MobileAppUltra = {};
    const MAU = root.MobileAppUltra;

    if (!MAU._storageShared) {
        MAU._storageShared = {
            indexedDBCache: {},
            indexedDBResults: {},
            ready: false
        };
    }

    const shared = MAU._storageShared;

    const t = (ru, en) => {
        const lang = (typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en').toLowerCase();
        return lang.startsWith('ru') ? ru : en;
    };

    function safeString(v) {
        if (v === null || v === undefined) return '';
        return String(v);
    }

    function hasLocalStorage() {
        try {
            return typeof localStorage !== 'undefined';
        } catch (e) {
            return false;
        }
    }

    function hasSessionStorage() {
        try {
            return typeof sessionStorage !== 'undefined';
        } catch (e) {
            return false;
        }
    }

    function estimateStorageKB(storageObj) {
        try {
            let total = 0;
            for (let i = 0; i < storageObj.length; i++) {
                const key = storageObj.key(i);
                const value = storageObj.getItem(key);
                total += (safeString(key).length + safeString(value).length) * 2;
            }
            return Math.round((total / 1024) * 100) / 100;
        } catch (e) {
            return -1;
        }
    }

    function getAllStorageKeys(storageObj) {
        try {
            const keys = [];
            for (let i = 0; i < storageObj.length; i++) {
                keys.push(storageObj.key(i));
            }
            return keys;
        } catch (e) {
            return [];
        }
    }

    function parseJSON(text, fallback) {
        try {
            return JSON.parse(String(text));
        } catch (e) {
            return fallback;
        }
    }

    function setByPath(obj, field, value) {
        const path = String(field || '').split('.').filter(Boolean);
        if (!path.length) return obj;

        let ref = obj;
        for (let i = 0; i < path.length - 1; i++) {
            const part = path[i];
            if (typeof ref[part] !== 'object' || ref[part] === null) {
                ref[part] = {};
            }
            ref = ref[part];
        }
        ref[path[path.length - 1]] = value;
        return obj;
    }

    function getByPath(obj, field) {
        const path = String(field || '').split('.').filter(Boolean);
        if (!path.length) return obj;

        let ref = obj;
        for (const part of path) {
            if (ref === null || ref === undefined || typeof ref !== 'object' || !(part in ref)) {
                return '';
            }
            ref = ref[part];
        }

        if (typeof ref === 'object') {
            try {
                return JSON.stringify(ref);
            } catch (e) {
                return '';
            }
        }
        return safeString(ref);
    }

    function setCookie(name, value, days) {
        if (typeof document === 'undefined') return false;
        try {
            const d = new Date();
            d.setTime(d.getTime() + (Number(days) || 0) * 24 * 60 * 60 * 1000);
            const expires = 'expires=' + d.toUTCString();
            document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';' + expires + ';path=/';
            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: setCookie failed', e);
            return false;
        }
    }

    function getCookie(name) {
        if (typeof document === 'undefined') return '';
        try {
            const target = encodeURIComponent(name) + '=';
            const parts = document.cookie.split(';');
            for (let c of parts) {
                c = c.trim();
                if (c.indexOf(target) === 0) {
                    return decodeURIComponent(c.substring(target.length));
                }
            }
        } catch (e) {
            console.warn('Mobile App Ultra Pro: getCookie failed', e);
        }
        return '';
    }

    function deleteCookie(name) {
        if (typeof document === 'undefined') return false;
        try {
            document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: deleteCookie failed', e);
            return false;
        }
    }

    function getAllCookies() {
        if (typeof document === 'undefined') return '';
        return document.cookie || '';
    }

    function openDB(name) {
        return new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                reject(new Error('IndexedDB is not supported.'));
                return;
            }

            try {
                const request = indexedDB.open(String(name), 1);

                request.onupgradeneeded = function (event) {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('data')) {
                        db.createObjectStore('data');
                    }
                };

                request.onsuccess = function () {
                    resolve(request.result);
                };

                request.onerror = function () {
                    reject(request.error || new Error('IndexedDB open failed.'));
                };
            } catch (e) {
                reject(e);
            }
        });
    }

    async function idbCreateDB(name) {
        const db = await openDB(name);
        db.close();
        shared.indexedDBCache[String(name)] = true;
        return true;
    }

    async function idbSet(dbName, key, value) {
        const db = await openDB(dbName);
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(['data'], 'readwrite');
                const store = tx.objectStore('data');
                const req = store.put(String(value), String(key));

                req.onsuccess = function () {
                    resolve(true);
                };
                req.onerror = function () {
                    reject(req.error || new Error('IndexedDB set failed.'));
                };
                tx.oncomplete = function () {
                    db.close();
                };
            } catch (e) {
                db.close();
                reject(e);
            }
        });
    }

    async function idbGet(dbName, key) {
        const db = await openDB(dbName);
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(['data'], 'readonly');
                const store = tx.objectStore('data');
                const req = store.get(String(key));

                req.onsuccess = function () {
                    resolve(req.result === undefined ? '' : safeString(req.result));
                };
                req.onerror = function () {
                    reject(req.error || new Error('IndexedDB get failed.'));
                };
                tx.oncomplete = function () {
                    db.close();
                };
            } catch (e) {
                db.close();
                reject(e);
            }
        });
    }

    async function idbDelete(dbName, key) {
        const db = await openDB(dbName);
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(['data'], 'readwrite');
                const store = tx.objectStore('data');
                const req = store.delete(String(key));

                req.onsuccess = function () {
                    resolve(true);
                };
                req.onerror = function () {
                    reject(req.error || new Error('IndexedDB delete failed.'));
                };
                tx.oncomplete = function () {
                    db.close();
                };
            } catch (e) {
                db.close();
                reject(e);
            }
        });
    }

    async function idbClear(dbName) {
        const db = await openDB(dbName);
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(['data'], 'readwrite');
                const store = tx.objectStore('data');
                const req = store.clear();

                req.onsuccess = function () {
                    resolve(true);
                };
                req.onerror = function () {
                    reject(req.error || new Error('IndexedDB clear failed.'));
                };
                tx.oncomplete = function () {
                    db.close();
                };
            } catch (e) {
                db.close();
                reject(e);
            }
        });
    }

    class MobileAppUltraStorage {
        getInfo() {
            return {
                id: 'mobileappultrastorage',
                name: t('Mobile App Ultra Pro / Хранилище', 'Mobile App Ultra Pro / Storage'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('LocalStorage', 'LocalStorage')
                    },
                    {
                        opcode: 'saveLocal',
                        blockType: BlockType.COMMAND,
                        text: t('сохранить [KEY] = [VALUE]', 'save [KEY] = [VALUE]'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'score' },
                            VALUE: { type: ArgumentType.STRING, defaultValue: '123' }
                        }
                    },
                    {
                        opcode: 'loadLocal',
                        blockType: BlockType.REPORTER,
                        text: t('загрузить [KEY]', 'load [KEY]'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'score' }
                        }
                    },
                    {
                        opcode: 'deleteLocal',
                        blockType: BlockType.COMMAND,
                        text: t('удалить [KEY]', 'delete [KEY]'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'score' }
                        }
                    },
                    {
                        opcode: 'hasLocalKey',
                        blockType: BlockType.BOOLEAN,
                        text: t('ключ существует [KEY]?', 'key exists [KEY]?'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'score' }
                        }
                    },
                    {
                        opcode: 'clearLocal',
                        blockType: BlockType.COMMAND,
                        text: t('очистить всё хранилище', 'clear all storage')
                    },
                    {
                        opcode: 'getAllLocalKeys',
                        blockType: BlockType.REPORTER,
                        text: t('все ключи (JSON)', 'all keys (JSON)')
                    },
                    {
                        opcode: 'getLocalCount',
                        blockType: BlockType.REPORTER,
                        text: t('количество сохранённых элементов', 'saved item count')
                    },
                    {
                        opcode: 'getLocalSizeKB',
                        blockType: BlockType.REPORTER,
                        text: t('размер хранилища (KB)', 'storage size (KB)')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('SessionStorage', 'SessionStorage')
                    },
                    {
                        opcode: 'saveSession',
                        blockType: BlockType.COMMAND,
                        text: t('сохранить в сессию [KEY] = [VALUE]', 'save to session [KEY] = [VALUE]'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'temp' },
                            VALUE: { type: ArgumentType.STRING, defaultValue: 'hello' }
                        }
                    },
                    {
                        opcode: 'loadSession',
                        blockType: BlockType.REPORTER,
                        text: t('загрузить из сессии [KEY]', 'load from session [KEY]'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'temp' }
                        }
                    },
                    {
                        opcode: 'deleteSession',
                        blockType: BlockType.COMMAND,
                        text: t('удалить из сессии [KEY]', 'delete from session [KEY]'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'temp' }
                        }
                    },
                    {
                        opcode: 'clearSession',
                        blockType: BlockType.COMMAND,
                        text: t('очистить сессию', 'clear session')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('JSON данные', 'JSON Data')
                    },
                    {
                        opcode: 'saveJSON',
                        blockType: BlockType.COMMAND,
                        text: t('сохранить JSON [KEY] = [OBJECT]', 'save JSON [KEY] = [OBJECT]'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'player' },
                            OBJECT: { type: ArgumentType.STRING, defaultValue: '{"name":"Alex","score":10}' }
                        }
                    },
                    {
                        opcode: 'loadJSON',
                        blockType: BlockType.REPORTER,
                        text: t('загрузить JSON [KEY]', 'load JSON [KEY]'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'player' }
                        }
                    },
                    {
                        opcode: 'getJSONField',
                        blockType: BlockType.REPORTER,
                        text: t('получить поле [FIELD] из [KEY]', 'get field [FIELD] from [KEY]'),
                        arguments: {
                            FIELD: { type: ArgumentType.STRING, defaultValue: 'name' },
                            KEY: { type: ArgumentType.STRING, defaultValue: 'player' }
                        }
                    },
                    {
                        opcode: 'setJSONField',
                        blockType: BlockType.COMMAND,
                        text: t('установить поле [FIELD] = [VALUE] в [KEY]', 'set field [FIELD] = [VALUE] in [KEY]'),
                        arguments: {
                            FIELD: { type: ArgumentType.STRING, defaultValue: 'score' },
                            VALUE: { type: ArgumentType.STRING, defaultValue: '100' },
                            KEY: { type: ArgumentType.STRING, defaultValue: 'player' }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Cookies', 'Cookies')
                    },
                    {
                        opcode: 'setCookieBlock',
                        blockType: BlockType.COMMAND,
                        text: t('установить cookie [NAME] = [VALUE] на [DAYS] дней', 'set cookie [NAME] = [VALUE] for [DAYS] days'),
                        arguments: {
                            NAME: { type: ArgumentType.STRING, defaultValue: 'user' },
                            VALUE: { type: ArgumentType.STRING, defaultValue: 'alex' },
                            DAYS: { type: ArgumentType.NUMBER, defaultValue: 7 }
                        }
                    },
                    {
                        opcode: 'getCookieBlock',
                        blockType: BlockType.REPORTER,
                        text: t('получить cookie [NAME]', 'get cookie [NAME]'),
                        arguments: {
                            NAME: { type: ArgumentType.STRING, defaultValue: 'user' }
                        }
                    },
                    {
                        opcode: 'deleteCookieBlock',
                        blockType: BlockType.COMMAND,
                        text: t('удалить cookie [NAME]', 'delete cookie [NAME]'),
                        arguments: {
                            NAME: { type: ArgumentType.STRING, defaultValue: 'user' }
                        }
                    },
                    {
                        opcode: 'getAllCookiesBlock',
                        blockType: BlockType.REPORTER,
                        text: t('все cookies', 'all cookies')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('IndexedDB', 'IndexedDB')
                    },
                    {
                        opcode: 'createDB',
                        blockType: BlockType.COMMAND,
                        text: t('создать базу данных [NAME]', 'create database [NAME]'),
                        arguments: {
                            NAME: { type: ArgumentType.STRING, defaultValue: 'MyDB' }
                        }
                    },
                    {
                        opcode: 'saveDB',
                        blockType: BlockType.COMMAND,
                        text: t('сохранить в БД [DB] ключ [KEY] значение [VALUE]', 'save in DB [DB] key [KEY] value [VALUE]'),
                        arguments: {
                            DB: { type: ArgumentType.STRING, defaultValue: 'MyDB' },
                            KEY: { type: ArgumentType.STRING, defaultValue: 'item1' },
                            VALUE: { type: ArgumentType.STRING, defaultValue: 'hello' }
                        }
                    },
                    {
                        opcode: 'loadDB',
                        blockType: BlockType.REPORTER,
                        text: t('загрузить из БД [DB] ключ [KEY]', 'load from DB [DB] key [KEY]'),
                        arguments: {
                            DB: { type: ArgumentType.STRING, defaultValue: 'MyDB' },
                            KEY: { type: ArgumentType.STRING, defaultValue: 'item1' }
                        }
                    },
                    {
                        opcode: 'deleteDB',
                        blockType: BlockType.COMMAND,
                        text: t('удалить из БД [DB] ключ [KEY]', 'delete from DB [DB] key [KEY]'),
                        arguments: {
                            DB: { type: ArgumentType.STRING, defaultValue: 'MyDB' },
                            KEY: { type: ArgumentType.STRING, defaultValue: 'item1' }
                        }
                    },
                    {
                        opcode: 'clearDB',
                        blockType: BlockType.COMMAND,
                        text: t('очистить БД [DB]', 'clear DB [DB]'),
                        arguments: {
                            DB: { type: ArgumentType.STRING, defaultValue: 'MyDB' }
                        }
                    }
                ]
            };
        }

        saveLocal(args) {
            if (!hasLocalStorage()) {
                console.warn('Mobile App Ultra Pro: localStorage is not supported.');
                return;
            }
            try {
                localStorage.setItem(safeString(args.KEY), safeString(args.VALUE));
            } catch (e) {
                console.warn('Mobile App Ultra Pro: saveLocal failed', e);
            }
        }

        loadLocal(args) {
            if (!hasLocalStorage()) return '';
            try {
                const value = localStorage.getItem(safeString(args.KEY));
                return value === null ? '' : value;
            } catch (e) {
                console.warn('Mobile App Ultra Pro: loadLocal failed', e);
                return '';
            }
        }

        deleteLocal(args) {
            if (!hasLocalStorage()) return;
            try {
                localStorage.removeItem(safeString(args.KEY));
            } catch (e) {
                console.warn('Mobile App Ultra Pro: deleteLocal failed', e);
            }
        }

        hasLocalKey(args) {
            if (!hasLocalStorage()) return false;
            try {
                return localStorage.getItem(safeString(args.KEY)) !== null;
            } catch (e) {
                return false;
            }
        }

        clearLocal() {
            if (!hasLocalStorage()) return;
            try {
                localStorage.clear();
            } catch (e) {
                console.warn('Mobile App Ultra Pro: clearLocal failed', e);
            }
        }

        getAllLocalKeys() {
            if (!hasLocalStorage()) return '[]';
            return JSON.stringify(getAllStorageKeys(localStorage));
        }

        getLocalCount() {
            if (!hasLocalStorage()) return 0;
            try {
                return localStorage.length;
            } catch (e) {
                return 0;
            }
        }

        getLocalSizeKB() {
            if (!hasLocalStorage()) return -1;
            return estimateStorageKB(localStorage);
        }

        saveSession(args) {
            if (!hasSessionStorage()) {
                console.warn('Mobile App Ultra Pro: sessionStorage is not supported.');
                return;
            }
            try {
                sessionStorage.setItem(safeString(args.KEY), safeString(args.VALUE));
            } catch (e) {
                console.warn('Mobile App Ultra Pro: saveSession failed', e);
            }
        }

        loadSession(args) {
            if (!hasSessionStorage()) return '';
            try {
                const value = sessionStorage.getItem(safeString(args.KEY));
                return value === null ? '' : value;
            } catch (e) {
                console.warn('Mobile App Ultra Pro: loadSession failed', e);
                return '';
            }
        }

        deleteSession(args) {
            if (!hasSessionStorage()) return;
            try {
                sessionStorage.removeItem(safeString(args.KEY));
            } catch (e) {
                console.warn('Mobile App Ultra Pro: deleteSession failed', e);
            }
        }

        clearSession() {
            if (!hasSessionStorage()) return;
            try {
                sessionStorage.clear();
            } catch (e) {
                console.warn('Mobile App Ultra Pro: clearSession failed', e);
            }
        }

        saveJSON(args) {
            if (!hasLocalStorage()) return;
            try {
                const parsed = parseJSON(args.OBJECT, null);
                const text = parsed === null ? safeString(args.OBJECT) : JSON.stringify(parsed);
                localStorage.setItem(safeString(args.KEY), text);
            } catch (e) {
                console.warn('Mobile App Ultra Pro: saveJSON failed', e);
            }
        }

        loadJSON(args) {
            if (!hasLocalStorage()) return '';
            try {
                const raw = localStorage.getItem(safeString(args.KEY));
                return raw === null ? '' : raw;
            } catch (e) {
                console.warn('Mobile App Ultra Pro: loadJSON failed', e);
                return '';
            }
        }

        getJSONField(args) {
            if (!hasLocalStorage()) return '';
            try {
                const raw = localStorage.getItem(safeString(args.KEY));
                if (raw === null) return '';
                const obj = parseJSON(raw, null);
                if (obj === null || typeof obj !== 'object') return '';
                return getByPath(obj, args.FIELD);
            } catch (e) {
                console.warn('Mobile App Ultra Pro: getJSONField failed', e);
                return '';
            }
        }

        setJSONField(args) {
            if (!hasLocalStorage()) return;
            try {
                const key = safeString(args.KEY);
                const raw = localStorage.getItem(key);
                let obj = parseJSON(raw || '{}', {});
                if (typeof obj !== 'object' || obj === null) obj = {};

                let value = args.VALUE;
                const parsedValue = parseJSON(value, undefined);
                if (parsedValue !== undefined) value = parsedValue;

                setByPath(obj, args.FIELD, value);
                localStorage.setItem(key, JSON.stringify(obj));
            } catch (e) {
                console.warn('Mobile App Ultra Pro: setJSONField failed', e);
            }
        }

        setCookieBlock(args) {
            setCookie(safeString(args.NAME), safeString(args.VALUE), Number(args.DAYS) || 0);
        }

        getCookieBlock(args) {
            return getCookie(safeString(args.NAME));
        }

        deleteCookieBlock(args) {
            deleteCookie(safeString(args.NAME));
        }

        getAllCookiesBlock() {
            return getAllCookies();
        }

        createDB(args) {
            idbCreateDB(safeString(args.NAME)).catch(e => {
                console.warn('Mobile App Ultra Pro: createDB failed', e);
            });
        }

        saveDB(args) {
            idbSet(safeString(args.DB), safeString(args.KEY), safeString(args.VALUE)).catch(e => {
                console.warn('Mobile App Ultra Pro: saveDB failed', e);
            });
        }

        loadDB(args) {
            const dbName = safeString(args.DB);
            const key = safeString(args.KEY);
            const cacheKey = dbName + '::' + key;

            if (!(cacheKey in shared.indexedDBResults)) {
                shared.indexedDBResults[cacheKey] = '';
                idbGet(dbName, key)
                    .then(value => {
                        shared.indexedDBResults[cacheKey] = value;
                    })
                    .catch(e => {
                        console.warn('Mobile App Ultra Pro: loadDB failed', e);
                        shared.indexedDBResults[cacheKey] = '';
                    });
            } else {
                idbGet(dbName, key)
                    .then(value => {
                        shared.indexedDBResults[cacheKey] = value;
                    })
                    .catch(() => {});
            }

            return shared.indexedDBResults[cacheKey];
        }

        deleteDB(args) {
            idbDelete(safeString(args.DB), safeString(args.KEY)).catch(e => {
                console.warn('Mobile App Ultra Pro: deleteDB failed', e);
            });
        }

        clearDB(args) {
            idbClear(safeString(args.DB)).catch(e => {
                console.warn('Mobile App Ultra Pro: clearDB failed', e);
            });
        }
    }

    Scratch.extensions.register(new MobileAppUltraStorage());
})(Scratch);
