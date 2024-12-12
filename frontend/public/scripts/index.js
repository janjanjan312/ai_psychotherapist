console.log('index.js loaded!');

function handleNavigation(targetPage) {
    console.log('Button clicked - handleNavigation called!');
    console.log('Current localStorage token:', localStorage.getItem('token'));
    
    const token = localStorage.getItem('token');
    
    if (token) {
        console.log('Has token, redirecting to:', targetPage);
        window.location.href = `/${targetPage}.html`;
    } else {
        console.log('No token found, redirecting to auth page');
        localStorage.setItem('redirectAfterLogin', targetPage);
        window.location.href = '/auth.html';
    }
}

// 强制重写按钮的点击事件
function initializeButton() {
    const chatButton = document.getElementById('chatButton');
    if (chatButton) {
        console.log('Initializing button...');
        // 移除可能存在的 onclick 属性
        chatButton.removeAttribute('onclick');
        // 移除所有现有的点击事件监听器
        chatButton.replaceWith(chatButton.cloneNode(true));
        // 重新获取按钮（因为 cloneNode 创建了新元素）
        const newChatButton = document.getElementById('chatButton');
        // 添加新的事件监听器
        newChatButton.onclick = (e) => {
            e.preventDefault();
            console.log('Button clicked!');
            handleNavigation('chat');
            return false;
        };
        console.log('Button initialized successfully');
    } else {
        console.log('Chat button not found!');
    }
}

// 页面加载完成后初始化按钮
document.addEventListener('DOMContentLoaded', initializeButton);
// 立即尝试初始化按钮
initializeButton(); 

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const chatButton = document.getElementById('chatButton');
    const quizButton = document.querySelector('.next-button');  // 获取 Quiz 按钮
    const buttonSection = document.querySelector('.button-section');
    const contentContainer = document.querySelector('.content-container');
    
    // 检查登录状态并设置按钮位置
    if (localStorage.getItem('token')) {
        // 计算内容容器的最小高度范围内的位置
        const containerHeight = 812;
        const currentHeight = contentContainer.offsetHeight;
        const availableHeight = Math.min(containerHeight, currentHeight);
        
        buttonSection.appendChild(logoutButton);
        
        logoutButton.style.cssText = `
            display: block !important;
            background: none !important;
            border: none !important;
            color: #999 !important;
            cursor: pointer !important;
            font-size: 16px !important;
            padding: 5px !important;
            width: 100% !important;
            text-align: center !important;
            position: absolute !important;
            top: ${Math.min(chatButton.offsetTop + chatButton.offsetHeight + 10, availableHeight - 70)}px !important;
        `;
    } else {
        logoutButton.style.display = 'none';
    }

    // 处理登出
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        logoutButton.style.display = 'none';
    });

    // Quiz 按钮点击事件
    quizButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!localStorage.getItem('token')) {
            window.location.href = '/auth.html?redirect=' + encodeURIComponent('/part1/intro.html');
        } else {
            window.location.href = '/part1/intro.html';
        }
    });

    // AI 聊天按钮点击事件
    chatButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!localStorage.getItem('token')) {
            window.location.href = '/auth.html?redirect=/chat.html';
        } else {
            window.location.href = '/chat.html';
        }
    });
}); 