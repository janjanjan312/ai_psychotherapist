// 获取DOM元素
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// 显示消息的函数
async function displayMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    chatMessages.appendChild(messageDiv);

    // 如果是接收到的消息，使用打字机效果
    if (type === 'received') {
        let index = 0;
        const speed = 20; // 打字速度（毫秒）
        
        function typeWriter() {
            if (index < content.length) {
                contentDiv.textContent += content.charAt(index);
                index++;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                setTimeout(typeWriter, speed);
            }
        }
        
        typeWriter();
    } else {
        // 如果是发送的消息，直接显示
        contentDiv.textContent = content;
    }
    
    // 滚动到最新消息
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 在页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        // 如果没有token，重定向到登录页面
        window.location.href = '/auth.html';
        return;
    }
});

// 发送消息的函数
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    try {
        // 显示用户消息
        displayMessage(message, 'sent');
        messageInput.value = ''; // 清空输入框

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/auth.html';
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send message');
        }

        const data = await response.json();
        displayMessage(data.reply, 'received');
    } catch (error) {
        console.error('Chat error:', error);
        displayMessage('Error: ' + error.message, 'error');
    }
}

// 添加事件监听器
sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});