import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createChat, deleteChat, getUserChats } from '../controllers/chatController.js';

const chatRoutes = express.Router();

chatRoutes.get('/create', protect, createChat)
chatRoutes.get('/getchats', protect, getUserChats)
chatRoutes.delete('/delete', protect, deleteChat)

export default chatRoutes;