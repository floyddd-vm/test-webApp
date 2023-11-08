var {Pool} = require('pg');

class DB{

    constructor(config){
        this.pool = new Pool(config);
        this.pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err)
            process.exit(-1)
        })
    }

    async transaction(query, data){
        let res;
        const connection = await this.pool.connect();
        try {
            await connection.query('BEGIN')
            res = await connection.query(query, data)
            await connection.query('COMMIT')
        } catch (e) {
            await connection.query('ROLLBACK')
            throw e
        } finally {
            connection.release()
        }
        return res;
    };

    async request(query, data){
		let connection = await this.pool.connect();
		try {
			return await connection.query(query, data);
		} catch (err) {
			console.error(`Database error: ${err}`);
		} finally {
			await connection.release();
		}
	};

    async init_db(){
        const crateTables = `CREATE TABLE IF NOT EXISTS users (
                                user_id serial PRIMARY KEY,
                                balance numeric default 10000
                            );
                            
                            CREATE TABLE IF NOT EXISTS public.logs
                            (
                                logsid serial PRIMARY KEY,
                                worker varchar(50),
                                task varchar(20) Not null,
                                starttime int Not null,  
                                endtime int Not null
                            );

                            CREATE TABLE IF NOT EXISTS public.works
                            (
                                task varchar(20) PRIMARY KEY,
                                worker varchar(50),
                                starttime int
                            );
                            
                            
                            CREATE TABLE IF NOT EXISTS public.workers
                            (
                                workerid varchar (50) PRIMARY KEY,
	                            lasttime int Not null
                            );`
        const insertTasks = `INSERT INTO works(task) VALUES('task1'),('task2'),('task3'),('task4'),('task5'),('task6'),('task7'),('task8'),('task9'),('task10') ON CONFLICT (task) DO NOTHING;`
        await this.transaction(crateTables + insertTasks);
    }

    async set_worker(id, timestamp){
        return await this.transaction(`INSERT INTO workers VALUES($1, $2) ON CONFLICT (workerid) DO UPDATE SET lasttime = $2`, [id, timestamp]);
    }

    async get_active_workers(){
        return await this.request(`SELECT * FROM workers WHERE lasttime > $1`,[Math.floor(new Date().getTime() / 1000) - 20]);
    }

    async clear_works(limittime){
        return await this.transaction(`UPDATE works
                                    SET 
                                        worker=null
                                    FROM (SELECT workerid
                                        FROM  workers WHERE lasttime < $1) AS subquery
                                    WHERE works.worker=subquery.workerid;`, [limittime]);
    }

    async get_works(){
        return await this.request(`SELECT * FROM works`);
    }

    async set_work(task, worker, startTime){
        console.log({task})
        console.log({worker})
        console.log({startTime})
        return await this.transaction(`UPDATE works SET worker = $1, starttime = $2 WHERE task = $3;`,[worker, startTime, task]);
    }

    async add_log(worker_id, task, startTime, endTime){
        return await this.request(`INSERT INTO logs(worker, task, starttime, endtime) VALUES($1, $2, $3, $4);`,[worker_id, task, startTime, endTime]);
    }
}

module.exports.DB = DB;