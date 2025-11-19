const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
// app.use('/api/questions', questionRoutes);
// app.use('/api/quizzes', quizRoutes);
// app.use('/api/results', resultRoutes);
const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();
