const redis = require("redis");

async function main() {
  const redisClient = redis.createClient({
    url: "redis://138.201.253.154:6379",
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis successfully!");
  });

  redisClient.on("error", (err) => {
    console.error("Failed to connect to Redis:", err);
  });

  try {
    await redisClient.connect();
    console.log("Redis server is running.");
  } catch (err) {
    console.error("Error connecting to Redis server:", err);
  } finally {
    await redisClient.quit();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
