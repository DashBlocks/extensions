/* Author: ABDev */
(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Mobile App Ultra Pro: This extension must run unsandboxed.');
    }

    const BlockType = Scratch.BlockType;
    const ArgumentType = Scratch.ArgumentType;

    const root = typeof window !== 'undefined' ? window : globalThis;
    if (!root.MobileAppUltra) {
        root.MobileAppUltra = {};
    }

    const MAU = root.MobileAppUltra;

    if (!MAU._coreShared) {
        MAU._coreShared = {
            version: '1.0.0',
            startedAt: Date.now(),
            locale: (typeof navigator !== 'undefined' && (navigator.language || (navigator.languages && navigator.languages[0]))) || 'en',
            languageMap: {
                ru: {
                    extName: 'Mobile App Ultra Pro / Ядро',
                    deviceCategory: 'Устройство',
                    screenCategory: 'Экран',
                    batteryCategory: 'Батарея',
                    networkCategory: 'Сеть',
                    perfCategory: 'Производительность',
                    unsupported: 'Не поддерживается',
                    unknown: 'unknown'
                },
                en: {
                    extName: 'Mobile App Ultra Pro / Core',
                    deviceCategory: 'Device',
                    screenCategory: 'Screen',
                    batteryCategory: 'Battery',
                    networkCategory: 'Network',
                    perfCategory: 'Performance',
                    unsupported: 'Unsupported',
                    unknown: 'unknown'
                }
            },
            battery: {
                manager: null,
                level: 100,
                charging: false,
                dischargingTime: -1,
                chargingTime: -1,
                supported: false,
                changedEdge: false,
                chargingStartEdge: false,
                chargingStopEdge: false,
                initialized: false
            },
            network: {
                online: typeof navigator !== 'undefined' ? navigator.onLine : true,
                type: 'unknown',
                effectiveType: 'unknown',
                downlink: 0,
                rtt: 0,
                saveData: false,
                internetOnEdge: false,
                internetOffEdge: false,
                typeChangedEdge: false,
                initialized: false
            },
            screen: {
                orientation: 'portrait',
                initialized: false
            },
            perf: {
                fps: 0,
                frameCount: 0,
                lastFpsTime: 0,
                rafStarted: false
            },
            safeArea: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                initialized: false,
                probe: null
            }
        };
    }

    const shared = MAU._coreShared;

    const getLang = () => {
        const raw = (typeof navigator !== 'undefined' && (navigator.language || 'en')) || 'en';
        return String(raw).toLowerCase().startsWith('ru') ? 'ru' : 'en';
    };

    const t = (ru, en) => (getLang() === 'ru' ? ru : en);

    const safeNumber = v => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const ua = () => (typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '');
    const platform = () => (typeof navigator !== 'undefined' ? (navigator.platform || '') : '');

    function detectOS() {
        const userAgent = ua();
        const plt = platform();

        if (/android/i.test(userAgent)) return 'Android';
        if (/iPad|iPhone|iPod/.test(userAgent) || (plt === 'MacIntel' && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) return 'iOS';
        if (/Win/i.test(plt) || /Windows/i.test(userAgent)) return 'Windows';
        if (/Mac/i.test(plt) || /Mac OS X/i.test(userAgent)) return 'Mac';
        if (/Linux/i.test(plt) || /Linux/i.test(userAgent)) return 'Linux';
        return 'unknown';
    }

    function detectOSVersion() {
        const userAgent = ua();
        let m;

        if ((m = userAgent.match(/Android\s([0-9.]+)/i))) return m[1];
        if ((m = userAgent.match(/OS\s([0-9_]+)\slike\sMac\sOS\sX/i))) return m[1].replace(/_/g, '.');
        if ((m = userAgent.match(/Windows NT\s([0-9.]+)/i))) return m[1];
        if ((m = userAgent.match(/Mac OS X\s([0-9_]+)/i))) return m[1].replace(/_/g, '.');
        return '';
    }

    function detectBrowser() {
        const userAgent = ua();
        if (/Edg\
        if (/OPR\
        if (/Chrome\
        if (/Firefox\
        if (/Safari\
        if (/SamsungBrowser\
        return 'unknown';
    }

    function detectBrowserVersion() {
        const userAgent = ua();
        let m;
        if ((m = userAgent.match(/Edg\/([0-9.]+)/))) return m[1];
        if ((m = userAgent.match(/OPR\/([0-9.]+)/))) return m[1];
        if ((m = userAgent.match(/Chrome\/([0-9.]+)/))) return m[1];
        if ((m = userAgent.match(/Firefox\/([0-9.]+)/))) return m[1];
        if ((m = userAgent.match(/Version\/([0-9.]+).*Safari/))) return m[1];
        if ((m = userAgent.match(/SamsungBrowser\/([0-9.]+)/))) return m[1];
        return '';
    }

    function detectDeviceType() {
        const userAgent = ua();
        const width = typeof window !== 'undefined' ? Math.min(window.innerWidth || 0, window.innerHeight || 0) : 0;
        const touchPoints = typeof navigator !== 'undefined' ? (navigator.maxTouchPoints || 0) : 0;

        if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) return 'tablet';
        if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) return 'tablet';
        if (/iPhone|iPod|Mobile|Android/i.test(userAgent)) {
            if (width >= 768 || touchPoints > 1 && width >= 700) return 'tablet';
            return 'phone';
        }
        return 'desktop';
    }

    function isMobileDevice() {
        const type = detectDeviceType();
        return type === 'phone' || type === 'tablet';
    }

    function currentOrientation() {
        if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.type) {
            return screen.orientation.type.startsWith('landscape') ? 'landscape' : 'portrait';
        }
        if (typeof window !== 'undefined') {
            return (window.innerWidth || 0) > (window.innerHeight || 0) ? 'landscape' : 'portrait';
        }
        return 'portrait';
    }

    function ensureBatteryInit() {
        if (shared.battery.initialized) return;
        shared.battery.initialized = true;

        if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
            navigator.getBattery().then(battery => {
                shared.battery.manager = battery;
                shared.battery.supported = true;

                const updateBattery = () => {
                    const oldLevel = shared.battery.level;
                    const oldCharging = shared.battery.charging;

                    shared.battery.level = Math.round((battery.level || 0) * 100);
                    shared.battery.charging = !!battery.charging;
                    shared.battery.dischargingTime = Number.isFinite(battery.dischargingTime) ? battery.dischargingTime : -1;
                    shared.battery.chargingTime = Number.isFinite(battery.chargingTime) ? battery.chargingTime : -1;

                    if (shared.battery.level !== oldLevel) {
                        shared.battery.changedEdge = true;
                    }
                    if (!oldCharging && shared.battery.charging) {
                        shared.battery.chargingStartEdge = true;
                    }
                    if (oldCharging && !shared.battery.charging) {
                        shared.battery.chargingStopEdge = true;
                    }
                };

                updateBattery();
                battery.addEventListener('levelchange', updateBattery);
                battery.addEventListener('chargingchange', updateBattery);
                battery.addEventListener('chargingtimechange', updateBattery);
                battery.addEventListener('dischargingtimechange', updateBattery);
            }).catch(() => {
                shared.battery.supported = false;
            });
        }
    }

    function getConnectionObject() {
        if (typeof navigator === 'undefined') return null;
        return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    }

    function normalizeConnectionType(type) {
        const s = String(type || '').toLowerCase();
        if (s.includes('wifi')) return 'wifi';
        if (s.includes('cell') || s.includes('2g') || s.includes('3g') || s.includes('4g') || s.includes('5g')) return 'cellular';
        if (s.includes('ethernet')) return 'ethernet';
        if (s.includes('none')) return 'none';
        return 'unknown';
    }

    function ensureNetworkInit() {
        if (shared.network.initialized) return;
        shared.network.initialized = true;

        const updateNetwork = () => {
            const oldOnline = shared.network.online;
            const oldType = shared.network.type;

            shared.network.online = typeof navigator !== 'undefined' ? !!navigator.onLine : true;

            const conn = getConnectionObject();
            shared.network.type = conn ? normalizeConnectionType(conn.type || conn.effectiveType) : (shared.network.online ? 'unknown' : 'none');
            shared.network.effectiveType = conn ? String(conn.effectiveType || 'unknown') : 'unknown';
            shared.network.downlink = conn && Number.isFinite(conn.downlink) ? conn.downlink : 0;
            shared.network.rtt = conn && Number.isFinite(conn.rtt) ? conn.rtt : 0;
            shared.network.saveData = !!(conn && conn.saveData);

            if (!oldOnline && shared.network.online) shared.network.internetOnEdge = true;
            if (oldOnline && !shared.network.online) shared.network.internetOffEdge = true;
            if (oldType !== shared.network.type) shared.network.typeChangedEdge = true;
        };

        updateNetwork();

        if (typeof window !== 'undefined') {
            window.addEventListener('online', updateNetwork);
            window.addEventListener('offline', updateNetwork);
        }

        const conn = getConnectionObject();
        if (conn && typeof conn.addEventListener === 'function') {
            conn.addEventListener('change', updateNetwork);
        }
    }

    function ensureScreenInit() {
        if (shared.screen.initialized) return;
        shared.screen.initialized = true;
        shared.screen.orientation = currentOrientation();

        const update = () => {
            shared.screen.orientation = currentOrientation();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', update);
            window.addEventListener('orientationchange', update);
        }
        if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.addEventListener === 'function') {
            screen.orientation.addEventListener('change', update);
        }
    }

    function ensureFpsLoop() {
        if (shared.perf.rafStarted) return;
        shared.perf.rafStarted = true;
        shared.perf.lastFpsTime = performance.now();

        const tick = now => {
            shared.perf.frameCount++;
            const delta = now - shared.perf.lastFpsTime;
            if (delta >= 1000) {
                shared.perf.fps = Math.round((shared.perf.frameCount * 1000) / delta);
                shared.perf.frameCount = 0;
                shared.perf.lastFpsTime = now;
            }
            root.requestAnimationFrame(tick);
        };

        if (typeof root.requestAnimationFrame === 'function') {
            root.requestAnimationFrame(tick);
        }
    }

    function ensureSafeAreaProbe() {
        if (shared.safeArea.initialized) return;
        shared.safeArea.initialized = true;

        if (typeof document === 'undefined') return;

        const probe = document.createElement('div');
        probe.style.position = 'fixed';
        probe.style.left = '0';
        probe.style.top = '0';
        probe.style.width = '0';
        probe.style.height = '0';
        probe.style.paddingTop = 'env(safe-area-inset-top)';
        probe.style.paddingRight = 'env(safe-area-inset-right)';
        probe.style.paddingBottom = 'env(safe-area-inset-bottom)';
        probe.style.paddingLeft = 'env(safe-area-inset-left)';
        probe.style.pointerEvents = 'none';
        probe.style.opacity = '0';
        probe.style.zIndex = '-1';

        document.documentElement.appendChild(probe);
        shared.safeArea.probe = probe;

        const update = () => {
            const cs = getComputedStyle(probe);
            shared.safeArea.top = parseInt(cs.paddingTop, 10) || 0;
            shared.safeArea.right = parseInt(cs.paddingRight, 10) || 0;
            shared.safeArea.bottom = parseInt(cs.paddingBottom, 10) || 0;
            shared.safeArea.left = parseInt(cs.paddingLeft, 10) || 0;
        };

        update();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', update);
            window.addEventListener('orientationchange', update);
        }
    }

    ensureBatteryInit();
    ensureNetworkInit();
    ensureScreenInit();
    ensureFpsLoop();
    ensureSafeAreaProbe();

    class MobileAppUltraCore {
        getInfo() {
            return {
                id: 'mobileappultracore',
                name: t('Mobile App Ultra Pro / Ядро', 'Mobile App Ultra Pro / Core'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('Информация об устройстве', 'Device Information')
                    },
                    {
                        opcode: 'getDeviceType',
                        blockType: BlockType.REPORTER,
                        text: t('тип устройства', 'device type')
                    },
                    {
                        opcode: 'getOSName',
                        blockType: BlockType.REPORTER,
                        text: t('операционная система', 'operating system')
                    },
                    {
                        opcode: 'getOSVersion',
                        blockType: BlockType.REPORTER,
                        text: t('версия ОС', 'OS version')
                    },
                    {
                        opcode: 'getBrowserName',
                        blockType: BlockType.REPORTER,
                        text: t('название браузера', 'browser name')
                    },
                    {
                        opcode: 'getBrowserVersion',
                        blockType: BlockType.REPORTER,
                        text: t('версия браузера', 'browser version')
                    },
                    {
                        opcode: 'getDeviceLanguage',
                        blockType: BlockType.REPORTER,
                        text: t('язык устройства', 'device language')
                    },
                    {
                        opcode: 'isMobile',
                        blockType: BlockType.BOOLEAN,
                        text: t('это мобильное устройство?', 'is mobile device?')
                    },
                    {
                        opcode: 'isTablet',
                        blockType: BlockType.BOOLEAN,
                        text: t('это планшет?', 'is tablet?')
                    },
                    {
                        opcode: 'getUserAgent',
                        blockType: BlockType.REPORTER,
                        text: 'User Agent'
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Экран и размеры', 'Screen and Size')
                    },
                    {
                        opcode: 'getScreenWidth',
                        blockType: BlockType.REPORTER,
                        text: t('ширина экрана', 'screen width')
                    },
                    {
                        opcode: 'getScreenHeight',
                        blockType: BlockType.REPORTER,
                        text: t('высота экрана', 'screen height')
                    },
                    {
                        opcode: 'getWindowWidth',
                        blockType: BlockType.REPORTER,
                        text: t('ширина окна', 'window width')
                    },
                    {
                        opcode: 'getWindowHeight',
                        blockType: BlockType.REPORTER,
                        text: t('высота окна', 'window height')
                    },
                    {
                        opcode: 'getDPR',
                        blockType: BlockType.REPORTER,
                        text: t('плотность пикселей (DPR)', 'pixel density (DPR)')
                    },
                    {
                        opcode: 'getOrientation',
                        blockType: BlockType.REPORTER,
                        text: t('ориентация', 'orientation')
                    },
                    {
                        opcode: 'isOrientation',
                        blockType: BlockType.BOOLEAN,
                        text: t('ориентация = [MODE]?', 'orientation = [MODE]?'),
                        arguments: {
                            MODE: {
                                type: ArgumentType.STRING,
                                menu: 'orientationMenu',
                                defaultValue: 'portrait'
                            }
                        }
                    },
                    {
                        opcode: 'isFullscreen',
                        blockType: BlockType.BOOLEAN,
                        text: t('полноэкранный режим?', 'fullscreen mode?')
                    },
                    {
                        opcode: 'toggleFullscreen',
                        blockType: BlockType.COMMAND,
                        text: t('переключить полноэкранный режим', 'toggle fullscreen')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Батарея', 'Battery')
                    },
                    {
                        opcode: 'getBatteryLevel',
                        blockType: BlockType.REPORTER,
                        text: t('уровень батареи (0-100)', 'battery level (0-100)')
                    },
                    {
                        opcode: 'isBatteryCharging',
                        blockType: BlockType.BOOLEAN,
                        text: t('батарея заряжается?', 'battery charging?')
                    },
                    {
                        opcode: 'isBatteryLow',
                        blockType: BlockType.BOOLEAN,
                        text: t('батарея низкая? (<20%)', 'battery low? (<20%)')
                    },
                    {
                        opcode: 'whenBatteryChanged',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда уровень батареи изменился', 'when battery level changed')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Сеть и подключение', 'Network and Connection')
                    },
                    {
                        opcode: 'hasInternet',
                        blockType: BlockType.BOOLEAN,
                        text: t('есть интернет?', 'has internet?')
                    },
                    {
                        opcode: 'getConnectionType',
                        blockType: BlockType.REPORTER,
                        text: t('тип подключения', 'connection type')
                    },
                    {
                        opcode: 'isConnectionType',
                        blockType: BlockType.BOOLEAN,
                        text: t('подключение = [TYPE]?', 'connection = [TYPE]?'),
                        arguments: {
                            TYPE: {
                                type: ArgumentType.STRING,
                                menu: 'connectionMenu',
                                defaultValue: 'wifi'
                            }
                        }
                    },
                    {
                        opcode: 'whenInternetOn',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда появился интернет', 'when internet connected')
                    },
                    {
                        opcode: 'whenInternetOff',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда пропал интернет', 'when internet disconnected')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Память и производительность', 'Memory and Performance')
                    },
                    {
                        opcode: 'getMemoryMB',
                        blockType: BlockType.REPORTER,
                        text: t('доступная память (MB)', 'available memory (MB)')
                    },
                    {
                        opcode: 'getCPUCores',
                        blockType: BlockType.REPORTER,
                        text: t('количество ядер процессора', 'CPU core count')
                    },
                    {
                        opcode: 'getFPS',
                        blockType: BlockType.REPORTER,
                        text: 'FPS ' + t('текущий', 'current')
                    },
                    {
                        opcode: 'getPerformanceLevel',
                        blockType: BlockType.REPORTER,
                        text: t('производительность устройства', 'device performance')
                    },
                    {
                        opcode: 'isSaveData',
                        blockType: BlockType.BOOLEAN,
                        text: t('режим экономии данных включён?', 'save-data mode enabled?')
                    }
                ],
                menus: {
                    orientationMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'portrait / портрет', value: 'portrait' },
                            { text: 'landscape / альбом', value: 'landscape' }
                        ]
                    },
                    connectionMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'wifi / Wi‑Fi', value: 'wifi' },
                            { text: 'cellular / сотовая', value: 'cellular' },
                            { text: 'ethernet / ethernet', value: 'ethernet' },
                            { text: 'none / нет', value: 'none' },
                            { text: 'unknown / неизвестно', value: 'unknown' }
                        ]
                    }
                }
            };
        }

        getDeviceType() {
            return detectDeviceType();
        }

        getOSName() {
            return detectOS();
        }

        getOSVersion() {
            return detectOSVersion() || '';
        }

        getBrowserName() {
            return detectBrowser();
        }

        getBrowserVersion() {
            return detectBrowserVersion() || '';
        }

        getDeviceLanguage() {
            if (typeof navigator === 'undefined') return 'en';
            return navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
        }

        isMobile() {
            return isMobileDevice();
        }

        isTablet() {
            return detectDeviceType() === 'tablet';
        }

        getUserAgent() {
            return ua();
        }

        getScreenWidth() {
            return typeof screen !== 'undefined' ? safeNumber(screen.width) : 0;
        }

        getScreenHeight() {
            return typeof screen !== 'undefined' ? safeNumber(screen.height) : 0;
        }

        getWindowWidth() {
            return typeof window !== 'undefined' ? safeNumber(window.innerWidth) : 0;
        }

        getWindowHeight() {
            return typeof window !== 'undefined' ? safeNumber(window.innerHeight) : 0;
        }

        getDPR() {
            return typeof window !== 'undefined' ? safeNumber(window.devicePixelRatio || 1) : 1;
        }

        getOrientation() {
            ensureScreenInit();
            return shared.screen.orientation;
        }

        isOrientation(args) {
            const mode = String(args.MODE || '').toLowerCase();
            return this.getOrientation() === mode;
        }

        isFullscreen() {
            if (typeof document === 'undefined') return false;
            return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
        }

        toggleFullscreen() {
            if (typeof document === 'undefined') return;

            const elem = document.documentElement;
            const isFs = this.isFullscreen();

            if (!isFs) {
                const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
                if (typeof req === 'function') {
                    try {
                        req.call(elem);
                    } catch (e) {
                        console.warn('Mobile App Ultra Pro: fullscreen enter failed', e);
                    }
                }
            } else {
                const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
                if (typeof exit === 'function') {
                    try {
                        exit.call(document);
                    } catch (e) {
                        console.warn('Mobile App Ultra Pro: fullscreen exit failed', e);
                    }
                }
            }
        }

        getBatteryLevel() {
            ensureBatteryInit();
            return shared.battery.supported ? shared.battery.level : -1;
        }

        isBatteryCharging() {
            ensureBatteryInit();
            return shared.battery.supported ? shared.battery.charging : false;
        }

        isBatteryLow() {
            ensureBatteryInit();
            return shared.battery.supported ? shared.battery.level < 20 : false;
        }

        whenBatteryChanged() {
            const v = shared.battery.changedEdge;
            shared.battery.changedEdge = false;
            return v;
        }

        hasInternet() {
            ensureNetworkInit();
            return shared.network.online;
        }

        getConnectionType() {
            ensureNetworkInit();
            return shared.network.type;
        }

        isConnectionType(args) {
            ensureNetworkInit();
            return shared.network.type === String(args.TYPE || '').toLowerCase();
        }

        whenInternetOn() {
            const v = shared.network.internetOnEdge;
            shared.network.internetOnEdge = false;
            return v;
        }

        whenInternetOff() {
            const v = shared.network.internetOffEdge;
            shared.network.internetOffEdge = false;
            return v;
        }

        getMemoryMB() {
            if (typeof navigator !== 'undefined' && Number.isFinite(navigator.deviceMemory)) {
                return Math.round(navigator.deviceMemory * 1024);
            }

            if (typeof performance !== 'undefined' && performance.memory && Number.isFinite(performance.memory.jsHeapSizeLimit)) {
                return Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
            }

            return -1;
        }

        getCPUCores() {
            if (typeof navigator !== 'undefined' && Number.isFinite(navigator.hardwareConcurrency)) {
                return navigator.hardwareConcurrency;
            }
            return -1;
        }

        getFPS() {
            ensureFpsLoop();
            return shared.perf.fps || 0;
        }

        getPerformanceLevel() {
            const mem = this.getMemoryMB();
            const cores = this.getCPUCores();
            const mobile = this.isMobile();

            let score = 0;
            if (cores >= 8) score += 2;
            else if (cores >= 4) score += 1;

            if (mem >= 8192) score += 2;
            else if (mem >= 4096) score += 1;
            else if (mem > 0 && mem < 2048) score -= 1;

            if (mobile) score -= 0.25;

            if (score >= 3) return 'high';
            if (score >= 1) return 'medium';
            return 'low';
        }

        isSaveData() {
            ensureNetworkInit();
            return !!shared.network.saveData;
        }
    }

    Scratch.extensions.register(new MobileAppUltraCore());
})(Scratch);
