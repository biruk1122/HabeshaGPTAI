import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import connectDB from './configs/db.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

await connectDB()

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('HabeshaGPTAI Backend is running'));
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));