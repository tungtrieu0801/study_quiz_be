const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const userRoutes = require('./routes/users');
const tagRoutes = require('./routes/tags');
const testListRoutes = require('./routes/testList');
dotenv.config();

const app = express();
const authMiddleware = require('./middlewares/authMiddleware');
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', authMiddleware, questionRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/tag', authMiddleware, tagRoutes);
app.use('/api/testList', authMiddleware, testListRoutes);

const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();
