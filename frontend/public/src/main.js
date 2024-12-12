// 测试 API 连接
fetch('http://localhost:3000/api/test')
  .then(response => response.json())
  .then(data => {
    console.log('API 测试响应:', data);
  })
  .catch(error => {
    console.error('API 测试错误:', error);
  });

console.log('前端应用已启动'); 