// 简单轮转法
window.onload = function () {
    // 就绪队列
    let readyList = []
    // 时间片大小
    let timeSplice = 1
    // 获取dom
    let aHandle = document.getElementById('a'),
        bHandle = document.getElementById('b'),
        cpu = document.getElementById('exec'),
        addHandle = document.getElementById('add-process')

    // 工厂模式-进程
    let Process = function (pcb) {
        this.pcb = pcb // Process的实例获得pcb属性
        console.log('生成进程: PCB', this.pcb)
    }
    // 进程的执行状态
    Process.prototype.exec = function () {
        let name = this.pcb.pName
        this.pcb.state = 'R' // 原型链找到exec前，this已经指向Process的实例
        console.log('*********************开始调度**********************')
        console.log(`${name} 正在运行......`)
        // this.pcb.priNum-=1
        this.pcb.runTime += timeSplice
        if (this.pcb.needTime == this.pcb.runTime) {
            this.pcb.state = 'F'
            console.log(`${name} 运行结束！`)
            return true
        }
        this.pcb.state = 'W'
        console.log(`${name} 一个时间片用完辽，进入等待状态.`)
        return false
    }

    // 进程a,b的pcb
    let A_PCB = {
        pName: 'A',
        // priNum: Math.ceil(Math.random()*10),
        needTime: Math.ceil(Math.random() * 10),
        runTime: 0,
        state: 'W'
    }
    let B_PCB = {
        pName: 'B',
        // priNum: Math.ceil(Math.random()*10),
        needTime: Math.ceil(Math.random() * 10),
        runTime: 0,
        state: 'W'
    }

    // 添加进程
    addHandle.onclick = function () {
        let newProName = document.getElementById('process-name').value,
            newNeedTime = document.getElementById('process-nTime').value,
            newPcb = {
                pName: newProName,
                needTime: Number(newNeedTime),
                runTime: 0,
                state: 'W'
            }
        if (!newProName || !newNeedTime) {
            alert('不能为空')
            return
        }
        let newProcess = new Process(newPcb)
        readyList.push(newProcess)
        console.log(`进程 ${newPcb.pName} 进入就绪队列`)
    }

    // 生成进程a,b
    let a, b
    aHandle.onclick = function () {
        if (!a) {
            a = new Process(A_PCB)
            readyList.push(a)
            console.log('进程 A 进入就绪队列')
        } else console.log('A已经进入就绪队列', readyList)
    }
    bHandle.onclick = function () {
        if (!b) {
            b = new Process(B_PCB)
            readyList.push(b)
            console.log('进程 B 进入就绪队列')
        } else console.log('B已经进入就绪队列', readyList)
    }

    // 打印就绪队列
    let printReadyList = () => {
        // let str = ''
        // readyList.map((item) => {
        //     str = str + ',' + item.pcb.pName
        // })
        // return str.substr(1)
        let listTable = [] // 表格
        readyList.map((item) => {
            listTable.push(item.pcb)
        })
        return listTable
    }

    /*
    * 执行者-cpu，决定调度算法
    * 根据就绪队列执行process的exec
    */
    let cmdSender = () => {
        if (!readyList[0]) {
            console.log(`就绪队列为空`)
            return
        }
        // 调度算法-FCFS
        let isFinished = readyList[0].exec()
        let curProcess = readyList.shift() // 取出队首进程
        if(!isFinished) { //进程还未结束，去队尾
            readyList.push(curProcess)
        }
        console.log('*******************调度后就绪队列*********************')
        console.table(printReadyList())
    }

    // “手动”启动cpu（模拟一个时间片）
    cpu.onclick = function () {
        cmdSender()
    }

    // 打印就绪队列
    let printList = document.getElementById('print-list')
    printList.onclick = function () {
        if (!readyList[0]) {
            console.log(`就绪队列为空`)
            return
        }
        console.log('*******************就绪队列*********************')
        console.table(printReadyList())
    }
}