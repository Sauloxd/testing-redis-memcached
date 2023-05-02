"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const util = require("util");
const KEY = `account1/balance`;
const DEFAULT_BALANCE = 100;

exports.chargeRequestRedis = async function (input) {
    var hrstart = process.hrtime()
    const redisClient = await getRedisClient();
    var remainingBalance = await getBalanceRedis(redisClient, KEY);
    var charges = input.unit;
    const isAuthorized = authorizeRequest(remainingBalance, charges);
    if (!isAuthorized) {
        return {
            remainingBalance,
            isAuthorized,
            charges: 0,
        };
    }
    remainingBalance = await chargeRedis(redisClient, KEY, charges);
    await disconnectRedis(redisClient);
    const hrend = process.hrtime(hrstart)
    
    return {
        remainingBalance,
        charges,
        isAuthorized,
        time: hrend[1] / 1000000,
    };
};


exports.chargeRequestRedisSingleCommand = async function (input) {
    var hrstart = process.hrtime()
    const redisClient = await getRedisClient();
    const charges = input.unit
    const res = await getBalanceAndChargeRedis(redisClient, KEY, charges);
    await disconnectRedis(redisClient);

    const isAuthorized = res !== "error"
    if (res === "error") {
        return {
            remainingBalance: 1,
            isAuthorized,
            charges: 0,
        };
    }
    const hrend = process.hrtime(hrstart)
    
    return {
        remainingBalance: res,
        charges,
        isAuthorized,
        time: hrend[1] / 1000000,
    };
};

exports.resetRedis = async function () {
    const redisClient = await getRedisClient();
    const ret = new Promise((resolve, reject) => {
        redisClient.set(KEY, String(DEFAULT_BALANCE), (err, res) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(DEFAULT_BALANCE);
            }
        });
    });
    await disconnectRedis(redisClient);
    return ret;
};

async function getRedisClient() {
    return new Promise((resolve, reject) => {
        try {
            const client = new redis.RedisClient({
                host: process.env.ENDPOINT,
                port: parseInt(process.env.PORT || "6379"),
            });
            client.on("ready", () => {
                // console.log('redis client ready');
                resolve(client);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
async function disconnectRedis(client) {
    return new Promise((resolve, reject) => {
        client.quit((error, res) => {
            if (error) {
                reject(error);
            }
            else if (res == "OK") {
                // console.log('redis client disconnected');
                resolve(res);
            }
            else {
                reject("unknown error closing redis connection.");
            }
        });
    });
}
function authorizeRequest(remainingBalance, charges) {
    return remainingBalance >= charges;
}

async function getBalanceRedis(redisClient, key) {
    const res = await util.promisify(redisClient.get).bind(redisClient).call(redisClient, key);
    return parseInt(res || "0");
}
async function chargeRedis(redisClient, key, charges) {
    return util.promisify(redisClient.decrby).bind(redisClient).call(redisClient, key, charges);
}

// Since Redis is single threaded, this probably is not a good idea, since this can block the main thread and became a bottleneck for other Redis operations.
// Also, adding a "business rule" as a database verification can make the system more complex and harder to reason about.
// As 
async function getBalanceAndChargeRedis(redisClient, key, charges) {
    return new Promise((resolve, reject) => {
        redisClient.eval("if tonumber(redis.call('GET', KEYS[1])) >= tonumber(ARGV[1]) then return redis.call('DECRBY', KEYS[1], ARGV[1]) else return ARGV[2] end",
        1,
        key,
        charges,
        "error",
        (err, res) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
}