// const Redis = require('ioredis');
// require('dotenv').config();

// const createRedisClient = () => {
//   let redisPort = process.env.REDIS_PORT;  // Replace with your Redis port
//   let redisHost = process.env.REDIS_URL;  // Replace with your Redis host

//   const client = new Redis();

//   (async () => {
//     // Connect to redis server
//     await client.connect();
// })();

//   client.on('connect', () => {
//     console.log('Redis Server is connected!');
//   });

//   // Log any error that may occur to the console
//   client.on("error", (err) => {
//     console.log(`Error while connecting to the Redis server: ${err}`);
//   });

//   return client;
// };

// module.exports = createRedisClient;
