// 打开数据库
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('QuizDatabase', 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('quizData')) {
                db.createObjectStore('quizData', { keyPath: 'id' });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            console.error('Database error:', event.target.errorCode);
            reject('Database error: ' + event.target.errorCode);
        };
    });
}

// 保存数据
async function saveData(id, data) {
    try {
        console.log('Attempting to save data:', { id, data });
        const db = await openDatabase();
        const transaction = db.transaction(['quizData'], 'readwrite');
        const store = transaction.objectStore('quizData');
        
        // 添加事务完成的监听
        return new Promise((resolve, reject) => {
            const request = store.put({ id, data });
            
            request.onsuccess = () => {
                console.log(`Successfully saved data for ${id}`);
                resolve();
            };
            
            request.onerror = (event) => {
                console.error(`Error saving data for ${id}:`, event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = () => {
                console.log('Transaction completed');
            };
        });
    } catch (error) {
        console.error('Error in saveData:', error);
        throw error;
    }
}

// 获取数据
async function getData(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['quizData'], 'readonly');
        const store = transaction.objectStore('quizData');
        const request = store.get(id);

        request.onsuccess = function(event) {
            const result = event.target.result ? event.target.result.data : null;
            console.log(`Data retrieved for ${id}:`, result);
            resolve(result);
        };

        request.onerror = function(event) {
            reject('Data retrieval error: ' + event.target.errorCode);
        };
    });
}

// 保存选择状态的函数
function saveSelections() {
    const questionNumber = window.location.pathname.split('/').pop().match(/\d+/)[0];
    const currentPath = window.location.pathname;
    const isPart2 = currentPath.includes('/part2/');
    
    // 根据不同部分使用不同的前缀
    const prefix = isPart2 ? 'part2_quiz' : 'quiz';
    
    // 保存所有选项的状态
    const selections = {
        adult: {},
        child: {},
        adultOther: '',
        childOther: ''
    };
    
    // 保存成人选项
    document.querySelectorAll('input[name="adult"]').forEach(checkbox => {
        if (checkbox.value === 'other') {
            selections.adultOther = checkbox.parentElement.querySelector('.other-input').value;
        }
        selections.adult[checkbox.value] = checkbox.checked;
    });
    
    // 保存儿童选项
    document.querySelectorAll('input[name="child"]').forEach(checkbox => {
        if (checkbox.value === 'other') {
            selections.childOther = checkbox.parentElement.querySelector('.other-input').value;
        }
        selections.child[checkbox.value] = checkbox.checked;
    });

    // 保存到 localStorage
    localStorage.setItem(`${prefix}${questionNumber}`, JSON.stringify(selections));
}

// 恢复选择状态的函数
function restoreSelections() {
    const questionNumber = window.location.pathname.split('/').pop().match(/\d+/)[0];
    const currentPath = window.location.pathname;
    const isPart2 = currentPath.includes('/part2/');
    const prefix = isPart2 ? 'part2_quiz' : 'quiz';
    
    const savedData = localStorage.getItem(`${prefix}${questionNumber}`);
    
    if (savedData) {
        const selections = JSON.parse(savedData);
        
        // 恢复成人选项
        document.querySelectorAll('input[name="adult"]').forEach(checkbox => {
            checkbox.checked = selections.adult[checkbox.value] || false;
            if (checkbox.value === 'other' && checkbox.checked) {
                checkbox.parentElement.classList.add('other-selected');
                checkbox.parentElement.querySelector('.other-input').value = selections.adultOther;
            }
        });
        
        // 恢复儿童选项
        document.querySelectorAll('input[name="child"]').forEach(checkbox => {
            checkbox.checked = selections.child[checkbox.value] || false;
            if (checkbox.value === 'other' && checkbox.checked) {
                checkbox.parentElement.classList.add('other-selected');
                checkbox.parentElement.querySelector('.other-input').value = selections.childOther;
            }
        });
    }
}

// 处理导航按钮的函数
function setupNavigation() {
    console.log('Setting up navigation...');
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);

    // 为所有按钮添加事件监听器
    document.querySelectorAll('.nav-button').forEach(button => {
        console.log('Found button:', button.textContent);
        // 移除现有的事件监听器（如果有的话）
        button.removeEventListener('click', handleNavigation);
        // 添加新的事件监听器
        button.addEventListener('click', handleNavigation);
    });
}

// 处理导航点击
function handleNavigation(event) {
    event.preventDefault(); // 阻止默认行为
    const button = event.target;
    const currentPath = window.location.pathname;
    console.log('Button clicked:', button.textContent);

    // 处理 intro 页面
    if (currentPath.includes('/intro.html')) {
        if (button.classList.contains('next-button')) {
            window.location.href = 'quiz1.html';
        } else if (button.classList.contains('back-button')) {
            window.location.href = '/';
        }
        return;
    }

    // 处理 quiz 页面
    if (currentPath.includes('/quiz')) {
        // 在导航前保存当前选择
        saveSelections();

        const currentPage = parseInt(currentPath.match(/quiz(\d+)/)[1]);
        const isPart1 = currentPath.includes('/part1/');
        const isPart2 = currentPath.includes('/part2/');
        const totalPages = 9;

        if (button.classList.contains('next-button')) {
            if (currentPage === totalPages) {
                // 最后一页的处理
                if (isPart1) {
                    window.location.href = '/part2/intro.html';  // 使用绝对路径
                } else if (isPart2) {
                    window.location.href = '/result.html';
                }
            } else {
                // 普通页面跳转到下一页
                location.href = `quiz${currentPage + 1}.html`;
            }
        } else if (button.classList.contains('back-button')) {
            if (currentPage === 1) {
                // 第一页的处理
                if (isPart1) {
                    location.href = 'intro.html';
                } else if (isPart2) {
                    location.href = '/part1/quiz9.html';  // 使用绝对路径
                }
            } else {
                // 普通页面跳转到上一页
                location.href = `quiz${currentPage - 1}.html`;
            }
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // 恢复之前的选择
    if (window.location.pathname.includes('/quiz')) {
        restoreSelections();
    }

    // 为所有复选框添加事件监听器
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', saveSelections);
    });

    // 为 other input 添加事件监听器
    document.querySelectorAll('.other-input').forEach(input => {
        input.addEventListener('input', saveSelections);
    });

    // 设置导航按钮
    setupNavigation();
}); 