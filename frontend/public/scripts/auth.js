const API_BASE_URL = 'http://localhost:3001/api/auth';

async function register(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '注册失败');
        }

        const data = await response.json();
        console.log('注册成功:', data);
        return data;
    } catch (error) {
        console.error('注册错误:', error);
        throw error;
    }
}

async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '登录失败');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data;
    } catch (error) {
        console.error('登录错误:', error);
        throw error;
    }
}

// 切换登录和注册表单的函数
function toggleForms() {
    const loginBox = document.getElementById('loginBox');
    const signupBox = document.getElementById('signupBox');
    
    if (loginBox.style.display === 'none') {
        loginBox.style.display = 'block';
        signupBox.style.display = 'none';
    } else {
        loginBox.style.display = 'none';
        signupBox.style.display = 'block';
    }
}

// 修改登录表单提交的处理部分
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = this.username.value;
    const password = this.password.value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            redirect: 'follow',
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '登录失败');
        }

        const data = await response.json();
        // localStorage.setItem('token', data.token);
        // localStorage.setItem('username', username);
        
        // // 获取URL中的redirect参数
        // const urlParams = new URLSearchParams(window.location.search);
        // const redirectPath = urlParams.get('redirect');
        
        // if (redirectPath) {
        //     // 如果有redirect参数，直接跳转到该路径
        //     window.location.href = redirectPath;
        // } else {
        //     // 如果没有redirect参数，检查localStorage中是否有redirectAfterLogin
        //     const redirectPage = localStorage.getItem('redirectAfterLogin');
        //     if (redirectPage) {
        //         localStorage.removeItem('redirectAfterLogin');
        //         window.location.href = `/${redirectPage}.html`;
        //     } else {
        //         window.location.href = '/chat.html';
        //     }
        // }
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please try again.');
    }
});

// 添加页面加载完成后的初始化代码
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        console.log('Found signup form');
        
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Signup form submitted');
            
            const username = this.username.value;
            const email = this.email.value;
            const password = this.password.value;

            console.log('Form data:', { username, email, hasPassword: !!password });

            try {
                const response = await fetch('http://localhost:3001/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password })
                });

                console.log('Response:', {
                    status: response.status,
                    statusText: response.statusText
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '注册失败');
                }

                const data = await response.json();
                console.log('Registration successful:', data);
                alert('注册成功！请登录。');
                toggleForms();
            } catch (error) {
                console.error('Registration error:', error);
                alert(error.message || '注册失败，请重试。');
            }
        });
    } else {
        console.error('Signup form not found!');
    }

    // 登录表单处理
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Found login form');
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('http://localhost:3001/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();
                console.log('Login response:', data);

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', username);
                    
                    // const urlParams = new URLSearchParams(window.location.search);
                    // const redirectPath = urlParams.get('redirect');
                    
                    // if (redirectPath) {
                    //     window.location.href = redirectPath;
                    // } else {
                    //     window.location.href = '/index.html';
                    // }
                } else {
                    const errorMessage = data.message || data.error || 'Login failed: ' + response.status;
                    console.error('Login error:', errorMessage);
                    alert(errorMessage);
                }
            } catch (error) {
                console.error('Network or parsing error:', error);
                alert('An error occurred during login: ' + error.message);
            }
        });
    } else {
        console.error('Login form not found!');
    }
}); 

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        console.log('正在尝试登录...', { username });
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        }).catch(error => {
            console.error('Fetch错误:', error);
            throw new Error(`连接服务器失败: ${error.message}`);
        });

        console.log('登录响应状态:', response.status);
        
        const data = await response.json();
        console.log('登录响应数据:', data);

        if (!response.ok) {
            throw new Error(data.error || '登录失败');
        }

        // 登录成功
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        
        // 获取URL中的redirect参数
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect');
        
        // if (redirectPath) {
        //     window.location.href = redirectPath;
        // } else {
        //     window.location.href = '/chat.html';
        // }
    } catch (error) {
        console.error('登录错误:', error);
        showError(`登录失败: ${error.message}`);
    }
}

// 改进错误显示函数
function showError(message) {
    console.error('显示错误:', message);
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

// 确保正确添加事件监听器
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}); 