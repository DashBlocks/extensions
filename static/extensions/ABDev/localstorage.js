/* Author: ABDev */
(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('⚠️ МЕГА Сохранение: Нужно включить режим "Run without sandbox" (Без песочницы)!');
  }

  const CONFIG = {
    prefix: 'MEGASAVE_',
    autoSaveInterval: 3000,
    maxHistory: 100,
    maxBackups: 10,
    version: '2.1.0', 
    debug: false
  };

  let autoSaveEnabled = false;
  let autoSaveTimer = null;
  let autoSaveTargets = new Set();
  let changeHistory = [];
  let lastSnapshotStr = "{}"; 
  let saveCount = 0;
  let loadCount = 0;

  function runtime() {
    return Scratch.vm?.runtime;
  }

  const memoryStorage = {
    data: {},
    getItem(key) { return this.data.hasOwnProperty(key) ? this.data[key] : null; },
    setItem(key, value) { this.data[key] = String(value); },
    removeItem(key) { delete this.data[key]; },
    clear() { this.data = {}; },
    get length() { return Object.keys(this.data).length; },
    key(i) { return Object.keys(this.data)[i] ?? null; }
  };

  function getStorage() {
    try {
      const testKey = '__megasave_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return localStorage;
    } catch (e) {
      console.warn('⚠️ [MEGASAVE] localStorage недоступен. Используем оперативную память.');
      return memoryStorage;
    }
  }

  const storage = getStorage();

  function fullKey(key) {
    return CONFIG.prefix + String(key).trim();
  }

  function log(msg, data = null) {
    if (CONFIG.debug) {
      console.log(`🔷 [MEGASAVE] ${msg}`, data !== null ? data : '');
    }
  }

  function timestamp() {
    return Date.now();
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString('ru-RU');
  }

  function saveValue(key, value) {
    try {
      const k = fullKey(key);
      const data = {
        value: value,
        type: typeof value,
        savedAt: timestamp(),
        version: CONFIG.version
      };
      storage.setItem(k, JSON.stringify(data));
      saveCount++;
      addToHistory('save', key, value);
      log(`Сохранено: ${key}`, value);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('❌ [MEGASAVE] Память браузера переполнена! Невозможно сохранить.');
      } else {
        console.error('❌ [MEGASAVE] Ошибка сохранения:', e);
      }
      return false;
    }
  }

  function loadValue(key, defaultValue = '') {
    try {
      const k = fullKey(key);
      const raw = storage.getItem(k);
      if (raw === null) return defaultValue;
      
      const data = JSON.parse(raw);
      loadCount++;
      log(`Загружено: ${key}`, data.value);
      return data.value;
    } catch (e) {
      console.error('❌ [MEGASAVE] Ошибка загрузки ключа:', key, e);
      return defaultValue;
    }
  }

  function deleteValue(key) {
    try {
      const k = fullKey(key);
      const existed = storage.getItem(k) !== null;
      storage.removeItem(k);
      if (existed) {
        addToHistory('delete', key, null);
        log(`Удалено: ${key}`);
      }
      return existed;
    } catch (e) {
      console.error('❌ [MEGASAVE] Ошибка удаления:', e);
      return false;
    }
  }

  function keyExists(key) {
    return storage.getItem(fullKey(key)) !== null;
  }

  function getAllKeys() {
    const keys = [];
    const prefix = CONFIG.prefix;
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(prefix)) {
        keys.push(k.slice(prefix.length));
      }
    }
    return keys;
  }

  function deleteAll() {
    const keys = getAllKeys();
    let count = 0;
    for (const key of keys) {
      if (deleteValue(key)) count++;
    }
    changeHistory = [];
    log(`Удалено всё: ${count} записей`);
    return count;
  }

  function getDataSize() {
    let size = 0;
    const prefix = CONFIG.prefix;
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(prefix)) {
        size += (storage.getItem(k) || '').length;
      }
    }
    return size;
  }

  function addToHistory(action, key, value) {
    changeHistory.push({
      action,
      key: String(key),
      time: timestamp()
    });
    if (changeHistory.length > CONFIG.maxHistory) {
      changeHistory.shift();
    }
  }

  function getHistory(count = 10) {
    return changeHistory.slice(-count);
  }

  function clearHistory() {
    changeHistory = [];
  }

  function startAutoSave() {
    if (autoSaveTimer) return;
    autoSaveEnabled = true;
    autoSaveTimer = setInterval(() => {
      performAutoSave();
    }, CONFIG.autoSaveInterval);
    log('🟢 Автосохранение включено');
  }

  function stopAutoSave() {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }
    autoSaveEnabled = false;
    log('🔴 Автосохранение выключено');
  }

  function performAutoSave() {
    const r = runtime();
    if (!r || !r.targets) return;

    const snapshot = {};
    
    for (const target of r.targets) {
      if (!target.isOriginal) continue;
      
      const name = target.isStage ? '__stage__' : target.sprite?.name;
      if (!name) continue;

      if (autoSaveTargets.size > 0 && !autoSaveTargets.has('__all__') && !autoSaveTargets.has(name)) {
        continue;
      }

      const data = {
        isStage: target.isStage,
        volume: target.volume,
        currentCostume: target.currentCostume,
        effects: { ...target.effects },
        variables: {}
      };

      if (!target.isStage) {
        data.x = target.x;
        data.y = target.y;
        data.direction = target.direction;
        data.size = target.size;
        data.visible = target.visible;
      }

      for (const [id, variable] of Object.entries(target.variables || {})) {
        data.variables[variable.name] = variable.value;
      }

      snapshot[name] = data;
    }

    const snapshotStr = JSON.stringify(snapshot);
    if (snapshotStr !== lastSnapshotStr) {
      saveValue('__autosave__', snapshot);
      saveValue('__autosave_time__', timestamp());
      lastSnapshotStr = snapshotStr;
      log('💾 Автосохранение выполнено');
    }
  }

  function loadAutoSave() {
    const snapshot = loadValue('__autosave__', null);
    if (!snapshot) return false;

    const r = runtime();
    if (!r || !r.targets) return false;

    for (const target of r.targets) {
      if (!target.isOriginal) continue;
      
      const name = target.isStage ? '__stage__' : target.sprite?.name;
      if (!name || !snapshot[name]) continue;

      const data = snapshot[name];

      if (!target.isStage) {
        target.setXY(data.x ?? target.x, data.y ?? target.y);
        target.setDirection(data.direction ?? target.direction);
        target.setSize(data.size ?? target.size);
        target.setVisible(data.visible ?? target.visible);
      }
      
      if (data.currentCostume !== undefined) {
        target.setCostume(data.currentCostume);
      }

      if (data.effects) {
        for (const [effect, value] of Object.entries(data.effects)) {
          target.setEffect(effect, value);
        }
      }

      if (data.variables) {
        for (const [varName, value] of Object.entries(data.variables)) {
          for (const variable of Object.values(target.variables || {})) {
            if (variable.name === varName) {
              variable.value = value;
            }
          }
        }
      }
    }
    
    r.requestRedraw(); 
    log('📂 Автосохранение загружено');
    return true;
  }

  function saveSprite(util, slotName) {
    const t = util?.target;
    if (!t) return false;

    const name = t.isStage ? '__stage__' : (t.sprite?.name || 'unknown');
    const data = {
      name,
      isStage: t.isStage,
      currentCostume: t.currentCostume,
      effects: { ...t.effects },
      variables: {}
    };

    if (!t.isStage) {
      data.x = t.x;
      data.y = t.y;
      data.direction = t.direction;
      data.size = t.size;
      data.visible = t.visible;
    }

    for (const variable of Object.values(t.variables || {})) {
      data.variables[variable.name] = variable.value;
    }

    return saveValue(`sprite_${slotName}_${name}`, data);
  }

  function loadSprite(util, slotName) {
    const t = util?.target;
    if (!t) return false;

    const name = t.isStage ? '__stage__' : (t.sprite?.name || 'unknown');
    const data = loadValue(`sprite_${slotName}_${name}`, null);
    if (!data) return false;

    if (!t.isStage) {
      t.setXY(data.x ?? t.x, data.y ?? t.y);
      t.setDirection(data.direction ?? t.direction);
      t.setSize(data.size ?? t.size);
      t.setVisible(data.visible ?? t.visible);
    }
    
    if (data.currentCostume !== undefined) {
      t.setCostume(data.currentCostume);
    }

    if (data.effects) {
      for (const [effect, value] of Object.entries(data.effects)) {
        t.setEffect(effect, value);
      }
    }

    if (data.variables) {
      for (const [varName, value] of Object.entries(data.variables)) {
        for (const variable of Object.values(t.variables || {})) {
          if (variable.name === varName) {
            variable.value = value;
          }
        }
      }
    }

    runtime()?.requestRedraw();
    return true;
  }

  function exportAllData() {
    const data = {};
    const keys = getAllKeys();
    for (const key of keys) {
      data[key] = loadValue(key);
    }
    return JSON.stringify({
      version: CONFIG.version,
      exportedAt: timestamp(),
      data
    }, null, 2);
  }

  function importAllData(jsonString) {
    try {
      const parsed = JSON.parse(String(jsonString));
      const data = parsed.data || parsed;
      if (typeof data !== 'object') throw new Error('Неверный формат данных');
      
      let count = 0;
      for (const [key, value] of Object.entries(data)) {
        saveValue(key, value);
        count++;
      }
      log(`📥 Импортировано: ${count} записей`);
      return count;
    } catch (e) {
      console.error('❌ Ошибка импорта:', e);
      return 0;
    }
  }

  function createBackup(name) {
    const data = exportAllData();
    const safeName = encodeURIComponent(String(name).replace(/_/g, '-'));
    const backupKey = `backup_${safeName}_${timestamp()}`;
    saveValue(backupKey, data);

    const backups = getAllKeys().filter(k => k.startsWith('backup_'));
    if (backups.length > CONFIG.maxBackups) {
      backups.sort();
      for (let i = 0; i < backups.length - CONFIG.maxBackups; i++) {
        deleteValue(backups[i]);
      }
    }
  }

  function listBackups() {
    return getAllKeys()
      .filter(k => k.startsWith('backup_'))
      .map(k => {
        const parts = k.split('_');
        return {
          key: k,
          name: decodeURIComponent(parts[1] || 'unknown'),
          time: parseInt(parts[2]) || 0
        };
      })
      .sort((a, b) => b.time - a.time);
  }

  function restoreBackup(backupKey) {
    const data = loadValue(backupKey, null);
    if (!data) return false;
    return importAllData(data) > 0;
  }

  function getSprites() {
    try {
      const r = runtime();
      if (!r?.targets) return ['нет'];
      const list = [];
      for (const t of r.targets) {
        if (t.isStage || !t.isOriginal || !t.sprite) continue;
        list.push(t.sprite.name);
      }
      return list.length ? list : ['нет'];
    } catch (e) {
      return ['нет'];
    }
  }

  class MegaProUltraMaxSave {
    getInfo() {
      return {
        id: 'megaProUltraMaxSave',
        name: '💾 МЕГА Сохранение',
        color1: '#9b59b6',
        color2: '#8e44ad',
        color3: '#6c3483',
        
        blocks: [
          
          { blockType: Scratch.BlockType.LABEL, text: '📝 Основные операции' },
          {
            opcode: 'saveData',
            blockType: Scratch.BlockType.COMMAND,
            text: '💾 сохранить [VALUE] в ключ [KEY]',
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'счёт' },
              VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '100' }
            }
          },
          {
            opcode: 'loadData',
            blockType: Scratch.BlockType.REPORTER,
            text: '📂 загрузить ключ [KEY]',
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'счёт' }
            }
          },
          {
            opcode: 'loadDataDefault',
            blockType: Scratch.BlockType.REPORTER,
            text: '📂 загрузить [KEY] или [DEFAULT]',
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'счёт' },
              DEFAULT: { type: Scratch.ArgumentType.STRING, defaultValue: '0' }
            }
          },
          {
            opcode: 'deleteData',
            blockType: Scratch.BlockType.COMMAND,
            text: '🗑️ удалить ключ [KEY]',
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'счёт' }
            }
          },
          {
            opcode: 'keyExists',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '❓ ключ [KEY] существует?',
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'счёт' }
            }
          },
          {
            opcode: 'deleteAllData',
            blockType: Scratch.BlockType.COMMAND,
            text: '💥 УДАЛИТЬ ВСЕ ДАННЫЕ'
          },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '🔄 Автосохранение' },
          { opcode: 'startAutoSave', blockType: Scratch.BlockType.COMMAND, text: '▶️ включить автосохранение' },
          { opcode: 'stopAutoSave', blockType: Scratch.BlockType.COMMAND, text: '⏹️ выключить автосохранение' },
          {
            opcode: 'setAutoSaveInterval',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏱️ интервал автосохранения [SEC] сек',
            arguments: { SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 } }
          },
          { opcode: 'autoSaveNow', blockType: Scratch.BlockType.COMMAND, text: '💾 автосохранить СЕЙЧАС' },
          { opcode: 'loadAutoSave', blockType: Scratch.BlockType.COMMAND, text: '📂 загрузить автосохранение' },
          { opcode: 'isAutoSaveEnabled', blockType: Scratch.BlockType.BOOLEAN, text: '🔄 автосохранение включено?' },
          { opcode: 'getAutoSaveTime', blockType: Scratch.BlockType.REPORTER, text: '🕐 время последнего автосохранения' },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '🎭 Сохранение объектов' },
          {
            opcode: 'saveSpriteState',
            blockType: Scratch.BlockType.COMMAND,
            text: '💾 сохранить состояние объекта в слот [SLOT]',
            arguments: { SLOT: { type: Scratch.ArgumentType.STRING, defaultValue: 'слот1' } }
          },
          {
            opcode: 'loadSpriteState',
            blockType: Scratch.BlockType.COMMAND,
            text: '📂 загрузить состояние объекта из слота [SLOT]',
            arguments: { SLOT: { type: Scratch.ArgumentType.STRING, defaultValue: 'слот1' } }
          },
          {
            opcode: 'savePosition',
            blockType: Scratch.BlockType.COMMAND,
            text: '📍 сохранить позицию спрайта в [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'позиция' } }
          },
          {
            opcode: 'loadPosition',
            blockType: Scratch.BlockType.COMMAND,
            text: '📍 загрузить позицию спрайта из [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'позиция' } }
          },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '📊 Информация' },
          { opcode: 'getAllKeys', blockType: Scratch.BlockType.REPORTER, text: '🔑 все ключи' },
          { opcode: 'getKeyCount', blockType: Scratch.BlockType.REPORTER, text: '🔢 количество ключей' },
          { opcode: 'getDataSize', blockType: Scratch.BlockType.REPORTER, text: '📏 размер данных (байт)' },
          { opcode: 'getSaveCount', blockType: Scratch.BlockType.REPORTER, text: '💾 сколько раз сохранено' },
          { opcode: 'getLoadCount', blockType: Scratch.BlockType.REPORTER, text: '📂 сколько раз загружено' },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '📜 История' },
          {
            opcode: 'getHistory',
            blockType: Scratch.BlockType.REPORTER,
            text: '📜 последние [N] изменений',
            arguments: { N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 } }
          },
          { opcode: 'clearHistory', blockType: Scratch.BlockType.COMMAND, text: '🧹 очистить историю' },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '💼 Резервные копии' },
          {
            opcode: 'createBackup',
            blockType: Scratch.BlockType.COMMAND,
            text: '💼 создать резервную копию [NAME]',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'backup' } }
          },
          { opcode: 'listBackups', blockType: Scratch.BlockType.REPORTER, text: '📋 список резервных копий' },
          {
            opcode: 'restoreBackup',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔙 восстановить копию [NAME]',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'backup' } }
          },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '📤 Экспорт/Импорт JSON' },
          { opcode: 'exportData', blockType: Scratch.BlockType.REPORTER, text: '📤 экспортировать всё в JSON' },
          {
            opcode: 'importData',
            blockType: Scratch.BlockType.COMMAND,
            text: '📥 импортировать из JSON [DATA]',
            arguments: { DATA: { type: Scratch.ArgumentType.STRING, defaultValue: '{}' } }
          },
          { opcode: 'downloadData', blockType: Scratch.BlockType.COMMAND, text: '⬇️ скачать данные как файл' },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '🔧 Настройки' },
          {
            opcode: 'setPrefix',
            blockType: Scratch.BlockType.COMMAND,
            text: '🏷️ префикс ключей [PREFIX]',
            arguments: { PREFIX: { type: Scratch.ArgumentType.STRING, defaultValue: 'MEGASAVE_' } }
          },
          {
            opcode: 'setDebug',
            blockType: Scratch.BlockType.COMMAND,
            text: '🐛 режим отладки [ON]',
            arguments: { ON: { type: Scratch.ArgumentType.STRING, menu: 'onOff' } }
          },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '⚡ Быстрые операции' },
          {
            opcode: 'increment',
            blockType: Scratch.BlockType.COMMAND,
            text: '➕ увеличить число [KEY] на [NUM]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'счёт' }, NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } }
          },
          {
            opcode: 'decrement',
            blockType: Scratch.BlockType.COMMAND,
            text: '➖ уменьшить число [KEY] на [NUM]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'счёт' }, NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } }
          },
          {
            opcode: 'appendToList',
            blockType: Scratch.BlockType.COMMAND,
            text: '📝 добавить [VALUE] в конец списка [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'инвентарь' }, VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: 'предмет' } }
          },
          {
            opcode: 'removeFromList',
            blockType: Scratch.BlockType.COMMAND,
            text: '🗑️ удалить [VALUE] из списка [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'инвентарь' }, VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: 'предмет' } }
          },
          {
            opcode: 'getListItem',
            blockType: Scratch.BlockType.REPORTER,
            text: '📋 элемент [INDEX] списка [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'инвентарь' }, INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } }
          },
          {
            opcode: 'getListLength',
            blockType: Scratch.BlockType.REPORTER,
            text: '🔢 длина списка [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'инвентарь' } }
          },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '🏆 Таблица рекордов' },
          {
            opcode: 'saveHighScore',
            blockType: Scratch.BlockType.COMMAND,
            text: '🏆 сохранить рекорд [SCORE] игрока [NAME]',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Игрок' }, SCORE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 } }
          },
          {
            opcode: 'getHighScores',
            blockType: Scratch.BlockType.REPORTER,
            text: '🏆 топ [N] рекордов (текстом)',
            arguments: { N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 } }
          },
          { opcode: 'getBestScore', blockType: Scratch.BlockType.REPORTER, text: '🥇 лучший результат (число)' },
          { opcode: 'clearHighScores', blockType: Scratch.BlockType.COMMAND, text: '🗑️ очистить таблицу рекордов' }
        ],
        
        menus: {
          sprites: { acceptReporters: true, items: 'getSpritesMenu' },
          onOff: { items: ['вкл', 'выкл'] }
        }
      };
    }

    saveData(args) { saveValue(args.KEY, args.VALUE); }

    loadData(args) {
      const val = loadValue(args.KEY, '');
      return typeof val === 'object' ? JSON.stringify(val) : val;
    }

    loadDataDefault(args) {
      const val = loadValue(args.KEY, args.DEFAULT);
      return typeof val === 'object' ? JSON.stringify(val) : val;
    }

    deleteData(args) { deleteValue(args.KEY); }

    keyExists(args) { return keyExists(args.KEY); }

    deleteAllData() { deleteAll(); }

    startAutoSave() { autoSaveTargets.add('__all__'); startAutoSave(); }
    stopAutoSave() { stopAutoSave(); }
    
    setAutoSaveInterval(args) {
      const sec = Math.max(1, Number(args.SEC) || 5);
      CONFIG.autoSaveInterval = sec * 1000;
      if (autoSaveEnabled) { stopAutoSave(); startAutoSave(); }
    }

    autoSaveNow() { performAutoSave(); }
    loadAutoSave() { loadAutoSave(); }
    isAutoSaveEnabled() { return autoSaveEnabled; }
    getAutoSaveTime() {
      const ts = loadValue('__autosave_time__', 0);
      return ts ? formatDate(ts) : 'никогда';
    }

    saveSpriteState(args, util) { saveSprite(util, args.SLOT); }
    loadSpriteState(args, util) { loadSprite(util, args.SLOT); }

    savePosition(args, util) {
      const t = util?.target;
      if (!t || t.isStage) return; 
      saveValue(args.KEY, { x: t.x, y: t.y, dir: t.direction });
    }

    loadPosition(args, util) {
      const t = util?.target;
      if (!t || t.isStage) return;
      const pos = loadValue(args.KEY, null);
      if (pos && typeof pos === 'object') {
        t.setXY(pos.x ?? t.x, pos.y ?? t.y);
        if (pos.dir !== undefined) t.setDirection(pos.dir);
      }
    }

    getAllKeys() { return getAllKeys().join(', '); }
    getKeyCount() { return getAllKeys().length; }
    getDataSize() { return getDataSize(); }
    getSaveCount() { return saveCount; }
    getLoadCount() { return loadCount; }

    getHistory(args) {
      const history = getHistory(Math.max(1, Number(args.N) || 5));
      if (history.length === 0) return 'пусто';
      return history.map(h => `${h.action}: ${h.key}`).join(', ');
    }
    clearHistory() { clearHistory(); }

    createBackup(args) { createBackup(args.NAME); }
    listBackups() {
      const backups = listBackups();
      return backups.length ? backups.map(b => b.name).join(', ') : 'нет копий';
    }
    restoreBackup(args) {
      const backups = listBackups();
      const backup = backups.find(b => b.name === String(args.NAME));
      if (backup) restoreBackup(backup.key);
    }

    exportData() { return exportAllData(); }
    importData(args) { 
      if(args.DATA && typeof args.DATA === 'string') importAllData(args.DATA); 
    }
    downloadData() {
      const data = exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `megasave_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setPrefix(args) { CONFIG.prefix = String(args.PREFIX) || 'MEGASAVE_'; }
    setDebug(args) { CONFIG.debug = args.ON === 'вкл'; }

    increment(args) {
      const current = Number(loadValue(args.KEY, 0)) || 0;
      saveValue(args.KEY, current + (Number(args.NUM) || 1));
    }
    decrement(args) {
      const current = Number(loadValue(args.KEY, 0)) || 0;
      saveValue(args.KEY, current - (Number(args.NUM) || 1));
    }

    appendToList(args) {
      let list = loadValue(args.KEY, []);
      if (!Array.isArray(list)) list = []; 
      list.push(args.VALUE);
      saveValue(args.KEY, list);
    }
    removeFromList(args) {
      const list = loadValue(args.KEY, []);
      if (!Array.isArray(list)) return;
      const index = list.indexOf(args.VALUE);
      if (index > -1) {
        list.splice(index, 1);
        saveValue(args.KEY, list);
      }
    }
    getListItem(args) {
      const list = loadValue(args.KEY, []);
      if (!Array.isArray(list)) return '';
      const index = (Number(args.INDEX) || 1) - 1;
      return list[index] ?? '';
    }
    getListLength(args) {
      const list = loadValue(args.KEY, []);
      return Array.isArray(list) ? list.length : 0;
    }

    saveHighScore(args) {
      const scores = loadValue('__highscores__', []);
      const arr = Array.isArray(scores) ? scores : [];
      const playerName = String(args.NAME);
      const scoreValue = Number(args.SCORE) || 0;

      const existing = arr.find(s => s.name === playerName);
      if (existing) {
        if (scoreValue > existing.score) {
          existing.score = scoreValue; 
          existing.time = timestamp();
        }
      } else {
        arr.push({ name: playerName, score: scoreValue, time: timestamp() });
      }

      arr.sort((a, b) => b.score - a.score); 
      saveValue('__highscores__', arr.slice(0, 100)); 
    }

    getHighScores(args) {
      const scores = loadValue('__highscores__', []);
      const n = Math.max(1, Number(args.N) || 5);
      if (!Array.isArray(scores) || scores.length === 0) return 'Таблица пуста';
      return scores.slice(0, n).map((s, i) => `${i + 1}. ${s.name}: ${s.score}`).join('\n');
    }

    getBestScore() {
      const scores = loadValue('__highscores__', []);
      return (Array.isArray(scores) && scores.length > 0) ? scores[0].score : 0;
    }

    clearHighScores() { deleteValue('__highscores__'); }

    getSpritesMenu() { return getSprites(); }
  }

  Scratch.extensions.register(new MegaProUltraMaxSave());

  console.log('🎉 [MEGASAVE] МЕГА ПРО УЛЬТРА МАКС Сохранение загружено!');
  console.log('💾 Версия:', CONFIG.version);

})(Scratch);
