const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 处理 API 请求 - 重定向到后端服务器
app.all('/api/*', (req, res) => {
    res.redirect(`http://localhost:3001${req.originalUrl}`);
});

// 处理根路径
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 处理 part1 和 part2 的请求
app.get('/part1/*', (req, res) => {
    console.log('Part1 request:', req.path);
    const relativePath = req.path.replace('/part1/', '');
    const filePath = path.join(__dirname, 'part1', relativePath);
    console.log('Serving file:', filePath);
    res.sendFile(filePath);
});

app.get('/part2/*', (req, res) => {
    console.log('Part2 request:', req.path);
    const relativePath = req.path.replace('/part2/', '');
    const filePath = path.join(__dirname, 'part2', relativePath);
    console.log('Serving file:', filePath);
    res.sendFile(filePath);
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Server Error');
});

app.listen(port, () => {
    console.log(`前端服务器运行在 http://localhost:${port}`);
}); 