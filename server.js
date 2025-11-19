const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
dotenv.config();

const app = express();
const authMiddleware = require('./middlewares/authMiddleware');
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', authMiddleware, questionRoutes);
// app.use('/api/quizzes', quizRoutes);
// app.use('/api/results', resultRoutes);
const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();
