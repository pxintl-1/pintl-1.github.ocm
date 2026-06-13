const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

// 儲存所有人上傳文字的「文字庫」
let textPool = [
    "歡迎來到隨機聊天室！目前文字庫還空空的，快來上傳第一條文字吧！",
    "今天也是充滿希望的一天，加油！ ✨",
    "做人如果沒有夢想，那跟鹹魚有什麼分別？"
];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('一個使用者連線了');

    // 監聽前端「上傳文字」的事件
    socket.on('upload text', (msg) => {
        if (msg.trim() !== "") {
            textPool.push(msg); // 將文字存入後端陣列
            console.log(`有人上傳了新文字！目前文字庫總數: ${textPool.length}`);
            
            // 告訴所有人文字庫更新了（選用，讓大家知道現在總共有幾條）
            io.emit('pool updated', textPool.length);
        }
    });

    // 監聽前端「請求隨機抽取」的事件
    socket.on('request random', () => {
        if (textPool.length === 0) {
            socket.emit('random result', "目前文字庫裡面沒有任何文字喔！");
            return;
        }

        // 產生隨機索引值 (0 到 textPool.length - 1)
        const randomIndex = Math.floor(Math.random() * textPool.length);
        const selectedText = textPool[randomIndex];

        // 將隨機抽到的文字，**單獨傳回給發出請求的那位用戶**
        socket.emit('random result', selectedText);
    });
});

http.listen(PORT, () => {
    console.log(`伺服器執行中：http://localhost:${PORT}`);
});
