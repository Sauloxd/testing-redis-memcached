const express = require('express');
const path = require('path');
const axios = require('axios');
const { chargeRequestRedis, resetRedis, chargeRequestRedisSingleCommand } = require('./engines/redis')
const { chargeRequestMemcached, resetMemcached } = require('./engines/memcached')
const app = express();
app.use(express.json());

app.post('/redis/charge_request', async (req, res, next) => {
  try {
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

app.post('/redis/charge_request_single', async (req, res, next) => {
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


