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
import { INotification } from './model/notificationModel';
import { IUser } from './model/userModel';
import { IBooks } from './model/bookModel'; 

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
    // console.log('A user connected:', socket.id); 
  
    socket.on('register', (userId) => {
      if (userId) {
        userSockets.set(userId, socket.id);

      }
    });
  
    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  
    socket.on('requestBook', async (notification) => {
      try {
        const { receiverId, userId, bookId, content } = notification;
        const receiverSocketId = userSockets.get(receiverId);
        const user: IUser | null = await userService.getUserById(userId);
        const book: IBooks | null = await userService.getBookById(bookId);
        const receiver: IUser | null = await userService.getUserById(receiverId);

        if (!user || !book || !receiver) {
          console.error('User, book, or receiver not found');
          return;
        }

        const notificationData = {
          userId: user._id!,
          receiverId: receiver._id!,
          bookId: book._id!,
          userName: user.name!,
          userImage: user.image!,
          bookTitle: book.bookTitle!,
          bookImage: book.images[0]!, 
          content: content!,
        };
  
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', notificationData);
        } else {
          console.log(`No active socket found for user ${receiverId}`);
        }
      } catch (error) {
        console.error('Error handling requestBook event:', error);
      }
    });

    // socket.on('requestBook', async (data) => {
    //   try {
    //     const { receiverId, userId, bookId,content } = notificationData;
    //     const user = await userService.getUserById(userId);
    //     const book = await userService.getBook(bookId);
    //     const notificationData = {
    //       content,
    //       userName: user?.name,
    //       userImage: user?.image,
    //       bookTitle: book?.bookTitle,
    //       bookImage: book?.images,
    //     };
  
    //     const receiverSocketId = userSockets.get(receiverId);
    //     console.log('Receiver socket ID:', receiverSocketId);
        
    //     if (receiverSocketId) {
    //       io.to(receiverSocketId).emit('notification', notificationData);
    //       console.log(`Notification sent to user ${receiverId}`);
    //     } else {
    //       console.log(`No active socket found for user ${receiverId}`);
    //     }
    //   } catch (error) {
    //     console.error('Error handling requestBook event:', error);
    //   }
    // });
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



  
