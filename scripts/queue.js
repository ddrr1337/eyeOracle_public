const Bull = require("bull");

const requestQueue = new Bull("requestQueue", {
  redis: {
    host: "138.201.253.154",
    port: 6379,
  },
});

module.exports = { requestQueue };
