/* Author: ABDev */
(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Console++++ must be loaded as an unsandboxed extension.');
    }

    const fgCodes = {
        'чёрный': 30, 'красный': 31, 'зелёный': 32, 'жёлтый': 33,
        'синий': 34, 'пурпурный': 35, 'бирюзовый': 36, 'светло-серый': 37,
        'серый': 90, 'ярко-красный': 91, 'ярко-зелёный': 92,
        'ярко-жёлтый': 93, 'ярко-синий': 94, 'ярко-пурпурный': 95,
        'ярко-бирюзовый': 96, 'белый': 97
    };
    const bgCodes = {
        'чёрный': 40, 'красный': 41, 'зелёный': 42, 'жёлтый': 43,
        'синий': 44, 'пурпурный': 45, 'бирюзовый': 46, 'светло-серый': 47,
        'серый': 100, 'ярко-красный': 101, 'ярко-зелёный': 102,
        'ярко-жёлтый': 103, 'ярко-синий': 104, 'ярко-пурпурный': 105,
        'ярко-бирюзовый': 106, 'белый': 107
    };
    const styleCodes = {
        'обычный': 0, 'жирный': 1, 'курсив': 3, 'подчёркнутый': 4,
        'зачёркнутый': 9, 'скрытый': 8
    };
    const logStyles = {
        'информация': {tag: 'INFO', color: 96},
        'успех': {tag: 'OK', color: 92},
        'предупреждение': {tag: 'WARN', color: 93},
        'ошибка': {tag: 'ERROR', color: 91},
        'отладка': {tag: 'DEBUG', color: 90}
    };

    const MAX_INPUT_LENGTH = 500;
    const MAX_HISTORY = 100;
    const BLINK_INTERVAL = 530;
    const ANSWER_PREFIX = '> ';
    
    const INPUT_MARKER = '\u200B';

    const BLANK_LINE = '\u00A0';

    const ESC = params => `\x1b[${params}m`;
    const RESET = ESC(0);
    const ANSI_RE = /\x1b\[[0-9;]*[A-Za-z]/g;

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const toInt = (value, fallback) => {
        const number = Math.floor(Number(value));
        return Number.isFinite(number) ? number : fallback;
    };
    const toChars = value => Array.from(String(value));
    const stripAnsi = value => String(value).replace(ANSI_RE, '');
    const cleanText = value => {
        const text = stripAnsi(value).replace(/^\u200B/, '');
        return text === BLANK_LINE ? '' : text;
    };
    const two = n => String(n).padStart(2, '0');
    const nowTime = () => {
        const date = new Date();
        return `${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())}`;
    };

    class ConsolePlusPlus {
        constructor () {
            
            this.foreground = null;
            
            this.background = null;
            
            this.styles = new Set();

            this.lastInput = '';
            this.lastInputCancelled = false;

            this._pendingAsks = 0;
            this._askGeneration = 0;
            this._askChain = Promise.resolve();
            this._activeAsk = null;
            this._history = [];

            this._warned = false;

            this._hookRuntime();
        }

        getInfo () {
            return {
                id: 'dashconsoleplusplus',
                name: 'Console+',
                author: 'AbdMaster2013',
                color1: '#1769aa', color2: '#12558a', color3: '#0d416b',
                blocks: [
                    {
                        opcode: 'clear',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'очистить консоль'
                    },
                    {
                        opcode: 'stage_mode',

                        func: 'set_stage_mode',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'переключить сцену на [MODE]',
                        arguments: {
                            MODE: {type: Scratch.ArgumentType.STRING, menu: 'stageModes'}
                        }
                    },
                    {
                        opcode: 'print_line',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'вывести строку [TEXT]',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Привет!'}
                        }
                    },
                    {
                        opcode: 'print_line_move',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'вывести строку [TEXT] и перейти на следующую',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Привет!'}
                        }
                    },
                    {
                        opcode: 'print_line_end',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'вывести строку [TEXT] в конец консоли',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Привет!'}
                        }
                    },
                    {
                        opcode: 'write',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'вписать [TEXT] у курсора',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'текст'}
                        }
                    },
                    {
                        opcode: 'reply',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'вывести ответ [TEXT]',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Готово'}
                        }
                    },
                    {
                        opcode: 'ask',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'спросить [PROMPT] и ждать ввод',
                        arguments: {
                            PROMPT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Как тебя зовут?'}
                        }
                    },
                    {
                        opcode: 'last_input',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'последний ввод'
                    },
                    {
                        opcode: 'is_input_pending',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'ждём ввод?'
                    },
                    {
                        opcode: 'print_colored',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'вывести [TEXT] цветом [COLOR]',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Сообщение'},
                            COLOR: {type: Scratch.ArgumentType.STRING, menu: 'colors'}
                        }
                    },
                    {
                        opcode: 'set_foreground',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'установить цвет текста [COLOR]',
                        arguments: {
                            COLOR: {type: Scratch.ArgumentType.STRING, menu: 'colors'}
                        }
                    },
                    {
                        opcode: 'set_background',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'установить фон текста [COLOR]',
                        arguments: {
                            COLOR: {type: Scratch.ArgumentType.STRING, menu: 'colors'}
                        }
                    },
                    {
                        opcode: 'set_style',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'установить стиль текста [STYLE]',
                        arguments: {
                            STYLE: {type: Scratch.ArgumentType.STRING, menu: 'styles'}
                        }
                    },
                    {
                        opcode: 'reset_style',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'сбросить цвет и стиль'
                    },
                    {
                        opcode: 'log',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'сообщение [KIND]: [TEXT]',
                        arguments: {
                            KIND: {type: Scratch.ArgumentType.STRING, menu: 'logKinds'},
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Сообщение'}
                        }
                    },
                    {
                        opcode: 'timestamp',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'вывести время и [TEXT]',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Событие'}
                        }
                    },
                    {
                        opcode: 'separator',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'разделитель [CHAR] длиной [COUNT]',
                        arguments: {
                            CHAR: {type: Scratch.ArgumentType.STRING, defaultValue: '-'},
                            COUNT: {type: Scratch.ArgumentType.NUMBER, defaultValue: 30}
                        }
                    },
                    {
                        opcode: 'replace_line',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'заменить текущую строку на [TEXT]',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Новая строка'}
                        }
                    },
                    {
                        opcode: 'replace_symbol',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'заменить символ у курсора на [TEXT]',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'А'}
                        }
                    },
                    {
                        opcode: 'move_cursor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'переместить курсор: строка [ROW], символ [COLUMN]',
                        arguments: {
                            ROW: {type: Scratch.ArgumentType.NUMBER, defaultValue: 1},
                            COLUMN: {type: Scratch.ArgumentType.NUMBER, defaultValue: 1}
                        }
                    },
                    {
                        opcode: 'get_contents',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'текст консоли'
                    },
                    {
                        opcode: 'get_line',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'строка [ROW] консоли',
                        arguments: {
                            ROW: {type: Scratch.ArgumentType.NUMBER, defaultValue: 1}
                        }
                    },
                    {
                        opcode: 'get_max_lines',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'максимум строк консоли'
                    },
                    {
                        opcode: 'get_current_line_count',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'сколько строк в консоли'
                    },

                    {
                        opcode: 'blank_line',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'пустая строка'
                    },
                    {
                        opcode: 'add_style',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'добавить стиль текста [STYLE]',
                        arguments: {
                            STYLE: {type: Scratch.ArgumentType.STRING, menu: 'styles'}
                        }
                    },
                    {
                        opcode: 'print_rgb',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'вывести [TEXT] цветом RGB [R] [G] [B]',
                        arguments: {
                            TEXT: {type: Scratch.ArgumentType.STRING, defaultValue: 'Сообщение'},
                            R: {type: Scratch.ArgumentType.NUMBER, defaultValue: 255},
                            G: {type: Scratch.ArgumentType.NUMBER, defaultValue: 128},
                            B: {type: Scratch.ArgumentType.NUMBER, defaultValue: 0}
                        }
                    },
                    {
                        opcode: 'set_foreground_256',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'установить цвет текста из палитры № [INDEX] (0–255)',
                        arguments: {
                            INDEX: {type: Scratch.ArgumentType.NUMBER, defaultValue: 208}
                        }
                    },
                    {
                        opcode: 'get_contents_raw',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'текст консоли с ANSI-кодами'
                    },
                    {
                        opcode: 'get_line_raw',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'строка [ROW] с ANSI-кодами',
                        arguments: {
                            ROW: {type: Scratch.ArgumentType.NUMBER, defaultValue: 1}
                        }
                    },
                    {
                        opcode: 'cursor_row',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'строка курсора'
                    },
                    {
                        opcode: 'cursor_column',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'символ курсора'
                    },
                    {
                        opcode: 'shown_lines',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'видимых строк в консоли'
                    },
                    {
                        opcode: 'cancel_ask',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'отменить ввод'
                    },
                    {
                        opcode: 'input_cancelled',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'последний ввод отменён?'
                    },
                    {
                        opcode: 'console_mode',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'консоль включена?'
                    }
                ],
                menus: {
                    colors: {acceptReporters: false, items: Object.keys(fgCodes)},
                    styles: {acceptReporters: false, items: Object.keys(styleCodes)},
                    logKinds: {acceptReporters: false, items: Object.keys(logStyles)},
                    stageModes: {
                        acceptReporters: true,
                        items: [
                            {text: 'консоль', value: 'console'},
                            {text: 'обычную сцену', value: '2d'}
                        ]
                    }
                }
            };
        }

        _hookRuntime () {
            const runtime = Scratch.vm && Scratch.vm.runtime;
            if (!runtime || typeof runtime.on !== 'function') return;

            runtime.on('PROJECT_STOP_ALL', () => this.cancelAsk());
            runtime.on('STAGE_MODE_CHANGED', mode => {
                if (mode !== 'console') this.cancelAsk();
            });
        }

        _consoleComponent () {
            const runtime = Scratch.vm && Scratch.vm.runtime;
            return runtime && runtime.console;
        }

        _api () {
            const component = this._consoleComponent();
            if (
                !component ||
                !component.props ||
                !Array.isArray(component.props.lines) ||
                typeof component.props.setConsoleLines !== 'function' ||
                typeof component.props.setConsoleCursor !== 'function'
            ) {
                return null;
            }
            return component;
        }

        _warnUnavailable () {
            if (this._warned) return;
            this._warned = true;
            if (typeof console !== 'undefined' && console.warn) {
                console.warn(
                    '[Console+] Включите режим консоли на сцене (stage → Console mode). ' +
                    'Без него блоки Console+ ничего не делают.'
                );
            }
        }

        _lines (component) {
            return component.props.lines.slice();
        }

        _maxLines (component) {
            const capacity = Number(component.state && component.state.linesCount);
            return Math.max(1, (Number.isFinite(capacity) && capacity > 0 ? Math.floor(capacity) : 200) - 1);
        }

        _setLines (component, lines, row, symbol) {
            const maxLines = this._maxLines(component);
            const extra = Math.max(0, lines.length - maxLines);
            const kept = extra > 0 ? lines.slice(extra) : lines;
            component.props.setConsoleLines(kept);
            const safeRow = clamp(toInt(row, kept.length - 1) - extra, 0, kept.length);
            component.props.setConsoleCursor(safeRow, Math.max(0, toInt(symbol, 0)));
        }

        _styleCode (name) {
            const code = styleCodes[String(name)];
            return typeof code === 'number' ? code : null;
        }

        _payload (map, name) {
            const code = map[String(name)];
            return typeof code === 'number' ? String(code) : null;
        }

        styledText (value, overrides) {
            const options = overrides || {};
            const styles = options.styles !== undefined ? options.styles : this.styles;
            const foreground = options.foreground !== undefined ? options.foreground : this.foreground;
            const background = options.background !== undefined ? options.background : this.background;

            let prefix = '';
            for (const code of styles) prefix += ESC(code);
            if (foreground) prefix += ESC(foreground);
            if (background) prefix += ESC(background);

            const text = String(value);
            return prefix ? `${prefix}${text}${RESET}` : text;
        }

        styledLines (value, overrides) {
            return String(value)
                .replace(/\r\n?/g, '\n')
                .split('\n')
                
                .map(line => this.styledText(line === '' ? BLANK_LINE : line, overrides))
                .join('\n');
        }

        set_stage_mode (args) {
            const raw = String(args.MODE === undefined || args.MODE === null ? '' : args.MODE)
                .trim()
                .toLowerCase();
            const mode = ['console', 'консоль', '1', 'true', 'да'].includes(raw) ? 'console' : '2d';

            const runtime = Scratch.vm && Scratch.vm.runtime;
            if (!runtime) return;

            if (mode === '2d') this.cancelAsk();

            try {
                const vm = Scratch.vm;
                if (vm && typeof vm.setStageMode === 'function') {
                    
                    vm.setStageMode(mode);
                } else if (typeof runtime.setStageMode === 'function') {
                    runtime.setStageMode(mode);
                } else if (runtime.stageMode !== mode) {
                    
                    runtime.stageMode = mode;
                    if (typeof runtime.emit === 'function') {
                        runtime.emit('STAGE_MODE_CHANGED', mode);
                    }
                }
            } catch (error) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('[Console+] setStageMode:', error);
                }
            }

            if (mode === 'console') return this._waitForConsole(1500);
        }

        _waitForConsole (timeout) {
            if (this._api()) return Promise.resolve();
            return new Promise(resolve => {
                const started = Date.now();
                const check = () => {
                    if (this._api() || Date.now() - started >= timeout) return resolve();
                    setTimeout(check, 30);
                };
                setTimeout(check, 0);
            });
        }

        clear () {
            this.cancelAsk();
            const component = this._consoleComponent();
            if (component && typeof component.clear === 'function') {
                component.clear();
            } else {
                this._warnUnavailable();
            }
        }

        print_line (args) {
            this._printLine(args, false);
        }

        print_line_move (args) {
            this._printLine(args, true);
        }

        _printLine (args, moveCursor) {
            const component = this._api();
            if (!component) return this._warnUnavailable();

            if (String(args.TEXT) === '') {
                this.blank_line();
                return;
            }
            component.addLine(this.styledLines(args.TEXT), moveCursor);
        }

        print_line_end (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();

            const text = String(args.TEXT);
            const lines = this._lines(component);
            if (text === '') {
                lines.push(BLANK_LINE);
            } else {
                lines.push(...this.styledLines(text).split('\n'));
            }
            this._setLines(component, lines, lines.length, 0);
        }

        blank_line () {
            const component = this._api();
            if (!component) return this._warnUnavailable();

            const lines = this._lines(component);
            const cursor = component.props.cursor || {row: 0, symbol: 0};
            const row = clamp(toInt(cursor.row, 0), 0, lines.length);
            lines.splice(row, 0, BLANK_LINE);
            this._setLines(component, lines, row + 1, 0);
        }

        write (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();
            
            const raw = String(args.TEXT).replace(/[\r\n]+/g, ' ');
            if (raw === '') return;
            component.print(this.styledText(raw));
        }

        reply (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();
            component.addLine(this.styledLines(`Ответ: ${args.TEXT}`), true);
        }

        print_colored (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();
            if (String(args.TEXT) === '') return this.blank_line();

            const foreground = this._payload(fgCodes, args.COLOR) || String(fgCodes['белый']);
            component.addLine(this.styledLines(args.TEXT, {foreground}), true);
        }

        print_rgb (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();
            if (String(args.TEXT) === '') return this.blank_line();

            const r = clamp(toInt(args.R, 255), 0, 255);
            const g = clamp(toInt(args.G, 128), 0, 255);
            const b = clamp(toInt(args.B, 0), 0, 255);
            component.addLine(
                this.styledLines(args.TEXT, {foreground: `38;2;${r};${g};${b}`}),
                true
            );
        }

        set_foreground (args) {
            this.foreground = this._payload(fgCodes, args.COLOR);
        }

        set_background (args) {
            this.background = this._payload(bgCodes, args.COLOR);
        }

        set_foreground_256 (args) {
            const index = clamp(toInt(args.INDEX, 0), 0, 255);
            this.foreground = `38;5;${index}`;
        }

        set_style (args) {
            const code = this._styleCode(args.STYLE);
            this.styles.clear();
            if (code) this.styles.add(String(code));
        }

        add_style (args) {
            const code = this._styleCode(args.STYLE);
            if (code) this.styles.add(String(code));
        }

        reset_style () {
            this.styles.clear();
            this.foreground = null;
            this.background = null;
        }

        log (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();

            const kind = logStyles[String(args.KIND)] || logStyles['информация'];
            const tag = this.styledText(`[${kind.tag}]`, {
                foreground: String(kind.color),
                styles: new Set(['1'])
            });
            const line = `${ESC('90')}[${nowTime()}]${RESET} ${tag} ${this.styledLines(args.TEXT)}`;
            component.addLine(line, true);
        }

        timestamp (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();
            component.addLine(this.styledLines(`[${nowTime()}] ${args.TEXT}`), true);
        }

        separator (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();

            const raw = toChars(args.CHAR === undefined || args.CHAR === null ? '-' : args.CHAR);
            const glyph = raw[0] || '-';
            const count = clamp(toInt(args.COUNT, 1), 1, 200);
            component.addLine(this.styledText(glyph.repeat(count)), true);
        }

        replace_line (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();

            if (String(args.TEXT) === '') {
                
                const lines = this._lines(component);
                const cursor = component.props.cursor || {row: 0, symbol: 0};
                const row = clamp(toInt(cursor.row, 0), 0, Math.max(0, lines.length - 1));
                if (!lines.length) {
                    lines.push(BLANK_LINE);
                }
                lines[row] = BLANK_LINE;
                this._setLines(component, lines, row, 0);
                return;
            }
            component.editLine(this.styledLines(args.TEXT));
        }

        replace_symbol (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();

            const chars = toChars(args.TEXT);
            if (!chars.length) return;

            const lines = this._lines(component);
            if (!lines.length) return;
            const cursor = component.props.cursor || {row: 0, symbol: 0};
            const row = clamp(toInt(cursor.row, 0), 0, lines.length - 1);
            const line = lines[row] || '';
            const offset = clamp(toInt(cursor.symbol, 0), 0, line.length);

            let start = 0;
            let end = 0;
            for (const char of Array.from(line)) {
                end = start + char.length;
                if (offset < end) break;
                start = end;
            }
            const after = end > start ? end : start;
            lines[row] = line.slice(0, start) + chars[0] + line.slice(after);
            this._setLines(component, lines, row, offset);
        }

        move_cursor (args) {
            const component = this._api();
            if (!component) return this._warnUnavailable();

            const lines = this._lines(component);
            if (!lines.length) return;

            const row = clamp(toInt(args.ROW, 1), 1, lines.length);
            const line = lines[row - 1] || '';
            
            const column = clamp(toInt(args.COLUMN, 1), 1, Math.max(1, line.length));
            component.props.setConsoleCursor(row - 1, column - 1);
        }

        get_contents () {
            const component = this._api();
            if (!component) return '';
            return this._lines(component).map(cleanText).join('\n');
        }

        get_contents_raw () {
            const component = this._api();
            if (!component) return '';
            return this._lines(component)
                .map(line => {
                    const text = String(line).replace(/^\u200B/, '');
                    return text === BLANK_LINE ? '' : text;
                })
                .join('\n');
        }

        get_line (args) {
            const component = this._api();
            if (!component) return '';
            const lines = this._lines(component);
            const row = clamp(toInt(args.ROW, 1), 1, Math.max(1, lines.length));
            return cleanText(lines[row - 1] || '');
        }

        get_line_raw (args) {
            const component = this._api();
            if (!component) return '';
            const lines = this._lines(component);
            const row = clamp(toInt(args.ROW, 1), 1, Math.max(1, lines.length));
            const text = String(lines[row - 1] || '').replace(/^\u200B/, '');
            return text === BLANK_LINE ? '' : text;
        }

        get_max_lines () {
            const component = this._api();
            return component && component.state ? component.state.linesCount : 0;
        }

        get_current_line_count () {
            const component = this._api();
            return component ? component.props.lines.length : 0;
        }

        shown_lines () {
            const component = this._api();
            return component && component.state ? component.state.shownLinesCount : 0;
        }

        cursor_row () {
            const component = this._api();
            const cursor = component && component.props.cursor;
            return cursor ? toInt(cursor.row, 0) + 1 : 0;
        }

        cursor_column () {
            const component = this._api();
            const cursor = component && component.props.cursor;
            return cursor ? toInt(cursor.symbol, 0) + 1 : 0;
        }

        last_input () {
            return this.lastInput;
        }

        is_input_pending () {
            return this._pendingAsks > 0;
        }

        input_cancelled () {
            return this.lastInputCancelled;
        }

        console_mode () {
            const runtime = Scratch.vm && Scratch.vm.runtime;
            const mode = runtime && runtime.stageMode;
            if (mode) return mode === 'console';
            return Boolean(this._api());
        }

        cancelAsk () {
            this._askGeneration++;
            if (this._activeAsk) {
                this._activeAsk.cancel();
            }
        }

        cancel_ask () {
            this.cancelAsk();
        }

        ask (args) {
            const generation = this._askGeneration;
            this._pendingAsks++;

            const run = () => {
                if (generation !== this._askGeneration) return Promise.resolve();
                return this._runAsk(args, generation);
            };
            const result = this._askChain.then(run, run);
            this._askChain = result.then(() => undefined, () => undefined);
            return result.finally(() => {
                this._pendingAsks = Math.max(0, this._pendingAsks - 1);
            });
        }

        _questionLines (prompt) {
            const raw = String(prompt === undefined || prompt === null ? '' : prompt)
                .replace(/\r\n?/g, '\n')
                .split('\n');
            if (raw.length === 1 && raw[0] === '') return [];
            return raw.map((line, index) => (index === 0 ? `> ${line}` : `  ${line}`));
        }

        _runAsk (args, generation) {
            const component = this._api();
            this.lastInput = '';
            this.lastInputCancelled = false;

            if (!component || typeof document === 'undefined') {
                this._warnUnavailable();
                return Promise.resolve();
            }

            const runtime = Scratch.vm && Scratch.vm.runtime;
            if (runtime && runtime.stageMode && runtime.stageMode !== 'console') {
                this._warnUnavailable();
                return Promise.resolve();
            }

            return new Promise(resolve => {
                const questionLines = this._questionLines(args.PROMPT);
                const chars = [];
                let caret = 0;
                let caretVisible = true;
                let done = false;
                let timer = null;
                let historyIndex = this._history.length;
                let draft = '';

                const marker = INPUT_MARKER;
                const markerLength = marker.length;
                const answerText = () => chars.join('');

                const renderAnswer = visible => {
                    const before = chars.slice(0, caret).join('');
                    const after = chars.slice(caret + 1).join('');
                    const under = caret < chars.length ? chars[caret] : ' ';
                    if (!visible) {
                        return ANSWER_PREFIX + before + under + after;
                    }
                    
                    return `${ANSWER_PREFIX}${before}${ESC('47')}${ESC('30')}${under}${RESET}${after}`;
                };

                const findMarker = lines => {
                    for (let index = lines.length - 1; index >= 0; index--) {
                        if (typeof lines[index] === 'string' && lines[index].startsWith(marker)) {
                            return index;
                        }
                    }
                    return -1;
                };

                const startLines = this._lines(component);
                while (startLines.length && startLines[startLines.length - 1] === '') startLines.pop();
                startLines.push(...questionLines, marker + renderAnswer(true));
                this._setLines(
                    component, startLines, startLines.length - 1,
                    markerLength + ANSWER_PREFIX.length
                );

                const render = () => {
                    if (done) return;
                    const api = this._api();
                    if (!api) return;

                    const lines = this._lines(api);
                    const display = marker + renderAnswer(caretVisible);
                    let index = findMarker(lines);
                    if (index === -1) {
                        while (lines.length && lines[lines.length - 1] === '') lines.pop();
                        lines.push(...questionLines, display);
                        index = lines.length - 1;
                    } else {
                        lines[index] = display;
                    }

                    const beforeLength = chars.slice(0, caret).join('').length;
                    this._setLines(api, lines, index, markerLength + ANSWER_PREFIX.length + beforeLength);
                };

                const resetBlink = () => {
                    caretVisible = true;
                    if (timer !== null) clearInterval(timer);
                    timer = setInterval(() => {
                        if (done) return;
                        caretVisible = !caretVisible;
                        render();
                    }, BLINK_INTERVAL);
                };

                const setAnswer = value => {
                    const next = toChars(value);
                    chars.length = 0;
                    chars.push(...next.slice(0, MAX_INPUT_LENGTH));
                    caret = chars.length;
                    resetBlink();
                    render();
                };

                const insertText = value => {
                    const clean = String(value)
                        .replace(/[\r\n\t]+/g, ' ')
                        .replace(/[\x00-\x1f\x7f]/g, '');
                    const incoming = toChars(clean);
                    if (!incoming.length) return;
                    const room = MAX_INPUT_LENGTH - chars.length;
                    if (room <= 0) return;
                    const added = incoming.slice(0, room);
                    chars.splice(caret, 0, ...added);
                    caret += added.length;
                    resetBlink();
                    render();
                };

                const deleteWord = () => {
                    if (caret === 0) return;
                    let index = caret;
                    while (index > 0 && /\s/.test(chars[index - 1])) index--;
                    while (index > 0 && !/\s/.test(chars[index - 1])) index--;
                    chars.splice(index, caret - index);
                    caret = index;
                };

                const historyPrev = () => {
                    const history = this._history;
                    if (!history.length) return;
                    if (historyIndex === history.length) draft = answerText();
                    historyIndex = Math.max(0, historyIndex - 1);
                    setAnswer(history[historyIndex]);
                };

                const historyNext = () => {
                    const history = this._history;
                    if (historyIndex >= history.length) return;
                    historyIndex++;
                    setAnswer(historyIndex === history.length ? draft : history[historyIndex]);
                };

                const isEditableTarget = target => {
                    if (!target) return false;
                    if (target.isContentEditable) return true;
                    if (/^(INPUT|TEXTAREA|SELECT)$/i.test(target.tagName || '')) return true;
                    return typeof target.closest === 'function' &&
                        Boolean(target.closest('[contenteditable="true"], [role="textbox"]'));
                };

                const finish = cancelled => {
                    if (done) return;
                    done = true;
                    if (timer !== null) clearInterval(timer);
                    timer = null;
                    document.removeEventListener('keydown', onKeyDown, true);
                    document.removeEventListener('paste', onPaste, true);
                    this._activeAsk = null;

                    if (generation !== this._askGeneration) cancelled = true;
                    const value = answerText();
                    this.lastInput = cancelled ? '' : value;
                    this.lastInputCancelled = Boolean(cancelled);

                    if (!cancelled && value !== '') {
                        if (this._history[this._history.length - 1] !== value) {
                            this._history.push(value);
                            if (this._history.length > MAX_HISTORY) this._history.shift();
                        }
                    }

                    const api = this._api();
                    if (api) {
                        const lines = this._lines(api);
                        let finalLine = ANSWER_PREFIX + value;
                        if (cancelled) finalLine += ` ${ESC('90')}^C${RESET}`;

                        const index = findMarker(lines);
                        if (index === -1) {
                            while (lines.length && lines[lines.length - 1] === '') lines.pop();
                            lines.push(...questionLines, finalLine);
                        } else {
                            lines[index] = finalLine;
                        }
                        
                        lines.push('');
                        this._setLines(api, lines, lines.length - 1, 0);
                    }

                    resolve();
                };

                const onKeyDown = event => {
                    if (done) return;
                    
                    if (event.isComposing || event.keyCode === 229) return;
                    if (isEditableTarget(event.target)) return;

                    const altGraph = typeof event.getModifierState === 'function' &&
                        event.getModifierState('AltGraph');
                    const shortcut = (event.ctrlKey && !altGraph) || event.metaKey;
                    let handled = true;

                    if (shortcut) {
                        const key = String(event.key).toLowerCase();
                        if (key === 'v') {
                            
                            handled = false;
                        } else if (key === 'c') {
                            finish(true);
                        } else if (key === 'u') {
                            chars.length = 0;
                            caret = 0;
                            resetBlink();
                            render();
                        } else if (key === 'w') {
                            deleteWord();
                            resetBlink();
                            render();
                        } else {
                            handled = false;
                        }
                    } else {
                        switch (event.key) {
                        case 'Enter':
                            finish(false);
                            break;
                        case 'Escape':
                            finish(true);
                            break;
                        case 'Backspace':
                            if (caret > 0) {
                                chars.splice(caret - 1, 1);
                                caret--;
                                resetBlink();
                                render();
                            }
                            break;
                        case 'Delete':
                            if (caret < chars.length) {
                                chars.splice(caret, 1);
                                resetBlink();
                                render();
                            }
                            break;
                        case 'ArrowLeft':
                            caret = Math.max(0, caret - 1);
                            resetBlink();
                            render();
                            break;
                        case 'ArrowRight':
                            caret = Math.min(chars.length, caret + 1);
                            resetBlink();
                            render();
                            break;
                        case 'Home':
                            caret = 0;
                            resetBlink();
                            render();
                            break;
                        case 'End':
                            caret = chars.length;
                            resetBlink();
                            render();
                            break;
                        case 'ArrowUp':
                            historyPrev();
                            break;
                        case 'ArrowDown':
                            historyNext();
                            break;
                        default: {
                            const key = event.key || '';
                            const printable = key.length === 1 ||
                                (key.length === 2 && key.codePointAt(0) > 0xffff);
                            const blockedModifier = (event.altKey && !altGraph) ||
                                (event.ctrlKey && !altGraph) || event.metaKey;
                            if (!printable || blockedModifier) {
                                handled = false;
                            } else {
                                insertText(key);
                            }
                        }
                        }
                    }

                    if (handled) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                };

                const onPaste = event => {
                    if (done) return;
                    if (isEditableTarget(event.target)) return;
                    const data = event.clipboardData && event.clipboardData.getData('text/plain');
                    if (!data) return;
                    event.preventDefault();
                    event.stopPropagation();
                    insertText(data);
                };

                this._activeAsk = {cancel: () => finish(true)};
                document.addEventListener('keydown', onKeyDown, true);
                document.addEventListener('paste', onPaste, true);
                resetBlink();
            });
        }
    }

    Scratch.extensions.register(new ConsolePlusPlus());
})(Scratch);
