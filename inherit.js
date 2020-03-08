/**
 * 子类.prototype 不能指向 父类.prototype, 会覆盖
 * 应该
 *  1.子类.prototype --> 父的 instance 
 *  2.子类 call 父 constructor
 * 目的: 复用, 
 */

function Animal(name) {
  //属性
  this.aName = name
  //实例方法
  this.sayName = function () {
    console.log(this.aName)
  }
}
// 原型方法
Animal.prototype.eat = function (food) {
  console.log('\t\t\t\t\t\t正在吃：' + food);
}

// *********************************************************************************
// 原型链继承
function CatProtoChain() {

}
CatProtoChain.prototype = new Animal()
CatProtoChain.prototype.aName = '原型链: 无法多继承&传参'

const catpc = new CatProtoChain()
catpc.sayName()
catpc.eat('原型链')


// *********************************************************************************
// 实例继承
function CatIns(name = '') {
  const cat = new Animal(name)
  cat.aName = name
  return cat
}
const catIns = new CatIns('实例: 不能多继承')
catIns.sayName()
catIns.eat('实例')

// *********************************************************************************
// 构造函数继承
function CatConstruct(name) {
  Animal.call(this)
  this.aName = name
}
const catcon = new CatConstruct('构造函数: 方法只是副本, 无法复用父类方法(cat instanceof Animal 为 false)')
catcon.sayName()
try { catcon.eat('haha') } catch (e) { console.log('\t\t\t\t\t\t构造函数不能吃!') }


// *********************************************************************************
// 组合继承
function CatCombine(name) {
  Animal.call(this, name)
}
CatCombine.prototype = new Animal()
// 为了不破坏原型链, 加 constructor
Object.defineProperty(CatCombine.prototype, 'constructor', {
  value: CatCombine,
  enumerable: false
})

const catcomb = new CatCombine('组合继承: 两份实例')
catcomb.sayName()
catcomb.eat('组合')


// *********************************************************************************
// 寄生组合继承create版
function CatParasitism(name) {
  const cat = Object.create(Animal.prototype)
  Animal.call(cat, name)
  return cat
}
/* 另一写法: 原型=Object.create
function CatParasitism(name) {
  Animal.call(this, name)
}
CatParasitism.prototype = Object.create(Animal.prototype, {
  constructor: { value: CatParasitism, writable: true, configurable: true }
});
*/
const catpara = new CatParasitism('寄生组合继承create版: 完美')
catpara.sayName()
catpara.eat('寄生组合create版')


// 寄生组合继承super版
function CatParasitism1(name) {
  // 若return实例, 确保实例的__proto__指向正确 ({}默认Object.prototype)
  Animal.call(this, name)
}
(() => {
  // 借助空类
  function Empty() { }
  Empty.prototype = Animal.prototype
  CatParasitism1.prototype = new Empty()
})()
// 别忘了constructor
Object.defineProperty(CatParasitism1.prototype, 'constructor', {
  value: CatParasitism1,
  enumerable: false
})

const catpara1 = new CatParasitism1('寄生组合继承super版: 完美')
catpara1.sayName()
catpara1.eat('寄生组合super版')