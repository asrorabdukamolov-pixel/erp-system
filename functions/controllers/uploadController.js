const Busboy = require('busboy');
const { storage } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

exports.uploadFile = (req, res) => {
    try {
        const busboy = Busboy({ headers: req.headers });
        const bucket = storage.bucket();
        
        let fileUploadPromise = null;
        let originalName = '';

        busboy.on('file', (fieldname, file, info) => {
            const { filename, encoding, mimeType } = info;
            originalName = filename;
            const fileExtension = path.extname(filename);
            const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
            const newFilename = `uploads/${Date.now()}_${sanitizedName}`;
            const fileRef = bucket.file(newFilename);
            const downloadToken = uuidv4();

            const writeStream = fileRef.createWriteStream({
                metadata: {
                    contentType: mimeType,
                    contentDisposition: `attachment; filename="${originalName}"`,
                    metadata: {
                        firebaseStorageDownloadTokens: downloadToken
                    }
                },
                resumable: false
            });

            file.pipe(writeStream);

            fileUploadPromise = new Promise((resolve, reject) => {
                writeStream.on('finish', () => {
                    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(newFilename)}?alt=media&token=${downloadToken}`;
                    resolve({ url: publicUrl, name: originalName });
                });
                writeStream.on('error', reject);
            });
        });

        busboy.on('finish', async () => {
            if (!fileUploadPromise) {
                return res.status(400).json({ msg: 'Fayl topilmadi' });
            }
            try {
                const result = await fileUploadPromise;
                res.json(result);
            } catch (err) {
                console.error("Upload finish error:", err);
                res.status(500).json({ msg: 'Yuklashda xatolik', error: err.message });
            }
        });

        busboy.on('error', (err) => {
            console.error("Busboy error:", err);
            res.status(500).json({ msg: 'Server xatosi', error: err.message });
        });

        if (req.rawBody) {
            busboy.end(req.rawBody);
        } else {
            req.pipe(busboy);
        }
    } catch (err) {
        console.error("General Upload Error:", err);
        res.status(500).json({ msg: 'Server xatosi', error: err.message });
    }
};
