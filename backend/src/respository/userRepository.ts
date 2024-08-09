import { user, IUser } from "../model/userModel";
import { admin } from "../model/adminModel";
import { userData } from "../utils/ReuseFunctions/interface/data";
import {User,ChatRoom } from "../interfaces/data";
import { Books } from "../interfaces/data";
import { books, IBooks } from "../model/bookModel";
import mongoose from "mongoose";
import { genres } from "../model/genresModel";
import { notification, INotification } from "../model/notificationModel";
import { Notification } from "../interfaces/data";
import {
    GetObjectCommand,
    GetObjectCommandInput,

} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "../config/config";
import { s3Client } from "../utils/imageFunctions/store";
import {IMessage } from "../model/message";
import {chatRoom,IChatRoom} from '../model/chatRoom'
// import { books } from "../controllers/userController";

export class UserRepository {
    async findUserByEmail(email: string): Promise<IUser | null> {
        try {
            return await user.findOne({ email });
        } catch (error) {
            console.log("Error findUserByEmail:", error);
            throw error;
        }
    }

    async findByGmail(email: string): Promise<IUser | null> {
        try {
            return await user.findOne({ email, isGoogle: true });
        } catch (error) {
            console.log("Error findByGmail:", error);
            throw error;
        }
    }

    async createUser(data: Partial<User>): Promise<IUser | null> {
        try {
            return new user({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
            }).save();
        } catch (error) {
            console.log("Error createUser:", error);
            throw error;
        }
    }
    async findByUserName(name: string): Promise<IUser | null> {
        try {
            return user.findOne({ name });
        } catch (error) {
            console.log("Error findByUserName:", error);
            throw error;
        }
    }

    async createUserByGoogle(data: User): Promise<IUser | null> {
        try {
            return new user({
                name: data.name,
                email: data.email,
                image: data.image,
                isGoogle: true,
            }).save();
        } catch (error) {
            console.log("Error createUserByGoogle:", error);
            throw error;
        }
    }

    async updatePassword(data: User): Promise<IUser | null> {
        try { 
            return await user.findOneAndUpdate(
                { email: data.email },
                { $set: { password: data.password } }
            );
        } catch (error) {
            console.log("Error updatePassword:", error);
            throw error;
        }
    }
    async addToBookRent(bookRentData: Books): Promise<IBooks | null> {
        try {
            return new books({
                bookTitle: bookRentData.bookTitle,
                description: bookRentData.description,
                author: bookRentData.author,
                publisher: bookRentData.publisher,
                publishedYear: bookRentData.publishedYear,
                genre: bookRentData.genre,
                images: bookRentData.images,
                rentalFee: bookRentData.rentalFee,
                isRented: true,
                lenderId: bookRentData.lenderId,
            }).save();
        } catch (error) {
            console.log("Error addToBookRent:", error);
            throw error;
        }
    }
    async findUserById(_id: string): Promise<IUser | null> {
        try {    
            
            return await user.findById(_id);
         
        } catch (error) {
            console.log("Error findUserById:", error);
            throw error;
        }
    }
    async findAllGenres() {
        try {
            return await genres.find();
        } catch (error) {
            console.log("Error findAllGenres:", error);
            throw error;
        }
    }
    async findAllBooks() {
        try {
            return await books.find();
        } catch (error) {
            console.log("Error findAllGenres:", error);
            throw error;
        }
    }
    async updateUser(userId:string,filteredUser: User): Promise<IUser | null> {
        try {
           
            const userToUpdate: IUser | null = await this.findUserById(userId)

            if (!userToUpdate) {
                console.log("Error finding the user to update:");
                return null;
            }else{
                
                console.log(filteredUser,'filteredUser')
                const updatedUser= await user.findByIdAndUpdate({_id:userId},{
                    name: filteredUser.name || userToUpdate.name,
                    email: filteredUser.email || userToUpdate.email,
                    phone: filteredUser.phone || userToUpdate.phone,
                    city: filteredUser.city || userToUpdate.city,
                    district: filteredUser.district || userToUpdate.district,
                    state: filteredUser.state || userToUpdate.state,
              
                },{new:true}
            )
                if (!updatedUser) {
                console.log("Error updating the user:");
                return null;
            }

            console.log('Updated user:', updatedUser);
            return updatedUser;
            }
        } catch (error) {
            console.log("Error findAllGenres:", error);
            throw error;
        }
    }
    async addToBookSell(bookSelldata: Books): Promise<IBooks | null> {
        try {
            return await new books({
                bookTitle: bookSelldata.bookTitle,
                description: bookSelldata.description,
                author: bookSelldata.author,
                publisher: bookSelldata.publisher,
                publishedYear: bookSelldata.publishedYear,
                genre: bookSelldata.genre,
                images: bookSelldata.images,
                price: bookSelldata.price,
                isSell: true,
                lenderId: bookSelldata.lenderId,
            }).save();
        } catch (error) {
            console.log("Error addToBookSell:", error);
            throw error;
        }
    }
    async findBook(bookId: string): Promise<IBooks | null> {
        try {
            const book:IBooks | null = await books.findById(bookId);
            if (!book) {
                console.log(`Book with ID ${bookId} not found.`);
                return null;
            }
    
                if (book.images && Array.isArray(book.images)) {
                    const imageUrls = await Promise.all(
                        book.images.map(async (imageKey: string) => {
                            const getObjectParams: GetObjectCommandInput = {
                                Bucket: config.BUCKET_NAME,
                                Key: imageKey,
                                
                            };
                            const command = new GetObjectCommand(getObjectParams);
                            return await getSignedUrl(s3Client, command, {
                                expiresIn: 3600,
                            });
                        })
                    );
                    book.images = imageUrls;
                } else {
                    book.images = [];
                }
    
            return book
        } catch (error: any) {
            console.log("Error findBook:", error);
            throw error
        }
    }

    async createNotification(
        data: Partial<Notification>
    ): Promise<INotification | null> {
        try {
            return new notification({
                userId: data.userId,
                receiverId: data.receiverId,
                bookId: data.bookId,
                type: data.type,
                content: data.content,
            }).save();
        } catch (error) {
            console.log("Error createUser:", error);
            throw error;
        }
    }
    async notificationsByUserId(userId: string): Promise<INotification[]> {
        try {
            const notifications =  await notification.find({ receiverId: new mongoose.Types.ObjectId(userId) })
            .populate('userId')
            .populate('receiverId')
            .populate('bookId');
            return notifications
        } catch (error) {
          console.log("Error notificationsByUserId:", error);
          throw error;
        }
      }
      async activeUsers () {
       try{
        const users = await user.find({isBlocked: false })
        return users
       }catch(error:any){
        console.log("Error getActiveUsers:", error);
          throw error;
       }
    };

    async createChatRoom(userId:string,receiverId:string): Promise<IChatRoom | null> {
        try {
            return new chatRoom({
                 userId,
                 receiverId,
            }).save();
        } catch (error) {
            console.log("Error createMessage:", error);
            throw error;
        }
    }

    // async messages(userId:string): Promise<IMessage[] | null>{
    //     try{
           
    //          return messages
    //     }catch(error){
    //         console.log("Error messages:",error)
    //         throw error
    //     }
    // }

    async updateProfileImage(userId:string,imageUrl:string): Promise<IUser | null> {
        try{
            return await user.findByIdAndUpdate(userId,{image:imageUrl},{new:true})
           
        }catch(error){
            console.log("Error updateProfileImage:",error)
            throw error
        }
    }

    async deleteUserImage(userId:string):Promise<IUser | null>{
        try{
            return await user.findByIdAndUpdate(userId,{$unset: {image: ""}},{new:true});
        }catch(error){
            console.log("Error deleteUserImage:",error)
            throw error
        }
    }

    async findCheckRequest(userId: string, bookId: string): Promise<boolean> {
        try {
            console.log(userId,'userdi')
            console.log(bookId,'bookId')
            const existingRequest = await notification.find({ userId:userId, bookId:bookId ,type:"Request"});
            console.log(existingRequest,'existingRequest')
            return existingRequest.length>0;
        } catch (error) {
            console.log("Error getCheckRequest:", error);
            throw error;
        }
    }

    async findCheckAccept(userId: string, bookId: string): Promise<boolean> {
        try {
            console.log(userId,'userdi')
            console.log(bookId,'bookId')
            const existingAccepted = await notification.find({ userId:userId, bookId:bookId ,type:"Accepted"});
            console.log(existingAccepted,'existingAccepted')
            return existingAccepted.length>0;
        } catch (error) {
            console.log("Error getCheckRequest:", error);
            throw error;
        }
    }
    async saveToken(userId:string,resetToken:string,resetTokenExpiration:number){
        try{
            return await user.findByIdAndUpdate(userId,{resetToken,resetTokenExpiration},{new:true})
        }catch(error){
            console.log('Error saveToken:',error)
            throw error
        }
    }
    async updateIsGoogle(gmail:string){
        try{
            const update = await user.findOneAndUpdate({email:gmail},{isGoogle:false},{new:true})
            console.log(update,'update')
            return update
        }catch(error){
            console.log("Error updateIsGoogle:",error)
            throw error
        }
    }
}
