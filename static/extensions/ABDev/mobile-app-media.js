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

    if (!MAU._mediaShared) {
        MAU._mediaShared = {
            camera: {
                stream: null,
                video: null,
                canvas: null,
                enabled: false,
                currentFacing: 'front',
                devices: [],
                lastPhotoBase64: '',
                lastPhotoURL: '',
                flashOn: false
            },
            microphone: {
                stream: null,
                enabled: false,
                analyser: null,
                audioContext: null,
                source: null,
                volume: 0,
                volumeLoopStarted: false
            },
            recording: {
                mediaRecorder: null,
                chunks: [],
                startTime: 0,
                lastAudioBase64: '',
                lastAudioURL: '',
                lastDuration: 0
            },
            screen: {
                stream: null,
                recorder: null,
                chunks: [],
                lastVideoURL: '',
                recording: false
            },
            clipboard: {
                lastText: '',
                lastHasText: false
            }
        };
    }

    const shared = MAU._mediaShared;

    const t = (ru, en) => {
        const lang = (typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en').toLowerCase();
        return lang.startsWith('ru') ? ru : en;
    };

    function hasMediaDevices() {
        return typeof navigator !== 'undefined' &&
            navigator.mediaDevices &&
            typeof navigator.mediaDevices.getUserMedia === 'function';
    }

    function hasClipboard() {
        return typeof navigator !== 'undefined' &&
            navigator.clipboard;
    }

    function ensureCameraElements() {
        if (typeof document === 'undefined') return;

        if (!shared.camera.video) {
            const video = document.createElement('video');
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;
            video.style.position = 'fixed';
            video.style.left = '-99999px';
            video.style.top = '-99999px';
            video.style.width = '1px';
            video.style.height = '1px';
            video.style.opacity = '0';
            video.style.pointerEvents = 'none';
            document.body.appendChild(video);
            shared.camera.video = video;
        }

        if (!shared.camera.canvas) {
            shared.camera.canvas = document.createElement('canvas');
        }
    }

    function stopTracks(stream) {
        if (!stream) return;
        try {
            for (const track of stream.getTracks()) {
                track.stop();
            }
        } catch (e) {
            console.warn('Mobile App Ultra Pro: stopTracks failed', e);
        }
    }

    async function refreshCameraDevices() {
        if (!hasMediaDevices() || typeof navigator.mediaDevices.enumerateDevices !== 'function') {
            shared.camera.devices = [];
            return [];
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            shared.camera.devices = devices.filter(d => d.kind === 'videoinput');
            return shared.camera.devices;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: enumerate camera devices failed', e);
            shared.camera.devices = [];
            return [];
        }
    }

    async function requestCameraPermission() {
        if (!hasMediaDevices()) return false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stopTracks(stream);
            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: camera permission denied', e);
            return false;
        }
    }

    async function startCamera(facing) {
        if (!hasMediaDevices()) return false;

        ensureCameraElements();

        try {
            if (shared.camera.stream) {
                stopTracks(shared.camera.stream);
                shared.camera.stream = null;
            }

            const normalizedFacing = String(facing || 'front').toLowerCase() === 'back' ? 'environment' : 'user';
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: normalizedFacing }
                },
                audio: false
            });

            shared.camera.stream = stream;
            shared.camera.enabled = true;
            shared.camera.currentFacing = normalizedFacing === 'environment' ? 'back' : 'front';

            if (shared.camera.video) {
                shared.camera.video.srcObject = stream;
                try {
                    await shared.camera.video.play();
                } catch (e) {}
            }

            refreshCameraDevices();
            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: startCamera failed', e);
            shared.camera.enabled = false;
            return false;
        }
    }

    function stopCamera() {
        if (shared.camera.stream) {
            stopTracks(shared.camera.stream);
            shared.camera.stream = null;
        }
        if (shared.camera.video) {
            shared.camera.video.srcObject = null;
        }
        shared.camera.enabled = false;
    }

    function capturePhoto() {
        ensureCameraElements();

        if (!shared.camera.enabled || !shared.camera.video || !shared.camera.canvas) return false;

        const video = shared.camera.video;
        const canvas = shared.camera.canvas;

        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) return false;

        ctx.drawImage(video, 0, 0, w, h);

        try {
            shared.camera.lastPhotoBase64 = canvas.toDataURL('image/png');
            try {
                if (shared.camera.lastPhotoURL && shared.camera.lastPhotoURL.startsWith('blob:')) {
                    URL.revokeObjectURL(shared.camera.lastPhotoURL);
                }
            } catch (e) {}
            shared.camera.lastPhotoURL = shared.camera.lastPhotoBase64;
            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: capturePhoto failed', e);
            return false;
        }
    }

    async function requestMicrophonePermission() {
        if (!hasMediaDevices()) return false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stopTracks(stream);
            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: microphone permission denied', e);
            return false;
        }
    }

    async function startMicrophone() {
        if (!hasMediaDevices()) return false;

        try {
            if (shared.microphone.stream) {
                stopTracks(shared.microphone.stream);
                shared.microphone.stream = null;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            shared.microphone.stream = stream;
            shared.microphone.enabled = true;

            const AudioCtx = root.AudioContext || root.webkitAudioContext;
            if (AudioCtx) {
                const audioContext = new AudioCtx();
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 1024;
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                shared.microphone.audioContext = audioContext;
                shared.microphone.analyser = analyser;
                shared.microphone.source = source;

                if (!shared.microphone.volumeLoopStarted) {
                    shared.microphone.volumeLoopStarted = true;
                    const data = new Uint8Array(analyser.frequencyBinCount);

                    const updateVolume = () => {
                        if (shared.microphone.analyser) {
                            shared.microphone.analyser.getByteFrequencyData(data);
                            let sum = 0;
                            for (let i = 0; i < data.length; i++) {
                                sum += data[i];
                            }
                            const avg = data.length ? sum / data.length : 0;
                            shared.microphone.volume = Math.round((avg / 255) * 100);
                        } else {
                            shared.microphone.volume = 0;
                        }
                        root.requestAnimationFrame(updateVolume);
                    };
                    root.requestAnimationFrame(updateVolume);
                }
            }

            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: startMicrophone failed', e);
            shared.microphone.enabled = false;
            return false;
        }
    }

    function stopMicrophone() {
        if (shared.microphone.stream) {
            stopTracks(shared.microphone.stream);
            shared.microphone.stream = null;
        }

        try {
            if (shared.microphone.source) {
                shared.microphone.source.disconnect();
            }
        } catch (e) {}

        try {
            if (shared.microphone.analyser) {
                shared.microphone.analyser.disconnect && shared.microphone.analyser.disconnect();
            }
        } catch (e) {}

        try {
            if (shared.microphone.audioContext && typeof shared.microphone.audioContext.close === 'function') {
                shared.microphone.audioContext.close();
            }
        } catch (e) {}

        shared.microphone.audioContext = null;
        shared.microphone.analyser = null;
        shared.microphone.source = null;
        shared.microphone.enabled = false;
        shared.microphone.volume = 0;
    }

    function blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onloadend = () => resolve(String(reader.result || ''));
                reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
                reader.readAsDataURL(blob);
            } catch (e) {
                reject(e);
            }
        });
    }

    async function startAudioRecording() {
        if (!shared.microphone.stream) {
            const ok = await startMicrophone();
            if (!ok) return false;
        }

        if (typeof MediaRecorder === 'undefined') {
            console.warn('Mobile App Ultra Pro: MediaRecorder is not supported.');
            return false;
        }

        try {
            shared.recording.chunks = [];
            shared.recording.startTime = Date.now();

            const recorder = new MediaRecorder(shared.microphone.stream);
            shared.recording.mediaRecorder = recorder;

            recorder.ondataavailable = e => {
                if (e.data && e.data.size > 0) {
                    shared.recording.chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {
                try {
                    const blob = new Blob(shared.recording.chunks, { type: recorder.mimeType || 'audio/webm' });
                    if (shared.recording.lastAudioURL && shared.recording.lastAudioURL.startsWith('blob:')) {
                        URL.revokeObjectURL(shared.recording.lastAudioURL);
                    }
                    shared.recording.lastAudioURL = URL.createObjectURL(blob);
                    shared.recording.lastAudioBase64 = await blobToDataURL(blob);
                    shared.recording.lastDuration = Math.max(0, Math.round((Date.now() - shared.recording.startTime) / 1000));
                } catch (e) {
                    console.warn('Mobile App Ultra Pro: audio record finalize failed', e);
                }
            };

            recorder.start();
            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: startAudioRecording failed', e);
            return false;
        }
    }

    function stopAudioRecording() {
        try {
            if (shared.recording.mediaRecorder && shared.recording.mediaRecorder.state !== 'inactive') {
                shared.recording.mediaRecorder.stop();
            }
        } catch (e) {
            console.warn('Mobile App Ultra Pro: stopAudioRecording failed', e);
        }
    }

    function screenRecordAvailable() {
        return typeof navigator !== 'undefined' &&
            navigator.mediaDevices &&
            typeof navigator.mediaDevices.getDisplayMedia === 'function' &&
            typeof MediaRecorder !== 'undefined';
    }

    async function startScreenRecording() {
        if (!screenRecordAvailable()) return false;

        try {
            shared.screen.chunks = [];
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            shared.screen.stream = stream;

            const recorder = new MediaRecorder(stream);
            shared.screen.recorder = recorder;
            shared.screen.recording = true;

            recorder.ondataavailable = e => {
                if (e.data && e.data.size > 0) {
                    shared.screen.chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                try {
                    const blob = new Blob(shared.screen.chunks, { type: recorder.mimeType || 'video/webm' });
                    if (shared.screen.lastVideoURL && shared.screen.lastVideoURL.startsWith('blob:')) {
                        URL.revokeObjectURL(shared.screen.lastVideoURL);
                    }
                    shared.screen.lastVideoURL = URL.createObjectURL(blob);
                } catch (e) {
                    console.warn('Mobile App Ultra Pro: screen record finalize failed', e);
                }

                stopTracks(shared.screen.stream);
                shared.screen.stream = null;
                shared.screen.recording = false;
            };

            recorder.start();
            return true;
        } catch (e) {
            console.warn('Mobile App Ultra Pro: startScreenRecording failed', e);
            shared.screen.recording = false;
            return false;
        }
    }

    function stopScreenRecording() {
        try {
            if (shared.screen.recorder && shared.screen.recorder.state !== 'inactive') {
                shared.screen.recorder.stop();
            }
        } catch (e) {
            console.warn('Mobile App Ultra Pro: stopScreenRecording failed', e);
        }
    }

    class MobileAppUltraMedia {
        getInfo() {
            return {
                id: 'mobileappultramedia',
                name: t('Mobile App Ultra Pro / Медиа', 'Mobile App Ultra Pro / Media'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('Камера', 'Camera')
                    },
                    {
                        opcode: 'isCameraAvailable',
                        blockType: BlockType.BOOLEAN,
                        text: t('камера доступна?', 'camera available?')
                    },
                    {
                        opcode: 'requestCameraAccess',
                        blockType: BlockType.COMMAND,
                        text: t('запросить доступ к камере', 'request camera access')
                    },
                    {
                        opcode: 'startCameraBlock',
                        blockType: BlockType.COMMAND,
                        text: t('включить камеру [FACING]', 'enable camera [FACING]'),
                        arguments: {
                            FACING: {
                                type: ArgumentType.STRING,
                                menu: 'cameraFacingMenu',
                                defaultValue: 'front'
                            }
                        }
                    },
                    {
                        opcode: 'stopCameraBlock',
                        blockType: BlockType.COMMAND,
                        text: t('выключить камеру', 'disable camera')
                    },
                    {
                        opcode: 'isCameraEnabled',
                        blockType: BlockType.BOOLEAN,
                        text: t('камера включена?', 'camera enabled?')
                    },
                    {
                        opcode: 'toggleCameraFacing',
                        blockType: BlockType.COMMAND,
                        text: t('переключить камеру', 'switch camera')
                    },
                    {
                        opcode: 'getCurrentCamera',
                        blockType: BlockType.REPORTER,
                        text: t('текущая камера', 'current camera')
                    },
                    {
                        opcode: 'takePhoto',
                        blockType: BlockType.COMMAND,
                        text: t('сделать фото', 'take photo')
                    },
                    {
                        opcode: 'getPhotoBase64',
                        blockType: BlockType.REPORTER,
                        text: t('фото как base64', 'photo as base64')
                    },
                    {
                        opcode: 'getPhotoURL',
                        blockType: BlockType.REPORTER,
                        text: t('фото как URL', 'photo as URL')
                    },
                    {
                        opcode: 'getCameraList',
                        blockType: BlockType.REPORTER,
                        text: t('список доступных камер', 'available camera list')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Микрофон', 'Microphone')
                    },
                    {
                        opcode: 'isMicrophoneAvailable',
                        blockType: BlockType.BOOLEAN,
                        text: t('микрофон доступен?', 'microphone available?')
                    },
                    {
                        opcode: 'requestMicrophoneAccess',
                        blockType: BlockType.COMMAND,
                        text: t('запросить доступ к микрофону', 'request microphone access')
                    },
                    {
                        opcode: 'startMicrophoneBlock',
                        blockType: BlockType.COMMAND,
                        text: t('включить микрофон', 'enable microphone')
                    },
                    {
                        opcode: 'stopMicrophoneBlock',
                        blockType: BlockType.COMMAND,
                        text: t('выключить микрофон', 'disable microphone')
                    },
                    {
                        opcode: 'isMicrophoneEnabled',
                        blockType: BlockType.BOOLEAN,
                        text: t('микрофон включён?', 'microphone enabled?')
                    },
                    {
                        opcode: 'getVolumeLevel',
                        blockType: BlockType.REPORTER,
                        text: t('уровень громкости (0-100)', 'volume level (0-100)')
                    },
                    {
                        opcode: 'startAudioRecordBlock',
                        blockType: BlockType.COMMAND,
                        text: t('начать запись аудио', 'start audio recording')
                    },
                    {
                        opcode: 'stopAudioRecordBlock',
                        blockType: BlockType.COMMAND,
                        text: t('остановить запись аудио', 'stop audio recording')
                    },
                    {
                        opcode: 'getRecordedAudioURL',
                        blockType: BlockType.REPORTER,
                        text: t('записанное аудио URL', 'recorded audio URL')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Экран и буфер обмена', 'Screen and Clipboard')
                    },
                    {
                        opcode: 'isScreenRecordAvailable',
                        blockType: BlockType.BOOLEAN,
                        text: t('запись экрана доступна?', 'screen recording available?')
                    },
                    {
                        opcode: 'startScreenRecordBlock',
                        blockType: BlockType.COMMAND,
                        text: t('начать запись экрана', 'start screen recording')
                    },
                    {
                        opcode: 'stopScreenRecordBlock',
                        blockType: BlockType.COMMAND,
                        text: t('остановить запись экрана', 'stop screen recording')
                    },
                    {
                        opcode: 'getRecordedVideoURL',
                        blockType: BlockType.REPORTER,
                        text: t('записанное видео URL', 'recorded video URL')
                    },
                    {
                        opcode: 'copyText',
                        blockType: BlockType.COMMAND,
                        text: t('копировать текст [TEXT]', 'copy text [TEXT]'),
                        arguments: {
                            TEXT: {
                                type: ArgumentType.STRING,
                                defaultValue: 'Hello!'
                            }
                        }
                    },
                    {
                        opcode: 'pasteText',
                        blockType: BlockType.REPORTER,
                        text: t('вставить текст', 'paste text')
                    },
                    {
                        opcode: 'clipboardHasText',
                        blockType: BlockType.BOOLEAN,
                        text: t('буфер обмена содержит текст?', 'clipboard has text?')
                    }
                ],
                menus: {
                    cameraFacingMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'front / передняя', value: 'front' },
                            { text: 'back / задняя', value: 'back' }
                        ]
                    }
                }
            };
        }

        isCameraAvailable() {
            return hasMediaDevices();
        }

        requestCameraAccess() {
            requestCameraPermission();
        }

        startCameraBlock(args) {
            startCamera(args.FACING);
        }

        stopCameraBlock() {
            stopCamera();
        }

        isCameraEnabled() {
            return !!shared.camera.enabled;
        }

        toggleCameraFacing() {
            const next = shared.camera.currentFacing === 'front' ? 'back' : 'front';
            startCamera(next);
        }

        getCurrentCamera() {
            return shared.camera.currentFacing || 'front';
        }

        takePhoto() {
            capturePhoto();
        }

        getPhotoBase64() {
            return shared.camera.lastPhotoBase64 || '';
        }

        getPhotoURL() {
            return shared.camera.lastPhotoURL || '';
        }

        getCameraList() {
            const arr = shared.camera.devices.map((d, i) => ({
                id: d.deviceId || '',
                label: d.label || ('Camera ' + (i + 1))
            }));
            return JSON.stringify(arr);
        }

        isMicrophoneAvailable() {
            return hasMediaDevices();
        }

        requestMicrophoneAccess() {
            requestMicrophonePermission();
        }

        startMicrophoneBlock() {
            startMicrophone();
        }

        stopMicrophoneBlock() {
            stopMicrophone();
        }

        isMicrophoneEnabled() {
            return !!shared.microphone.enabled;
        }

        getVolumeLevel() {
            return Math.max(0, Math.min(100, Math.round(shared.microphone.volume || 0)));
        }

        startAudioRecordBlock() {
            startAudioRecording();
        }

        stopAudioRecordBlock() {
            stopAudioRecording();
        }

        getRecordedAudioURL() {
            return shared.recording.lastAudioURL || '';
        }

        isScreenRecordAvailable() {
            return screenRecordAvailable();
        }

        startScreenRecordBlock() {
            startScreenRecording();
        }

        stopScreenRecordBlock() {
            stopScreenRecording();
        }

        getRecordedVideoURL() {
            return shared.screen.lastVideoURL || '';
        }

        async copyText(args) {
            const text = String(args.TEXT || '');
            if (!hasClipboard() || typeof navigator.clipboard.writeText !== 'function') {
                console.warn('Mobile App Ultra Pro: clipboard writeText is not supported.');
                shared.clipboard.lastText = text;
                shared.clipboard.lastHasText = text.length > 0;
                return;
            }

            try {
                await navigator.clipboard.writeText(text);
                shared.clipboard.lastText = text;
                shared.clipboard.lastHasText = text.length > 0;
            } catch (e) {
                console.warn('Mobile App Ultra Pro: copyText failed', e);
            }
        }

        pasteText() {
            if (!hasClipboard() || typeof navigator.clipboard.readText !== 'function') {
                return shared.clipboard.lastText || '';
            }

            navigator.clipboard.readText()
                .then(text => {
                    shared.clipboard.lastText = String(text || '');
                    shared.clipboard.lastHasText = shared.clipboard.lastText.length > 0;
                })
                .catch(e => {
                    console.warn('Mobile App Ultra Pro: pasteText failed', e);
                });

            return shared.clipboard.lastText || '';
        }

        clipboardHasText() {
            return !!shared.clipboard.lastHasText;
        }
    }

    Scratch.extensions.register(new MobileAppUltraMedia());
})(Scratch);
