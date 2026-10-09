const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Agar request '/subscription' par aati hai, toh local JSON response return hoga[cite: 5]
app.all('/subscription', (req, res) => {
    res.json({
        status: true,
        message: "Local subscription data",
        data: {} // Yahan apna local subscription JSON content dalein
    });
});

// 2. Agar request '/struct' par aati hai, toh local JSON response return hoga[cite: 5]
app.all('/struct', (req, res) => {
    res.json({
        status: true,
        message: "Local struct data",
        data: {} // Yahan apna local struct JSON content dalein
    });
});

// 3. Baaki saari requests Original App Server (https://story.appsdone.online) par forward hongi[cite: 5]
// Key / Token injection function hata diya gaya hai[cite: 5]
app.use('/', createProxyMiddleware({
    target: 'https://tv.elitemods.online',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        // Extra headers ya key injection yahan se remove kar diya gaya hai
    }
}));

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});