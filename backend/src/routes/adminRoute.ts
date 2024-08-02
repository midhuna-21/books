import express, { Request, Response } from 'express';
import { addGenre, adminLogin,getUsersList ,blockUser,unBlockUser} from '../controllers/adminController';
import upload from '../utils/imageFunctions/store';
import {verifyToken} from '../utils/middleware/authMiddleware';

const adminRouter = express.Router()

adminRouter.post('/admin-login',adminLogin)

// add genre

adminRouter.post('/add-genre',verifyToken,upload.single('file'),addGenre);

// get-users
adminRouter.get('/get-users',getUsersList)
// block-user
adminRouter.post('/block-user',blockUser)
// unblock-user
adminRouter.post('/unblock-user',unBlockUser)

export default adminRouter 


 