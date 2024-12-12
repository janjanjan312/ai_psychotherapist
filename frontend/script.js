function randomizeDolphin() {
    const dolphin = document.querySelector('.dolphin');
    // 随机设置动画延迟
    dolphin.style.animationDelay = `${Math.random() * 2}s`;
    // 随机设置动画时长
    dolphin.style.animationDuration = `${20 + Math.random() * 10}s`;
}

// 初始化随机效果
randomizeDolphin();

// 每次动画结束后重新随机
document.querySelector('.dolphin').addEventListener('animationiteration', randomizeDolphin);

// 检查用户是否已登录
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        // 如果已登录，直接跳转到 part1/intro.html
        window.location.href = 'part1/intro.html';
    }
}

// 页面加载时检查登录状态
window.onload = function() {
    // 如果当前在 index.html 页面，检查登录状态
    if (window.location.pathname.endsWith('index.html')) {
        checkLoginStatus();
    }
} 