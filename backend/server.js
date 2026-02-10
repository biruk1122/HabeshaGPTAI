import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import connectDB from './configs/db.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import creditRouter from './routes/creditRoutes.js';
import { stripewebwooks } from './controllers/webhooks.js';

const app = express();

await connectDB()

//Stripe Webhooks
app.post('/api/stripe', express.raw({type: 'application/json'}), stripewebwooks)

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('HabeshaGPTAI Backend is running'));
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));