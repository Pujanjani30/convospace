import { Router } from "express";
import {
  signup, login, logout,
  getUserInfo, updateProfile,
  addProfilePic, removeProfilePic
} from '../controllers/auth.controller.js'
import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadProfilePic } from "../middlewares/uploadFile.middleware.js";

const authRoutes = Router();
authRoutes.get('/user-info', verifyToken, getUserInfo)

authRoutes.post('/signup', signup)
authRoutes.post('/login', login)
authRoutes.post('/add-profile-pic', verifyToken, uploadProfilePic, addProfilePic);

authRoutes.put('/update-profile', verifyToken, updateProfile);

authRoutes.delete('/remove-profile-pic', verifyToken, removeProfilePic);
authRoutes.delete('/logout', verifyToken, logout);

export default authRoutes;
