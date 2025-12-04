const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const userRoutes = require('./routes/users');
const tagRoutes = require('./routes/tags');
const testListRoutes = require('./routes/testList');
const notificationRouter = require('./routes/notification');
const r2Routes = require('./routes/r2');
dotenv.config();

const app = express();
const authMiddleware = require('./middlewares/authMiddleware');
const {initR2} = require("./config/r2");
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', authMiddleware, questionRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/tag', authMiddleware, tagRoutes);
app.use('/api/testList', authMiddleware, testListRoutes);
app.use('/api/notifications', authMiddleware, notificationRouter)
app.use('/api/r2', authMiddleware, r2Routes);

const startServer = async () => {
    await connectDB();
    await initR2();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();
