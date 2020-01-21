// 作业调度-短作业优先
window.onload = function () {
    // 后备队列
    let backupQuery = []
    // 时间量
    let timeStamp = 0
    // 就绪队列
    let readyList = []
    // 系统内存大小,磁带机
    let memo = 100,
        disk = 5
    // 获取dom
    let aHandle = document.getElementById('a'),
        bHandle = document.getElementById('b'),
        cHandle = document.getElementById('c'),
        dispatchButton = document.getElementById('dispatch-button'),
        cpuButton = document.getElementById('cpu-button'),
        addHandle = document.getElementById('add-job')


    // 工厂模式-作业
    let Job = function (jcb) {
        this.jcb = jcb // Job的实例获得jcb属性
        console.log('生成作业: JCB', this.jcb)
    }
    // 作业的进入就绪队列状态
    Job.prototype.dispatch = function () {
        this.jcb.state = 'R' // this已经指向调用者-Job的实例
        this.jcb.startTime = timeStamp // 开始时间

        // 占用资源
        memo -= this.jcb.needMemo
        disk -= this.jcb.needDisk

        let name = this.jcb.jobName
        timeStamp += this.jcb.needTime /* 更新时间 */
        this.jcb.finishTime = timeStamp /* 结束时间 */
        this.jcb.waitTime = this.jcb.startTime - this.jcb.commitTime /* 周转时间 */
    }

    // 作业a,b的jcb
    let A_JCB = {
        userName: 'A',
        jobName: 'JOB1',
        // commitTime: timeStamp,// 提交时间
        needTime: Math.ceil(Math.random() * 10),
        needMemo: 120,// 所需的内存资源
        needDisk: 4,// 所需的磁带资源
        state: 'W'
    }
    let B_JCB = {
        userName: 'B',
        jobName: 'JOB2',
        // commitTime: timeStamp,
        needTime: Math.ceil(Math.random() * 10),
        needMemo: 60,
        needDisk: 3,
        state: 'W'
    }
    let C_JCB = {
        userName: 'C',
        jobName: 'JOB3',
        // commitTime: timeStamp,
        needTime: Math.ceil(Math.random() * 10),
        needMemo: 40,
        needDisk: 2,
        state: 'W'
    }

    // 添加作业
    addHandle.onclick = function () {
        let newJobUser = document.getElementById('job-user').value,
            newJobName = document.getElementById('job-name').value,
            newNeedTime = document.getElementById('job-nTime').value,
            newNeedMemo = document.getElementById('job-nMemo').value,
            newNeedDisk = document.getElementById('job-nDisk').value,
            newJcb = {
                userName: newJobUser,
                jobName: newJobName,
                commitTime: timeStamp,
                needTime: Number(newNeedTime),
                needMemo: Number(newNeedMemo),
                needDisk: Number(newNeedDisk),
                state: 'W'
            }
        if (!newJobName || !newNeedTime || !newJobUser || !newNeedMemo || !newNeedDisk) {
            alert('不能为空')
            return
        }
        let newJob = new Job(newJcb)
        backupQuery.push(newJob)
        console.log(`作业 ${newJcb.jobName} 进入后备队列`)
        console.log('*******************输入井后备队列*********************')
        console.table(printReadyQuery(backupQuery))
    }

    // 生成作业a,b,c
    let a, b, c
    aHandle.onclick = function () {
        if (!a) {
            A_JCB.commitTime = timeStamp /* 赋予系统时间量 */
            a = new Job(A_JCB)
            backupQuery.push(a)
            console.log('作业 A 进入后备队列')
        } else console.log('A已经进入后备队列', backupQuery)
        console.log('*******************输入井后备队列*********************')
        console.table(printReadyQuery(backupQuery))
    }
    bHandle.onclick = function () {
        if (!b) {
            B_JCB.commitTime = timeStamp /* 赋予系统时间量 */
            b = new Job(B_JCB)
            backupQuery.push(b)
            console.log('作业 B 进入后备队列')
        } else console.log('B已经进入后备队列', backupQuery)
        console.log('*******************输入井后备队列*********************')
        console.table(printReadyQuery(backupQuery))
    }
    cHandle.onclick = function () {
        if (!c) {
            C_JCB.commitTime = timeStamp /* 赋予系统时间量 */
            c = new Job(C_JCB)
            backupQuery.push(c)
            console.log('作业 C 进入后备队列')
        } else console.log('C已经进入后备队列', backupQuery)
        console.log('*******************输入井后备队列*********************')
        console.table(printReadyQuery(backupQuery))
    }

    // 打印后备队列
    let printReadyQuery = (list) => {
        let obj = [] // 表格对象
        list.map((item) => {
            let _jcb = JSON.parse(JSON.stringify(item.jcb)) // 深拷贝
            _jcb.needMemo = item.jcb.needMemo + 'K'
            _jcb.needDisk = item.jcb.needDisk + '台'
            obj.push(_jcb)
        })
        return obj
    }
    // 按进程名打印就绪队列
    let printReadyList = () => {
        let str = ''
        readyList.map((item) => {
            str = str + ',' + item.jcb.jobName
        })
        return str.substr(1)
    }

    // 获取最短的符合资源的作业
    let getShortestJob = (list) => {
        let i,
            minJcb = {needTime: Infinity}, /* 初始化 */
            curJcb = list[0].jcb
        for (i = 0; i < list.length; i++) { /* 取最短作业 */
            curJcb = list[i].jcb
            if (minJcb.needTime > curJcb.needTime && curJcb.needMemo <= memo && curJcb.needDisk <= disk) {
                minJcb = curJcb
            }
        }
        return minJcb.needTime===Infinity ? false : {
            minJcb,
            index: --i
        }
    }

    /*
    * 执行者，决定调度算法
    * 根据后备队列执行job的dispatch
    */
    let dispatchCmdSender = () => {
        if (!backupQuery[0]) {
            console.log(`后备队列为空`)
            return
        }

        /* 调度算法-SJF
        选中first-in */
        console.log(`系统现有资源：内存 ${memo} ; 磁盘 ${disk}`)
        console.log('*********************调度**********************')

        let minJob = getShortestJob(backupQuery) // 获取最短的符合资源的作业
        if(!minJob){
            console.log('系统资源不足以调用后备队列的任一作业')
            return
        }
        let i = minJob.index
        console.log(`${minJob.minJcb.jobName} 是最短作业且满足现有资源，进入就绪队列 ......`)
        backupQuery[i].dispatch() // 调度作业的就绪态
        readyList.push(...backupQuery.splice(i, 1)) /* 取出队首作业加入就绪队列 */
        console.log(`就绪队列：[${printReadyList()}]`)
        return
    }

    // “手动”一个个地调度作业
    dispatchButton.onclick = function () {
        dispatchCmdSender()
    }

    // 随机模拟进程调度
    cpuButton.onclick = function () {
        if (!readyList[0]) {
            console.log(`就绪队列为空`)
            return
        }
        let curProcess = readyList[0]
        curProcess.jcb.state = 'F'
        // 返回占用资源
        memo += curProcess.jcb.needMemo
        disk += curProcess.jcb.needDisk
        console.log(`${curProcess.jcb.jobName} 正在运行.......................................................`)
        setTimeout(() => {
            console.log(`用户 ${curProcess.jcb.userName} 的 ${curProcess.jcb.jobName} 已运行完成！`)
            console.table([curProcess.jcb])
        }, 1000)
        // 进程调度-FCFS
        readyList.shift() // 取出队首进程
    }
}