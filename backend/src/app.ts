import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; 
import cookieParser from 'cookie-parser';
import {Request,Response} from 'express'
import cors from 'cors';
import  dbConnect  from './config/db'
import userRouter from './routes/userRoute'
import adminRouter from './routes/adminRoute';  
import config from './config/config';
import {refreshTokenController} from './controllers/refreshToken'
import { UserService } from './services/userService';

const userService = new UserService()

const app = express()
const server = http.createServer(app);
const io = new Server(server, {
   cors: {
     origin: 'http://localhost:5173',
     credentials: true,
   },
});

app.set('io', io);

dbConnect()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  

app.use(express.static('public/'))
app.use(cors
   ({
   origin:'http://localhost:5173',
   credentials:true,
}))

const userSockets = new Map<string, string>();
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    socket.on('register', (userId) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ID: ${socket.id}`);
      }
    });
  
    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected and socket ID: ${socket.id} removed`);
          break;
        }
      }
    });
  
    socket.on('requestBook', async (data) => {
      try {
        const { receiverId, userId, bookId, content } = data;
        const user = await userService.getUserById(userId);
        const book = await userService.getBook(bookId);
        const notificationData = {
          content,
          userName: user?.name,
          userImage: user?.image,
          bookTitle: book?.bookTitle,
          bookImage: book?.images,
        };
  
        const receiverSocketId = userSockets.get(receiverId);
        console.log('Receiver socket ID:', receiverSocketId);
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', notificationData);
          console.log(`Notification sent to user ${receiverId}`);
        } else {
          console.log(`No active socket found for user ${receiverId}`);
        }
      } catch (error) {
        console.error('Error handling requestBook event:', error);
      }
    });
  });
app.use((req, res, next) => {
   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
   res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
   next();
});

app.use('/api/user',userRouter) 
app.use('/api/admin',adminRouter)
app.post('/api/refresh-token', refreshTokenController);


server.listen(config.PORT,()=>{
   console.log(`Server running at ${config.PORT}`)
})



  
