import { user, IUser } from "../model/userModel";
import { admin } from "../model/adminModel";
import { userData } from "../utils/ReuseFunctions/interface/data";
import { User } from "../interfaces/data";
import { Books } from "../interfaces/data";
import { books, IBooks } from "../model/bookModel";
import mongoose from "mongoose";
import { genres } from "../model/genresModel";
import { notification, INotification } from "../model/notificationModel";
import { Notification } from "../interfaces/data";
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
            const users = await user.findById(_id);
            return users;
        } catch (error) {
            console.log("Error findAdminById:", error);
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
    async updateUser(data: User): Promise<IUser | null> {
        try {
            const email = data.email;
            const userToUpdate: IUser | null = await user.findOne({
                email: email,
            });

            if (!userToUpdate) {
                console.log("Error finding the user to update:");
                return null;
            }
            const userId = userToUpdate._id;
            return await user.findByIdAndUpdate(
                userId,
                {
                    name: data.name || userToUpdate.name,
                    email: data.email || userToUpdate.email,
                    phone: data.phone || userToUpdate.phone,
                    city: data.city || userToUpdate.city,
                    district: data.district || userToUpdate.district,
                    state: data.state || userToUpdate.state,
                    pincode: data.pincode || userToUpdate.pincode,
                    address: data.address || userToUpdate.address,
                    image: data.image || userToUpdate.image,
                },
                { new: true }
            );
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
    async findBook(bookId: string) {
        try {
            return await books.findById(bookId);
        } catch (error: any) {
            console.log("Error findBook:", error);
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
            .populate('userId', 'name email phone')
            .populate('receiverId', 'name email phone')
            .populate('bookId', 'bookTitle description images author genre publisher publishedYear rentalFee');
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
}

// const addBookSell = async (
//     bookTitle: string,
//     description: string,
//     author: string,
//     publisher: string,
//     genre: string,
//     images: string[],
//     price: number
// ) => {
//     const newBookRent = new sellBook({
//         bookTitle,
//         description,
//         author,
//         publisher,
//         genre,
//         images,
//         price,
//     });
//     return await newBookRent.save();
// };
// const findUpdateUser = async (
//     userId: string,
//     name: string,
//     email: string,
//     phone: string,
//     city: string,
//     district: string,
//     state: string,
//     pincode: string,
//     address:string,
//     image: string | null
//   ): Promise<any> => {
//     try {
//         const updateUser = await user.findByIdAndUpdate(userId,{ name,email,phone, city,district,state,pincode,address,image},{ new: true });
//         if (!updateUser) {
//             throw new Error("User not found");
//         }
//         return updateUser;
//     } catch (error:any) {
//         console.error(error.message);
//         throw new Error("Repository Internal server error");
//     }
//   };

// const findAllBooks = async () => {
//     try {
//         const allBooks = await sellBook.find();
//         return allBooks;
//     } catch (error: any) {
//         console.log(error.message);
//         throw new Error("Internal server error");
//     }
// };

// const findAllGenres = async () => {
//     try {
//         const allGenres = await genres.find();
//         return allGenres;
//     } catch (error: any) {
//         console.log(error.message);
//         throw new Error("Internal server error");
//     }
// };

// const findUserId = async (_id: string) => {
//     try {
//         const userId = await user.findById(_id);
//         return userId;
//     } catch (error: any) {
//         console.log(error.message);
//         throw new Error("Internal server error");
//     }
// };

// const addBookRent = async (
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
//     const newBookRent = new rentBook({
//         bookTitle,
//         description,
//         author,
//         publisher,
//         genre,
//         images,
//         rentalFee,
//         damageFee,
//         lateFee,
//         rentalPeriod,
//     });
//     return await newBookRent.save();
// };

// const findAdminEmail = async (email: string) => {
//     return await admin.findOne({ email, isAdmin: true });
// };

// const updatePassword = async (email: string, password: string) => {
//     const newPassword = await user.findOneAndUpdate(
//         { email: email },
//         { $set: { password: password } }
//     );
//     return newPassword;
// };

// const googleCreateUser = async (name: string, email: string, image: string) => {
//     const userCreation = new user({
//         name,
//         email,
//         image,
//         isGoogle: true,
//     });
//     console.log("heimage", userCreation);
//     const googleUser = await userCreation.save();
//     console.log(googleUser, "googleuser");
//     return googleUser;
// };

// const findUserName = async (name: string) => {
//     return await user.findOne({ name });
// };
// const createUser = async (data: userData) => {
//     const addUser = new user({
//         name: data.name,
//         email: data.email,
//         phone: data.phone,
//         password: data.password,
//     });
//     return await addUser.save();
// };
// const findGmail = async (email: string) => {
//     return await user.findOne({ email, isGoogle: true });
// };

// const findEmail = async (email: string) => {
//     console.log("find emailuser");
//     const emailuser = await user.findOne({ email });
//     console.log(emailuser, "emailuser");
//     return emailuser;
// };

// const createAdmin = async (email: string, password:string) => {
//   const adminCreation = new admin({
//     email,
//     password,
//     isAdmin:true,
//   });
//   const adminData = await adminCreation.save();
//   return adminData
// };