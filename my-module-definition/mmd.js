// 1.管理多个模块的容器
class Module {
    constructor() {
        this.moduleMap = new Map()
    }

    /**
     * @description: 2.定义模块
     * @param {string} name
     * @param {Array} dep 
     * @param {fucntion} callback 
     */
    define(name, dep, callback) {
        // 3.如果模块存在对其他模块的依赖
        if (dep.length) {
            dep.forEach((item,i) => {
                dep[i] = this.moduleMap.get(item) ? this.moduleMap.get(item) : null
            })
        }
        // map的键是模块名，值时模块导出的对象
        // define时模块已经执行callback
        if (!this.moduleMap.has(name)) {
            this.moduleMap.set(name, callback.apply(null, dep))
        }
    }
}

// 单例模式
(() => {
    let MMD
    if (!MMD) {
        MMD = new Module()
        // 暴露MMD供模块定义使用
        window.MMD = MMD
    } else return
})()