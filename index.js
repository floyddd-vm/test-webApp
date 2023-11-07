var express = require('express');
var {Pool} = require('pg');

var app = express();
app.use(express.json())   

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root',
    port: 5432,
  });
   

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

async function transaction(query, data){
    let res;
    const client = await pool.connect();
    try {
        await client.query('BEGIN')
        res = await client.query(query, data)
        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    } finally {
        client.release()
    }
    return res;
}

// POST method route
app.post('/upd_balance', async (req, res, next) => {
    try{
        console.log(`[${req.body.id}] upd_balance id = ${req.body.userId}, amount = ${req.body.amount}`)
        const queryText = 'UPDATE users SET balance = balance - $1 WHERE user_id = $2 AND balance >= $1 RETURNING balance';
        result = await transaction(queryText, [req.body.amount, req.body.userId])
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


app.listen(8081, async () => {
    console.log('WebApp running on port 8081!');
    const crateTable = `CREATE TABLE IF NOT EXISTS users (
        user_id serial PRIMARY KEY,
        balance numeric default 10000
     );`
    const queryText = 'INSERT INTO users(balance) VALUES($1) RETURNING user_id';
    await transaction(crateTable, [])
    let res = await transaction(queryText, [10000])
    console.log(`Add new user, id = ${res.rows[0].user_id}`);
});