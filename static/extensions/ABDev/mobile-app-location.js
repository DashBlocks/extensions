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

    if (!MAU._locationShared) {
        MAU._locationShared = {
            current: {
                latitude: 0,
                longitude: 0,
                accuracy: -1,
                altitude: null,
                altitudeAccuracy: null,
                speed: null,
                heading: null,
                timestamp: 0,
                available: false,
                permissionRequested: false
            },
            watch: {
                id: null,
                active: false,
                changedEdge: false
            },
            geofences: {},
            errors: {
                last: ''
            }
        };
    }

    const shared = MAU._locationShared;

    const t = (ru, en) => {
        const lang = (typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en').toLowerCase();
        return lang.startsWith('ru') ? ru : en;
    };

    function hasGeolocation() {
        return typeof navigator !== 'undefined' && !!navigator.geolocation;
    }

    function updatePosition(pos) {
        if (!pos || !pos.coords) return;

        const oldLat = shared.current.latitude;
        const oldLon = shared.current.longitude;

        shared.current.latitude = Number.isFinite(pos.coords.latitude) ? pos.coords.latitude : 0;
        shared.current.longitude = Number.isFinite(pos.coords.longitude) ? pos.coords.longitude : 0;
        shared.current.accuracy = Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : -1;
        shared.current.altitude = Number.isFinite(pos.coords.altitude) ? pos.coords.altitude : null;
        shared.current.altitudeAccuracy = Number.isFinite(pos.coords.altitudeAccuracy) ? pos.coords.altitudeAccuracy : null;
        shared.current.speed = Number.isFinite(pos.coords.speed) ? pos.coords.speed : null;
        shared.current.heading = Number.isFinite(pos.coords.heading) ? pos.coords.heading : null;
        shared.current.timestamp = Number.isFinite(pos.timestamp) ? pos.timestamp : Date.now();
        shared.current.available = true;

        if (oldLat !== shared.current.latitude || oldLon !== shared.current.longitude) {
            shared.watch.changedEdge = true;
            updateGeofences();
        }
    }

    function handleGeoError(err) {
        shared.errors.last = err && err.message ? String(err.message) : 'Geolocation error';
        console.warn('Mobile App Ultra Pro: geolocation error', err);
    }

    function requestCurrentPosition() {
        if (!hasGeolocation()) return;

        navigator.geolocation.getCurrentPosition(
            updatePosition,
            handleGeoError,
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 15000
            }
        );
    }

    function requestPermissionLike() {
        shared.current.permissionRequested = true;
        requestCurrentPosition();
    }

    function startWatch() {
        if (!hasGeolocation()) return false;
        if (shared.watch.active && shared.watch.id !== null) return true;

        try {
            shared.watch.id = navigator.geolocation.watchPosition(
                updatePosition,
                handleGeoError,
                {
                    enableHighAccuracy: true,
                    maximumAge: 3000,
                    timeout: 15000
                }
            );
            shared.watch.active = true;
            return true;
        } catch (e) {
            handleGeoError(e);
            return false;
        }
    }

    function stopWatch() {
        if (!hasGeolocation()) return;
        if (shared.watch.id !== null) {
            try {
                navigator.geolocation.clearWatch(shared.watch.id);
            } catch (e) {}
        }
        shared.watch.id = null;
        shared.watch.active = false;
    }

    function toRad(v) {
        return v * Math.PI / 180;
    }

    function toDeg(v) {
        return v * 180 / Math.PI;
    }

    function haversineMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function bearingDegrees(lat1, lon1, lat2, lon2) {
        const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
        const x =
            Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
        let brng = toDeg(Math.atan2(y, x));
        brng = (brng + 360) % 360;
        return brng;
    }

    function updateGeofences() {
        const lat = shared.current.latitude;
        const lon = shared.current.longitude;

        for (const name in shared.geofences) {
            const zone = shared.geofences[name];
            const d = haversineMeters(lat, lon, zone.lat, zone.lon);
            const insideNow = d <= zone.radius;

            if (!zone.inside && insideNow) {
                zone.enterEdge = true;
            }
            if (zone.inside && !insideNow) {
                zone.exitEdge = true;
            }

            zone.inside = insideNow;
            zone.lastDistance = d;
        }
    }

    class MobileAppUltraLocation {
        getInfo() {
            return {
                id: 'mobileappultralocation',
                name: t('Mobile App Ultra Pro / Геолокация', 'Mobile App Ultra Pro / Location'),
                color1: '#FF6B6B',
                color2: '#EE5A5A',
                color3: '#CC4848',
                blocks: [
                    {
                        blockType: BlockType.LABEL,
                        text: t('Позиция', 'Position')
                    },
                    {
                        opcode: 'isGeolocationAvailable',
                        blockType: BlockType.BOOLEAN,
                        text: t('геолокация доступна?', 'geolocation available?')
                    },
                    {
                        opcode: 'requestGeoPermission',
                        blockType: BlockType.COMMAND,
                        text: t('запросить доступ к геолокации', 'request geolocation access')
                    },
                    {
                        opcode: 'getPositionNow',
                        blockType: BlockType.COMMAND,
                        text: t('получить позицию', 'get position')
                    },
                    {
                        opcode: 'getLatitude',
                        blockType: BlockType.REPORTER,
                        text: t('широта (latitude)', 'latitude')
                    },
                    {
                        opcode: 'getLongitude',
                        blockType: BlockType.REPORTER,
                        text: t('долгота (longitude)', 'longitude')
                    },
                    {
                        opcode: 'getAccuracy',
                        blockType: BlockType.REPORTER,
                        text: t('точность (метры)', 'accuracy (meters)')
                    },
                    {
                        opcode: 'getAltitude',
                        blockType: BlockType.REPORTER,
                        text: t('высота (метры)', 'altitude (meters)')
                    },
                    {
                        opcode: 'getSpeed',
                        blockType: BlockType.REPORTER,
                        text: t('скорость (м/с)', 'speed (m/s)')
                    },
                    {
                        opcode: 'getHeading',
                        blockType: BlockType.REPORTER,
                        text: t('направление движения (0-360)', 'movement heading (0-360)')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Отслеживание и события', 'Tracking and Events')
                    },
                    {
                        opcode: 'startTracking',
                        blockType: BlockType.COMMAND,
                        text: t('начать отслеживание позиции', 'start position tracking')
                    },
                    {
                        opcode: 'stopTracking',
                        blockType: BlockType.COMMAND,
                        text: t('остановить отслеживание', 'stop tracking')
                    },
                    {
                        opcode: 'isTracking',
                        blockType: BlockType.BOOLEAN,
                        text: t('отслеживание активно?', 'tracking active?')
                    },
                    {
                        opcode: 'whenPositionChanged',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда позиция изменилась', 'when position changed')
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Расчёты', 'Calculations')
                    },
                    {
                        opcode: 'distanceToMeters',
                        blockType: BlockType.REPORTER,
                        text: t('расстояние до [LAT] [LON] (метры)', 'distance to [LAT] [LON] (meters)'),
                        arguments: {
                            LAT: { type: ArgumentType.NUMBER, defaultValue: 55.7558 },
                            LON: { type: ArgumentType.NUMBER, defaultValue: 37.6176 }
                        }
                    },
                    {
                        opcode: 'distanceToKm',
                        blockType: BlockType.REPORTER,
                        text: t('расстояние до [LAT] [LON] (км)', 'distance to [LAT] [LON] (km)'),
                        arguments: {
                            LAT: { type: ArgumentType.NUMBER, defaultValue: 55.7558 },
                            LON: { type: ArgumentType.NUMBER, defaultValue: 37.6176 }
                        }
                    },
                    {
                        opcode: 'directionTo',
                        blockType: BlockType.REPORTER,
                        text: t('направление к [LAT] [LON] (градусы)', 'direction to [LAT] [LON] (degrees)'),
                        arguments: {
                            LAT: { type: ArgumentType.NUMBER, defaultValue: 55.7558 },
                            LON: { type: ArgumentType.NUMBER, defaultValue: 37.6176 }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Геозоны', 'Geofences')
                    },
                    {
                        opcode: 'createGeofence',
                        blockType: BlockType.COMMAND,
                        text: t('создать геозону [NAME] в [LAT] [LON] радиус [R] метров', 'create geofence [NAME] at [LAT] [LON] radius [R] meters'),
                        arguments: {
                            NAME: { type: ArgumentType.STRING, defaultValue: 'home' },
                            LAT: { type: ArgumentType.NUMBER, defaultValue: 55.7558 },
                            LON: { type: ArgumentType.NUMBER, defaultValue: 37.6176 },
                            R: { type: ArgumentType.NUMBER, defaultValue: 100 }
                        }
                    },
                    {
                        opcode: 'deleteGeofence',
                        blockType: BlockType.COMMAND,
                        text: t('удалить геозону [NAME]', 'delete geofence [NAME]'),
                        arguments: {
                            NAME: { type: ArgumentType.STRING, defaultValue: 'home' }
                        }
                    },
                    {
                        opcode: 'isInsideGeofence',
                        blockType: BlockType.BOOLEAN,
                        text: t('внутри геозоны [NAME]?', 'inside geofence [NAME]?'),
                        arguments: {
                            NAME: { type: ArgumentType.STRING, defaultValue: 'home' }
                        }
                    },
                    {
                        opcode: 'whenEnterGeofence',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда вошёл в геозону [NAME]', 'when entered geofence [NAME]'),
                        arguments: {
                            NAME: { type: ArgumentType.STRING, defaultValue: 'home' }
                        }
                    },
                    {
                        opcode: 'whenExitGeofence',
                        blockType: BlockType.HAT,
                        isEdgeActivated: true,
                        text: t('когда вышел из геозоны [NAME]', 'when exited geofence [NAME]'),
                        arguments: {
                            NAME: { type: ArgumentType.STRING, defaultValue: 'home' }
                        }
                    },

                    {
                        blockType: BlockType.LABEL,
                        text: t('Дополнительно', 'Extra')
                    },
                    {
                        opcode: 'getPositionTime',
                        blockType: BlockType.REPORTER,
                        text: t('время получения позиции', 'position timestamp')
                    },
                    {
                        opcode: 'getAltitudeAccuracy',
                        blockType: BlockType.REPORTER,
                        text: t('точность высоты', 'altitude accuracy')
                    }
                ]
            };
        }

        isGeolocationAvailable() {
            return hasGeolocation();
        }

        requestGeoPermission() {
            requestPermissionLike();
        }

        getPositionNow() {
            requestCurrentPosition();
        }

        getLatitude() {
            return shared.current.available ? shared.current.latitude : 0;
        }

        getLongitude() {
            return shared.current.available ? shared.current.longitude : 0;
        }

        getAccuracy() {
            return shared.current.available ? shared.current.accuracy : -1;
        }

        getAltitude() {
            return shared.current.available && shared.current.altitude !== null ? shared.current.altitude : -1;
        }

        getSpeed() {
            return shared.current.available && shared.current.speed !== null ? shared.current.speed : -1;
        }

        getHeading() {
            return shared.current.available && shared.current.heading !== null ? shared.current.heading : -1;
        }

        startTracking() {
            startWatch();
        }

        stopTracking() {
            stopWatch();
        }

        isTracking() {
            return !!shared.watch.active;
        }

        whenPositionChanged() {
            const v = shared.watch.changedEdge;
            shared.watch.changedEdge = false;
            return v;
        }

        distanceToMeters(args) {
            if (!shared.current.available) return -1;
            const lat = Number(args.LAT);
            const lon = Number(args.LON);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return -1;
            return Math.round(haversineMeters(shared.current.latitude, shared.current.longitude, lat, lon) * 100) / 100;
        }

        distanceToKm(args) {
            const m = this.distanceToMeters(args);
            return m < 0 ? -1 : Math.round((m / 1000) * 1000) / 1000;
        }

        directionTo(args) {
            if (!shared.current.available) return -1;
            const lat = Number(args.LAT);
            const lon = Number(args.LON);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return -1;
            return Math.round(bearingDegrees(shared.current.latitude, shared.current.longitude, lat, lon) * 100) / 100;
        }

        createGeofence(args) {
            const name = String(args.NAME || '');
            const lat = Number(args.LAT);
            const lon = Number(args.LON);
            const radius = Math.max(1, Number(args.R) || 1);

            if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) return;

            shared.geofences[name] = {
                lat: lat,
                lon: lon,
                radius: radius,
                inside: false,
                enterEdge: false,
                exitEdge: false,
                lastDistance: -1
            };

            if (shared.current.available) {
                updateGeofences();
            }
        }

        deleteGeofence(args) {
            const name = String(args.NAME || '');
            delete shared.geofences[name];
        }

        isInsideGeofence(args) {
            const name = String(args.NAME || '');
            const zone = shared.geofences[name];
            if (!zone) return false;
            return !!zone.inside;
        }

        whenEnterGeofence(args) {
            const name = String(args.NAME || '');
            const zone = shared.geofences[name];
            if (!zone) return false;
            const v = !!zone.enterEdge;
            zone.enterEdge = false;
            return v;
        }

        whenExitGeofence(args) {
            const name = String(args.NAME || '');
            const zone = shared.geofences[name];
            if (!zone) return false;
            const v = !!zone.exitEdge;
            zone.exitEdge = false;
            return v;
        }

        getPositionTime() {
            return shared.current.available ? shared.current.timestamp : 0;
        }

        getAltitudeAccuracy() {
            return shared.current.available && shared.current.altitudeAccuracy !== null ? shared.current.altitudeAccuracy : -1;
        }
    }

    Scratch.extensions.register(new MobileAppUltraLocation());
})(Scratch);
