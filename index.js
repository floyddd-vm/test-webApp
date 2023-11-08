const express = require('express');
const DB = require("./db").DB;
const Worker = require("./worker").Worker;
const {Pool} = require('pg');
const process = require('process'); 


var app = express();
app.use(express.json())   

const db = new DB({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root',
    port: 5432,
  });

const worker = new Worker(db, process.pid);

// POST method route
app.post('/upd_balance', async (req, res, next) => {
    try{
        console.log(`[${req.body.id}] upd_balance id = ${req.body.userId}, amount = ${req.body.amount}`)
        const queryText = 'UPDATE users SET balance = balance - $1 WHERE user_id = $2 AND balance >= $1 RETURNING balance';
        result = await db.transaction(queryText, [req.body.amount, req.body.userId])
        if(result.rowCount > 0){
            console.log(`user balance updated. new balance = ${result.rows[0].balance}`)
            res.send(`user balance updated. new balance = ${result.rows[0].balance}`)
        }else{
            res.send(`balance too low.`)
            console.log("balance too low.")
        }
    }catch(e){
        console.log(e);
        next(e.message);
    }
})

app.get(`/works`, async (req, res) =>{
    let works = await db.get_works();
    res.send(JSON.stringify(works.rows));
})

app.listen(8081, async () => {
    console.log(`WebApp running on port 8081! process id:${process.pid}`);
    await db.init_db();
    const queryText = 'INSERT INTO users(balance) VALUES($1) RETURNING user_id';
    let res = await db.transaction(queryText, [10000])
    console.log(`Add new user, id = ${res.rows[0].user_id}`);
});