(function(Scratch) { 
 'use strict';
  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Extension MUST run unsandboxed!');
  }
  const vm = Scratch.vm;
  let currentGameId = 'MyGame';
  let currentSlot = '1';
  let encryptionKey = 'DefaultKey';
  let achievementsDB = {};
  let lastUnlockedID = '';
  let jsonCache = {};
  const LZW = {
    compress: function(s) {
        var dict = {};
        var data = (s + "").split("");
        var out = [];
        var currChar;
        var phrase = data[0];
        var code = 256;
        for (var i = 1; i < data.length; i++) {
            currChar = data[i];
            if (dict[phrase + currChar] != null) {
                phrase += currChar;
            } else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase = currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        for (var i = 0; i < out.length; i++) {
            out[i] = String.fromCharCode(out[i]);
        }
        return out.join("");
    },
    decompress: function(s) {
        var dict = {};
        var data = (s + "").split("");
        var currChar = data[0];
        var oldPhrase = currChar;
        var out = [currChar];
        var code = 256;
        var phrase;
        for (var i = 1; i < data.length; i++) {
            var currCode = data[i].charCodeAt(0);
            if (currCode < 256) {
                phrase = data[i];
            } else {
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            dict[code] = oldPhrase + currChar;
            code++;
            oldPhrase = phrase;
        }
        return out.join("");
    }
  };
  class AutoSaveTitanium {
    getInfo() {
      return {
        id: 'qbacksAutoSave',
        name: 'AutoSave',
        color1: '#37474F', 
        color2: '#263238', 
        color3: '#FFD600', 
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: 'System Controls' },
          {
            opcode: 'config',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Configure game: ID [ID] | Key [KEY]',
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'RPG_v1' },
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'Secret' }
            }
          },
          {
            opcode: 'setSlot',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Set Slot: [NUM]',
            arguments: { NUM: { type: Scratch.ArgumentType.STRING, defaultValue: '1' } }
          },
          {
            opcode: 'getCurrentSlot',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Current Slot',
            disableMonitor: true
          },
          {
            opcode: 'copySlot',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Copy Slot [FROM] to Slot [TO]',
            arguments: {
              FROM: { type: Scratch.ArgumentType.STRING, defaultValue: '1' },
              TO: { type: Scratch.ArgumentType.STRING, defaultValue: '2' }
            }
          },
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Slot Data' },
          {
            opcode: 'saveVar',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Save variable [VAL] as [NAME]',
            arguments: {
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: '100' },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'score' }
            }
          },
          {
            opcode: 'loadVar',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Load variable [NAME] (or [DEF])',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'score' },
              DEF: { type: Scratch.ArgumentType.STRING, defaultValue: '0' }
            }
          },
          {
            opcode: 'saveList',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Save list [LIST] as [NAME]',
            arguments: {
              LIST: { type: Scratch.ArgumentType.STRING, menu: 'listsMenu' },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'inv' }
            }
          },
          {
            opcode: 'loadList',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Load list [LIST] from [NAME]',
            arguments: {
              LIST: { type: Scratch.ArgumentType.STRING, menu: 'listsMenu' },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'inv' }
            }
          },
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'База Данных (JSON)' },
          {
            opcode: 'jsonSet',
            blockType: Scratch.BlockType.COMMAND,
            text: 'In object [OBJ] write key [KEY] = [VAL]',
            arguments: {
              OBJ: { type: Scratch.ArgumentType.STRING, defaultValue: 'Stats' },
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'hp' },
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: '100' }
            }
          },
          {
            opcode: 'jsonGet',
            blockType: Scratch.BlockType.REPORTER,
            text: 'From object [OBJ] get key [KEY]',
            arguments: {
              OBJ: { type: Scratch.ArgumentType.STRING, defaultValue: 'Stats' },
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'hp' }
            }
          },
          {
            opcode: 'jsonSave',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Save object [OBJ] to disk',
            arguments: { OBJ: { type: Scratch.ArgumentType.STRING, defaultValue: 'Stats' } }
          },
          {
            opcode: 'jsonLoad',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Load object [OBJ] from disk',
            arguments: { OBJ: { type: Scratch.ArgumentType.STRING, defaultValue: 'Stats' } }
          },
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Ачивки и Глобал' },
          {
            opcode: 'saveGlobal',
            blockType: Scratch.BlockType.COMMAND,
            text: 'GLOBAL: Save [VAL] as [NAME]',
            arguments: {
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: 'true' },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'GameBeaten' }
            }
          },
          {
            opcode: 'loadGlobal',
            blockType: Scratch.BlockType.REPORTER,
            text: 'GLOBAL: Load [NAME] (or [DEF])',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'GameBeaten' },
              DEF: { type: Scratch.ArgumentType.STRING, defaultValue: 'false' }
            }
          },
          {
            opcode: 'registerAch',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Register achievement: ID [ID] Name [NAME] Description [DESC]',
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'WIN' },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Victory' },
              DESC: { type: Scratch.ArgumentType.STRING, defaultValue: 'Complete the game' }
            }
          },
          {
            opcode: 'registerAchProgress',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Progress settings: ID [ID] Target [TARGET] Stat [STAT]',
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'KILLER' },
              TARGET: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
              STAT: { type: Scratch.ArgumentType.STRING, defaultValue: 'kills' }
            }
          },
          {
            opcode: 'addStat',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Add [VAL] to stat [STAT]',
            arguments: {
              VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              STAT: { type: Scratch.ArgumentType.STRING, defaultValue: 'kills' }
            }
          },
          {
            opcode: 'whenUnlocked',
            blockType: Scratch.BlockType.HAT,
            text: 'When achievement unlocked',
            isEdgeActivated: false
          },
          {
            opcode: 'getLastAchInfo',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Info of last achievement: [TYPE]',
            arguments: { TYPE: { type: Scratch.ArgumentType.STRING, menu: 'achInfoMenu' } }
          },
          {
            opcode: 'getAchData',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Data of achievement [ID]: [TYPE]',
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'WIN' },
              TYPE: { type: Scratch.ArgumentType.STRING, menu: 'achFullMenu' }
            }
          },
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Управление Файлами' },
          {
            opcode: 'saveTimestamp',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Write save timestamp'
          },
          {
            opcode: 'getLastSaveTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Time of last save',
            disableMonitor: true
          },
          {
            opcode: 'slotExists',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'Slot [NUM] occupied?',
            arguments: { NUM: { type: Scratch.ArgumentType.STRING, defaultValue: '1' } }
          },
          {
            opcode: 'generateSaveCode',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Get compressed save code',
            disableMonitor: true
          },
          {
            opcode: 'loadFromSaveCode',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Load from code: [CODE]',
            arguments: { CODE: { type: Scratch.ArgumentType.STRING, defaultValue: '' } }
          },
          {
            opcode: 'downloadKey',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Download Slot as file',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'backup' } }
          },
          {
            opcode: 'uploadKey',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Upload file to Slot',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'backup' } }
          },
          {
             opcode: 'wipeSlot',
             blockType: Scratch.BlockType.COMMAND,
             text: 'Delete slot data (Wipe)'
          }
        ],
        menus: {
          listsMenu: { acceptReporters: true, items: 'getLists' },
          achInfoMenu: { items: ['ID', 'Name', 'Description'] },
          achFullMenu: { items: ['Name', 'Description', 'Unlocked? (true/false)', 'Progress', 'Target'] }
        }
      };
    }
    _makeKeyNew(varName) { return 'AS_' + currentGameId + '_S' + currentSlot + '_' + varName; }
    _makeKeyOld(varName) { return 'AS_' + currentGameId + '_' + varName; }
    _makeKeyGlobal(varName) { return 'AS_' + currentGameId + '_GLOBAL_' + varName; }
    _makeKeyAch(id) { return 'AS_' + currentGameId + '_ACH_' + id; }
    _encrypt(text) {
      if (!encryptionKey) return text;
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
        result += String.fromCharCode(charCode);
      }
      return btoa(unescape(encodeURIComponent(result)));
    }
    _decrypt(encoded) {
      if (!encryptionKey) return encoded;
      try {
        const text = decodeURIComponent(escape(atob(encoded)));
        let result = '';
        for (let i = 0; i < text.length; i++) {
          const charCode = text.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
          result += String.fromCharCode(charCode);
        }
        return result;
      } catch (e) { return null; }
    }
    _findList(listName, util) {
      let list = util.target.lookupVariableByNameAndType(listName, 'list');
      if (!list) {
         const stage = vm.runtime.getTargetForStage();
         if (stage) list = stage.lookupVariableByNameAndType(listName, 'list');
      }
      return list;
    }
    config(args) { currentGameId = args.ID; encryptionKey = args.KEY; }
    setSlot(args) { currentSlot = args.NUM; }
    getCurrentSlot() { return currentSlot; }
    saveVar(args) {
      const val = this._encrypt(String(args.VAL));
      localStorage.setItem(this._makeKeyNew(args.NAME), val);
    }
    loadVar(args) {
      const newKey = this._makeKeyNew(args.NAME);
      let raw = localStorage.getItem(newKey);
      if (raw === null && currentSlot == '1') {
          const oldKey = this._makeKeyOld(args.NAME);
          raw = localStorage.getItem(oldKey);
          if (raw !== null) {
              localStorage.setItem(newKey, raw);
              localStorage.removeItem(oldKey);
          }
      }
      if (raw === null) return args.DEF;
      const dec = this._decrypt(raw);
      return dec === null ? args.DEF : dec;
    }
    saveList(args, util) {
      const list = this._findList(args.LIST, util);
      if (!list) return;
      const jsonString = JSON.stringify(list.value);
      const encrypted = this._encrypt(jsonString);
      localStorage.setItem(this._makeKeyNew(args.NAME), encrypted);
    }
    loadList(args, util) {
      const list = this._findList(args.LIST, util);
      if (!list) return;
      const newKey = this._makeKeyNew(args.NAME);
      let raw = localStorage.getItem(newKey);
      if (!raw && currentSlot == '1') {
           const oldKey = this._makeKeyOld(args.NAME);
           raw = localStorage.getItem(oldKey);
           if (raw) {
               localStorage.setItem(newKey, raw);
               localStorage.removeItem(oldKey);
           }
      }
      if (!raw) return;
      const decrypted = this._decrypt(raw);
      if (!decrypted) return;
      try {
        const arrayData = JSON.parse(decrypted);
        if (Array.isArray(arrayData)) {
            list.value = arrayData;
            list._monitorUpToDate = false; 
        }
      } catch (e) {}
    }
    jsonSet(args) {
        const objName = args.OBJ;
        if (!jsonCache[objName]) jsonCache[objName] = {};
        const val = args.VAL;
        jsonCache[objName][args.KEY] = isNaN(Number(val)) ? val : Number(val);
    }
    jsonGet(args) {
        const objName = args.OBJ;
        if (!jsonCache[objName]) return '';
        const val = jsonCache[objName][args.KEY];
        return (val === undefined) ? '' : val;
    }
    jsonSave(args) {
        const objName = args.OBJ;
        const data = jsonCache[objName] || {};
        const encrypted = this._encrypt(JSON.stringify(data));
        localStorage.setItem(this._makeKeyNew('JSON_' + objName), encrypted);
    }
    jsonLoad(args) {
        const objName = args.OBJ;
        const raw = localStorage.getItem(this._makeKeyNew('JSON_' + objName));
        if (!raw) { jsonCache[objName] = {}; return; }
        const decrypted = this._decrypt(raw);
        if (decrypted) {
            try { jsonCache[objName] = JSON.parse(decrypted); } 
            catch(e) { jsonCache[objName] = {}; }
        }
    }
    saveGlobal(args) {
        localStorage.setItem(this._makeKeyGlobal(args.NAME), this._encrypt(String(args.VAL)));
    }
    loadGlobal(args) {
        const raw = localStorage.getItem(this._makeKeyGlobal(args.NAME));
        if (!raw) return args.DEF;
        const dec = this._decrypt(raw);
        return dec || args.DEF;
    }
    registerAch(args) {
        if (!achievementsDB[args.ID]) achievementsDB[args.ID] = {};
        achievementsDB[args.ID].name = args.NAME;
        achievementsDB[args.ID].desc = args.DESC;
        if (achievementsDB[args.ID].target === undefined) {
             achievementsDB[args.ID].target = 0;
             achievementsDB[args.ID].stat = null;
        }
    }
    registerAchProgress(args) {
        if (!achievementsDB[args.ID]) achievementsDB[args.ID] = {};
        achievementsDB[args.ID].target = args.TARGET;
        achievementsDB[args.ID].stat = args.STAT;
    }
    addStat(args) {
        const statName = args.STAT;
        const addVal = Number(args.VAL);
        let currentVal = Number(this.loadGlobal({NAME: statName, DEF: 0}));
        currentVal += addVal;
        this.saveGlobal({NAME: statName, VAL: currentVal});
        for (const id in achievementsDB) {
            const ach = achievementsDB[id];
            if (ach.stat === statName) {
                const status = this._getAchStatus(id);
                if (!status.unlocked && currentVal >= ach.target) {
                    this._unlockAch(id);
                }
            }
        }
    }
    _getAchStatus(id) {
        const raw = localStorage.getItem(this._makeKeyAch(id));
        if (!raw) return { unlocked: false };
        const dec = this._decrypt(raw);
        return dec ? JSON.parse(dec) : { unlocked: false };
    }
    _unlockAch(id) {
        const status = this._getAchStatus(id);
        if (status.unlocked) return;
        status.unlocked = true;
        localStorage.setItem(this._makeKeyAch(id), this._encrypt(JSON.stringify(status)));
        lastUnlockedID = id;
        vm.runtime.startHats('qbacksAutoSave_whenUnlocked');
    }
    whenUnlocked() { return false; }
    getLastAchInfo(args) {
        if (!lastUnlockedID || !achievementsDB[lastUnlockedID]) return 'Unknown';
        if (args.TYPE === 'ID') return lastUnlockedID;
        if (args.TYPE === 'Name') return achievementsDB[lastUnlockedID].name;
        if (args.TYPE === 'Description') return achievementsDB[lastUnlockedID].desc;
        return '';
    }
    getAchData(args) {
        const id = args.ID;
        const info = achievementsDB[id] || { name: id, desc: '??', target: 0 };
        const status = this._getAchStatus(id);
        if (args.TYPE === 'Name') return info.name;
        if (args.TYPE === 'Description') return info.desc;
        if (args.TYPE === 'Unlocked? (true/false)') return status.unlocked;
        if (args.TYPE === 'Target') return info.target;
        if (args.TYPE === 'Progress') {
            if (!info.stat) return status.unlocked ? 1 : 0;
            return this.loadGlobal({NAME: info.stat, DEF: 0});
        }
        return '';
    }
    generateSaveCode() {
        const saveData = {};
        const prefix = this._makeKeyNew('');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                const varName = key.replace(prefix, '');
                saveData[varName] = localStorage.getItem(key);
            }
        }
        const json = JSON.stringify(saveData);
        const encrypted = this._encrypt(json);
        const compressed = LZW.compress(encrypted);
        return btoa(unescape(encodeURIComponent(compressed)));
    }
    loadFromSaveCode(args) {
        if (!args.CODE) return;
        try {
            const compressed = decodeURIComponent(escape(atob(args.CODE)));
            const encrypted = LZW.decompress(compressed);
            const json = this._decrypt(encrypted);
            if (!json) return; 
            const saveData = JSON.parse(json);
            if (!saveData || typeof saveData !== 'object') {
                console.warn('AutoSave: Corrupted Code');
                return;
            }
            this.wipeSlot();
            const prefix = this._makeKeyNew('');
            Object.keys(saveData).forEach(varName => {
                if (saveData[varName] !== undefined) {
                    localStorage.setItem(prefix + varName, saveData[varName]);
                }
            });
        } catch (e) { console.warn('Bad Code', e); }
    }
    downloadKey(args) {
      const key = this._makeKeyNew(args.NAME);
      const data = localStorage.getItem(key);
      if (!data) return;
      const blob = new Blob([data], {type: "text/plain"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentGameId}_Slot${currentSlot}_${args.NAME}.save`; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    uploadKey(args) {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.save';
      input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = re => {
          localStorage.setItem(this._makeKeyNew(args.NAME), re.target.result);
          alert('File uploaded!');
        };
        reader.readAsText(file);
      };
      input.click();
    }
    saveTimestamp() {
        const now = new Date().toLocaleString();
        localStorage.setItem(this._makeKeyNew('_TIMESTAMP'), this._encrypt(now));
    }
    getLastSaveTime() {
        const raw = localStorage.getItem(this._makeKeyNew('_TIMESTAMP'));
        if (!raw) return 'No data';
        const dec = this._decrypt(raw);
        return dec || 'Error';
    }
    slotExists(args) {
        const savedSlot = currentSlot;
        currentSlot = args.NUM;
        let exists = localStorage.getItem(this._makeKeyNew('_TIMESTAMP')) !== null;
        if (!exists && currentSlot == '1') {
             const prefix = 'AS_' + currentGameId + '_';
             for (let i = 0; i < localStorage.length; i++) {
                 const key = localStorage.key(i);
                 if (key.startsWith(prefix) && !key.includes('_S')) { exists = true; break; }
             }
        }
        currentSlot = savedSlot;
        return exists;
    }
    copySlot(args) {
        const from = args.FROM; const to = args.TO;
        if (from === to) return;
        const pTo = 'AS_' + currentGameId + '_S' + to + '_';
        Object.keys(localStorage).forEach(k => { if (k.startsWith(pTo)) localStorage.removeItem(k); });
        const pFrom = 'AS_' + currentGameId + '_S' + from + '_';
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith(pFrom)) {
                const varName = k.replace(pFrom, '');
                localStorage.setItem('AS_' + currentGameId + '_S' + to + '_' + varName, localStorage.getItem(k));
            }
        });
    }
    wipeSlot() {
       const prefix = this._makeKeyNew('');
       Object.keys(localStorage).forEach(k => { if (k.startsWith(prefix)) localStorage.removeItem(k); });
    }
    getLists() {
      const lists = [];
      const targets = vm.runtime.targets;
      for (const target of targets) {
        for (const id in target.variables) {
          const v = target.variables[id];
          if (v.type === 'list') { if (!lists.includes(v.name)) lists.push(v.name); }
        }
      }
      return lists.length > 0 ? lists : ['Create a list!'];
    }
  }
  Scratch.extensions.register(new AutoSaveTitanium());
})(Scratch);
