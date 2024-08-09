import { signUp ,generateOtp, loginUser, verifyEmail, verifyOtp,updatePassword,sellBook, rentBook,logoutUser,loginByGoogle,updateUser,bookDetail,
   genresOfBooks,books,genres,sendNotification,notifications,updateProfileImage,deleteUserImage,getUser,createChatRoom,checkUserSent,checkAccept,sendUnlinkEmail
} from '../controllers/userController';
import express from 'express'
import upload from '../utils/imageFunctions/store';
// import {multerUpload} from '../utils/imageFunctions/cloudinaryConfig';
import {verifyToken} from '../utils/middleware/authMiddleware';

const userRouter=express.Router()

userRouter.post('/sign-up',signUp)

userRouter.post('/otp-generate',generateOtp)

userRouter.post('/login',loginUser)

userRouter.post('/google-login',loginByGoogle)

userRouter.post('/check-email',verifyEmail)

userRouter.post('/verify-otp',verifyOtp)  

userRouter.post('/update-password',updatePassword) 

userRouter.post('/rent-book',verifyToken,upload.array('images', 10),rentBook)

userRouter.post('/sell-book',verifyToken,upload.array('images', 10),sellBook)

userRouter.get('/genres',verifyToken,genresOfBooks)

userRouter.get('/books/:userId',verifyToken,books)

// userRouter.get('/genres',verifyToken,genres)

userRouter.get('/book/:Id',verifyToken,bookDetail)

userRouter.put('/update-profile',verifyToken,updateUser)  

userRouter.put('/update-profile-image',verifyToken,upload.single('selectedImage'),updateProfileImage)  

userRouter.post('/notification',verifyToken,sendNotification)

userRouter.get('/notifications',verifyToken,notifications)

// userRouter.post('/create-message',verifyToken,messageCreation)

// userRouter.get('/user-messages/:userId',verifyToken,allMessages)

 userRouter.post('/create-chatRoom',verifyToken,createChatRoom)

userRouter.get('/user/:receiverId',verifyToken,getUser)

userRouter.post('/send-email',verifyToken,sendUnlinkEmail)

userRouter.get('/check-request/:userId/:bookId', verifyToken, checkUserSent);
userRouter.get('/check-accept/:userId/:bookId', verifyToken, checkAccept);


userRouter.post('/logout',logoutUser) 

userRouter.delete('/delete-profile-image',verifyToken,deleteUserImage)

// router.post('/add-book',multerUpload,addbook)

export default userRouter 



