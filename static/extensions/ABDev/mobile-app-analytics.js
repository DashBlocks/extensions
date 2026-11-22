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

    if (!MAU._analyticsShared) {
        MAU._analyticsShared = {
            initialized: false,
            enabled: true,
            analyticsId: '',
            service: 'custom',
            currentScreen: '',
            userId: '',
            userProperties: {},
            events: [],
            ecommerce: [],
            lastEventTime: 0
        };
    }

    const shared = MAU._analyticsShared;

    const t = (ru, en) => {
        const lang = (typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en').toLowerCase();
        return lang.startsWith('ru') ? ru : en;
    };

    function safeString(v) {
        if (v === null || v === undefined) return '';
        return String(v);
    }

    function safeNumber(v, fallback) {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    }

    function parseJSON(text, fallback) {
        try {
            return JSON.parse(String(text));
        } catch (e) {
            return fallback;
        }
    }

    function saveAnalyticsState() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('MobileAppUltra.analytics.events', JSON.stringify(shared.events));
                localStorage.setItem('MobileAppUltra.analytics.ecommerce', JSON.stringify(shared.ecommerce));
                localStorage.setItem('MobileAppUltra.analytics.userProperties', JSON.stringify(shared.userProperties));
                localStorage.setItem('MobileAppUltra.analytics.userId', shared.userId);
                localStorage.setItem('MobileAppUltra.analytics.currentScreen', shared.currentScreen);
            }
        } catch (e) {
            console.warn('Mobile App Ultra Pro Analytics: save state failed', e);
        }
    }

    function loadAnalyticsState() {
        try {
            if (typeof localStorage !== 'undefined') {
                shared.events = parseJSON(localStorage.getItem('MobileAppUltra.analytics.events') || '[]', []);
                shared.ecommerce = parseJSON(localStorage.getItem('MobileAppUltra.analytics.ecommerce') || '[]', []);
                shared.userProperties = parseJSON(localStorage.getItem('MobileAppUltra.analytics.userProperties') || '{}', {});
                shared.userId = localStorage.getItem('MobileAppUltra.analytics.userId') || '';
                shared.currentScreen = localStorage.getItem('MobileAppUltra.analytics.currentScreen') || '';
            }
        } catch (e) {
            console.warn('Mobile App Ultra Pro Analytics: load state failed', e);
        }
    }

    loadAnalyticsState();

    function pushEvent(name, params, value, type) {
        if (!shared.enabled || !shared.initialized) return false;

        const event = {
            name: safeString(name),
            params: params || {},
            value: value,
            type: type || 'event',
            screen: shared.currentScreen,
            userId: shared.userId,
            time: Date.now()
        };

        shared.events.push(event);
        shared.lastEventTime = event.time;

        if (shared.events.length > 500) {
            shared.events.shift();
        }

        saveAnalyticsState();

        if (MAU.analyticsDebug) {
            console.log('Mobile App Ultra Analytics Event:', event);
        }

        return true;
    }

    function pushEcommerce(type, data) {
        if (!shared.enabled || !shared.initialized) return false;

        const item = {
            type: safeString(type),
            data: data || {},
            userId: shared.userId,
            screen: shared.currentScreen,
            time: Date.now()
        };

        shared.ecommerce.push(item);

        if (shared.ecommerce.length > 300) {
            shared.ecommerce.shift();
        }

        saveAnalyticsState();

        if (MAU.analyticsDebug) {
            console.log('Mobile App Ultra Analytics Ecommerce:', item);
        }

        return true;
    }

    class MobileAppUltraAnalytics {
        getInfo() {
            return {
                id: 'mobileappultraanalytics',
                name: t('Mobile App Ultra Pro / Аналитика', 'Mobile App Ultra Pro / Analytics'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('Инициализация', 'Initialization')
                    },
                    {
                        opcode: 'initAnalytics',
                        blockType: BlockType.COMMAND,
                        text: t('инициализировать аналитику [ANALYTICS_ID]', 'initialize analytics [ANALYTICS_ID]'),
                        arguments: {
                            ANALYTICS_ID: {
                                type: ArgumentType.STRING,
                                defaultValue: 'demo-analytics-id'
                            }
                        }
                    },
                    {
                        opcode: 'isAnalyticsInitialized',
                        blockType: BlockType.BOOLEAN,
                        text: t('аналитика инициализирована?', 'analytics initialized?')
                    },
                    {
                        opcode: 'enableAnalytics',
                        blockType: BlockType.COMMAND,
                        text: t('включить аналитику', 'enable analytics')
                    },
                    {
                        opcode: 'disableAnalytics',
                        blockType: BlockType.COMMAND,
                        text: t('отключить аналитику', 'disable analytics')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('События', 'Events')
                    },
                    {
                        opcode: 'sendEvent',
                        blockType: BlockType.COMMAND,
                        text: t('отправить событие [EVENT_NAME]', 'send event [EVENT_NAME]'),
                        arguments: {
                            EVENT_NAME: {
                                type: ArgumentType.STRING,
                                defaultValue: 'game_start'
                            }
                        }
                    },
                    {
                        opcode: 'sendEventParams',
                        blockType: BlockType.COMMAND,
                        text: t('отправить событие [EVENT_NAME] параметры [PARAMS_JSON]', 'send event [EVENT_NAME] params [PARAMS_JSON]'),
                        arguments: {
                            EVENT_NAME: {
                                type: ArgumentType.STRING,
                                defaultValue: 'level_start'
                            },
                            PARAMS_JSON: {
                                type: ArgumentType.STRING,
                                defaultValue: '{"level":1}'
                            }
                        }
                    },
                    {
                        opcode: 'sendEventValue',
                        blockType: BlockType.COMMAND,
                        text: t('отправить событие [EVENT_NAME] значение [VALUE]', 'send event [EVENT_NAME] value [VALUE]'),
                        arguments: {
                            EVENT_NAME: {
                                type: ArgumentType.STRING,
                                defaultValue: 'coins_earned'
                            },
                            VALUE: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Экраны и пользователь', 'Screens and User')
                    },
                    {
                        opcode: 'trackScreenView',
                        blockType: BlockType.COMMAND,
                        text: t('отправить просмотр экрана [SCREEN_NAME]', 'track screen view [SCREEN_NAME]'),
                        arguments: {
                            SCREEN_NAME: {
                                type: ArgumentType.STRING,
                                defaultValue: 'MainMenu'
                            }
                        }
                    },
                    {
                        opcode: 'setCurrentScreen',
                        blockType: BlockType.COMMAND,
                        text: t('текущий экран [SCREEN_NAME]', 'current screen [SCREEN_NAME]'),
                        arguments: {
                            SCREEN_NAME: {
                                type: ArgumentType.STRING,
                                defaultValue: 'Game'
                            }
                        }
                    },
                    {
                        opcode: 'setUserId',
                        blockType: BlockType.COMMAND,
                        text: t('установить ID пользователя [USER_ID]', 'set user ID [USER_ID]'),
                        arguments: {
                            USER_ID: {
                                type: ArgumentType.STRING,
                                defaultValue: 'user123'
                            }
                        }
                    },
                    {
                        opcode: 'setUserProperty',
                        blockType: BlockType.COMMAND,
                        text: t('установить свойство [PROPERTY] = [VALUE]', 'set property [PROPERTY] = [VALUE]'),
                        arguments: {
                            PROPERTY: {
                                type: ArgumentType.STRING,
                                defaultValue: 'country'
                            },
                            VALUE: {
                                type: ArgumentType.STRING,
                                defaultValue: 'RU'
                            }
                        }
                    },
                    {
                        opcode: 'resetUser',
                        blockType: BlockType.COMMAND,
                        text: t('сбросить пользователя', 'reset user')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('E-commerce', 'E-commerce')
                    },
                    {
                        opcode: 'trackPurchase',
                        blockType: BlockType.COMMAND,
                        text: t('отправить покупку [PRODUCT] цена [PRICE] валюта [CURRENCY]', 'track purchase [PRODUCT] price [PRICE] currency [CURRENCY]'),
                        arguments: {
                            PRODUCT: {
                                type: ArgumentType.STRING,
                                defaultValue: 'premium_pack'
                            },
                            PRICE: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 4.99
                            },
                            CURRENCY: {
                                type: ArgumentType.STRING,
                                defaultValue: 'USD'
                            }
                        }
                    },
                    {
                        opcode: 'trackAddToCart',
                        blockType: BlockType.COMMAND,
                        text: t('отправить добавление в корзину [PRODUCT]', 'track add to cart [PRODUCT]'),
                        arguments: {
                            PRODUCT: {
                                type: ArgumentType.STRING,
                                defaultValue: 'premium_pack'
                            }
                        }
                    },
                    {
                        opcode: 'trackViewItem',
                        blockType: BlockType.COMMAND,
                        text: t('отправить просмотр товара [PRODUCT]', 'track item view [PRODUCT]'),
                        arguments: {
                            PRODUCT: {
                                type: ArgumentType.STRING,
                                defaultValue: 'premium_pack'
                            }
                        }
                    },
                    {
                        opcode: 'trackCheckoutStart',
                        blockType: BlockType.COMMAND,
                        text: t('отправить начало оформления', 'track checkout start')
                    },
                    {
                        opcode: 'trackCheckoutComplete',
                        blockType: BlockType.COMMAND,
                        text: t('отправить завершение покупки [ORDER_ID]', 'track checkout complete [ORDER_ID]'),
                        arguments: {
                            ORDER_ID: {
                                type: ArgumentType.STRING,
                                defaultValue: 'order_001'
                            }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Стандартные события', 'Standard Events')
                    },
                    {
                        opcode: 'trackLevelComplete',
                        blockType: BlockType.COMMAND,
                        text: t('отправить "уровень пройден" [LEVEL]', 'track "level complete" [LEVEL]'),
                        arguments: {
                            LEVEL: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'trackAchievement',
                        blockType: BlockType.COMMAND,
                        text: t('отправить "достижение" [ACHIEVEMENT]', 'track "achievement" [ACHIEVEMENT]'),
                        arguments: {
                            ACHIEVEMENT: {
                                type: ArgumentType.STRING,
                                defaultValue: 'first_win'
                            }
                        }
                    },
                    {
                        opcode: 'trackShared',
                        blockType: BlockType.COMMAND,
                        text: t('отправить "поделился"', 'track "shared"')
                    },
                    {
                        opcode: 'trackRegistered',
                        blockType: BlockType.COMMAND,
                        text: t('отправить "зарегистрировался"', 'track "registered"')
                    },
                    {
                        opcode: 'trackLoggedIn',
                        blockType: BlockType.COMMAND,
                        text: t('отправить "вошёл"', 'track "logged in"')
                    },
                    {
                        opcode: 'trackSubscribed',
                        blockType: BlockType.COMMAND,
                        text: t('отправить "подписался"', 'track "subscribed"')
                    },
                    {
                        opcode: 'trackRatedApp',
                        blockType: BlockType.COMMAND,
                        text: t('отправить "оценил приложение"', 'track "rated app"')
                    }
                ]
            };
        }

        initAnalytics(args) {
            shared.initialized = true;
            shared.analyticsId = safeString(args.ANALYTICS_ID);
            shared.enabled = true;
            saveAnalyticsState();
        }

        isAnalyticsInitialized() {
            return !!shared.initialized;
        }

        enableAnalytics() {
            shared.enabled = true;
        }

        disableAnalytics() {
            shared.enabled = false;
        }

        sendEvent(args) {
            pushEvent(args.EVENT_NAME, {}, null, 'event');
        }

        sendEventParams(args) {
            const params = parseJSON(args.PARAMS_JSON, {});
            pushEvent(args.EVENT_NAME, params && typeof params === 'object' ? params : {}, null, 'event');
        }

        sendEventValue(args) {
            pushEvent(args.EVENT_NAME, {}, safeNumber(args.VALUE, 0), 'event');
        }

        trackScreenView(args) {
            const screen = safeString(args.SCREEN_NAME);
            shared.currentScreen = screen;
            pushEvent('screen_view', { screen_name: screen }, null, 'screen');
            saveAnalyticsState();
        }

        setCurrentScreen(args) {
            shared.currentScreen = safeString(args.SCREEN_NAME);
            saveAnalyticsState();
        }

        setUserId(args) {
            shared.userId = safeString(args.USER_ID);
            saveAnalyticsState();
        }

        setUserProperty(args) {
            const key = safeString(args.PROPERTY);
            if (!key) return;
            shared.userProperties[key] = safeString(args.VALUE);
            pushEvent('user_property_set', { property: key, value: shared.userProperties[key] }, null, 'user');
            saveAnalyticsState();
        }

        resetUser() {
            shared.userId = '';
            shared.userProperties = {};
            saveAnalyticsState();
        }

        trackPurchase(args) {
            const product = safeString(args.PRODUCT);
            const price = safeNumber(args.PRICE, 0);
            const currency = safeString(args.CURRENCY) || 'USD';

            pushEcommerce('purchase', {
                product: product,
                price: price,
                currency: currency
            });

            pushEvent('purchase', {
                product: product,
                currency: currency
            }, price, 'ecommerce');
        }

        trackAddToCart(args) {
            const product = safeString(args.PRODUCT);
            pushEcommerce('add_to_cart', { product: product });
            pushEvent('add_to_cart', { product: product }, null, 'ecommerce');
        }

        trackViewItem(args) {
            const product = safeString(args.PRODUCT);
            pushEcommerce('view_item', { product: product });
            pushEvent('view_item', { product: product }, null, 'ecommerce');
        }

        trackCheckoutStart() {
            pushEcommerce('begin_checkout', {});
            pushEvent('begin_checkout', {}, null, 'ecommerce');
        }

        trackCheckoutComplete(args) {
            const orderId = safeString(args.ORDER_ID);
            pushEcommerce('checkout_complete', { order_id: orderId });
            pushEvent('checkout_complete', { order_id: orderId }, null, 'ecommerce');
        }

        trackLevelComplete(args) {
            pushEvent('level_complete', { level: safeNumber(args.LEVEL, 1) }, null, 'game');
        }

        trackAchievement(args) {
            pushEvent('achievement_unlocked', { achievement: safeString(args.ACHIEVEMENT) }, null, 'game');
        }

        trackShared() {
            pushEvent('shared', {}, null, 'social');
        }

        trackRegistered() {
            pushEvent('registered', {}, null, 'auth');
        }

        trackLoggedIn() {
            pushEvent('logged_in', {}, null, 'auth');
        }

        trackSubscribed() {
            pushEvent('subscribed', {}, null, 'subscription');
        }

        trackRatedApp() {
            pushEvent('rated_app', {}, null, 'engagement');
        }
    }

    Scratch.extensions.register(new MobileAppUltraAnalytics());
})(Scratch);
