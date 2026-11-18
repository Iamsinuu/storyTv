const express = require('express');
const crypto = require('crypto');
const app = express();

const PORT = process.env.PORT || 3000;
const ORIGINAL_API_BASE = 'https://tv.elitemods.online';

// 32-byte Secret Key (Android app ke DEX/Smali code ke sath exact match honi chahiye)
const SECRET_KEY = crypto.createHash('sha256').update('Ikbal').digest();

// Local JSON Files Import
const subscriptionData = require('./subscription.json');
const structData = require('./struct.json');

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// JSON Helper Function
function sendJsonWithCdnProxy(res, req, data) {
    res.header("Cache-Control", "public, max-age=3600");
    return res.json(data);
}

// ---------------- AES-256-GCM CRYPTO HELPER FUNCTIONS ----------------

function decryptPayload(base64Data) {
    const buffer = Buffer.from(base64Data, 'base64');
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(buffer.length - 16);
    const ciphertext = buffer.subarray(12, buffer.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', SECRET_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}

function encryptPayload(jsonData) {
    const plaintext = JSON.stringify(jsonData);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_KEY, iv);

    let encrypted = cipher.update(plaintext, 'utf8');
    const finalChunk = cipher.final();
    const authTag = cipher.getAuthTag();

    const finalBuffer = Buffer.concat([iv, encrypted, finalChunk, authTag]);
    return finalBuffer.toString('base64');
}

// ---------------- LOCAL CUSTOM ENDPOINTS ----------------

app.get('/userservice/v1/profile/subscription', (req, res) => {
    sendJsonWithCdnProxy(res, req, subscriptionData);
});

app.get('/feedservice/v1/homepage/struct', (req, res) => {
    sendJsonWithCdnProxy(res, req, structData);
});

// ---------------- LIVE PROXY HANDLER ----------------

app.use(async (req, res) => {
    try {
        const targetUrl = `${ORIGINAL_API_BASE}${req.originalUrl}`;
        let requestBody = {};

        // Agar client ne encrypted payload bheja hai ({ data: "..." })
        if (req.body && req.body.data) {
            try {
                requestBody = decryptPayload(req.body.data);
            } catch (decErr) {
                console.error("Decryption failed:", decErr.message);
                requestBody = req.body;
            }
        } else if (req.body && Object.keys(req.body).length > 0) {
            requestBody = req.body;
        }

        // Original Headers Setup
        const headers = {
            'appVersion': req.headers['appversion'] || '14',
            'platform': req.headers['platform'] || '0',
            'deviceId': req.headers['deviceid'] || '5de5d3c427dcb215',
            'os': req.headers['os'] || 'Android 16 (API 36)',
            'network_type': req.headers['network_type'] || 'WIFI',
            'User-Agent': 'ktor-client',
            'Content-Type': 'application/json',
            'ts': Math.floor(Date.now() / 1000).toString()
        };

        // Sirf tabhi Authorization bhejein jab client se aaye (No hardcoded token)
        if (req.headers['authorization']) {
            headers['Authorization'] = req.headers['authorization'];
        }

        const fetchOptions = {
            method: req.method,
            headers: headers
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && Object.keys(requestBody).length > 0) {
            fetchOptions.body = JSON.stringify(requestBody);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const responseData = await response.json();

        // Response ko AES-256-GCM se encrypt karke client ko return karna
        const encryptedResponse = encryptPayload(responseData);

        res.status(response.status).json({ data: encryptedResponse });

    } catch (error) {
        res.status(500).json({
            status: "PROXY_ERROR",
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});