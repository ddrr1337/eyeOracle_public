const Bull = require("bull");

const requestQueue = new Bull("requestQueue", {
  redis: {
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
  },
});

module.exports = { requestQueue };
