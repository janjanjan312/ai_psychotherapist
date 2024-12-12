function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    document.querySelector('.time').textContent = `${hours}:${minutes}`;
    document.querySelector('.date').textContent = 
        `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
}

// 初始更新时间
updateTime();

// 每秒更新一次时间
setInterval(updateTime, 1000); 

function randomizeDolphin() {
    const dolphin = document.querySelector('.dolphin');
    // 随机设置动画延迟
    dolphin.style.animationDelay = `${Math.random() * 2}s`;
    // 随机设置动画时长
    dolphin.style.animationDuration = `${15 + Math.random() * 10}s`;
}

// 初始化随机效果
randomizeDolphin();

// 每次动画结束后重新随机
document.querySelector('.dolphin').addEventListener('animationiteration', randomizeDolphin); 