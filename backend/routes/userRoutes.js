import express from 'express';
import { getPublishedImages, getUserProfile, loginUser, registerUser } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';


const userRoutes = express.Router();

userRoutes.post('/register', registerUser)
userRoutes.post('/login', loginUser)
userRoutes.get('/data', protect, getUserProfile)
userRoutes.get('/published-images', getPublishedImages)

export default userRoutes;