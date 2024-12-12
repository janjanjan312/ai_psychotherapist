const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');
const authRouter = require('./routes/auth');  // 添加这行来导入 auth 路由
// const passport = require('passport');
// const GitHubStrategy = require('passport-github2');
// const session = require('express-session');

const app = express();
const port = process.env.NODE_ENV === 'production' ? 3000 : 3001;
const JWT_SECRET = 'your-secret-key';  // 建议使用环境变量存储这个密钥

// 基本中间件
app.use(express.json());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://solid-giggle-694r6rwrw4vxh599g-3000.app.github.dev'
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers,
        origin: req.headers.origin
    });
    next();
});

// 创建认证中间件 - 确保它在 API 路由之前定义
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// 创建数据库连接
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Database error:', err);
    } else {
        console.log('Connected to database');
    }
});

// 在数据库连接后添加表创建代码
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready');
        }
    });
});

// 创建 API 路由器
const apiRouter = express.Router();

// API 路由定义
apiRouter.post('/auth/signup', async (req, res) => {
    console.log('Signup route hit:', {
        path: req.path,
        body: req.body,
        headers: req.headers
    });

    try {
        // 添加内容类型检查
        if (!req.is('application/json')) {
            console.log('Invalid content type:', req.headers['content-type']);
            return res.status(400).json({ error: 'Content-Type must be application/json' });
        }

        const { username, email, password } = req.body;
        console.log('Processing signup for:', { username, email, hasPassword: !!password });
        
        if (!username || !email || !password) {
            console.log('Missing fields:', { username: !!username, email: !!email, password: !!password });
            return res.status(400).json({ error: '所有字段都是必填的' });
        }
        
        // 检查用户是否已存在
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: '服务器错误' });
            }
            
            if (user) {
                console.log('User already exists:', { username: user.username, email: user.email });
                return res.status(400).json({ error: '用户名或邮箱已存在' });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // 添加用户插入日志
                console.log('Attempting to insert user:', { username, email });
                
                db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                    [username, email, hashedPassword],
                    function(err) {  // 使用 function 而不是箭头函数来访问 this
                        if (err) {
                            console.error('Insert error:', err);
                            return res.status(500).json({ error: '注册失败: ' + err.message });
                        }
                        console.log('User registered successfully:', { id: this.lastID });
                        res.status(201).json({ message: '注册成功' });
                    }
                );
            } catch (hashError) {
                console.error('Password hashing error:', hashError);
                res.status(500).json({ error: '密码加密失败' });
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: '服务器错误: ' + error.message });
    }
});

apiRouter.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: '服务器错误' });
        }
        
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '24h'
        });

        res.json({ token, username: user.username });
    });
});

// 修改 OpenAI 配置
const configuration = {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://xiaoai.plus/v1'  // 修改为 xiaoai.plus 的基础URL
};

// 创建 OpenAI 实例
let openai;
try {
    openai = new OpenAI(configuration);
    console.log('OpenAI instance created successfully');
} catch (error) {
    console.error('Failed to create OpenAI instance:', error);
}

apiRouter.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        console.log('收到聊天请求:', {
            message,
            user: req.user,
            apiKey: process.env.OPENAI_API_KEY ? '已设置' : '未设置',
            apiModel: process.env.OPENAI_API_MODEL,
            hasOpenAI: !!openai
        });

        if (!message) {
            return res.status(400).json({ error: '消息不能为空' });
        }

        if (!openai) {
            console.error('OpenAI instance not initialized');
            return res.status(500).json({ error: 'OpenAI service not available' });
        }

        try {
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_API_MODEL || "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are Dr. Sarah Johnson, a professional psychotherapist. Respond with empathy and professional insight."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            });

            console.log('OpenAI API response status:', completion.status);
            console.log('Response data:', {
                hasChoices: !!completion.choices,
                firstChoice: completion.choices?.[0]?.message?.content ? '有内容' : '无内容'
            });

            if (!completion.choices?.[0]?.message?.content) {
                throw new Error('Invalid response format from OpenAI');
            }

            res.json({ 
                reply: completion.choices[0].message.content 
            });
        } catch (openaiError) {
            console.error('OpenAI API Error:', {
                name: openaiError.name,
                message: openaiError.message,
                code: openaiError.code,
                type: openaiError.type,
                status: openaiError.status
            });
            
            if (openaiError.response) {
                console.error('OpenAI API Response:', openaiError.response.data);
            }
            
            res.status(500).json({ 
                error: 'OpenAI API error',
                details: openaiError.message
            });
        }
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message
        });
    }
});

// 确保这些中间件在路由之前
app.use(express.json());

// 挂载路由
app.use('/api/auth', authRouter);

// 其他 API 路由
app.use('/api', apiRouter);

// 404 处理 - API 路由
app.use('/api/*', (req, res) => {
    console.log('404 for API request:', req.path);  // 添加日志
    res.status(404).json({ error: 'API endpoint not found' });
});

// 然后是静态文件服务
app.use(express.static(path.join(__dirname, '../frontend/public')));

// 最后是页面路由
// app.get('/chat', (req, res) => {
//    res.sendFile(path.join(__dirname, '../frontend/public/chat.html'));
// });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (req.path.startsWith('/api/')) {
        res.status(500).json({ error: 'Internal server error' });
    } else {
        next(err);
    }
});

// GitHub OAuth 配置
// passport.use(new GitHubStrategy({
//     clientID: process.env.GITHUB_CLIENT_ID,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     callbackURL: process.env.NODE_ENV === 'production'
//         ? 'https://solid-giggle-694r6rwrw4vxh599g-3000.app.github.dev/api/auth/github/callback'
//         : 'http://localhost:3000/api/auth/github/callback'
// }, function(accessToken, refreshToken, profile, cb) {
//     return cb(null, profile);
// }));

// 初始化 Passport
// app.use(passport.initialize());

// 添加环境检测
const isProduction = process.env.NODE_ENV === 'production';
const callbackURL = isProduction
    ? 'https://solid-giggle-694r6rwrw4vxh599g-3000.app.github.dev/auth/github/callback'
    : 'http://localhost:3000/auth/github/callback';

console.log('Current environment:', process.env.NODE_ENV);
console.log('Using callback URL:', callbackURL);

// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
//     }
// }));

// app.use(passport.session());

// 序列化用户
// passport.serializeUser(function(user, done) {
//     done(null, user);
// });

// passport.deserializeUser(function(user, done) {
//     done(null, user);
// });

app.listen(port, () => {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('CORS origin:', process.env.NODE_ENV === 'production'
        ? 'https://solid-giggle-694r6rwrw4vxh599g-3000.app.github.dev'
        : 'http://localhost:3000');
    console.log(`Server running at http://localhost:${port}`);
}); 