'use strict';

const { redis: redisConf } = require('../config/index');
const { RedisClient } = require('redis');

const TIMEOUT_ON_START = 15000;
const MAX_RETRY_TIME = 5000;

const opts = {
    retry_strategy: options => {
        const { attempt } = options;
        // only print log when attempt like 1, 2, ...9, 10, 20, ...90, 100, 200, 3000...
        // prettier-ignore
        if (attempt.toString().slice(1).replace(/0/g, '') === '') {
            console.warn(`redis client reconnecting attempt ${attempt}`);
        }
        return Math.min(options.attempt * 100, MAX_RETRY_TIME);
    }
};

const client = new RedisClient(Object.assign(opts, redisConf));

let _started;
let timeout = setTimeout(() => {
    if (!_started) {
        _started = -1;
        timeout = null;
        throw new Error('failed connect to redis server!');
    }
}, TIMEOUT_ON_START);

client.on('error', e => {
    console.error(e);
});

/* invoke callback when redis is ready */
client.on('ready', () => {
    /* callback will only be invoked once */
    if (!_started) {
        _started = 1;
        clearTimeout(timeout);
        timeout = null;
        console.info('redis client connected');
    }
});

client.on('end', () => {
    console.info('redis client ended');
});

export default client;
