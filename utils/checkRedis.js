const redis = require("redis");

async function checkRedis() {
  const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_SERVER}:${process.env.REDIS_PORT}`,
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis successfully!");
  });

  redisClient.on("error", (err) => {
    console.error("Failed to connect to Redis:", err);
  });

  try {
    await redisClient.connect();
    return true;
  } catch (err) {
    console.error("Error connecting to Redis server:", err);
    return false;
  } finally {
    await redisClient.quit();
  }
}

module.exports = { checkRedis };
