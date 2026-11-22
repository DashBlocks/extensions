/* Author: ABDev */
const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const PORT = 3000;

const ROOT_DIR = path.join(__dirname, '..');

const FILES = [
    '3d.js',
    'clav.js',
    'col.js',
    'col1.js',
    'localstorage.js',
    'mish.js',
    'mobile-app-ads.js',
    'mobile-app-analytics.js',
    'mobile-app-audio.js',
    'mobile-app-core.js',
    'mobile-app-location.js',
    'mobile-app-media.js',
    'mobile-app-notifications.js',
    'mobile-app-sensors.js',
    'mobile-app-social.js',
    'mobile-app-storage.js',
    'mobile-app-system.js',
    'mobile-app-touch.js',
    'mobile-app-vibration.js',
    'sdkyan.js',
    'sss.js'
];

app.get('/', (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;

    if (!FILES.includes(filename)) {
        return res.status(404).send('Файл не найден');
    }
    
    const filePath = path.join(ROOT_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Файл не найден');
    }

    res.download(filePath, filename);
});

app.get('/download-all', (req, res) => {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=files.zip');
    
    const archive = archiver('zip', {
        zlib: { level: 9 } 
    });
    
    archive.on('error', (err) => {
        res.status(500).send('Ошибка при создании архива');
    });
    
    archive.pipe(res);

    FILES.forEach(filename => {
        const filePath = path.join(ROOT_DIR, filename);
        if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: filename });
        }
    });
    
    archive.finalize();
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http:
    console.log(`📁 Корневая директория: ${ROOT_DIR}`);
    console.log(`📦 Всего файлов: ${FILES.length}`);
});
