const request = require('request');

function Request(options){
  return new Promise(function(resolve, reject){
      request(options, (err, res, body) => {
          if (err) {
              return reject(new Error('Request error : ' + err));
          }
          if(!body)
              return resolve(null);
          if(options.method === 'GET')
              try {
                  body = JSON.parse(body);
              }
              catch (err) {
              console.error(`body is not JSON: ${body}`);
                  return reject(new Error('Request parse error : ' + err));
              }
          return resolve(body);
      });
  });
}



describe('web App', function () {
  it('one update balance', async function(){
      let data = {
        userId:3,
        amount:2
      };

      let options = {
        method:  'POST',
        url: "http://localhost:8081/upd_balance",
        body: data,
        json: true
      };
      let result = await Request(options);

      console.log(result);
  });

  it('10k txs for update balance', async function(){
    for(let i = 0; i<10000; i++){
      let data = {
        id: i,
        userId:3,
        amount:2
      };

      let options = {
        method:  'POST',
        url: "http://localhost:8081/upd_balance",
        body: data,
        json: true
      };
      Request(options);
    }
});
});