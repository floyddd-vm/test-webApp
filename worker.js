const TaskService = require('./task.service').TaskService;

class Worker {

    constructor(db, id) {
        console.info(`Worker process started`);
        this.db = db;
        this.id = id;
        this.service = new TaskService();
        this.handlers = {
            'task1' :  this.service.task1.bind(this),
            'task2' :  this.service.task2.bind(this),
            'task3' :  this.service.task3.bind(this),
            'task4' :  this.service.task4.bind(this),
            'task5' :  this.service.task5.bind(this),
            'task6' :  this.service.task6.bind(this),
            'task7' :  this.service.task7.bind(this),
            'task8' :  this.service.task8.bind(this),
            'task9' :  this.service.task9.bind(this),
            'task10' : this.service.task10.bind(this)
        };

        this.workerInt = setTimeout(async () => { await this.work(); }, 2000);
        this.pingPong = setTimeout(async () => { await this.ping(); }, 100);
        this.checLife = setTimeout(async () => { await this.life(); }, 200);
    }

    async ping(){
        let now = Math.floor(new Date().getTime() / 1000);
        await this.db.set_worker(this.id, now);
        setTimeout(async () => { await this.ping(); }, 10000);
    }

    //if user not ping 30 sec, clear his works list
    async life(){
        let now = Math.floor(new Date().getTime() / 1000);
        await this.db.clear_works(now-30);
        setTimeout(async () => { await this.life(); }, 30000);
    }

    async work(){
        try{
            let works = await this.db.get_works();
            let workers = await this.db.get_active_workers();
            //check limit (balancer) - 
            let id = this.id;
            if(works.rowCount / workers.rowCount > works.rows.filter(item => item.worker == id).length){
                works = works.rows.filter(item => item.worker == null);
                if(works.length > 0) {
                    let index = Math.floor(Math.random() * works.length);   
                    console.log(index)                           
                    //try run rundom task
                    let work = works[index];
                    let startTime = Math.floor(new Date().getTime() / 1000);                    
                    if(this.handlers.hasOwnProperty(work.task)){
                        let set = await this.db.set_work(work.task, this.id, startTime);
                        if(set.rowCount === 1)
                            this.runTask(work.task, this.handlers[work.task], startTime);
                    }
                }
            }
        }
        catch (e) {
            console.error(e);
        }
        setTimeout(async () => { await this.work(); }, 2000);
    }

    //runer
    async runTask(key, handler, startTime){
        let result = await handler();
        let endTime = Math.floor(new Date().getTime() / 1000);   
        //set log and status
        await this.db.add_log(this.id, key, startTime, endTime);
        await this.db.set_work(key, null, null);
    }
}

module.exports.Worker = Worker;