const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Agar request '/subscription' par aati hai, toh local JSON response return hoga[cite: 5]
app.all('/subscription', (req, res) => {
    res.json({
        status: true,
        message: "Local subscription data",
        data: {{
  "code": 200,
  "message": "Success",
  "data": {
    "subStat": "1",
    "plan": "𝐌ⱺᑯᑯ𝖾𝗋ᯓ➤ 𝐑υᑯ𝗋α𝗑ⱺ",
    "cta": "Active",
    "valdTxt": "Lifetime",
    "pvend": "JUSPAY",
    "sectionTile": {
      "id": "18",
      "lyt": "TS1",
      "acttxt": "",
      "text": "Top 10"
    },
    "valEp": 1828891843235,
    "mdActv": false
  }
}} // Yahan apna local subscription JSON content dalein
    });
});

// 2. Agar request '/struct' par aati hai, toh local JSON response return hoga[cite: 5]
app.all('/struct', (req, res) => {
    res.json({
        status: true,
        message: "Local struct data",
        data: {{
  "code": 200,
  "message": "Home Page Layout",
  "data": {
    "cid": "cluster1",
    "sections": [
      {
        "id": "505",
        "lyt": "F1",
        "atoScrl": false,
        "btnover": "Watch Now"
      },
      {
        "id": "507",
        "lyt": "TS1",
        "acttxt": null,
        "text": "𝐌ⱺᑯᑯ𝖾𝗋ᯓ➤ 𝐑υᑯ𝗋α𝗑ⱺ 𝐗 𝚰𝗄ᑲαᥣ",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "223",
        "lyt": "G1",
        "acttxt": "See All",
        "text": "Love Affairs",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "509",
        "lyt": "G1",
        "acttxt": "See All",
        "text": "Binge Worthy Series",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "512",
        "lyt": "G1",
        "acttxt": "See All",
        "text": "Trending Now",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "755",
        "lyt": "G1",
        "acttxt": null,
        "text": "Dailies - Daily New Episodes",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "514",
        "lyt": "TS1",
        "acttxt": null,
        "text": "Top 10 New Releases",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "515",
        "lyt": "G1",
        "acttxt": "See All",
        "text": "CEO Billionaire",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "516",
        "lyt": "G1",
        "acttxt": "See All",
        "text": "Just Launched",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "521",
        "lyt": "G1",
        "acttxt": "See All",
        "text": "Revenge & Dhoka",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "519",
        "lyt": "G1",
        "acttxt": "See All",
        "text": "Top International Dramas",
        "sBgG": false,
        "sBgImg": null
      },
      {
        "id": "522",
        "lyt": "AD1",
        "acttxt": null,
        "text": "All Dramas",
        "sBgG": false,
        "sBgImg": null
      }
    ]
  }
}} // Yahan apna local struct JSON content dalein
    });
});

// 3. Baaki saari requests Original App Server (https://story.appsdone.online) par forward hongi[cite: 5]
// Key / Token injection function hata diya gaya hai[cite: 5]
app.use('/', createProxyMiddleware({
    target: 'https://story.appsdone.online',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        // Extra headers ya key injection yahan se remove kar diya gaya hai
    }
}));

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});