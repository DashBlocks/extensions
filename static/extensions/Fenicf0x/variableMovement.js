// Name: Variable Window Mover
// ID: variablewindowmover
// Description: Move variable and list monitors ("variable windows") around the stage with blocks.
// By: Fenicf0x <https://scratch.mit.edu/users/Fenicf0x>
// License: MIT

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Variable Window Mover must be loaded unsandboxed (check "Run without sandbox" when loading it).');
  }
  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const iconURI = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI0MjguNzk5MSIgaGVpZ2h0PSIxNTEuOTM1OTEiIHZpZXdCb3g9IjAsMCw0MjguNzk5MSwxNTEuOTM1OTEiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zLjk0MywtNjYuMzUzMTQpIj48ZyBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiPjxnIHN0cm9rZS1saW5lY2FwPSJidXR0Ij48cGF0aCBkPSJNNTQuNTA3OTIsMjE2LjAzOTA2Yy0yLjc2MTQyLDAgLTUsLTIuMjM4NTggLTUsLTV2LTYyLjA3ODA5YzAsLTIuNzYxNDIgMi4yMzg1OCwtNSA1LC01aDM3MC45ODQxOGMyLjc2MTQyLDAgNSwyLjIzODU4IDUsNXY2Mi4wNzgwOWMwLDIuNzYxNDIgLTIuMjM4NTgsNSAtNSw1eiIgZmlsbD0iI2U2ZjBmZiIgc3Ryb2tlPSIjYzNjY2Q5IiBzdHJva2Utd2lkdGg9IjQuNSIvPjx0ZXh0IHRyYW5zZm9ybT0idHJhbnNsYXRlKDc3LjUzODI5LDE5Mi4xOTAyMikgc2NhbGUoMC43ODYwOCwwLjc4NjA4KSIgZm9udC1zaXplPSI0MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgZmlsbD0iIzU3NWU3NSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZvbnQtZmFtaWx5PSJTYW5zIFNlcmlmIiBmb250LXdlaWdodD0ibm9ybWFsIiB0ZXh0LWFuY2hvcj0ic3RhcnQiPjx0c3BhbiB4PSIwIiBkeT0iMCI+bXkgdmFyaWFibGU8L3RzcGFuPjwvdGV4dD48cGF0aCBkPSJNMzA0LjQ5MzA0LDIwMS43Mzc4NmMtMi43NjE0MiwwIC01LC0yLjIzODU4IC01LC01di0zNS43NjM4N2MwLC0yLjc2MTQyIDIuMjM4NTgsLTUgNSwtNWg5OC42ODkxOGMyLjc2MTQyLDAgNSwyLjIzODU4IDUsNXYzNS43NjM4N2MwLDIuNzYxNDIgLTIuMjM4NTgsNSAtNSw1eiIgZmlsbD0iI2ZmOGMxYSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjAiLz48dGV4dCB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNDUuMjU2OSwxODkuMzk5NjIpIHNjYWxlKDAuNzc2MSwwLjc3NjEpIiBmb250LXNpemU9IjQwIiB4bWw6c3BhY2U9InByZXNlcnZlIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZm9udC1mYW1pbHk9IlNhbnMgU2VyaWYiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHRleHQtYW5jaG9yPSJzdGFydCI+PHRzcGFuIHg9IjAiIGR5PSIwIj4wPC90c3Bhbj48L3RleHQ+PC9nPjxwYXRoIGQ9Ik0zNDYuMjg2NTgsNjguNjAzMTVsNzIuNjUwMTQsNjUuMjEzNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzNjY2Q5IiBzdHJva2Utd2lkdGg9IjQuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQyLjM4MDQ4LDEzOC44MTY2NWwtMTUuMjk0NzYsLTEzLjcyOTE1IiBmaWxsPSJub25lIiBzdHJva2U9IiNjM2NjZDkiIHN0cm9rZS13aWR0aD0iNC41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNDEuMDg3OTUsMjAyLjczNzYybC0zNC44OTQ5NSwtMzEuMzIzMDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2MzY2NkOSIgc3Ryb2tlLXdpZHRoPSI0LjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMjkuMTgzMzksMTE5Ljc5MDYxbC0yNi43MzU3MywtMjMuOTk5IiBmaWxsPSJub25lIiBzdHJva2U9IiNjM2NjZDkiIHN0cm9rZS13aWR0aD0iNC41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMjEyLjEzMjUsMTAzLjU2MTc2bDM3LjAzMjYsMzMuMjQxODYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2MzY2NkOSIgc3Ryb2tlLXdpZHRoPSI0LjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjIzNi4wNTcwMDQ5OTk5OTk5ODoxMTMuNjQ2ODU1LS0+'
 //Cordinates use the cordinates from scratch/turbowarp

  const VAR_TYPES = ['', 'list'];

  const findVariable = (name, target) => {
    name = Scratch.Cast.toString(name);
    if (target) {
      for (const type of VAR_TYPES) {
        const v = target.lookupVariableByNameAndType(name, type);
        if (v) return v;
      }
    }
    // Fall back to any sprite's local variable with that name.
    for (const t of runtime.targets) {
      if (!t.isOriginal) continue;
      for (const id of Object.keys(t.variables)) {
        const v = t.variables[id];
        if (v.name === name && VAR_TYPES.includes(v.type)) return v;
      }
    }
    return null;
  };

  const getRecord = (id) => runtime._monitorState.get(id);

  const num = (v) => (typeof v === 'number' && !isNaN(v) ? v : 0);

//Makes monitor move, even if invsisble
  const ensureMonitor = (variable, target) => {
    if (getRecord(variable.id)) return true;
    const isList = variable.type === 'list';
    const opcode = isList ? 'data_listcontents' : 'data_variable';
    const field = isList ? 'LIST' : 'VARIABLE';
    const isLocal = !runtime.getTargetForStage().variables[variable.id];
    let owner = null;
    if (isLocal) {
      owner = runtime.targets.find((t) => t.isOriginal && t.variables[variable.id]) || target;
    }
    try {
      if (!runtime.monitorBlocks.getBlock(variable.id)) {
        runtime.monitorBlocks.createBlock({
          id: variable.id,
          opcode,
          inputs: {},
          fields: {[field]: {name: field, id: variable.id, value: variable.name, variableType: variable.type}},
          next: null,
          parent: null,
          topLevel: true,
          shadow: false,
          x: 0,
          y: 0,
          isMonitored: false,
          targetId: owner ? owner.id : null
        });
      }
      const block = runtime.monitorBlocks.getBlock(variable.id);
      if (owner) block.targetId = owner.id;
      // Show then hide in the same frame: creates the monitor record without flicker.
      runtime.monitorBlocks.changeBlock({id: variable.id, element: 'checkbox', value: true}, runtime);
      runtime.monitorBlocks.changeBlock({id: variable.id, element: 'checkbox', value: false}, runtime);
    } catch (e) {
      console.warn('Variable Window Mover: could not create monitor', e);
    }
    return !!getRecord(variable.id);
  };

//Makes x/y work properly
 
  let cachedStore = null;
  const getReduxStore = () => {
    if (cachedStore) return cachedStore;
    if (typeof document === 'undefined') return null;
    const start = document.querySelector('.monitor-overlay') || document.querySelector('[class*="stage-wrapper"]');
    if (!start) return null;
    const key = Object.keys(start).find((k) => k.startsWith('__reactInternalInstance$') || k.startsWith('__reactFiber$'));
    let fiber = key ? start[key] : null;
    while (fiber) {
      const props = fiber.memoizedProps;
      if (props && props.store && typeof props.store.dispatch === 'function' && typeof props.store.getState === 'function') {
        cachedStore = props.store;
        return cachedStore;
      }
      fiber = fiber.return;
    }
    return null;
  };

  const parseTranslate = (el) => {
    const m = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\s*\)/.exec(el.style.transform || '');
    return m ? {x: parseFloat(m[1]), y: parseFloat(m[2])} : {x: 0, y: 0};
  };

  const syncEditor = (id, x, y) => {
    if (typeof document === 'undefined') return;
    try {
      const sel = `.monitor-overlay [data-id="${CSS.escape(id)}"]`;
      for (const el of document.querySelectorAll(sel)) {
        // react-draggable leaves a translate() on the element after a drag.
        const t = parseTranslate(el);
        el.style.left = `${Math.round(x - t.x)}px`;
        el.style.top = `${Math.round(y - t.y)}px`;
      }
      const store = getReduxStore();
      if (!store) return;
      const state = store.getState();
      const layout = state && state.scratchGui && state.scratchGui.monitorLayout;
      if (!layout) return;
      const rx = Math.round(x);
      const ry = Math.round(y);
      if (layout.monitors[id]) {
        store.dispatch({type: 'scratch-gui/monitors/MOVE_MONITOR_RECT', monitorId: id, newX: rx, newY: ry});
      } else {
        //remembers position when hidden
        store.dispatch({
          type: 'scratch-gui/monitors/ADD_MONITOR_RECT',
          monitorId: id,
          upperStart: {x: rx, y: ry},
          lowerEnd: {x: rx + 1, y: ry + 1},
          savePosition: true
        });
        store.dispatch({type: 'scratch-gui/monitors/REMOVE_MONITOR_RECT', monitorId: id});
      }
    } catch (e) {
      console.warn('Variable Window Mover: editor sync failed', e);
    }
  };

  //Core blocks

  const moveMonitor = (name, target, x, y) => {
    const variable = findVariable(name, target);
    if (!variable) return;
    if (!ensureMonitor(variable, target)) return;
    x = Scratch.Cast.toNumber(x);
    y = Scratch.Cast.toNumber(y);
    runtime.requestUpdateMonitor({id: variable.id, x, y});
    syncEditor(variable.id, x, y);
  };

  const getPosition = (name, target) => {
    const variable = findVariable(name, target);
    if (!variable) return null;
    const record = getRecord(variable.id);
    if (!record) return null;
    return {x: num(record.get('x')), y: num(record.get('y'))};
  };

  const getSize = (name, target) => {
    const variable = findVariable(name, target);
    if (!variable) return null;
    if (typeof document !== 'undefined') {
      const el = document.querySelector(
        `.monitor-overlay [data-id="${CSS.escape(variable.id)}"], .sc-monitor-root[data-id="${CSS.escape(variable.id)}"]`
      );
      if (el && el.offsetWidth) return {width: el.offsetWidth, height: el.offsetHeight};
    }
    const record = getRecord(variable.id);
    if (!record) return null;
    return {width: num(record.get('width')), height: num(record.get('height'))};
  };

  class VariableWindowMover {
    getInfo () {
      return {
        id: 'variablewindowmover',
        name: 'Variable Movement',
        menuIconURI: iconURI,
        color1: '#ff8c1a',
        color2: '#db6e00',
        color3: '#c25f00',
        blocks: [
          {
            opcode: 'moveTo',
            blockType: Scratch.BlockType.COMMAND,
            text: 'move window of [VAR] to x: [X] y: [Y]',
            arguments: {
              VAR: {type: Scratch.ArgumentType.STRING, menu: 'variables'},
              X: {type: Scratch.ArgumentType.NUMBER, defaultValue: 10},
              Y: {type: Scratch.ArgumentType.NUMBER, defaultValue: 10}
            }
          },
          {
            opcode: 'glideTo',
            blockType: Scratch.BlockType.COMMAND,
            text: 'glide window of [VAR] to x: [X] y: [Y] in [SECS] secs',
            arguments: {
              VAR: {type: Scratch.ArgumentType.STRING, menu: 'variables'},
              X: {type: Scratch.ArgumentType.NUMBER, defaultValue: 200},
              Y: {type: Scratch.ArgumentType.NUMBER, defaultValue: 150},
              SECS: {type: Scratch.ArgumentType.NUMBER, defaultValue: 1}
            }
          },
          '---',
          {
            opcode: 'changeBy',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change window of [VAR] [AXIS] by [N]',
            arguments: {
              VAR: {type: Scratch.ArgumentType.STRING, menu: 'variables'},
              AXIS: {type: Scratch.ArgumentType.STRING, menu: 'axis', defaultValue: 'x'},
              N: {type: Scratch.ArgumentType.NUMBER, defaultValue: 10}
            }
          },
          {
            opcode: 'setTo',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set window of [VAR] [AXIS] to [N]',
            arguments: {
              VAR: {type: Scratch.ArgumentType.STRING, menu: 'variables'},
              AXIS: {type: Scratch.ArgumentType.STRING, menu: 'axis', defaultValue: 'x'},
              N: {type: Scratch.ArgumentType.NUMBER, defaultValue: 0}
            }
          },
          {
            opcode: 'center',
            blockType: Scratch.BlockType.COMMAND,
            text: 'move window of [VAR] to center of stage',
            arguments: {
              VAR: {type: Scratch.ArgumentType.STRING, menu: 'variables'}
            }
          },
          '---',
          {
            opcode: 'getProp',
            blockType: Scratch.BlockType.REPORTER,
            text: '[PROP] of window of [VAR]',
            arguments: {
              PROP: {type: Scratch.ArgumentType.STRING, menu: 'props', defaultValue: 'x'},
              VAR: {type: Scratch.ArgumentType.STRING, menu: 'variables'}
            }
          },
          {
            opcode: 'isShown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'window of [VAR] shown?',
            arguments: {
              VAR: {type: Scratch.ArgumentType.STRING, menu: 'variables'}
            }
          },
          {
            opcode: 'setShown',
            blockType: Scratch.BlockType.COMMAND,
            text: '[ACTION] window of [VAR]',
            arguments: {
              ACTION: {type: Scratch.ArgumentType.STRING, menu: 'showHide', defaultValue: 'show'},
              VAR: {type: Scratch.ArgumentType.STRING, menu: 'variables'}
            }
          }
        ],
        menus: {
          variables: {acceptReporters: true, items: 'getVariableMenu'},
          axis: {acceptReporters: false, items: ['x', 'y']},
          props: {acceptReporters: false, items: ['x', 'y', 'width', 'height']},
          showHide: {acceptReporters: false, items: ['show', 'hide']}
        }
      };
    }

    getVariableMenu () {
      const names = [];
      const add = (target) => {
        if (!target) return;
        for (const id of Object.keys(target.variables)) {
          const v = target.variables[id];
          if (VAR_TYPES.includes(v.type) && !names.includes(v.name)) names.push(v.name);
        }
      };
      add(runtime.getTargetForStage());
      add(runtime.getEditingTarget());
      if (names.length === 0) return [{text: '(no variables)', value: ''}];
      return names.sort((a, b) => a.localeCompare(b));
    }

    moveTo (args, util) {
      moveMonitor(args.VAR, util.target, args.X, args.Y);
    }

    glideTo (args, util) {
      if (!util.stackFrame.timer) {
        const start = getPosition(args.VAR, util.target);
        const secs = Scratch.Cast.toNumber(args.SECS);
        const endX = Scratch.Cast.toNumber(args.X);
        const endY = Scratch.Cast.toNumber(args.Y);
        if (!start || secs <= 0) {
          moveMonitor(args.VAR, util.target, endX, endY);
          return;
        }
        util.stackFrame.timer = {start: runtime.currentMSecs};
        util.stackFrame.duration = secs * 1000;
        util.stackFrame.startX = start.x;
        util.stackFrame.startY = start.y;
        util.stackFrame.endX = endX;
        util.stackFrame.endY = endY;
        util.yield();
        return;
      }
      const f = util.stackFrame;
      const elapsed = runtime.currentMSecs - f.timer.start;
      if (elapsed < f.duration) {
        const t = elapsed / f.duration;
        moveMonitor(args.VAR, util.target, f.startX + (f.endX - f.startX) * t, f.startY + (f.endY - f.startY) * t);
        util.yield();
      } else {
        moveMonitor(args.VAR, util.target, f.endX, f.endY);
      }
    }

    changeBy (args, util) {
      const pos = getPosition(args.VAR, util.target) || {x: 0, y: 0};
      const n = Scratch.Cast.toNumber(args.N);
      if (args.AXIS === 'y') moveMonitor(args.VAR, util.target, pos.x, pos.y + n);
      else moveMonitor(args.VAR, util.target, pos.x + n, pos.y);
    }

    setTo (args, util) {
      const pos = getPosition(args.VAR, util.target) || {x: 0, y: 0};
      const n = Scratch.Cast.toNumber(args.N);
      if (args.AXIS === 'y') moveMonitor(args.VAR, util.target, pos.x, n);
      else moveMonitor(args.VAR, util.target, n, pos.y);
    }

    center (args, util) {
      const size = getSize(args.VAR, util.target) || {width: 0, height: 0};
      moveMonitor(
        args.VAR,
        util.target,
        (runtime.stageWidth - size.width) / 2,
        (runtime.stageHeight - size.height) / 2
      );
    }

    getProp (args, util) {
      if (args.PROP === 'width' || args.PROP === 'height') {
        const size = getSize(args.VAR, util.target);
        return size ? size[args.PROP] : 0;
      }
      const pos = getPosition(args.VAR, util.target);
      if (!pos) return 0;
      return args.PROP === 'y' ? pos.y : pos.x;
    }

    isShown (args, util) {
      const variable = findVariable(args.VAR, util.target);
      if (!variable) return false;
      const record = getRecord(variable.id);
      return !!(record && record.get('visible'));
    }

    setShown (args, util) {
      const variable = findVariable(args.VAR, util.target);
      if (!variable) return;
      if (!ensureMonitor(variable, util.target)) return;
      runtime.monitorBlocks.changeBlock(
        {id: variable.id, element: 'checkbox', value: args.ACTION !== 'hide'},
        runtime
      );
    }
  }

  Scratch.extensions.register(new VariableWindowMover());
})(Scratch);
