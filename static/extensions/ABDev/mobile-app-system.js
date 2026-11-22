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

    if (!MAU._systemShared) {
        MAU._systemShared = {
            app: {
                startedAt: Date.now(),
                launchCount: 0,
                active: true,
                background: false,
                justOpened: true,
                activeEdge: false,
                backgroundEdge: false,
                closingEdge: false
            },
            theme: {
                current: 'light',
                requested: 'auto',
                changedEdge: false,
                mediaQuery: null,
                initialized: false
            },
            language: {
                current: (typeof navigator !== 'undefined' && (navigator.language || 'en')) || 'en',
                available: ['en', 'ru'],
                strings: {
                    en: {
                        hello: 'Hello',
                        ok: 'OK',
                        cancel: 'Cancel',
                        yes: 'Yes',
                        no: 'No'
                    },
                    ru: {
                        hello: 'Привет',
                        ok: 'ОК',
                        cancel: 'Отмена',
                        yes: 'Да',
                        no: 'Нет'
                    }
                }
            },
            keyboard: {
                open: false,
                height: 0,
                openEdge: false,
                closeEdge: false,
                lastInnerHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
                initialized: false
            },
            version: {
                appVersion: '1.0.0',
                buildNumber: '1',
                updateAvailable: false,
                updateVersion: ''
            }
        };
    }

    const shared = MAU._systemShared;

    if (!shared.app.launchCount) {
        try {
            const key = 'MobileAppUltra.launchCount';
            const oldVal = typeof localStorage !== 'undefined' ? Number(localStorage.getItem(key) || 0) : 0;
            shared.app.launchCount = oldVal + 1;
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, String(shared.app.launchCount));
            }
        } catch (e) {
            shared.app.launchCount = 1;
        }

        setTimeout(() => {
            shared.app.justOpened = false;
        }, 2000);
    }

    const t = (ru, en) => {
        const lang = (typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en').toLowerCase();
        return lang.startsWith('ru') ? ru : en;
    };

    function safeString(v) {
        if (v === null || v === undefined) return '';
        return String(v);
    }

    function openURL(url, sameWindow) {
        try {
            const target = sameWindow ? '_self' : '_blank';
            if (typeof window !== 'undefined' && typeof window.open === 'function') {
                window.open(String(url), target, sameWindow ? '' : 'noopener,noreferrer');
                return true;
            }
        } catch (e) {
            console.warn('Mobile App Ultra Pro System: openURL failed', e);
        }
        return false;
    }

    function initAppState() {
        if (typeof document === 'undefined' || typeof window === 'undefined') return;
        if (MAU._systemAppStateInitialized) return;
        MAU._systemAppStateInitialized = true;

        const updateVisibility = () => {
            const hidden = !!document.hidden;
            const wasBackground = shared.app.background;

            shared.app.background = hidden;
            shared.app.active = !hidden;

            if (wasBackground && !hidden) {
                shared.app.activeEdge = true;
            }
            if (!wasBackground && hidden) {
                shared.app.backgroundEdge = true;
            }
        };

        document.addEventListener('visibilitychange', updateVisibility);

        window.addEventListener('focus', () => {
            if (!shared.app.active) {
                shared.app.activeEdge = true;
            }
            shared.app.active = true;
            shared.app.background = false;
        });

        window.addEventListener('blur', () => {
            if (!shared.app.background) {
                shared.app.backgroundEdge = true;
            }
            shared.app.active = false;
            shared.app.background = true;
        });

        window.addEventListener('beforeunload', () => {
            shared.app.closingEdge = true;
        });
    }

    function initTheme() {
        if (shared.theme.initialized) return;
        shared.theme.initialized = true;

        try {
            if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
                const mq = window.matchMedia('(prefers-color-scheme: dark)');
                shared.theme.mediaQuery = mq;
                shared.theme.current = mq.matches ? 'dark' : 'light';

                const handler = e => {
                    const old = shared.theme.current;
                    shared.theme.current = e.matches ? 'dark' : 'light';
                    if (old !== shared.theme.current) {
                        shared.theme.changedEdge = true;
                    }
                };

                if (typeof mq.addEventListener === 'function') {
                    mq.addEventListener('change', handler);
                } else if (typeof mq.addListener === 'function') {
                    mq.addListener(handler);
                }
            }
        } catch (e) {
            console.warn('Mobile App Ultra Pro System: initTheme failed', e);
        }
    }

    function initKeyboardDetection() {
        if (shared.keyboard.initialized) return;
        shared.keyboard.initialized = true;

        if (typeof window === 'undefined') return;

        shared.keyboard.lastInnerHeight = window.innerHeight;

        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const diff = shared.keyboard.lastInnerHeight - currentHeight;

            if (diff > 120 && !shared.keyboard.open) {
                shared.keyboard.open = true;
                shared.keyboard.height = diff;
                shared.keyboard.openEdge = true;
            } else if (diff < -80 && shared.keyboard.open) {
                shared.keyboard.open = false;
                shared.keyboard.height = 0;
                shared.keyboard.closeEdge = true;
            } else if (shared.keyboard.open && diff > 0) {
                shared.keyboard.height = Math.max(shared.keyboard.height, diff);
            }

            shared.keyboard.lastInnerHeight = currentHeight;
        });
    }

    initAppState();
    initTheme();
    initKeyboardDetection();

    class MobileAppUltraSystem {
        getInfo() {
            return {
                id: 'mobileappultrasystem',
                name: t('Mobile App Ultra Pro / Система', 'Mobile App Ultra Pro / System'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('Ссылки и приложения', 'Links and Apps')
                    },
                    {
                        opcode: 'openURL',
                        blockType: BlockType.COMMAND,
                        text: t('открыть URL [URL]', 'open URL [URL]'),
                        arguments: {
                            URL: { type: ArgumentType.STRING, defaultValue: 'https:
                        }
                    },
                    {
                        opcode: 'openURLBrowser',
                        blockType: BlockType.COMMAND,
                        text: t('открыть URL в браузере [URL]', 'open URL in browser [URL]'),
                        arguments: {
                            URL: { type: ArgumentType.STRING, defaultValue: 'https:
                        }
                    },
                    {
                        opcode: 'openEmail',
                        blockType: BlockType.COMMAND,
                        text: t('открыть email [EMAIL]', 'open email [EMAIL]'),
                        arguments: {
                            EMAIL: { type: ArgumentType.STRING, defaultValue: 'test@example.com' }
                        }
                    },
                    {
                        opcode: 'openEmailFull',
                        blockType: BlockType.COMMAND,
                        text: t('открыть email [EMAIL] тема [SUBJECT] текст [BODY]', 'open email [EMAIL] subject [SUBJECT] body [BODY]'),
                        arguments: {
                            EMAIL: { type: ArgumentType.STRING, defaultValue: 'test@example.com' },
                            SUBJECT: { type: ArgumentType.STRING, defaultValue: 'Hello' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Message' }
                        }
                    },
                    {
                        opcode: 'callPhone',
                        blockType: BlockType.COMMAND,
                        text: t('позвонить на [PHONE]', 'call [PHONE]'),
                        arguments: {
                            PHONE: { type: ArgumentType.STRING, defaultValue: '+79990000000' }
                        }
                    },
                    {
                        opcode: 'sendSMS',
                        blockType: BlockType.COMMAND,
                        text: t('отправить SMS на [PHONE] текст [TEXT]', 'send SMS to [PHONE] text [TEXT]'),
                        arguments: {
                            PHONE: { type: ArgumentType.STRING, defaultValue: '+79990000000' },
                            TEXT: { type: ArgumentType.STRING, defaultValue: 'Hello' }
                        }
                    },
                    {
                        opcode: 'openMapsAddress',
                        blockType: BlockType.COMMAND,
                        text: t('открыть карты с адресом [ADDRESS]', 'open maps with address [ADDRESS]'),
                        arguments: {
                            ADDRESS: { type: ArgumentType.STRING, defaultValue: 'Moscow' }
                        }
                    },
                    {
                        opcode: 'openMapsCoords',
                        blockType: BlockType.COMMAND,
                        text: t('открыть карты координаты [LAT] [LON]', 'open maps coordinates [LAT] [LON]'),
                        arguments: {
                            LAT: { type: ArgumentType.NUMBER, defaultValue: 55.7558 },
                            LON: { type: ArgumentType.NUMBER, defaultValue: 37.6176 }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Состояние приложения', 'Application State')
                    },
                    {
                        opcode: 'isAppActive',
                        blockType: BlockType.BOOLEAN,
                        text: t('приложение активно?', 'app active?')
                    },
                    {
                        opcode: 'isAppInBackground',
                        blockType: BlockType.BOOLEAN,
                        text: t('приложение в фоне?', 'app in background?')
                    },
                    {
                        opcode: 'isAppJustOpened',
                        blockType: BlockType.BOOLEAN,
                        text: t('приложение только что открыто?', 'app just opened?')
                    },
                    {
                        opcode: 'whenAppActive',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда приложение стало активным', 'when app became active')
                    },
                    {
                        opcode: 'whenAppBackground',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда приложение ушло в фон', 'when app moved to background')
                    },
                    {
                        opcode: 'getUptime',
                        blockType: BlockType.REPORTER,
                        text: t('время работы приложения (сек)', 'app uptime (sec)')
                    },
                    {
                        opcode: 'getLaunchCount',
                        blockType: BlockType.REPORTER,
                        text: t('количество запусков приложения', 'app launch count')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Версия и обновления', 'Version and Updates')
                    },
                    {
                        opcode: 'getAppVersion',
                        blockType: BlockType.REPORTER,
                        text: t('версия приложения', 'app version')
                    },
                    {
                        opcode: 'getBuildNumber',
                        blockType: BlockType.REPORTER,
                        text: t('номер сборки', 'build number')
                    },
                    {
                        opcode: 'checkUpdate',
                        blockType: BlockType.COMMAND,
                        text: t('проверить обновление', 'check update')
                    },
                    {
                        opcode: 'isUpdateAvailable',
                        blockType: BlockType.BOOLEAN,
                        text: t('обновление доступно?', 'update available?')
                    },
                    {
                        opcode: 'getUpdateVersion',
                        blockType: BlockType.REPORTER,
                        text: t('версия обновления', 'update version')
                    },
                    {
                        opcode: 'openUpdatePage',
                        blockType: BlockType.COMMAND,
                        text: t('открыть страницу обновления', 'open update page')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Тема, язык, клавиатура', 'Theme, Language, Keyboard')
                    },
                    {
                        opcode: 'isDarkTheme',
                        blockType: BlockType.BOOLEAN,
                        text: t('тёмная тема включена?', 'dark theme enabled?')
                    },
                    {
                        opcode: 'getSystemTheme',
                        blockType: BlockType.REPORTER,
                        text: t('системная тема', 'system theme')
                    },
                    {
                        opcode: 'whenThemeChanged',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда тема изменилась', 'when theme changed')
                    },
                    {
                        opcode: 'getAppLanguage',
                        blockType: BlockType.REPORTER,
                        text: t('язык приложения', 'app language')
                    },
                    {
                        opcode: 'setAppLanguage',
                        blockType: BlockType.COMMAND,
                        text: t('изменить язык [LANG_CODE]', 'change language [LANG_CODE]'),
                        arguments: {
                            LANG_CODE: { type: ArgumentType.STRING, defaultValue: 'ru' }
                        }
                    },
                    {
                        opcode: 'getLocalizationText',
                        blockType: BlockType.REPORTER,
                        text: t('текст локализации [KEY]', 'localization text [KEY]'),
                        arguments: {
                            KEY: { type: ArgumentType.STRING, defaultValue: 'hello' }
                        }
                    },
                    {
                        opcode: 'isKeyboardOpen',
                        blockType: BlockType.BOOLEAN,
                        text: t('клавиатура открыта?', 'keyboard open?')
                    },
                    {
                        opcode: 'getKeyboardHeight',
                        blockType: BlockType.REPORTER,
                        text: t('высота клавиатуры', 'keyboard height')
                    },
                    {
                        opcode: 'whenKeyboardOpened',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда клавиатура открылась', 'when keyboard opened')
                    },
                    {
                        opcode: 'hideKeyboard',
                        blockType: BlockType.COMMAND,
                        text: t('скрыть клавиатуру', 'hide keyboard')
                    }
                ]
            };
        }

        openURL(args) {
            openURL(safeString(args.URL), false);
        }

        openURLBrowser(args) {
            openURL(safeString(args.URL), false);
        }

        openEmail(args) {
            const email = encodeURIComponent(safeString(args.EMAIL));
            openURL('mailto:' + email, false);
        }

        openEmailFull(args) {
            const email = encodeURIComponent(safeString(args.EMAIL));
            const subject = encodeURIComponent(safeString(args.SUBJECT));
            const body = encodeURIComponent(safeString(args.BODY));
            openURL('mailto:' + email + '?subject=' + subject + '&body=' + body, false);
        }

        callPhone(args) {
            const phone = safeString(args.PHONE);
            openURL('tel:' + phone, false);
        }

        sendSMS(args) {
            const phone = safeString(args.PHONE);
            const text = encodeURIComponent(safeString(args.TEXT));
            openURL('sms:' + phone + '?body=' + text, false);
        }

        openMapsAddress(args) {
            const address = encodeURIComponent(safeString(args.ADDRESS));
            openURL('https:
        }

        openMapsCoords(args) {
            const lat = Number(args.LAT);
            const lon = Number(args.LON);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
            openURL('https:
        }

        isAppActive() {
            return !!shared.app.active;
        }

        isAppInBackground() {
            return !!shared.app.background;
        }

        isAppJustOpened() {
            return !!shared.app.justOpened;
        }

        whenAppActive() {
            const v = shared.app.activeEdge;
            shared.app.activeEdge = false;
            return v;
        }

        whenAppBackground() {
            const v = shared.app.backgroundEdge;
            shared.app.backgroundEdge = false;
            return v;
        }

        getUptime() {
            return Math.floor((Date.now() - shared.app.startedAt) / 1000);
        }

        getLaunchCount() {
            return Number(shared.app.launchCount || 1);
        }

        getAppVersion() {
            return MAU.appVersion || shared.version.appVersion || '1.0.0';
        }

        getBuildNumber() {
            return MAU.buildNumber || shared.version.buildNumber || '1';
        }

        checkUpdate() {
            const latest = MAU.latestVersion || '';
            if (latest) {
                shared.version.updateAvailable = latest !== this.getAppVersion();
                shared.version.updateVersion = latest;
            } else {
                shared.version.updateAvailable = false;
                shared.version.updateVersion = '';
                console.warn('Mobile App Ultra Pro System: latestVersion is not configured.');
            }
        }

        isUpdateAvailable() {
            return !!shared.version.updateAvailable;
        }

        getUpdateVersion() {
            return shared.version.updateVersion || '';
        }

        openUpdatePage() {
            const url = MAU.updateURL || MAU.appStoreURL || 'https:
            openURL(url, false);
        }

        isDarkTheme() {
            initTheme();
            return shared.theme.current === 'dark';
        }

        getSystemTheme() {
            initTheme();
            return shared.theme.current || 'light';
        }

        whenThemeChanged() {
            const v = shared.theme.changedEdge;
            shared.theme.changedEdge = false;
            return v;
        }

        getAppLanguage() {
            return shared.language.current || 'en';
        }

        setAppLanguage(args) {
            const lang = safeString(args.LANG_CODE).toLowerCase();
            shared.language.current = lang || 'en';
        }

        getLocalizationText(args) {
            const key = safeString(args.KEY);
            const lang = shared.language.current || 'en';
            const pack = shared.language.strings[lang] || shared.language.strings.en || {};
            return key in pack ? safeString(pack[key]) : '';
        }

        isKeyboardOpen() {
            return !!shared.keyboard.open;
        }

        getKeyboardHeight() {
            return Number(shared.keyboard.height || 0);
        }

        whenKeyboardOpened() {
            const v = shared.keyboard.openEdge;
            shared.keyboard.openEdge = false;
            return v;
        }

        hideKeyboard() {
            try {
                if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
                    document.activeElement.blur();
                }
            } catch (e) {
                console.warn('Mobile App Ultra Pro System: hideKeyboard failed', e);
            }
        }
    }

    Scratch.extensions.register(new MobileAppUltraSystem());
})(Scratch);
