const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON file ko safe tarike se read karne ke liye helper function
const readJsonFile = (fileName) => {
    const filePath = path.join(__dirname, fileName);
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
};

// 1. '/subscription' request par 'subscription.json' se response bhejein[cite: 5]
app.all('/subscription', (req, res) => {
    try {
        const responseData = readJsonFile('subscription.json');
        res.json(responseData);
    } catch (error) {
        res.status(500).json({ status: false, message: "subscription.json read karne mein error aaya" });
    }
});

// 2. '/struct' request par 'struct.json' se response bhejein[cite: 5]
app.all('/struct', (req, res) => {
    try {
        const responseData = readJsonFile('struct.json');
        res.json(responseData);
    } catch (error) {
        res.status(500).json({ status: false, message: "struct.json read karne mein error aaya" });
    }
});

// 3. Baaki saari requests Original App Server par forward hongi (Key/Token function removed)[cite: 5]
app.use('/', createProxyMiddleware({
    target: 'https://tv.elitemods.online',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        // Headers ya keys inject karne ka function hata diya gaya hai
    }
}));

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});