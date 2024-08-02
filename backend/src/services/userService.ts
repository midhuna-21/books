import { UserRepository } from "../respository/userRepository";
import { userData } from "../utils/ReuseFunctions/interface/data";
import {Books, User} from '../interfaces/data'
import {IUser, user} from '../model/userModel'
import {IBooks} from '../model/bookModel'
import {INotification} from '../model/notificationModel'
import {Notification} from '../interfaces/data'

const userRepository =new UserRepository()

export class UserService{
    async getCreateUser(data:Partial<User>):Promise<IUser | null>{
        try{
            return await userRepository.createUser(data)
        }catch(error){
            console.log("Error getByGmail:",error);
            throw error
        }
    }
    async getUserByEmail(email:string):Promise<IUser | null>{
        try{
            return await userRepository.findUserByEmail(email)
        }catch(error){
            console.log("Error getByEmail:",error);
            throw error
        }
    }

    async getByGmail(email:string):Promise<IUser | null>{
        try{
            return await userRepository.findByGmail(email)
        }catch(error){
            console.log("Error getByGmail:",error);
            throw error
        }
    }
    async getUserByName(name:string):Promise<IUser | null>{
        try{
            return await userRepository.findByUserName(name)
        }catch(error){
            console.log("Error getUserByName:",error);
            throw error
        }
    }

    async getCreateUserByGoogle(data:User):Promise<IUser | null>{
        try{
            return await userRepository.createUserByGoogle(data)
        }catch(error){
            console.log("Error getCreateUserByGoogle:",error);
            throw error
        }
    }
    async getUpdatePassword(data:User):Promise<IUser | null>{
        try{
            return await userRepository.updatePassword(data)
        }catch(error){
            console.log("Error getUpdatePassword:",error);
            throw error
        }
    }
   

    async getAddToBookRent(bookRentData:Books):Promise<IBooks | null>{
        try{
            return await userRepository.addToBookRent(bookRentData)
        }catch(error){
            console.log("Error getAddToBookRent:",error);
            throw error
        }
    }
    async getAddToBookSell(bookSelldata:Books):Promise<IBooks | null>{
        try{
            return await userRepository.addToBookSell(bookSelldata)
        }catch(error){
            console.log("Error getAddToBookSell:",error);
            throw error
        }
    }

    async getUserById(_id:string):Promise<IUser | null>{
        try{
            const userss = await userRepository.findUserById(_id)
         
            return userss
        }catch(error){
            console.log("Error getUserById:",error);
            throw error
        }
    }

    async getAllGenres(){
        try{
            return await userRepository.findAllGenres()
        }catch(error){
            console.log("Error getAllGenres:",error);
            throw error
        }
    }
    async getAllBooks(){
        try{
            return await userRepository.findAllBooks()
        }catch(error){
            console.log("Error getAllBooks:",error);
            throw error
        }
    }
    async getUpdateUser(user:User):Promise<IUser | null>{
        try{
            return await userRepository.updateUser(user)
        }catch(error){
            console.log("Error getUpdateUser:",error);
            throw error
        }
    }
    async getBook(bookId:string){
        try{
            return await userRepository.findBook(bookId)
        }catch(error:any){
            console.log("Error getBook:",error)
        }
    }
    async getCreateNotification(data:Partial<Notification>):Promise<INotification | null>{
        try{
            return await userRepository.createNotification(data)
        }catch(error){
            console.log("Error getCreateNotification:",error);
            throw error
        }
    }
    async   getNotificationsByUserId(userId: string): Promise<INotification[]> {
        try{
            return await userRepository.notificationsByUserId(userId)
        }catch(error){
            console.log("Error getNotificationsByUserId:",error);
            throw error
        }
    }
    async getActiveUsers(){
        try{
           return await userRepository.activeUsers()
        }catch(error){
           console.log("Error getAllUsers:",error);
           throw error
     }
     }

}

// const getUpdateUser = async (
//     userId:string,name:string,email:string,phone:string,city:string,district:string,state:string,pincode:string,address:string,image:string|null) => {
//     try{
//       const updatedUser = await userRepository.findUpdateUser(
//         userId,
//         name,
//         email,
//         phone,
//         city,
//         district,
//         state,
//         pincode,
//         address,
//         image);
//       return updatedUser
//     }catch(error:any){
//       console.log(error.message)
//       throw new Error("service error Internal server error");
//     }
//   }

// const getAllBooks = async () => {
//     try{
//      return await userRepository.findAllBooks();
//     }catch(error:any){
//      console.log(error.message)
//      throw new Error("service error Internal server error");
//    }
//  };
 
// const getAllGenres = async () => {
//     try{
//      return await userRepository.findAllGenres();
//     }catch(error:any){
//      console.log(error.message)
//      throw new Error("service error Internal server error");
//    }
//  };

// const getUserId = async (_id: string) => {
//     try {
//         return await userRepository.findUserId(_id);
//     } catch (error: any) {
//         console.log(error.message);
//         throw new Error("Internal servvvvvvvvver error");
//     }
// };

// const getAddBookSell = async (
//     bookTitle: string,
//     description: string,
//     author: string,
//     publisher: string,
//     genre: string,
//     images: string[],
//     price: number
// ) => {
//     return await userRepository.addBookSell(
//         bookTitle,
//         description,
//         author,
//         publisher,
//         genre,
//         images,
//         price
//     );
// };

// const getAddBookRent = async (
//     bookTitle: string,
//     description: string,
//     author: string,
//     publisher: string,
//     genre: string,
//     images: string[],
//     rentalFee: number,
//     damageFee: number,
//     lateFee: number,
//     rentalPeriod: number
// ) => {
//     return await userRepository.addBookRent(
//         bookTitle,
//         description,
//         author,
//         publisher,
//         genre,
//         images,
//         rentalFee,
//         damageFee,
//         lateFee,
//         rentalPeriod
//     );
// };

// const getAdminEmail = async (email: string) => {
//     return await userRepository.findAdminEmail(email);
// };

// const getUpdatePassword = async (email: string, password: string) => {
//     return await userRepository.updatePassword(email, password);
// };

// const getGoogleCreateUser = async (
//     name: string,
//     email: string,
//     image: string
// ) => {
//     return await userRepository.googleCreateUser(name, email, image);
// };

// const getUserName = async (name: string) => {
//     return await userRepository.findUserName(name);
// };

// const getCreateUser = async (data: userData) => {
//     return await userRepository.createUser(data);
// };

// const getGmail = async (email: string) => {
//     return await userRepository.findGmail(email);
// };

// const getEmail = async (email: string) => {
//     return await userRepository.findEmail(email);
// };
 
