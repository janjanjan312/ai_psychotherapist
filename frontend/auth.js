const apiUrl = process.env.NODE_ENV === 'production'
    ? 'https://solid-giggle-694r6rwrw4vxh599g-3000.app.github.dev'
    : 'http://localhost:3001';

// 使用时
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${apiUrl}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        // 处理登录成功
    } catch (error) {
        console.error('Login error:', error);
    }
} 