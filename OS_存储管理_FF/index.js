// 存储管理-首次适应 first fit
window.onload = function () {
    // 后备队列
    let backupQuery = []
    // 系统内存大小
    let memo = 600
    // 获取dom
    let aHandle = document.getElementById('a'),
        bHandle = document.getElementById('b'),
        // cHandle = document.getElementById('c'),
        dispatchButton = document.getElementById('dispatch-button'),
        recycleButton = document.getElementById('recycle-button'),
        addHandle = document.getElementById('add-job')


    // 工厂模式-作业
    let Job = function (jcb) {
        this.jcb = jcb // Job的实例获得jcb属性
        console.log('提交作业: JCB', this.jcb)
    }
    // 作业的进入就绪队列状态
    Job.prototype.dispatch = function () {
        this.jcb.state = 'R' // this已经指向调用者-Job的实例
    }

    // 作业a,b的jcb
    let A_JCB = {
        jobName: '作业1',
        // Math.ceil(Math.random() * 10),
        needMemo: 130,// 所需的内存资源
        state: 'W'
    }

    let B_JCB = {
        jobName: '作业2',
        needMemo: 60,
        state: 'W'
    }

    // 添加作业
    addHandle.onclick = function () {
        let newJobNum = document.getElementById('job-num').value,
            newNeedMemo = document.getElementById('job-nMemo').value,
            newJcb = {
                jobName: `作业${newJobNum}`,
                needMemo: Number(newNeedMemo),
                state: 'W'
            }
        if (!newJobNum || !newNeedMemo) {
            alert('不能为空')
            return
        }
        let newJob = new Job(newJcb)
        backupQuery.push(newJob)
        console.log(`作业 ${newJcb.jobName} 进入后备队列`)
        console.log('*******************输入井后备队列*********************')
        console.table(printReadyQuery(backupQuery))
    }

    // 生成作业a页表
    let a, b
    aHandle.onclick = function () {
        if (!a) {
            a = new Job(A_JCB)
            backupQuery.push(a)
            console.log('作业 A 进入后备队列')
            console.log('*******************输入井后备队列*********************')
        } else console.log('A已经进入后备队列')
        console.table(printReadyQuery(backupQuery))
    }
    bHandle.onclick = function () {
        if (!b) {
            b = new Job(B_JCB)
            backupQuery.push(b)
            console.log('作业 B 进入后备队列')
            console.log('*******************输入井后备队列*********************')
        } else console.log('B已经进入后备队列')
        console.table(printReadyQuery(backupQuery))
    }

    // 打印后备队列
    let printReadyQuery = (list) => {
        let obj = [] // 表格对象
        list.map((item) => {
            let _jcb = item.jcb
            obj.push(_jcb)
        })
        return obj
    }

    // 空闲分区表初始化
    let i = 1,
        freeZoneMap = [
            {
                zoneSize: memo,
                initAddress: 0,
                status: '空闲'
            }
        ]

    /* 
    * 分配空闲分区表
    * 按首次适应算法分配内存
    */
    let allocFZMap = function (jcb) {
        // 从队首开始找
        const freeList = freeZoneMap.filter(item => item.status == '空闲')
        for (let i = 0; i < freeList.length; i++) {
            if (freeList[i].zoneSize >= jcb.needMemo) { /* 找到符合的分区 */

                console.log(`${jcb.jobName} 满足现有资源，分配内存分区......`)
                memo -= jcb.needMemo /* 系统资源更新 */

                popFreeZoneMap(freeList[i].initAddress) /* 弹出现在的空闲区，推入新的两个分区 */
                freeZoneMap.push({ /* 将碎片作为新的空闲分区 */
                    zoneSize: freeList[i].zoneSize - jcb.needMemo,
                    initAddress: freeList[i].initAddress + jcb.needMemo,
                    status: '空闲'
                })
                freeZoneMap.push({ /* 将碎片作为新的空闲分区 */
                    zoneSize: jcb.needMemo,
                    initAddress: freeList[i].initAddress,
                    status: '占用'
                })

                console.log('空闲分区表：')
                console.table(freeZoneMap.sort(compare))
                return
            }
        }
        console.log('哦豁，要调用虚拟内存了')
    }

    // 分区表的排序规则
    let compare = function (obj1, obj2) {
        var val1 = obj1.initAddress
        var val2 = obj2.initAddress
        if (val1 < val2) {
            return -1
        } else if (val1 > val2) {
            return 1
        } else {
            return 0
        }
    }

    // freeZoneMap元素pop出来
    let popFreeZoneMap = (address) => {
        for (let i = 0; i < freeZoneMap.length; i++) {
            if (freeZoneMap[i].initAddress == address) {
                freeZoneMap.splice(i, 1)
                return
            }
        }
    }

    /*
    * 回收空闲分区表
    */
    let recycleFZMap = function (reNum) {
        console.log('*********************回收作业************************')
        freeZoneMap[reNum].status = '空闲'

        /* 检查时新增任务
        连接空闲区的合并 */
        if(reNum-1>=0){ /* 上一个是空闲 */
            if(freeZoneMap[reNum-1].status=='空闲'){
                freeZoneMap.splice(reNum-1,1, { /* 连接碎片作为新的空闲分区 */
                    zoneSize: freeZoneMap[reNum].zoneSize + freeZoneMap[reNum-1].zoneSize,
                    initAddress: freeZoneMap[reNum-1].initAddress,
                    status: '空闲'
                })
                popFreeZoneMap(freeZoneMap[reNum].initAddress)
            }
        }
        if(reNum<=freeZoneMap.length-1){/* 下一个是空闲 */
            if(freeZoneMap[reNum+1].status=='空闲'){
                freeZoneMap.splice(reNum,1, { /* 连接碎片作为新的空闲分区 */
                    zoneSize: freeZoneMap[reNum].zoneSize + freeZoneMap[reNum+1].zoneSize,
                    initAddress: freeZoneMap[reNum].initAddress,
                    status: '空闲'
                })
                popFreeZoneMap(freeZoneMap[reNum+1].initAddress)
            }
        }

        console.log(`回收作业 ${reNum} 的分区成功`)
        console.log('空闲分区表：')
        console.table(freeZoneMap.sort(compare))

        memo += freeZoneMap[reNum].zoneSize /* 系统资源更新 */
        console.log(`系统现有资源：主存 ${memo} `)
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

        console.log('*********************调度作业进主存***********************')
        allocFZMap(backupQuery[0].jcb) /* 更新空闲分区表 */

        console.log(`系统现有资源：主存 ${memo} `)
        backupQuery[0].dispatch() /* 被调度作业的就绪态 */
        backupQuery.shift() /* 队首作业所有指令地址执行完 */
    }

    // “手动”一个个地调度作业
    dispatchButton.onclick = function () {
        dispatchCmdSender()
    }

    // 回收某个作业
    recycleButton.onclick = function () {
        let recycleNum = document.getElementById('recycle-number').value
        recycleFZMap(Number(recycleNum))
    }
}