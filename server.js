const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

// 預設公共隨機文字庫
let textPool = [
    "這是第一條預設的溫暖心聲 ✨",
    "今天點了一杯奶茶，甜度剛剛好，希望你的心情也是！",
    "做人如果沒有夢想，那跟鹹魚有什麼分別？"
];

// 讓專案可以使用當前目錄下的靜態資源檔案 (css, js, images 等)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Socket 即時通訊核心監聽
io.on('connection', (socket) => {
    // 剛連線時，先將目前的字條數量同步給這名剛進來的使用者
    socket.emit('pool updated', textPool.length);

    // 監聽前端上傳文字
    socket.on('upload text', (msg) => {
        if (msg && msg.trim() !== "") {
            textPool.push(msg.trim());
            // 廣播給所有人更新後的總數量
            io.emit('pool updated', textPool.length);
        }
    });

    // 監聽前端隨機抽取請求
    socket.on('request random', () => {
        if (textPool.length === 0) {
            socket.emit('random result', "文字樹洞目前空空如也，快投入第一個秘密吧！");
            return;
        }
        // 計算隨機索引值並取出文字
        const randomIndex = Math.floor(Math.random() * textPool.length);
        const selectedText = textPool[randomIndex];
        
        // 將抽取結果單獨傳回給發出請求的該名用戶
        socket.emit('random result', selectedText);
    });
});

http.listen(PORT, () => {
    console.log(`伺服器正在運行中：http://localhost:${PORT}`);
});
