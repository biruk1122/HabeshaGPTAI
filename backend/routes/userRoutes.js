import express from 'express';
import { getUserProfile, loginUser, registerUser } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';


const userRoutes = express.Router();

userRoutes.post('/register', registerUser)
userRoutes.post('/login', loginUser)
userRoutes.get('/data', protect, getUserProfile)

export default userRoutes;