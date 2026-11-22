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

    if (!MAU._socialShared) {
        MAU._socialShared = {
            share: {
                lastSuccess: false,
                lastError: '',
                referralCounter: 1
            },
            referral: {
                lastLink: '',
                lastCode: '',
                trackedCode: ''
            }
        };
    }

    const shared = MAU._socialShared;

    const t = (ru, en) => {
        const lang = (typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en').toLowerCase();
        return lang.startsWith('ru') ? ru : en;
    };

    function safeString(v) {
        if (v === null || v === undefined) return '';
        return String(v);
    }

    function openURL(url) {
        try {
            if (typeof window !== 'undefined' && typeof window.open === 'function') {
                window.open(String(url), '_blank', 'noopener,noreferrer');
                return true;
            }
        } catch (e) {
            console.warn('Mobile App Ultra Pro Social: openURL failed', e);
        }
        return false;
    }

    async function tryNativeShare(data) {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(data);
                shared.share.lastSuccess = true;
                shared.share.lastError = '';
                return true;
            } catch (e) {
                shared.share.lastSuccess = false;
                shared.share.lastError = e && e.message ? String(e.message) : 'Share failed';
                console.warn('Mobile App Ultra Pro Social: native share failed', e);
                return false;
            }
        }
        return false;
    }

    function buildCurrentBaseURL() {
        if (typeof location !== 'undefined' && location.href) {
            return location.origin + location.pathname;
        }
        return 'https:
    }

    class MobileAppUltraSocial {
        getInfo() {
            return {
                id: 'mobileappultrasocial',
                name: t('Mobile App Ultra Pro / Социальное', 'Mobile App Ultra Pro / Social'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('Поделиться', 'Share')
                    },
                    {
                        opcode: 'shareText',
                        blockType: BlockType.COMMAND,
                        text: t('поделиться текстом [TEXT]', 'share text [TEXT]'),
                        arguments: {
                            TEXT: { type: ArgumentType.STRING, defaultValue: 'Привет!' }
                        }
                    },
                    {
                        opcode: 'shareLink',
                        blockType: BlockType.COMMAND,
                        text: t('поделиться ссылкой [URL]', 'share link [URL]'),
                        arguments: {
                            URL: { type: ArgumentType.STRING, defaultValue: 'https:
                        }
                    },
                    {
                        opcode: 'shareImage',
                        blockType: BlockType.COMMAND,
                        text: t('поделиться изображением [IMAGE_URL]', 'share image [IMAGE_URL]'),
                        arguments: {
                            IMAGE_URL: { type: ArgumentType.STRING, defaultValue: 'https:
                        }
                    },
                    {
                        opcode: 'shareFile',
                        blockType: BlockType.COMMAND,
                        text: t('поделиться файлом [FILE_URL]', 'share file [FILE_URL]'),
                        arguments: {
                            FILE_URL: { type: ArgumentType.STRING, defaultValue: 'https:
                        }
                    },
                    {
                        opcode: 'shareAdvanced',
                        blockType: BlockType.COMMAND,
                        text: t('поделиться [TITLE] текст [TEXT] URL [URL]', 'share [TITLE] text [TEXT] URL [URL]'),
                        arguments: {
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'My App' },
                            TEXT: { type: ArgumentType.STRING, defaultValue: 'Посмотри это!' },
                            URL: { type: ArgumentType.STRING, defaultValue: 'https:
                        }
                    },
                    {
                        opcode: 'isShareAvailable',
                        blockType: BlockType.BOOLEAN,
                        text: t('шаринг доступен?', 'sharing available?')
                    },
                    {
                        opcode: 'wasLastShareSuccessful',
                        blockType: BlockType.BOOLEAN,
                        text: t('последний шаринг успешен?', 'last share successful?')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Социальные сети', 'Social Networks')
                    },
                    {
                        opcode: 'openTwitterProfile',
                        blockType: BlockType.COMMAND,
                        text: t('открыть профиль Twitter [USERNAME]', 'open Twitter profile [USERNAME]'),
                        arguments: {
                            USERNAME: { type: ArgumentType.STRING, defaultValue: 'twitter' }
                        }
                    },
                    {
                        opcode: 'openInstagramProfile',
                        blockType: BlockType.COMMAND,
                        text: t('открыть профиль Instagram [USERNAME]', 'open Instagram profile [USERNAME]'),
                        arguments: {
                            USERNAME: { type: ArgumentType.STRING, defaultValue: 'instagram' }
                        }
                    },
                    {
                        opcode: 'openTelegramProfile',
                        blockType: BlockType.COMMAND,
                        text: t('открыть профиль Telegram [USERNAME]', 'open Telegram profile [USERNAME]'),
                        arguments: {
                            USERNAME: { type: ArgumentType.STRING, defaultValue: 'telegram' }
                        }
                    },
                    {
                        opcode: 'openVKProfile',
                        blockType: BlockType.COMMAND,
                        text: t('открыть профиль VK [ID]', 'open VK profile [ID]'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'durov' }
                        }
                    },
                    {
                        opcode: 'tweetText',
                        blockType: BlockType.COMMAND,
                        text: t('твитнуть [TEXT]', 'tweet [TEXT]'),
                        arguments: {
                            TEXT: { type: ArgumentType.STRING, defaultValue: 'Hello Twitter!' }
                        }
                    },
                    {
                        opcode: 'sendTelegramMessage',
                        blockType: BlockType.COMMAND,
                        text: t('написать в Telegram [USERNAME] [TEXT]', 'send Telegram [USERNAME] [TEXT]'),
                        arguments: {
                            USERNAME: { type: ArgumentType.STRING, defaultValue: 'telegram' },
                            TEXT: { type: ArgumentType.STRING, defaultValue: 'Привет!' }
                        }
                    },
                    {
                        opcode: 'sendWhatsAppMessage',
                        blockType: BlockType.COMMAND,
                        text: t('написать в WhatsApp [PHONE] [TEXT]', 'send WhatsApp [PHONE] [TEXT]'),
                        arguments: {
                            PHONE: { type: ArgumentType.STRING, defaultValue: '79990000000' },
                            TEXT: { type: ArgumentType.STRING, defaultValue: 'Hello!' }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Отзывы и магазин', 'Reviews and Store')
                    },
                    {
                        opcode: 'requestStoreReview',
                        blockType: BlockType.COMMAND,
                        text: t('запросить отзыв в App Store / Google Play', 'request review in App Store / Google Play')
                    },
                    {
                        opcode: 'openAppStorePage',
                        blockType: BlockType.COMMAND,
                        text: t('открыть страницу приложения в магазине', 'open app store page')
                    },
                    {
                        opcode: 'openReviewPage',
                        blockType: BlockType.COMMAND,
                        text: t('открыть страницу для отзыва', 'open review page')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Приглашения', 'Invites')
                    },
                    {
                        opcode: 'createReferralLink',
                        blockType: BlockType.REPORTER,
                        text: t('создать реферальную ссылку', 'create referral link')
                    },
                    {
                        opcode: 'shareReferralLink',
                        blockType: BlockType.COMMAND,
                        text: t('поделиться реферальной ссылкой', 'share referral link')
                    },
                    {
                        opcode: 'trackReferral',
                        blockType: BlockType.COMMAND,
                        text: t('отслеживать реферал [CODE]', 'track referral [CODE]'),
                        arguments: {
                            CODE: { type: ArgumentType.STRING, defaultValue: 'REF123' }
                        }
                    },
                    {
                        opcode: 'getTrackedReferral',
                        blockType: BlockType.REPORTER,
                        text: t('текущий реферал', 'current referral')
                    }
                ]
            };
        }

        async shareText(args) {
            const text = safeString(args.TEXT);
            const ok = await tryNativeShare({ text });
            if (!ok) {
                shared.share.lastSuccess = openURL('mailto:?body=' + encodeURIComponent(text));
            }
        }

        async shareLink(args) {
            const url = safeString(args.URL);
            const ok = await tryNativeShare({ url, text: url });
            if (!ok) {
                shared.share.lastSuccess = openURL(url);
            }
        }

        async shareImage(args) {
            const url = safeString(args.IMAGE_URL);
            const ok = await tryNativeShare({ title: 'Image', text: url, url });
            if (!ok) {
                shared.share.lastSuccess = openURL(url);
            }
        }

        async shareFile(args) {
            const url = safeString(args.FILE_URL);
            const ok = await tryNativeShare({ title: 'File', text: url, url });
            if (!ok) {
                shared.share.lastSuccess = openURL(url);
            }
        }

        async shareAdvanced(args) {
            const data = {
                title: safeString(args.TITLE),
                text: safeString(args.TEXT),
                url: safeString(args.URL)
            };
            const ok = await tryNativeShare(data);
            if (!ok) {
                const combined = (data.title ? data.title + '\n' : '') + data.text + '\n' + data.url;
                shared.share.lastSuccess = openURL('mailto:?subject=' + encodeURIComponent(data.title) + '&body=' + encodeURIComponent(combined));
            }
        }

        isShareAvailable() {
            return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
        }

        wasLastShareSuccessful() {
            return !!shared.share.lastSuccess;
        }

        openTwitterProfile(args) {
            const user = safeString(args.USERNAME).replace(/^@/, '');
            openURL('https:
        }

        openInstagramProfile(args) {
            const user = safeString(args.USERNAME).replace(/^@/, '');
            openURL('https:
        }

        openTelegramProfile(args) {
            const user = safeString(args.USERNAME).replace(/^@/, '');
            openURL('https:
        }

        openVKProfile(args) {
            const id = safeString(args.ID);
            openURL('https:
        }

        tweetText(args) {
            const text = safeString(args.TEXT);
            openURL('https:
        }

        sendTelegramMessage(args) {
            const user = safeString(args.USERNAME).replace(/^@/, '');
            const text = safeString(args.TEXT);
            openURL('https:
        }

        sendWhatsAppMessage(args) {
            const phone = safeString(args.PHONE).replace(/[^\d+]/g, '');
            const text = safeString(args.TEXT);
            openURL('https:
        }

        requestStoreReview() {
            console.warn('Mobile App Ultra Pro Social: native review dialog is not available in plain browser. Use native app bridge later.');
            this.openReviewPage();
        }

        openAppStorePage() {
            const url = MAU.appStoreURL || 'https:
            openURL(url);
        }

        openReviewPage() {
            const url = MAU.reviewURL || MAU.appStoreURL || 'https:
            openURL(url);
        }

        createReferralLink() {
            const code = 'REF' + Date.now().toString(36).toUpperCase() + String(shared.share.referralCounter++);
            const base = buildCurrentBaseURL();
            const link = base + '?ref=' + encodeURIComponent(code);

            shared.referral.lastCode = code;
            shared.referral.lastLink = link;

            return link;
        }

        async shareReferralLink() {
            const link = shared.referral.lastLink || this.createReferralLink();
            const ok = await tryNativeShare({
                title: 'Referral',
                text: link,
                url: link
            });

            if (!ok) {
                shared.share.lastSuccess = openURL('mailto:?body=' + encodeURIComponent(link));
            }
        }

        trackReferral(args) {
            shared.referral.trackedCode = safeString(args.CODE);
        }

        getTrackedReferral() {
            return shared.referral.trackedCode || '';
        }
    }

    Scratch.extensions.register(new MobileAppUltraSocial());
})(Scratch);
