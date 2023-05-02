# Benchmarking Memcached vs Redis

This is a simple web server just to play with Redis and Memcached.
The idea is to play with concurrenncy and load of requests, and test some features of both.

## Dependencies

1. `npm install`
2. [Redis](https://redis.io/docs/getting-started/installation/install-redis-on-mac-os/)
3. [Memcached](https://memcached.org/

## How to run
Run express server:

``` bash
node server.js
```

## How to develop

Since we have a Lambda with hardware connected to it in AWS, develop everything inside `engines/` ans just expose functions to express server so you are able to test it locally.
After developing, copy/paste to lambda
