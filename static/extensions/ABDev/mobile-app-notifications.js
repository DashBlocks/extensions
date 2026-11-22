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

    if (!MAU._notificationsShared) {
        MAU._notificationsShared = {
            notifications: {
                supported: typeof Notification !== 'undefined',
                permission: typeof Notification !== 'undefined' ? Notification.permission : 'denied',
                active: [],
                clickEdge: false,
                lastClickedTitle: '',
                actionEdges: {},
                lastAction: ''
            },
            dialogs: {
                lastResult: '',
                lastOk: false,
                lastCancel: false
            },
            toast: {
                element: null,
                hideTimer: null,
                visible: false
            },
            badge: {
                supported: false,
                current: 0,
                checked: false
            }
        };
    }

    const shared = MAU._notificationsShared;

    const t = (ru, en) => {
        const lang = (typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en').toLowerCase();
        return lang.startsWith('ru') ? ru : en;
    };

    function refreshNotificationPermission() {
        shared.notifications.supported = typeof Notification !== 'undefined';
        shared.notifications.permission = typeof Notification !== 'undefined' ? Notification.permission : 'denied';
    }

    async function requestNotificationPermissionInternal() {
        refreshNotificationPermission();
        if (!shared.notifications.supported) return false;

        try {
            const result = await Notification.requestPermission();
            shared.notifications.permission = result;
            return result === 'granted';
        } catch (e) {
            console.warn('Mobile App Ultra Pro: notification permission request failed', e);
            return false;
        }
    }

    function attachNotificationEvents(notification, title, actions) {
        notification.onclick = function () {
            shared.notifications.clickEdge = true;
            shared.notifications.lastClickedTitle = String(title || '');
            try {
                notification.close();
            } catch (e) {}
        };

        if (Array.isArray(actions)) {
            for (const action of actions) {
                const key = String(action || '');
                if (!(key in shared.notifications.actionEdges)) {
                    shared.notifications.actionEdges[key] = false;
                }
            }
        }
    }

    function showNotificationInternal(title, body, icon, actions) {
        refreshNotificationPermission();

        if (!shared.notifications.supported) {
            console.warn('Mobile App Ultra Pro: Notifications are not supported in this browser.');
            return false;
        }

        if (shared.notifications.permission !== 'granted') {
            console.warn('Mobile App Ultra Pro: Notification permission is not granted.');
            return false;
        }

        try {
            const options = {
                body: String(body || ''),
                icon: icon ? String(icon) : undefined,
                badge: icon ? String(icon) : undefined,
                tag: 'mobile-app-ultra-pro',
                renotify: true
            };

            if (Array.isArray(actions) && actions.length > 0) {
                options.actions = actions.map(a => ({
                    action: String(a),
                    title: String(a)
                }));
            }

            const n = new Notification(String(title || ''), options);

            attachNotificationEvents(n, title, actions);

            n.onshow = function () {};
            n.onclose = function () {};
            n.onerror = function (e) {
                console.warn('Mobile App Ultra Pro: notification error', e);
            };

            shared.notifications.active.push(n);
            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: showNotification failed', e);
            return false;
        }
    }

    function ensureToastElement() {
        if (typeof document === 'undefined') return null;
        if (shared.toast.element) return shared.toast.element;

        const el = document.createElement('div');
        el.style.position = 'fixed';
        el.style.left = '50%';
        el.style.bottom = '24px';
        el.style.transform = 'translateX(-50%)';
        el.style.maxWidth = '80vw';
        el.style.padding = '12px 18px';
        el.style.background = 'rgba(30,30,30,0.92)';
        el.style.color = '#fff';
        el.style.borderRadius = '14px';
        el.style.fontFamily = 'sans-serif';
        el.style.fontSize = '14px';
        el.style.lineHeight = '1.4';
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
        el.style.zIndex = '2147483647';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        el.style.transformOrigin = 'center center';
        document.body.appendChild(el);

        shared.toast.element = el;
        return el;
    }

    function setToastPosition(pos) {
        const el = ensureToastElement();
        if (!el) return;

        const p = String(pos || 'bottom').toLowerCase();
        el.style.top = '';
        el.style.bottom = '';
        el.style.transform = 'translateX(-50%)';

        if (p === 'top') {
            el.style.top = '24px';
        } else if (p === 'middle') {
            el.style.top = '50%';
            el.style.transform = 'translate(-50%, -50%)';
        } else {
            el.style.bottom = '24px';
        }
    }

    function showToastInternal(message, duration, position) {
        const el = ensureToastElement();
        if (!el) {
            console.warn('Mobile App Ultra Pro: Toast is not supported without document.');
            return false;
        }

        if (shared.toast.hideTimer) {
            clearTimeout(shared.toast.hideTimer);
            shared.toast.hideTimer = null;
        }

        setToastPosition(position);
        el.textContent = String(message || '');
        el.style.opacity = '1';
        shared.toast.visible = true;

        const dur = Math.max(0.2, Number(duration) || 2) * 1000;
        shared.toast.hideTimer = setTimeout(() => {
            hideToastInternal();
        }, dur);

        return true;
    }

    function hideToastInternal() {
        const el = ensureToastElement();
        if (!el) return false;

        if (shared.toast.hideTimer) {
            clearTimeout(shared.toast.hideTimer);
            shared.toast.hideTimer = null;
        }

        el.style.opacity = '0';
        shared.toast.visible = false;
        return true;
    }

    async function checkBadgeSupport() {
        if (shared.badge.checked) return shared.badge.supported;
        shared.badge.checked = true;

        try {
            const nav = typeof navigator !== 'undefined' ? navigator : null;
            shared.badge.supported = !!(
                nav &&
                (
                    typeof nav.setAppBadge === 'function' ||
                    typeof nav.clearAppBadge === 'function'
                )
            );
        } catch (e) {
            shared.badge.supported = false;
        }
        return shared.badge.supported;
    }

    class MobileAppUltraNotifications {
        getInfo() {
            return {
                id: 'mobileappultranotifications',
                name: t('Mobile App Ultra Pro / Уведомления', 'Mobile App Ultra Pro / Notifications'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('Уведомления', 'Notifications')
                    },
                    {
                        opcode: 'notificationsAvailable',
                        blockType: BlockType.BOOLEAN,
                        text: t('уведомления доступны?', 'notifications available?')
                    },
                    {
                        opcode: 'requestNotificationPermission',
                        blockType: BlockType.COMMAND,
                        text: t('запросить разрешение на уведомления', 'request notification permission')
                    },
                    {
                        opcode: 'notificationPermissionGranted',
                        blockType: BlockType.BOOLEAN,
                        text: t('разрешение получено?', 'permission granted?')
                    },
                    {
                        opcode: 'showNotificationBasic',
                        blockType: BlockType.COMMAND,
                        text: t('показать уведомление [TITLE] текст [BODY]', 'show notification [TITLE] text [BODY]'),
                        arguments: {
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'Hello' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Message text' }
                        }
                    },
                    {
                        opcode: 'showNotificationIcon',
                        blockType: BlockType.COMMAND,
                        text: t('показать уведомление [TITLE] текст [BODY] иконка [ICON]', 'show notification [TITLE] text [BODY] icon [ICON]'),
                        arguments: {
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'Hello' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Message text' },
                            ICON: { type: ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'showNotificationActions',
                        blockType: BlockType.COMMAND,
                        text: t('показать уведомление с действиями [TITLE] текст [BODY] кнопки [BUTTONS]', 'show notification with actions [TITLE] text [BODY] buttons [BUTTONS]'),
                        arguments: {
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'Hello' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Choose action' },
                            BUTTONS: { type: ArgumentType.STRING, defaultValue: 'OK,Cancel' }
                        }
                    },
                    {
                        opcode: 'closeAllNotifications',
                        blockType: BlockType.COMMAND,
                        text: t('закрыть все уведомления', 'close all notifications')
                    },
                    {
                        opcode: 'whenNotificationClicked',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда уведомление нажато', 'when notification clicked')
                    },
                    {
                        opcode: 'whenActionClicked',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда действие [ACTION] нажато', 'when action [ACTION] clicked'),
                        arguments: {
                            ACTION: { type: ArgumentType.STRING, defaultValue: 'OK' }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Диалоги', 'Dialogs')
                    },
                    {
                        opcode: 'showAlert',
                        blockType: BlockType.COMMAND,
                        text: t('показать alert [MESSAGE]', 'show alert [MESSAGE]'),
                        arguments: {
                            MESSAGE: { type: ArgumentType.STRING, defaultValue: 'Hello!' }
                        }
                    },
                    {
                        opcode: 'showConfirm',
                        blockType: BlockType.BOOLEAN,
                        text: t('показать confirm [MESSAGE]', 'show confirm [MESSAGE]'),
                        arguments: {
                            MESSAGE: { type: ArgumentType.STRING, defaultValue: 'Continue?' }
                        }
                    },
                    {
                        opcode: 'showPrompt',
                        blockType: BlockType.REPORTER,
                        text: t('показать prompt [MESSAGE] по умолчанию [DEFAULT]', 'show prompt [MESSAGE] default [DEFAULT]'),
                        arguments: {
                            MESSAGE: { type: ArgumentType.STRING, defaultValue: 'Enter text' },
                            DEFAULT: { type: ArgumentType.STRING, defaultValue: 'text' }
                        }
                    },
                    {
                        opcode: 'getLastDialogResult',
                        blockType: BlockType.REPORTER,
                        text: t('результат последнего диалога', 'last dialog result')
                    },
                    {
                        opcode: 'didUserPressOK',
                        blockType: BlockType.BOOLEAN,
                        text: t('пользователь нажал OK?', 'user pressed OK?')
                    },
                    {
                        opcode: 'didUserPressCancel',
                        blockType: BlockType.BOOLEAN,
                        text: t('пользователь нажал Отмена?', 'user pressed Cancel?')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Toast / Snackbar', 'Toast / Snackbar')
                    },
                    {
                        opcode: 'showToastSimple',
                        blockType: BlockType.COMMAND,
                        text: t('показать toast [MESSAGE]', 'show toast [MESSAGE]'),
                        arguments: {
                            MESSAGE: { type: ArgumentType.STRING, defaultValue: 'Saved!' }
                        }
                    },
                    {
                        opcode: 'showToastDuration',
                        blockType: BlockType.COMMAND,
                        text: t('показать toast [MESSAGE] на [DURATION] сек', 'show toast [MESSAGE] for [DURATION] sec'),
                        arguments: {
                            MESSAGE: { type: ArgumentType.STRING, defaultValue: 'Saved!' },
                            DURATION: { type: ArgumentType.NUMBER, defaultValue: 2 }
                        }
                    },
                    {
                        opcode: 'showToastPosition',
                        blockType: BlockType.COMMAND,
                        text: t('показать toast [MESSAGE] позиция [POSITION]', 'show toast [MESSAGE] position [POSITION]'),
                        arguments: {
                            MESSAGE: { type: ArgumentType.STRING, defaultValue: 'Saved!' },
                            POSITION: { type: ArgumentType.STRING, menu: 'toastPositionMenu', defaultValue: 'bottom' }
                        }
                    },
                    {
                        opcode: 'hideToast',
                        blockType: BlockType.COMMAND,
                        text: t('скрыть toast', 'hide toast')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Badge', 'Badge')
                    },
                    {
                        opcode: 'badgeAvailable',
                        blockType: BlockType.BOOLEAN,
                        text: t('badge доступен?', 'badge available?')
                    },
                    {
                        opcode: 'setBadge',
                        blockType: BlockType.COMMAND,
                        text: t('установить badge [NUMBER]', 'set badge [NUMBER]'),
                        arguments: {
                            NUMBER: { type: ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'clearBadge',
                        blockType: BlockType.COMMAND,
                        text: t('очистить badge', 'clear badge')
                    }
                ],
                menus: {
                    toastPositionMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'top / сверху', value: 'top' },
                            { text: 'middle / по центру', value: 'middle' },
                            { text: 'bottom / снизу', value: 'bottom' }
                        ]
                    }
                }
            };
        }

        notificationsAvailable() {
            refreshNotificationPermission();
            return shared.notifications.supported;
        }

        requestNotificationPermission() {
            requestNotificationPermissionInternal();
        }

        notificationPermissionGranted() {
            refreshNotificationPermission();
            return shared.notifications.permission === 'granted';
        }

        showNotificationBasic(args) {
            showNotificationInternal(args.TITLE, args.BODY, '', []);
        }

        showNotificationIcon(args) {
            showNotificationInternal(args.TITLE, args.BODY, args.ICON, []);
        }

        showNotificationActions(args) {
            const actions = String(args.BUTTONS || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            showNotificationInternal(args.TITLE, args.BODY, '', actions);

            for (const action of actions) {
                shared.notifications.actionEdges[action] = false;
            }

            if (actions.length > 0) {
                console.warn('Mobile App Ultra Pro: Native notification action click events are limited in regular browser Notification API.');
            }
        }

        closeAllNotifications() {
            try {
                for (const n of shared.notifications.active) {
                    try {
                        n.close();
                    } catch (e) {}
                }
            } catch (e) {
                console.warn('Mobile App Ultra Pro: closeAllNotifications failed', e);
            }
            shared.notifications.active = [];
        }

        whenNotificationClicked() {
            const v = shared.notifications.clickEdge;
            shared.notifications.clickEdge = false;
            return v;
        }

        whenActionClicked(args) {
            const key = String(args.ACTION || '');
            const v = !!shared.notifications.actionEdges[key];
            shared.notifications.actionEdges[key] = false;
            return v;
        }

        showAlert(args) {
            try {
                alert(String(args.MESSAGE || ''));
                shared.dialogs.lastResult = String(args.MESSAGE || '');
                shared.dialogs.lastOk = true;
                shared.dialogs.lastCancel = false;
            } catch (e) {
                console.warn('Mobile App Ultra Pro: alert failed', e);
            }
        }

        showConfirm(args) {
            try {
                const res = confirm(String(args.MESSAGE || ''));
                shared.dialogs.lastResult = String(res);
                shared.dialogs.lastOk = !!res;
                shared.dialogs.lastCancel = !res;
                return !!res;
            } catch (e) {
                console.warn('Mobile App Ultra Pro: confirm failed', e);
                return false;
            }
        }

        showPrompt(args) {
            try {
                const res = prompt(String(args.MESSAGE || ''), String(args.DEFAULT || ''));
                if (res === null) {
                    shared.dialogs.lastResult = '';
                    shared.dialogs.lastOk = false;
                    shared.dialogs.lastCancel = true;
                    return '';
                }
                shared.dialogs.lastResult = String(res);
                shared.dialogs.lastOk = true;
                shared.dialogs.lastCancel = false;
                return String(res);
            } catch (e) {
                console.warn('Mobile App Ultra Pro: prompt failed', e);
                return '';
            }
        }

        getLastDialogResult() {
            return shared.dialogs.lastResult || '';
        }

        didUserPressOK() {
            return !!shared.dialogs.lastOk;
        }

        didUserPressCancel() {
            return !!shared.dialogs.lastCancel;
        }

        showToastSimple(args) {
            showToastInternal(args.MESSAGE, 2, 'bottom');
        }

        showToastDuration(args) {
            showToastInternal(args.MESSAGE, args.DURATION, 'bottom');
        }

        showToastPosition(args) {
            showToastInternal(args.MESSAGE, 2, args.POSITION);
        }

        hideToast() {
            hideToastInternal();
        }

        badgeAvailable() {
            checkBadgeSupport();
            return !!shared.badge.supported;
        }

        setBadge(args) {
            const value = Math.max(0, Math.floor(Number(args.NUMBER) || 0));
            shared.badge.current = value;

            checkBadgeSupport().then(supported => {
                if (!supported) {
                    console.warn('Mobile App Ultra Pro: Badge API is not supported.');
                    return;
                }

                try {
                    if (typeof navigator.setAppBadge === 'function') {
                        navigator.setAppBadge(value);
                    }
                } catch (e) {
                    console.warn('Mobile App Ultra Pro: setBadge failed', e);
                }
            });
        }

        clearBadge() {
            shared.badge.current = 0;

            checkBadgeSupport().then(supported => {
                if (!supported) return;

                try {
                    if (typeof navigator.clearAppBadge === 'function') {
                        navigator.clearAppBadge();
                    }
                } catch (e) {
                    console.warn('Mobile App Ultra Pro: clearBadge failed', e);
                }
            });
        }
    }

    Scratch.extensions.register(new MobileAppUltraNotifications());
})(Scratch);
