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
let arr = [0, 1, [2, 3], 4],
  arrClone = deepClone(arr)
arr[0] = 1
arr[2][0] = 1
console.log(arr, arrClone)

// 测试对象
let obj = {
  id: 1,
  name: 2,
  c: {
    age: 3
  }
},
  objClone = deepClone(obj)
obj.id = 100
obj.c.age = 300
console.log(obj, objClone)

// 测试成环对象
let cir = {
  id: 1,
  name: 2,
  c: {
    age: 3
  }
}
cir.loop = cir
let cirClone = deepClone(cir)
cir.id = 1000
cir.c.age = 3000
console.log(cir, cirClone)

// 异常测试
console.log(deepClone(1))
