// ajax请求：借助xhr对象，onreadystatechange、readyState、status、
// let request = new XMLHttpRequest()
var request = new XMLHttpRequest()
request.onreadystatechange = () => {
  request.readyState === 4 && request.status === 200 && success(request.responseText)
}

// baidu.com 或者 http://baidu.com 都会跨域
request.open('GET', 'https://www.baidu.com')
request.setRequestHeader('Content-Type', 'application/json')
request.send()

// 请求成功, 处理响应值
const success = (res) => {
  console.log(res)
}
