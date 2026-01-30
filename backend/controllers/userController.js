import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

//Api to register user
export const registerUser = async(req, res) => {
    const {username, email, password} = req.body;

    try {
        const userExists = await User.findOne({email});
        if(userExists){
            return res.json({success: false, message: 'User already exists'});
        }

        const user = await User.create({username, email, password});

        const token = generateToken(user._id);
        res.json({sucess:true, token})
    } catch (error) {
        return res.status(500).json({success:false, message: error.message});
    }
}

//Api to login user
export const loginUser = async(req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(user){
            const isMatch = await bcrypt.compare(password, user.password);

            if(isMatch){
                const token = generateToken(user._id);
                return res.json({success:true,  token});
            }
        }
        return res.status(401).json({success:false, message: 'Invalid email or password'});

    }catch(error){
        return res.status(500).json({success:false, message: error.message});
    }
}

//Api to get user profile
export const getUserProfile = async(req, res) => {
    try{
        const user = req.user;
        return res.json({success:true, user});
    }catch(error){
        return res.status(500).json({success:false, message: error.message});
    }
}