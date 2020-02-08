// 使用weakMap解决对象成环问题
// 设置一个哈希表存储已拷贝过的对象
const deepClone = (obj, hash = new WeakMap()) => {
  // 判断是否数组或对象
  if (!isObject(obj)) {
    console.log('Could only deep-clone object or array')
    return false
  }

  // 已克隆，则直接返回已克隆的引用
  if (hash.has(obj)) return hash.get(obj)

  let res = Array.isArray(obj) ? [] : {}

  // 拷贝过就建立映射关系：对象--对应clone对象
  // deepClone克隆完时res指向的堆内存已经完成克隆，所以console.log调obj的get()时res引用的对象是深拷贝的obj
  hash.set(obj, res)

  // for-in法遍历第一层
  for (let key in obj) {
    // 若属性值为对象，递归遍历
    // 递归的传参技巧：达到存储的目的，每次调用的hash都是在下层deepClone执行栈的hash的基础上更新了的WeakMap
    res[key] = isObject(obj[key]) ? deepClone(obj[key], hash) : obj[key]
  }

  return res

}

const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]' || Array.isArray(obj)
}

// 测试数组
let a = [0, 1, [2, 3], 4],
  b = deepClone(a)
a[0] = 1
a[2][0] = 1
console.log(a, b)

// 测试对象
var aa = {
  id: 1,
  name: 2,
  c: {
    age: 3
  }
},
  bb = deepClone(aa)
aa['id'] = 100
aa['c']['age'] = 300
console.log(aa, bb)

// 测试成环对象
var aaa = {
  id: 1,
  name: 2,
  c: {
    age: 3
  }
}
// 致使栈溢出
aaa.loop = aaa
aaa.haha = 'haha'
var bbb = deepClone(aaa)
aaa['id'] = 100
aaa['c']['age'] = 300
console.log(aaa, bbb)

// 异常测试
deepClone(1)
console.log()