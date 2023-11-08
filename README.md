# test-webApp

# get started
    1 create DB (Postgresql)
    2 set connection info to index.js (hardcode..)

# run 
    in cluster mode
        `pm2 start index.js --name App -i 5`

# use 

    - get info for workers now - `/works` 

    - change balance, send POST request `/upd_balance` with params `userId`, and `amount` by which to reduce the balance