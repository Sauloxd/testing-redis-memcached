const express = require('express');
const path = require('path');
const axios = require('axios');
const { chargeRequestRedis, resetRedis, chargeRequestRedisSingleCommand } = require('./engines/redis')
const { chargeRequestMemcached, resetMemcached } = require('./engines/memcached')
const app = express();
app.use(express.json());

// fetch("http://localhost:3000/redis/charge_request", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
//     "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "Content-Type": "application/json"
//   },
//   "referrer": "http://localhost:3000/redis/charge_request_single",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": JSON.stringify({
//       "serviceType": "voice",
//       "unit": 2
//     }),
//   "method": "POST",
//   "mode": "cors",
//   "credentials": "omit"
// });

app.post('/redis/charge_request', async (req, res, next) => {
  try {
    console.log(req.body)
    res.json(await chargeRequestRedis(req.body));
  } catch (err) {
    next(err);
  }
});
app.get('/redis/reset', async (req, res, next) => {
  try {
    res.json(await resetRedis(req.body));
  } catch (err) {
    next(err);
  }
});

app.get('/redis/charge_request_single', async (req, res, next) => {
  try {
    res.json(await chargeRequestRedisSingleCommand(req.body));
  } catch (err) {
    next(err);
  }
});

app.post('/memcached/charge_request', async (req, res, next) => {
  try {
    res.json(await chargeRequestMemcached(req.body));
  } catch (err) {
    next(err);
  }
});

app.get('/memcached/reset', async (req, res, next) => {
  try {
    console.log('memcached')
    res.json(await resetMemcached(req.body));
  } catch (err) {
    next(err);
  }
});

app.use(function (err, req, res, next) {
  console.error(err);
  res.set('Content-Type', 'text/html');
  res.status(500).send('<h1>Internal Server Error</h1>');
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening to port: ${server.address().port}`);
});


