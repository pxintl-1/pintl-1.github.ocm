const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

// 讓伺服器讀取同一個資料夾底下的 index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 當有使用者連線時的邏輯
io.on('connection', (socket) => {
    console.log('一個使用者連線了！');

    // 監聽前端傳來的 'chat message' 事件
    socket.on('chat message', (msg) => {
        // 將訊息廣播給所有人（包含發送者自己）
        io.emit('chat message', msg);
    });

    // 當使用者斷開連線
    socket.on('disconnect', () => {
        console.log('使用者離開了。');
    });
});

// 啟動伺服器
http.listen(PORT, () => {
    console.log(`伺服器正在運行中：http://localhost:${PORT}`);
});
