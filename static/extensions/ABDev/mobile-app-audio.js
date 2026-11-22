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

    if (!MAU._audioShared) {
        MAU._audioShared = {
            players: {},
            sounds: {},
            backgroundAllowed: false,
            sessionCategory: 'ambient',
            mixWithOthers: false,
            tts: {
                supported: typeof speechSynthesis !== 'undefined',
                speaking: false,
                language: (typeof navigator !== 'undefined' && navigator.language) || 'en-US'
            },
            stt: {
                supported: false,
                recognition: null,
                active: false,
                lastText: '',
                recognizedEdge: false,
                language: (typeof navigator !== 'undefined' && navigator.language) || 'en-US'
            }
        };
    }

    const shared = MAU._audioShared;

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

    function getAudio(id, createIfMissing) {
        const key = safeString(id);
        if (!shared.players[key] && createIfMissing) {
            shared.players[key] = new Audio();
            shared.players[key].preload = 'auto';
            shared.players[key].crossOrigin = 'anonymous';
        }
        return shared.players[key] || null;
    }

    function getSound(id, createIfMissing) {
        const key = safeString(id);
        if (!shared.sounds[key] && createIfMissing) {
            shared.sounds[key] = new Audio();
            shared.sounds[key].preload = 'auto';
            shared.sounds[key].crossOrigin = 'anonymous';
        }
        return shared.sounds[key] || null;
    }

    function initSpeechRecognition() {
        if (shared.stt.recognition || shared.stt.supported) return;

        const SR = root.SpeechRecognition || root.webkitSpeechRecognition;
        if (!SR) {
            shared.stt.supported = false;
            return;
        }

        try {
            const rec = new SR();
            rec.lang = shared.stt.language;
            rec.continuous = true;
            rec.interimResults = false;

            rec.onresult = function (event) {
                try {
                    const result = event.results[event.results.length - 1];
                    if (result && result[0]) {
                        shared.stt.lastText = String(result[0].transcript || '').trim();
                        shared.stt.recognizedEdge = true;
                    }
                } catch (e) {
                    console.warn('Mobile App Ultra Pro Audio: speech result parse failed', e);
                }
            };

            rec.onstart = function () {
                shared.stt.active = true;
            };

            rec.onend = function () {
                shared.stt.active = false;
            };

            rec.onerror = function (e) {
                shared.stt.active = false;
                console.warn('Mobile App Ultra Pro Audio: speech recognition error', e);
            };

            shared.stt.recognition = rec;
            shared.stt.supported = true;
        } catch (e) {
            shared.stt.supported = false;
            console.warn('Mobile App Ultra Pro Audio: speech recognition init failed', e);
        }
    }

    initSpeechRecognition();

    class MobileAppUltraAudio {
        getInfo() {
            return {
                id: 'mobileappultraaudio',
                name: t('Mobile App Ultra Pro / Аудио', 'Mobile App Ultra Pro / Audio'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('Аудио плеер', 'Audio Player')
                    },
                    {
                        opcode: 'loadAudio',
                        blockType: BlockType.COMMAND,
                        text: t('загрузить аудио [URL] как [ID]', 'load audio [URL] as [ID]'),
                        arguments: {
                            URL: { type: ArgumentType.STRING, defaultValue: 'https:
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' }
                        }
                    },
                    {
                        opcode: 'playAudio',
                        blockType: BlockType.COMMAND,
                        text: t('играть аудио [ID]', 'play audio [ID]'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' }
                        }
                    },
                    {
                        opcode: 'pauseAudio',
                        blockType: BlockType.COMMAND,
                        text: t('пауза аудио [ID]', 'pause audio [ID]'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' }
                        }
                    },
                    {
                        opcode: 'stopAudio',
                        blockType: BlockType.COMMAND,
                        text: t('остановить аудио [ID]', 'stop audio [ID]'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' }
                        }
                    },
                    {
                        opcode: 'isAudioPlaying',
                        blockType: BlockType.BOOLEAN,
                        text: t('аудио [ID] играет?', 'audio [ID] playing?'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' }
                        }
                    },
                    {
                        opcode: 'setAudioVolume',
                        blockType: BlockType.COMMAND,
                        text: t('громкость аудио [ID] = [VOL]', 'audio volume [ID] = [VOL]'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' },
                            VOL: { type: ArgumentType.NUMBER, defaultValue: 100 }
                        }
                    },
                    {
                        opcode: 'getAudioPosition',
                        blockType: BlockType.REPORTER,
                        text: t('текущая позиция [ID] (сек)', 'current position [ID] (sec)'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' }
                        }
                    },
                    {
                        opcode: 'getAudioDuration',
                        blockType: BlockType.REPORTER,
                        text: t('длительность [ID] (сек)', 'duration [ID] (sec)'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' }
                        }
                    },
                    {
                        opcode: 'seekAudio',
                        blockType: BlockType.COMMAND,
                        text: t('перемотать [ID] на [SEC] сек', 'seek [ID] to [SEC] sec'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' },
                            SEC: { type: ArgumentType.NUMBER, defaultValue: 10 }
                        }
                    },
                    {
                        opcode: 'setAudioRate',
                        blockType: BlockType.COMMAND,
                        text: t('скорость воспроизведения [ID] = [RATE]', 'playback rate [ID] = [RATE]'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' },
                            RATE: { type: ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'setAudioLoop',
                        blockType: BlockType.COMMAND,
                        text: t('зациклить [ID] [STATE]', 'loop [ID] [STATE]'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'music1' },
                            STATE: { type: ArgumentType.STRING, menu: 'onOffMenu', defaultValue: 'ON' }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Звуковые эффекты', 'Sound Effects')
                    },
                    {
                        opcode: 'loadSound',
                        blockType: BlockType.COMMAND,
                        text: t('загрузить звук [URL] как [ID]', 'load sound [URL] as [ID]'),
                        arguments: {
                            URL: { type: ArgumentType.STRING, defaultValue: 'https:
                            ID: { type: ArgumentType.STRING, defaultValue: 'click1' }
                        }
                    },
                    {
                        opcode: 'playSound',
                        blockType: BlockType.COMMAND,
                        text: t('играть звук [ID]', 'play sound [ID]'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'click1' }
                        }
                    },
                    {
                        opcode: 'playSoundVolume',
                        blockType: BlockType.COMMAND,
                        text: t('играть звук [ID] громкость [VOL]', 'play sound [ID] volume [VOL]'),
                        arguments: {
                            ID: { type: ArgumentType.STRING, defaultValue: 'click1' },
                            VOL: { type: ArgumentType.NUMBER, defaultValue: 100 }
                        }
                    },
                    {
                        opcode: 'stopAllSounds',
                        blockType: BlockType.COMMAND,
                        text: t('остановить все звуки', 'stop all sounds')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Фоновое аудио и TTS/STT', 'Background Audio and TTS/STT')
                    },
                    {
                        opcode: 'allowBackgroundAudio',
                        blockType: BlockType.COMMAND,
                        text: t('разрешить фоновое воспроизведение', 'allow background playback')
                    },
                    {
                        opcode: 'disallowBackgroundAudio',
                        blockType: BlockType.COMMAND,
                        text: t('запретить фоновое воспроизведение', 'disallow background playback')
                    },
                    {
                        opcode: 'isTTSSupported',
                        blockType: BlockType.BOOLEAN,
                        text: t('TTS доступен?', 'TTS available?')
                    },
                    {
                        opcode: 'speakText',
                        blockType: BlockType.COMMAND,
                        text: t('произнести [TEXT]', 'speak [TEXT]'),
                        arguments: {
                            TEXT: { type: ArgumentType.STRING, defaultValue: 'Привет мир' }
                        }
                    },
                    {
                        opcode: 'speakTextVoice',
                        blockType: BlockType.COMMAND,
                        text: t('произнести [TEXT] голосом [VOICE]', 'speak [TEXT] with voice [VOICE]'),
                        arguments: {
                            TEXT: { type: ArgumentType.STRING, defaultValue: 'Привет мир' },
                            VOICE: { type: ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'stopSpeech',
                        blockType: BlockType.COMMAND,
                        text: t('остановить речь', 'stop speech')
                    },
                    {
                        opcode: 'getVoices',
                        blockType: BlockType.REPORTER,
                        text: t('список голосов', 'voice list')
                    },
                    {
                        opcode: 'isSpeechRecognitionSupported',
                        blockType: BlockType.BOOLEAN,
                        text: t('распознавание речи доступно?', 'speech recognition available?')
                    },
                    {
                        opcode: 'startSpeechRecognition',
                        blockType: BlockType.COMMAND,
                        text: t('начать распознавание речи', 'start speech recognition')
                    },
                    {
                        opcode: 'stopSpeechRecognition',
                        blockType: BlockType.COMMAND,
                        text: t('остановить распознавание речи', 'stop speech recognition')
                    },
                    {
                        opcode: 'getRecognizedText',
                        blockType: BlockType.REPORTER,
                        text: t('распознанный текст', 'recognized text')
                    },
                    {
                        opcode: 'whenSpeechRecognized',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда речь распознана', 'when speech recognized')
                    }
                ],
                menus: {
                    onOffMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'ON / ВКЛ', value: 'ON' },
                            { text: 'OFF / ВЫКЛ', value: 'OFF' }
                        ]
                    }
                }
            };
        }

        loadAudio(args) {
            const audio = getAudio(args.ID, true);
            if (!audio) return;
            audio.src = safeString(args.URL);
            audio.load();
        }

        playAudio(args) {
            const audio = getAudio(args.ID, false);
            if (!audio) return;
            audio.play().catch(e => {
                console.warn('Mobile App Ultra Pro Audio: playAudio failed', e);
            });
        }

        pauseAudio(args) {
            const audio = getAudio(args.ID, false);
            if (!audio) return;
            audio.pause();
        }

        stopAudio(args) {
            const audio = getAudio(args.ID, false);
            if (!audio) return;
            audio.pause();
            try {
                audio.currentTime = 0;
            } catch (e) {}
        }

        isAudioPlaying(args) {
            const audio = getAudio(args.ID, false);
            return !!(audio && !audio.paused && !audio.ended);
        }

        setAudioVolume(args) {
            const audio = getAudio(args.ID, false);
            if (!audio) return;
            const vol = Math.max(0, Math.min(100, safeNumber(args.VOL, 100)));
            audio.volume = vol / 100;
        }

        getAudioPosition(args) {
            const audio = getAudio(args.ID, false);
            if (!audio) return 0;
            return Math.round((audio.currentTime || 0) * 100) / 100;
        }

        getAudioDuration(args) {
            const audio = getAudio(args.ID, false);
            if (!audio || !Number.isFinite(audio.duration)) return 0;
            return Math.round(audio.duration * 100) / 100;
        }

        seekAudio(args) {
            const audio = getAudio(args.ID, false);
            if (!audio) return;
            const sec = Math.max(0, safeNumber(args.SEC, 0));
            try {
                audio.currentTime = sec;
            } catch (e) {
                console.warn('Mobile App Ultra Pro Audio: seekAudio failed', e);
            }
        }

        setAudioRate(args) {
            const audio = getAudio(args.ID, false);
            if (!audio) return;
            audio.playbackRate = Math.max(0.5, Math.min(2, safeNumber(args.RATE, 1)));
        }

        setAudioLoop(args) {
            const audio = getAudio(args.ID, false);
            if (!audio) return;
            audio.loop = String(args.STATE || '').toUpperCase() === 'ON';
        }

        loadSound(args) {
            const sound = getSound(args.ID, true);
            if (!sound) return;
            sound.src = safeString(args.URL);
            sound.load();
        }

        playSound(args) {
            const sound = getSound(args.ID, false);
            if (!sound) return;
            try {
                const clone = sound.cloneNode(true);
                clone.volume = sound.volume;
                clone.play().catch(e => {
                    console.warn('Mobile App Ultra Pro Audio: playSound failed', e);
                });
            } catch (e) {
                console.warn('Mobile App Ultra Pro Audio: playSound clone failed', e);
            }
        }

        playSoundVolume(args) {
            const sound = getSound(args.ID, false);
            if (!sound) return;
            const vol = Math.max(0, Math.min(100, safeNumber(args.VOL, 100)));
            try {
                const clone = sound.cloneNode(true);
                clone.volume = vol / 100;
                clone.play().catch(e => {
                    console.warn('Mobile App Ultra Pro Audio: playSoundVolume failed', e);
                });
            } catch (e) {
                console.warn('Mobile App Ultra Pro Audio: playSoundVolume clone failed', e);
            }
        }

        stopAllSounds() {
            for (const id in shared.sounds) {
                const sound = shared.sounds[id];
                if (sound) {
                    sound.pause();
                    try {
                        sound.currentTime = 0;
                    } catch (e) {}
                }
            }
            for (const id in shared.players) {
                const audio = shared.players[id];
                if (audio) {
                    audio.pause();
                }
            }
        }

        allowBackgroundAudio() {
            shared.backgroundAllowed = true;
        }

        disallowBackgroundAudio() {
            shared.backgroundAllowed = false;
        }

        isTTSSupported() {
            return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
        }

        speakText(args) {
            this.speakTextVoice({ TEXT: args.TEXT, VOICE: '' });
        }

        speakTextVoice(args) {
            if (!this.isTTSSupported()) {
                console.warn('Mobile App Ultra Pro Audio: TTS is not supported.');
                return;
            }

            try {
                const utter = new SpeechSynthesisUtterance(safeString(args.TEXT));
                utter.lang = shared.tts.language || 'en-US';

                const voiceName = safeString(args.VOICE);
                const voices = speechSynthesis.getVoices ? speechSynthesis.getVoices() : [];
                const found = voices.find(v => v.name === voiceName);
                if (found) utter.voice = found;

                utter.onstart = () => {
                    shared.tts.speaking = true;
                };
                utter.onend = () => {
                    shared.tts.speaking = false;
                };
                utter.onerror = () => {
                    shared.tts.speaking = false;
                };

                speechSynthesis.speak(utter);
            } catch (e) {
                console.warn('Mobile App Ultra Pro Audio: speakTextVoice failed', e);
            }
        }

        stopSpeech() {
            if (typeof speechSynthesis !== 'undefined') {
                try {
                    speechSynthesis.cancel();
                } catch (e) {}
            }
            shared.tts.speaking = false;
        }

        getVoices() {
            if (!this.isTTSSupported() || !speechSynthesis.getVoices) return '[]';
            try {
                const voices = speechSynthesis.getVoices().map(v => ({
                    name: v.name,
                    lang: v.lang,
                    default: !!v.default
                }));
                return JSON.stringify(voices);
            } catch (e) {
                return '[]';
            }
        }

        isSpeechRecognitionSupported() {
            initSpeechRecognition();
            return !!shared.stt.supported;
        }

        startSpeechRecognition() {
            initSpeechRecognition();
            if (!shared.stt.supported || !shared.stt.recognition) {
                console.warn('Mobile App Ultra Pro Audio: Speech recognition is not supported.');
                return;
            }

            try {
                shared.stt.recognition.lang = shared.stt.language || 'en-US';
                shared.stt.recognition.start();
            } catch (e) {
                console.warn('Mobile App Ultra Pro Audio: startSpeechRecognition failed', e);
            }
        }

        stopSpeechRecognition() {
            if (!shared.stt.recognition) return;
            try {
                shared.stt.recognition.stop();
            } catch (e) {
                console.warn('Mobile App Ultra Pro Audio: stopSpeechRecognition failed', e);
            }
        }

        getRecognizedText() {
            return shared.stt.lastText || '';
        }

        whenSpeechRecognized() {
            const v = shared.stt.recognizedEdge;
            shared.stt.recognizedEdge = false;
            return v;
        }
    }

    Scratch.extensions.register(new MobileAppUltraAudio());
})(Scratch);
