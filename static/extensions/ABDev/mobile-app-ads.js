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

    if (!MAU._adsShared) {
        MAU._adsShared = {
            initialized: false,
            network: '',
            appId: '',
            testMode: false,
            userAge: 0,
            consent: false,

            banner: {
                loaded: false,
                shown: false,
                adUnitId: '',
                position: 'bottom',
                size: 'standard',
                element: null,
                loadEdge: false,
                failEdge: false,
                clickEdge: false
            },

            interstitial: {
                loaded: false,
                shown: false,
                adUnitId: '',
                loadEdge: false,
                shownEdge: false,
                closedEdge: false,
                failEdge: false
            },

            rewarded: {
                loaded: false,
                shown: false,
                adUnitId: '',
                rewardReceived: false,
                rewardType: 'coins',
                rewardAmount: 0,
                loadEdge: false,
                shownEdge: false,
                closedEdge: false,
                rewardEdge: false,
                failEdge: false
            },

            rewardedInterstitial: {
                loaded: false,
                adUnitId: ''
            },

            nativeAd: {
                loaded: false,
                adUnitId: '',
                title: '',
                body: '',
                iconURL: '',
                imageURL: '',
                cta: ''
            },

            appOpen: {
                loaded: false,
                adUnitId: '',
                shownEdge: false,
                closedEdge: false
            },

            stats: {
                impressions: 0,
                clicks: 0,
                earnedCoins: 0,
                lastError: ''
            }
        };
    }

    const shared = MAU._adsShared;

    const t = (ru, en) => {
        const lang = (typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en').toLowerCase();
        return lang.startsWith('ru') ? ru : en;
    };

    function safeString(v) {
        if (v === null || v === undefined) return '';
        return String(v);
    }

    function setAdError(msg) {
        shared.stats.lastError = safeString(msg);
        console.warn('Mobile App Ultra Pro Ads:', msg);
    }

    function ensureBannerElement() {
        if (typeof document === 'undefined') return null;
        if (shared.banner.element) return shared.banner.element;

        const el = document.createElement('div');
        el.style.position = 'fixed';
        el.style.left = '0';
        el.style.right = '0';
        el.style.height = '50px';
        el.style.display = 'none';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.background = 'linear-gradient(135deg, #FF6B6B, #EE5A5A)';
        el.style.color = '#fff';
        el.style.fontFamily = 'sans-serif';
        el.style.fontSize = '14px';
        el.style.fontWeight = 'bold';
        el.style.zIndex = '2147483647';
        el.style.boxShadow = '0 -2px 12px rgba(0,0,0,0.2)';
        el.style.cursor = 'pointer';
        el.style.userSelect = 'none';
        el.textContent = 'Test Banner Ad';

        el.addEventListener('click', () => {
            shared.banner.clickEdge = true;
            shared.stats.clicks += 1;
        });

        document.body.appendChild(el);
        shared.banner.element = el;
        applyBannerLayout();
        return el;
    }

    function applyBannerLayout() {
        const el = shared.banner.element;
        if (!el) return;

        const pos = shared.banner.position;
        const size = shared.banner.size;

        el.style.top = '';
        el.style.bottom = '';

        if (pos === 'top') el.style.top = '0';
        else el.style.bottom = '0';

        let height = '50px';
        if (size === 'large') height = '90px';
        else if (size === 'medium') height = '70px';
        else if (size === 'full') height = '100px';

        el.style.height = height;
        el.textContent = 'Test Banner Ad [' + size + ']';
    }

    function simulateAsync(callback, delay) {
        setTimeout(callback, Math.max(50, Number(delay) || 300));
    }

    function canUseAds() {
        if (!shared.initialized) {
            setAdError('Ads are not initialized.');
            return false;
        }
        return true;
    }

    function showModalAd(title, body, onClose) {
        if (typeof document === 'undefined') {
            alert(title + '\n\n' + body);
            if (typeof onClose === 'function') onClose();
            return;
        }

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.72)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '2147483647';

        const box = document.createElement('div');
        box.style.width = 'min(88vw, 420px)';
        box.style.background = '#fff';
        box.style.borderRadius = '18px';
        box.style.padding = '20px';
        box.style.fontFamily = 'sans-serif';
        box.style.boxShadow = '0 12px 32px rgba(0,0,0,0.35)';
        box.style.textAlign = 'center';

        const h = document.createElement('div');
        h.textContent = title;
        h.style.fontSize = '22px';
        h.style.fontWeight = 'bold';
        h.style.marginBottom = '12px';

        const p = document.createElement('div');
        p.textContent = body;
        p.style.fontSize = '15px';
        p.style.color = '#333';
        p.style.marginBottom = '18px';

        const ad = document.createElement('div');
        ad.textContent = 'Demo Ad Placeholder';
        ad.style.height = '180px';
        ad.style.borderRadius = '14px';
        ad.style.background = 'linear-gradient(135deg, #FF6B6B, #EE5A5A)';
        ad.style.display = 'flex';
        ad.style.alignItems = 'center';
        ad.style.justifyContent = 'center';
        ad.style.color = '#fff';
        ad.style.fontWeight = 'bold';
        ad.style.marginBottom = '16px';
        ad.style.cursor = 'pointer';

        ad.addEventListener('click', () => {
            shared.stats.clicks += 1;
        });

        const closeBtn = document.createElement('button');
        closeBtn.textContent = t('Закрыть', 'Close');
        closeBtn.style.border = 'none';
        closeBtn.style.background = '#EE5A5A';
        closeBtn.style.color = '#fff';
        closeBtn.style.padding = '10px 18px';
        closeBtn.style.borderRadius = '12px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontWeight = 'bold';

        closeBtn.addEventListener('click', () => {
            try {
                document.body.removeChild(overlay);
            } catch (e) {}
            if (typeof onClose === 'function') onClose();
        });

        box.appendChild(h);
        box.appendChild(p);
        box.appendChild(ad);
        box.appendChild(closeBtn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    class MobileAppUltraAds {
        getInfo() {
            return {
                id: 'mobileappultraads',
                name: t('Mobile App Ultra Pro / Реклама', 'Mobile App Ultra Pro / Ads'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('Инициализация', 'Initialization')
                    },
                    {
                        opcode: 'initAds',
                        blockType: BlockType.COMMAND,
                        text: t('инициализировать рекламу [AD_NETWORK] ID [APP_ID]', 'initialize ads [AD_NETWORK] ID [APP_ID]'),
                        arguments: {
                            AD_NETWORK: { type: ArgumentType.STRING, menu: 'adNetworkMenu', defaultValue: 'AdMob' },
                            APP_ID: { type: ArgumentType.STRING, defaultValue: 'demo-app-id' }
                        }
                    },
                    {
                        opcode: 'isAdsInitialized',
                        blockType: BlockType.BOOLEAN,
                        text: t('реклама инициализирована?', 'ads initialized?')
                    },
                    {
                        opcode: 'setTestMode',
                        blockType: BlockType.COMMAND,
                        text: t('тестовый режим рекламы [STATE]', 'ad test mode [STATE]'),
                        arguments: {
                            STATE: { type: ArgumentType.STRING, menu: 'onOffMenu', defaultValue: 'ON' }
                        }
                    },
                    {
                        opcode: 'setUserAge',
                        blockType: BlockType.COMMAND,
                        text: t('возраст пользователя [AGE]', 'user age [AGE]'),
                        arguments: {
                            AGE: { type: ArgumentType.NUMBER, defaultValue: 18 }
                        }
                    },
                    {
                        opcode: 'setConsent',
                        blockType: BlockType.COMMAND,
                        text: t('пользователь дал согласие на рекламу [VALUE]', 'user gave ad consent [VALUE]'),
                        arguments: {
                            VALUE: { type: ArgumentType.STRING, menu: 'yesNoMenu', defaultValue: 'YES' }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Banner Ads', 'Banner Ads')
                    },
                    {
                        opcode: 'loadBanner',
                        blockType: BlockType.COMMAND,
                        text: t('загрузить баннер [AD_UNIT_ID]', 'load banner [AD_UNIT_ID]'),
                        arguments: {
                            AD_UNIT_ID: { type: ArgumentType.STRING, defaultValue: 'banner-demo' }
                        }
                    },
                    {
                        opcode: 'showBanner',
                        blockType: BlockType.COMMAND,
                        text: t('показать баннер', 'show banner')
                    },
                    {
                        opcode: 'hideBanner',
                        blockType: BlockType.COMMAND,
                        text: t('скрыть баннер', 'hide banner')
                    },
                    {
                        opcode: 'isBannerLoaded',
                        blockType: BlockType.BOOLEAN,
                        text: t('баннер загружен?', 'banner loaded?')
                    },
                    {
                        opcode: 'isBannerShown',
                        blockType: BlockType.BOOLEAN,
                        text: t('баннер показан?', 'banner shown?')
                    },
                    {
                        opcode: 'setBannerPosition',
                        blockType: BlockType.COMMAND,
                        text: t('позиция баннера [POSITION]', 'banner position [POSITION]'),
                        arguments: {
                            POSITION: { type: ArgumentType.STRING, menu: 'bannerPositionMenu', defaultValue: 'bottom' }
                        }
                    },
                    {
                        opcode: 'setBannerSize',
                        blockType: BlockType.COMMAND,
                        text: t('размер баннера [SIZE]', 'banner size [SIZE]'),
                        arguments: {
                            SIZE: { type: ArgumentType.STRING, menu: 'bannerSizeMenu', defaultValue: 'standard' }
                        }
                    },
                    {
                        opcode: 'whenBannerLoaded',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда баннер загружен', 'when banner loaded')
                    },
                    {
                        opcode: 'whenBannerFailed',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда баннер не загрузился', 'when banner failed')
                    },
                    {
                        opcode: 'whenBannerClicked',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда баннер нажат', 'when banner clicked')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Interstitial Ads', 'Interstitial Ads')
                    },
                    {
                        opcode: 'loadInterstitial',
                        blockType: BlockType.COMMAND,
                        text: t('загрузить interstitial [AD_UNIT_ID]', 'load interstitial [AD_UNIT_ID]'),
                        arguments: {
                            AD_UNIT_ID: { type: ArgumentType.STRING, defaultValue: 'interstitial-demo' }
                        }
                    },
                    {
                        opcode: 'showInterstitial',
                        blockType: BlockType.COMMAND,
                        text: t('показать interstitial', 'show interstitial')
                    },
                    {
                        opcode: 'isInterstitialReady',
                        blockType: BlockType.BOOLEAN,
                        text: t('interstitial готов?', 'interstitial ready?')
                    },
                    {
                        opcode: 'whenInterstitialLoaded',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда interstitial загружен', 'when interstitial loaded')
                    },
                    {
                        opcode: 'whenInterstitialShown',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда interstitial показан', 'when interstitial shown')
                    },
                    {
                        opcode: 'whenInterstitialClosed',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда interstitial закрыт', 'when interstitial closed')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Rewarded Ads', 'Rewarded Ads')
                    },
                    {
                        opcode: 'loadRewarded',
                        blockType: BlockType.COMMAND,
                        text: t('загрузить rewarded [AD_UNIT_ID]', 'load rewarded [AD_UNIT_ID]'),
                        arguments: {
                            AD_UNIT_ID: { type: ArgumentType.STRING, defaultValue: 'rewarded-demo' }
                        }
                    },
                    {
                        opcode: 'showRewarded',
                        blockType: BlockType.COMMAND,
                        text: t('показать rewarded', 'show rewarded')
                    },
                    {
                        opcode: 'isRewardedReady',
                        blockType: BlockType.BOOLEAN,
                        text: t('rewarded готов?', 'rewarded ready?')
                    },
                    {
                        opcode: 'rewardReceived',
                        blockType: BlockType.BOOLEAN,
                        text: t('награда получена?', 'reward received?')
                    },
                    {
                        opcode: 'getRewardAmount',
                        blockType: BlockType.REPORTER,
                        text: t('количество награды', 'reward amount')
                    },
                    {
                        opcode: 'whenRewardReceived',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда награда получена', 'when reward received')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Статистика', 'Statistics')
                    },
                    {
                        opcode: 'getImpressions',
                        blockType: BlockType.REPORTER,
                        text: t('всего показов рекламы', 'total ad impressions')
                    },
                    {
                        opcode: 'getClicks',
                        blockType: BlockType.REPORTER,
                        text: t('всего кликов по рекламе', 'total ad clicks')
                    },
                    {
                        opcode: 'getEarnedCoins',
                        blockType: BlockType.REPORTER,
                        text: t('заработано монет', 'earned coins')
                    },
                    {
                        opcode: 'getLastAdError',
                        blockType: BlockType.REPORTER,
                        text: t('последняя ошибка рекламы', 'last ad error')
                    }
                ],
                menus: {
                    adNetworkMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'AdMob', value: 'AdMob' },
                            { text: 'Unity Ads', value: 'Unity Ads' },
                            { text: 'AppLovin', value: 'AppLovin' },
                            { text: 'ironSource', value: 'ironSource' },
                            { text: 'Facebook Audience Network', value: 'Facebook Audience Network' },
                            { text: 'Yandex Ads', value: 'Yandex Ads' },
                            { text: 'myTarget', value: 'myTarget' },
                            { text: 'Vungle', value: 'Vungle' },
                            { text: 'Chartboost', value: 'Chartboost' },
                            { text: 'Pangle', value: 'Pangle' }
                        ]
                    },
                    onOffMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'ON / ВКЛ', value: 'ON' },
                            { text: 'OFF / ВЫКЛ', value: 'OFF' }
                        ]
                    },
                    yesNoMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'YES / ДА', value: 'YES' },
                            { text: 'NO / НЕТ', value: 'NO' }
                        ]
                    },
                    bannerPositionMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'top / сверху', value: 'top' },
                            { text: 'bottom / снизу', value: 'bottom' }
                        ]
                    },
                    bannerSizeMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'standard / стандарт', value: 'standard' },
                            { text: 'large / большой', value: 'large' },
                            { text: 'medium / средний', value: 'medium' },
                            { text: 'full / полный', value: 'full' }
                        ]
                    }
                }
            };
        }

        initAds(args) {
            shared.initialized = true;
            shared.network = safeString(args.AD_NETWORK);
            shared.appId = safeString(args.APP_ID);
            shared.stats.lastError = '';
        }

        isAdsInitialized() {
            return !!shared.initialized;
        }

        setTestMode(args) {
            shared.testMode = String(args.STATE || '').toUpperCase() === 'ON';
        }

        setUserAge(args) {
            shared.userAge = Math.max(0, Math.floor(Number(args.AGE) || 0));
        }

        setConsent(args) {
            shared.consent = String(args.VALUE || '').toUpperCase() === 'YES';
        }

        loadBanner(args) {
            if (!canUseAds()) return;

            shared.banner.loaded = false;
            shared.banner.adUnitId = safeString(args.AD_UNIT_ID);

            simulateAsync(() => {
                if (!shared.banner.adUnitId) {
                    shared.banner.failEdge = true;
                    setAdError('Banner ad unit ID is empty.');
                    return;
                }
                ensureBannerElement();
                shared.banner.loaded = true;
                shared.banner.loadEdge = true;
                shared.stats.impressions += 0;
            }, 250);
        }

        showBanner() {
            if (!canUseAds()) return;
            if (!shared.banner.loaded) {
                setAdError('Banner is not loaded.');
                return;
            }

            const el = ensureBannerElement();
            if (!el) {
                setAdError('Document is not available for banner rendering.');
                return;
            }

            applyBannerLayout();
            el.style.display = 'flex';
            shared.banner.shown = true;
            shared.stats.impressions += 1;
        }

        hideBanner() {
            if (shared.banner.element) {
                shared.banner.element.style.display = 'none';
            }
            shared.banner.shown = false;
        }

        isBannerLoaded() {
            return !!shared.banner.loaded;
        }

        isBannerShown() {
            return !!shared.banner.shown;
        }

        setBannerPosition(args) {
            shared.banner.position = String(args.POSITION || 'bottom').toLowerCase() === 'top' ? 'top' : 'bottom';
            applyBannerLayout();
        }

        setBannerSize(args) {
            const size = String(args.SIZE || 'standard').toLowerCase();
            if (['standard', 'large', 'medium', 'full'].includes(size)) {
                shared.banner.size = size;
            }
            applyBannerLayout();
        }

        whenBannerLoaded() {
            const v = shared.banner.loadEdge;
            shared.banner.loadEdge = false;
            return v;
        }

        whenBannerFailed() {
            const v = shared.banner.failEdge;
            shared.banner.failEdge = false;
            return v;
        }

        whenBannerClicked() {
            const v = shared.banner.clickEdge;
            shared.banner.clickEdge = false;
            return v;
        }

        loadInterstitial(args) {
            if (!canUseAds()) return;

            shared.interstitial.loaded = false;
            shared.interstitial.adUnitId = safeString(args.AD_UNIT_ID);

            simulateAsync(() => {
                if (!shared.interstitial.adUnitId) {
                    shared.interstitial.failEdge = true;
                    setAdError('Interstitial ad unit ID is empty.');
                    return;
                }
                shared.interstitial.loaded = true;
                shared.interstitial.loadEdge = true;
            }, 350);
        }

        showInterstitial() {
            if (!canUseAds()) return;
            if (!shared.interstitial.loaded) {
                setAdError('Interstitial is not loaded.');
                return;
            }

            shared.interstitial.shown = true;
            shared.interstitial.shownEdge = true;
            shared.stats.impressions += 1;

            showModalAd('Interstitial Ad', 'Demo fullscreen interstitial ad', () => {
                shared.interstitial.shown = false;
                shared.interstitial.loaded = false;
                shared.interstitial.closedEdge = true;
            });
        }

        isInterstitialReady() {
            return !!shared.interstitial.loaded;
        }

        whenInterstitialLoaded() {
            const v = shared.interstitial.loadEdge;
            shared.interstitial.loadEdge = false;
            return v;
        }

        whenInterstitialShown() {
            const v = shared.interstitial.shownEdge;
            shared.interstitial.shownEdge = false;
            return v;
        }

        whenInterstitialClosed() {
            const v = shared.interstitial.closedEdge;
            shared.interstitial.closedEdge = false;
            return v;
        }

        loadRewarded(args) {
            if (!canUseAds()) return;

            shared.rewarded.loaded = false;
            shared.rewarded.adUnitId = safeString(args.AD_UNIT_ID);
            shared.rewarded.rewardReceived = false;
            shared.rewarded.rewardAmount = 0;

            simulateAsync(() => {
                if (!shared.rewarded.adUnitId) {
                    shared.rewarded.failEdge = true;
                    setAdError('Rewarded ad unit ID is empty.');
                    return;
                }
                shared.rewarded.loaded = true;
                shared.rewarded.loadEdge = true;
            }, 350);
        }

        showRewarded() {
            if (!canUseAds()) return;
            if (!shared.rewarded.loaded) {
                setAdError('Rewarded ad is not loaded.');
                return;
            }

            shared.rewarded.shown = true;
            shared.rewarded.shownEdge = true;
            shared.stats.impressions += 1;

            showModalAd('Rewarded Ad', 'Watch this demo ad to receive reward', () => {
                shared.rewarded.shown = false;
                shared.rewarded.loaded = false;
                shared.rewarded.closedEdge = true;

                shared.rewarded.rewardReceived = true;
                shared.rewarded.rewardType = 'coins';
                shared.rewarded.rewardAmount = shared.testMode ? 5 : 10;
                shared.rewarded.rewardEdge = true;
                shared.stats.earnedCoins += shared.rewarded.rewardAmount;
            });
        }

        isRewardedReady() {
            return !!shared.rewarded.loaded;
        }

        rewardReceived() {
            return !!shared.rewarded.rewardReceived;
        }

        getRewardAmount() {
            return Number(shared.rewarded.rewardAmount || 0);
        }

        whenRewardReceived() {
            const v = shared.rewarded.rewardEdge;
            shared.rewarded.rewardEdge = false;
            return v;
        }

        getImpressions() {
            return Number(shared.stats.impressions || 0);
        }

        getClicks() {
            return Number(shared.stats.clicks || 0);
        }

        getEarnedCoins() {
            return Number(shared.stats.earnedCoins || 0);
        }

        getLastAdError() {
            return shared.stats.lastError || '';
        }
    }

    Scratch.extensions.register(new MobileAppUltraAds());
})(Scratch);
