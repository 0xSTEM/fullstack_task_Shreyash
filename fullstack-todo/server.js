// /server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Configurations
const PORT = process.env.PORT || 3000;
const REDIS_KEY = 'FULLSTACK_TASK_shreyash';
const REDIS_HOST = 'redis-12675.c212.ap-south-1-1.ec2.cloud.redislabs.com';
const REDIS_PORT = 12675;
const REDIS_USERNAME = 'default';
const REDIS_PASSWORD = 'dssYpBnYQrl01GbCGVhVq2e4dYvUrKJB';
const MONGO_URL = 'mongodb+srv://assignment_user:HCgEj5zv8Hxwa4xO@test-cluster.6f94f5o.mongodb.net/';
const MONGO_COLLECTION = 'assignment_shreyash';

// MongoDB setup
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const TaskSchema = new mongoose.Schema({ text: String });
const Task = mongoose.model(MONGO_COLLECTION, TaskSchema);

// Redis setup
const redisClient = redis.createClient({
    url: `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
});
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});
redisClient.connect().then(() => {
    console.log('Connected to Redis');
});

// Express setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(bodyParser.json());

// WebSocket setup
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('add', async (message) => {
        const tasks = await getTasksFromCache();
        tasks.push(message);
        
        if (tasks.length > 50) {
            await Task.insertMany(tasks.map(task => ({ text: task })));
            await redisClient.del(REDIS_KEY);
        } else {
            await redisClient.set(REDIS_KEY, JSON.stringify(tasks));
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// HTTP API setup
app.get('/fetchAllTasks', async (req, res) => {
    const tasks = await getTasksFromCache();
    const dbTasks = await Task.find();
    res.json([...tasks, ...dbTasks.map(task => task.text)]);
});

// Helper functions
async function getTasksFromCache() {
    const data = await redisClient.get(REDIS_KEY);
    return JSON.parse(data) || [];
}

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
