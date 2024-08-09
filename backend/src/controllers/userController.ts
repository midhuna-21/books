import { Request, Response } from "express";
import {
    comparePassword,
    hashPassword,
} from "../utils/ReuseFunctions/passwordValidation";
import { UserService } from "../services/userService";
import { AdminService } from "../services/adminService";
import { otpGenerate } from "../utils/ReuseFunctions/otpGenerate";
import { generateTokens } from "../utils/jwt/generateToken";
import crypto from "crypto";
import axios from "axios";
import sharp from "sharp";
import {
    GetObjectCommand,
    GetObjectCommandInput,
    PutObjectCommand,
    DeleteObjectCommand,
    ObjectCannedACL,
    S3Client,
} from "@aws-sdk/client-s3";
import config from "../config/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IUser } from "../model/userModel";
import { User } from "../interfaces/data";
import { Books } from "../interfaces/data";
import { IGenre } from "../model/genresModel";
import { Types } from "mongoose";
import { IBooks } from "../model/bookModel";
import { Notification } from "../interfaces/data";
import { INotification } from "../model/notificationModel";
import rentBookValidation from "../utils/ReuseFunctions/rentBookValidation";
import sellBookValidation from "../utils/ReuseFunctions/sellBookValidation";
import { AuthenticatedRequest } from "../utils/middleware/authMiddleware";
import { s3Client } from "../utils/imageFunctions/store";
import { IChatRoom } from "../model/chatRoom";
import {sendEmail} from '../utils/ReuseFunctions/sendEmail';

const userService = new UserService();
const adminService = new AdminService();

const signUp = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password } = req.body;
        console.log(req.body)
        let existUser = await userService.getUserByEmail(email);
        if (existUser) {
            return res.status(400).json({ message: "Email already exist" });
        }
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "Please ensure all required fields are filled out.",
            });
        }
        const securePassword = await hashPassword(password);
        const user: User = { name, email, phone, password: securePassword };

        return res.status(200).json({ user });
    } catch (error: any) {
        console.error(error.message);
        return res.status(400).json({ message: "Internal server error" });
    }
};

const genresOfBooks = async (req: Request, res: Response) => {
    try {
        const genres: IGenre[] = await userService.getAllGenres();

        for (const genre of genres) {
            if (genre.image) {
                const getObjectParams = {
                    Bucket: config.BUCKET_NAME,
                    Key: genre.image,
                };

                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3Client, command, {
                    expiresIn: 3600,
                });
                genre.image = url;
            } else {
                genre.image = " ";
            }
        }

        return res.status(200).json(genres);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const randomImageName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString("hex");

const generateOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        let otp = await otpGenerate(email);
        console.log(otp, "otp");
        res.cookie("otp", otp, { maxAge: 60000 });
        return res
            .status(200)
            .json({ message: "OTP generated and sent successfully" });
    } catch (error: any) {
        console.log(error.message);
        return res.status(400).json({ message: "internal s erver error" });
    }
};

const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { response, origin, otp } = req.body;
        const { name, email, phone, password } = response;
        if (!otp) {
            return res.status(400).json({ message: "please enter otp" });
        }
        const otpFromCookie = req.cookies.otp;
        if (!otpFromCookie) {
            return res.status(400).json({ message: "please click Resend OTP" });
        }
        if (otp !== otpFromCookie) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (origin === "sign-up") {
            const user: IUser | null = await userService.getCreateUser({
                name,
                email,
                phone,
                password,
            });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            } else {
                const userId = user._id.toString();
                const { accessToken, refreshToken } = generateTokens(res, {
                    userId,
                    userRole: "user",
                });
                return res
                    .status(200)
                    .json({ user, accessToken, refreshToken, origin });
            }
        } else {
            let user: IUser | null = await userService.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json({ user, origin });
        }
    } catch (error: any) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        let user: IUser | null = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }
        if (user.isBlocked) {
            return res.status(400).json({
                message:
                    "user is blocked, please contact admin to get your account back",
            });
        }
        if (!user.password) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const userId: string = (user._id as Types.ObjectId).toString();
        const { accessToken, refreshToken } = generateTokens(res, {
            userId,
            userRole: "user",
        });
        return res.status(200).json({ user, accessToken, refreshToken });
    } catch (error: any) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const loginByGoogle = async (req: Request, res: Response) => {
    try {
      const { name, email, image } = req.body;
      let user = await userService.getUserByEmail(email);
      if (user?.isGoogle==true) {   
        const userId = user._id.toString();
        const { accessToken, refreshToken } = generateTokens(res, { userId, userRole: "user" });
        return res.status(200).json({ user, accessToken, refreshToken });
      }else if(user?.isGoogle == false){
        return res.status(500).json({message:"Your email is not linked with google.Enter your email and password."})
      }
       else {
        let imageKey: string | undefined;
        if (image) {
          try {
            const imageResponse = await axios.get(image, { responseType: "arraybuffer" });
            const buffer = await sharp(imageResponse.data).resize({ height: 1920, width: 1080, fit: "contain" }).toBuffer();
            imageKey = randomImageName();
            const params = {
              Bucket: "bookstore-web-app",
              Key: imageKey,
              Body: buffer,
              ContentType: "image/jpeg",
           
            };
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
          } catch (error: any) {
            console.error("Error uploading image:", error);
            return res.status(500).json({ message: "Failed to upload image" });
          }
        }
  
        let imageUrl: string | undefined;
        if (imageKey) {
          const getObjectParams: GetObjectCommandInput = {
            Bucket: config.BUCKET_NAME,
            Key: imageKey,
          };
          const command = new GetObjectCommand(getObjectParams);
          imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 9600 }) || undefined;
        }
  
        const data = { name, email, image: imageUrl };
        user = await userService.getCreateUserByGoogle(data);
  
        if (user) {
          const userId = user._id.toString();
          const { accessToken, refreshToken } = generateTokens(res, { userId, userRole: "user" });
          return res.status(200).json({ user, accessToken, refreshToken });
        } else {
          return res.status(500).json({ message: "Failed to create user" });
        }
      }
    } catch (error: any) {
      console.error("Error in loginByGoogle:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };


// const loginByGoogle = async (req: Request, res: Response) => {
//     try {
//         const { name, email, image } = req.body;
       
//         let imageKey: string | undefined;
//         if (image) {
//             const imageResponse = await axios.get(image, {
//                 responseType: "arraybuffer",
//             });
//             const buffer = await sharp(imageResponse.data)
//                 .resize({ height: 1920, width: 1080, fit: "contain" })
//                 .toBuffer();

//             imageKey = randomImageName();
//             const params = {
//                 Bucket: "bookstore-web-app",
//                 Key: imageKey,
//                 Body: buffer,
//                 ContentType: "image/jpeg",
//             };

//             const command = new PutObjectCommand(params);
//             try {
//                 await s3Client.send(command);
//             } catch (error: any) {
//                 console.error("Error uploading image:", error);
//                 return res
//                     .status(500)
//                     .json({ message: "Failed to upload image" });
//             }
//         }
//         let imageUrl: string | undefined;
//         if (imageKey) {
//             const getObjectParams:  = {
//                 Bucket: "bookstore-web-app",
//                 Key: imageKey,
//             };
//             const command = new GetObjectCommand(getObjectParams);
//             imageUrl =
//                 (await getSignedUrl(s3Client, command, {
//                     expiresIn: 9600,
//                 })) || undefined;
//         }
//         const data: User = { name, email, image: imageUrl };

//         let user: IUser | null = await userService.getUserByGmail(email);
//         if (!user) {
//             user = await userService.getCreateUserByGoogle(data);
//         }
//         const userId: string = (user!._id as Types.ObjectId).toString();
//         const { accessToken, refreshToken } = generateTokens(res, {
//             userId,
//             userRole: "user",
//         });

//         return res.status(200).json({ user, accessToken, refreshToken });
//     } catch (error: any) {
//         console.error("Error in loginByGoogle:", error);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// };

const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { formData } = req.body;
        console.log(req.body, "formdata at user controller");
        const { name,email, phone, city, district, state } = formData;
        const userId = req.userId!;

        const userExist: IUser | null = await userService.getUserById(userId);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        const user: Partial<IUser> = {
            name,
            email,
            phone,
            city,
            district,
            state,
          
        };
        console.log(user, "user atcontroller");
        const filteredUser = Object.fromEntries(
            Object.entries(user).filter(
                ([_, value]) => value && value.trim() !== ""
            )
        );
        console.log(filteredUser, "filteredUser at controller");
        const updatedUser = await userService.getUpdateUser(
            userId,
            filteredUser
        );

        return res.status(200).json({ user: updatedUser });
    } catch (error: any) {
        console.error("Error updating user:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
const updateProfileImage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const userExist: IUser | null = await userService.getUserById(userId);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        let imageKey: string | undefined;
        if (req.file) {
            const buffer = await sharp(req.file.buffer)
                .resize({ height: 1920, width: 1080, fit: "contain" })
                .toBuffer();

            imageKey = randomImageName();
            const params = {
                Bucket: "bookstore-web-app",
                Key: imageKey,
                Body: buffer,
                ContentType: req.file.mimetype,
                ACL: ObjectCannedACL.public_read,
            };

            const command = new PutObjectCommand(params);
            try {
                await s3Client.send(command);
            } catch (error: any) {
                console.error("Error uploading image:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to upload image" });
            }
        }
        let imageUrl: string = "";
        if (imageKey) {
            const getObjectParams: GetObjectCommandInput = {
                Bucket: "bookstore-web-app",
                Key: imageKey,
                
            };
            const command = new GetObjectCommand(getObjectParams);
            imageUrl =
                (await getSignedUrl(s3Client, command, {
                    expiresIn: 3600,
                })) ;
        }
        const user = await userService.getUpdateProfileImage(userId,imageUrl)
      
        return res.status(200).json({ user });
    } catch (error: any) {
        console.error("Error updating user:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const deleteUserImage = async(req:AuthenticatedRequest,res:Response)=>{
    try{
        const { imageToRemove}=req.body
        const userId = req.userId
        if(!userId){
            return res.status(500).json({message:'User not found'})
        }
        if(!imageToRemove){
            return res.status(500).json({messag:"Image is required."});
        }
        const deleteParams = {
            Bucket: config.BUCKET_NAME,
            Key: imageToRemove,
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
        console.log(imageToRemove,'image to remove delte function controller')
        const user = await userService.getDeleteUserImage(userId)
        return res.status(200).json({user})
    }catch(error){
        console.log("Error deleteUserImage:",error);
        return res.status(500).json({error: "Internal server error"});
    }
}
const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        let isValidEmail: IUser | null = await userService.getUserByEmail(
            email
        );
        if (isValidEmail) {
            return res.status(200).json({ isValidEmail });
        } else {
            return res.status(401).json({ message: "Invalid email" });
        }
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const updatePassword = async (req: Request, res: Response) => {
    try {
        const { password, email } = req.body;
        console.log(email,password)
        const isGmail = await userService.getUserByGmail(email)
        const gmail = isGmail?.email!
        if(isGmail){
            const updateIsGoogle = await userService.getUpdateIsGoogle(gmail)
        }
        const securePassword = await hashPassword(password);
        const data: User = { email, password: securePassword };
        const updatePassword: IUser | null = await userService.getUpdatePassword(data);
        return res.status(200).json("Password updated successfully");
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token", { httpOnly: true, secure: true });
        return res.status(200).json({ message: "Logout successfully" });
    } catch (error: any) {
        console.error(error.message);
        return res.status(400).json({ message: "Internal server error" });
    }
};

const rentBook = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            bookTitle,
            description,
            author,
            publisher,
            publishedYear,
            genre,
            rentalFee,
        } = req.body;

        if (!req.userId) {
            return res
                .status(403)
                .json({ message: "User ID not found in request" });
        }
        const userId = req.userId;

        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res
                .status(404)
                .json({ message: "Please provide book images" });
        }

      
        const imageUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const buffer = await sharp(files[i].buffer)
                .resize({ height: 1920, width: 1080, fit: "contain" })
                .toBuffer();

            const imageKey = randomImageName();

            const params = {
                Bucket: "bookstore-web-app",
                Key: imageKey,
                Body: buffer,
                ContentType: files[i].mimetype,
            };

            const command = new PutObjectCommand(params);

            try {
                await s3Client.send(command);
                imageUrls.push(imageKey);
            } catch (error: any) {
                console.error(error);
                return res
                    .status(500)
                    .json({ message: `Failed to upload image ${i}` });
            }
        }
        const bookRentData: Books = {
            bookTitle,
            description,
            author,
            publisher,
            publishedYear,
            genre,
            images: imageUrls,
            rentalFee,
            isRented: true,
            lenderId: userId,
        };

        const validationError = rentBookValidation(bookRentData);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const bookAdded = await userService.getAddToBookRent(bookRentData);
        return res
            .status(200)
            .json({ message: "Book rented successfully", bookAdded });
    } catch (error: any) {
        console.error("Error renting book:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const sendUnlinkEmail = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;
        // const {email}=req.body;
        if(!userId){
            return res.status(400).json({message:"user not found"});
        }
        const user = await userService.getUserById(userId)
        if(!user){
            return res.status(400).json({message:"user not found"});
        }
        const email = user?.email;
        const send = await sendEmail(userId,email)
        
    } catch (error: any) {
        console.error(error.message);
        return res.status(400).json({ message: "Internal server error" });
    }
}
// const rentBook = async (req: AuthenticatedRequest, res: Response) => {
//     try {
//         const {
//             bookTitle,
//             description,
//             author,
//             publisher,
//             publishedYear,
//             genre,
//             rentalFee,
//         } = req.body;

//         // const genreName = await adminService.getGenreName(genre)
//         // if(!genreName){
//         //     await adminService.getCreateCustomGenre(genre)
//         // }
//         if (!req.userId) {
//             return res
//                 .status(403)
//                 .json({ message: "User ID not found in request" });
//         }
//         const userId = req.userId;

//         const files = req.files as Express.Multer.File[];

//         if (!files || files.length === 0) {
//             return res
//                 .status(404)
//                 .json({ message: "Please provide book images" });
//         }

//         const imageKeys: string[] = [];

//         for (let i = 0; i < files.length; i++) {
//             const buffer = await sharp(files[i].buffer)
//                 .resize({ height: 1920, width: 1080, fit: "contain" })
//                 .toBuffer();

//             const imageKey = randomImageName();

//             const params = {
//                 Bucket: "bookstore-web-app",
//                 Key: imageKey,
//                 Body: buffer,
//                 ContentType: files[i].mimetype,
//             };

//             const command = new PutObjectCommand(params);

//             try {
//                 await s3Client.send(command);
//                 imageKeys.push(imageKey);
//             } catch (error: any) {
//                 console.error(error);
//                 return res
//                     .status(500)
//                     .json({ message: `Failed to upload image ${i}` });
//             }
//         }
        

//         const bookRentData: Books = {
//             bookTitle,
//             description,
//             author,
//             publisher,
//             publishedYear,
//             genre,
//             images: imageKeys,
//             rentalFee,
//             isRented: true,
//             lenderId: userId,
//         };
//         const validationError = rentBookValidation(bookRentData);
//         if (validationError) {
//             return res.status(400).json({ message: validationError });
//         }
//         const bookAdded = await userService.getAddToBookRent(bookRentData);
//         return res
//             .status(200)
//             .json({ message: "Book rented successfully", bookAdded });
//     } catch (error: any) {
//         console.error("Error renting book:", error.message);
//         return res.status(404).json({ error: "Internal server error" });
//     }
// };

const sellBook = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            bookTitle,
            description,
            author,
            publisher,
            publishedYear,
            genre,
            price,
        } = req.body as Books;

        if (!req.userId) {
            return res
                .status(403)
                .json({ message: "User ID not found in request" });
        }
        const userId = req.userId;

        const images = req.files as Express.Multer.File[];

        if (!images || images.length === 0) {
            return res
                .status(404)
                .json({ message: "Please provide book images" });
        }

        const bookImages: string[] = [];
        for (let i = 0; i < images.length; i++) {
            const buffer = await sharp(images[i].buffer)
                .resize({ height: 1920, width: 1080, fit: "contain" })
                .toBuffer();

            const image = randomImageName();

            const params = {
                Bucket: "bookstore-web-app",
                Key: image,
                Body: buffer,
                ContentType: images[i].mimetype,
            }

            const command = new PutObjectCommand(params);

            try {
                await s3Client.send(command);
                bookImages.push(image);
            } catch (error: any) {
                console.error(error);
                return res
                    .status(404)
                    .json({ message: `Failed to upload image ${i}` });
            }
        }
        const bookSelldata: Books = {
            bookTitle,
            description,
            author,
            publisher,
            publishedYear,
            genre,
            images: bookImages,
            price,
            lenderId: userId,
        };
        const validationError = sellBookValidation(bookSelldata);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }
        await userService.getAddToBookSell(bookSelldata);
        return res
            .status(200)
            .json({ message: "Book sold successfully", bookSelldata });
    } catch (error: any) {
        console.error("Error renting book:", error.message);
        return res.status(404).json({ error: "Internal server error" });
    }
};

const books = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = req.params.userId;
        const allBooks: IBooks[] = await userService.getAllBooks();
        const booksToShow = allBooks.filter((book) => book.lenderId !== userId);
        for (const book of booksToShow) {
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
        }
        console.log(booksToShow);

        return res.status(200).json(booksToShow);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const genres = async (req: Request, res: Response): Promise<Response> => {
    try {
        console.log("sojdl");
        const genres: IGenre[] = await userService.getAllGenres();
        console.log("here is ");
        for (const genre of genres) {
            if (genre.image && typeof genre.image === "string") {
                const getObjectParams: GetObjectCommandInput = {
                    Bucket: config.BUCKET_NAME,
                    Key: genre.image,
                };
                const command = new GetObjectCommand(getObjectParams);
                const imageUrl = await getSignedUrl(s3Client, command, {
                    expiresIn: 3600,
                });
                genre.image = imageUrl;
            } else {
                genre.image = "";
            }
        }

        return res.status(200).json(genres);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const bookDetail = async (req: Request, res: Response) => {
    try {
        const bookId = req.params.Id as string;
        const book:IBooks | null = await userService.getBookById(bookId);

        if (!book) {
            return res.status(500).json({ message: "Book is not found " });
        }
        const lenderId: string = book.lenderId;
        const lender = await userService.getUserById(lenderId);
        return res.status(200).json({ book, lender });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const sendNotification = async (req: Request, res: Response) => {
    try {
        const { userId, receiverId, bookId, type, content } =
            req.body;
     
        const data: Notification = {
            userId,
            receiverId,
            bookId,
            type,
            content,
        };
        const notification = await userService.getCreateNotification(data);
        return res.status(200).json({ notification });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
const notifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId: string = req.userId || "";
        if (!userId) {
            return res
                .status(400)
                .json({ message: "User ID not found in request" });
        }
        const notifications = await userService.getNotificationsByUserId(
            userId
        );
        return res.status(200).json({ notifications });
    } catch (error: any) {
        console.log(error.message);
        return res
            .status(500)
            .json({ message: "Internal server error at notifications" });
    }
};
const getUser = async (req: Request, res: Response) => {
    try {
        const {receiverId} = req.params;
        if (!receiverId) {
            return res
                .status(400)
                .json({ message: "User ID not found in request" });
        }
     
    const receiver = await userService.getUserById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }
        return res.status(200).json({ receiver });
    } catch (error: any) {
        console.log(error.message);
        return res
            .status(500)
            .json({ message: "Internal server error at notifications" });
    }
};
const createChatRoom = async (req: Request, res: Response) => {
    try {
       const {userId,receiverId} = req.body;
       if (!userId || !receiverId) {
        return res.status(400).json({ message: "Missing userId or receiverId" });
    }

    const chatRoom:IChatRoom | null = await userService.getCreateChatRoom(userId, receiverId);
    return res.status(201).json({ chatRoom });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const checkUserSent = async(req:Request,res:Response)=>{
    try{
        const { userId, bookId } = req.params;
     if (!userId || !bookId) {
            return res
                .status(400)
                .json({ message: "User ID or Book ID not found in request" });
        }

        const isRequested = await userService.getCheckRequest(userId, bookId);
       console.log(isRequested,'isRequested')
        return res.status(200).json({ isRequested });
    }catch(error:any){
        console.log("Error checkUserSent:",error)
        return res
        .status(500)
        .json({ message: "Internal server error at checkUserSent" });
    }
}

const checkAccept = async(req:Request,res:Response)=>{
    try{
           const { userId, bookId } = req.params;
        console.log(bookId,'bookId')
        console.log(userId,'npc')

        if (!userId || !bookId) {
            return res
                .status(400)
                .json({ message: "User ID or Book ID not found in request" });
        }

        const isAccepted = await userService.getCheckAccepted(userId, bookId);
       console.log(isAccepted,'isRequested')
        return res.status(200).json({ isAccepted });
    }catch(error:any){
        console.log("Error checkUserSent:",error)
        return res
        .status(500)
        .json({ message: "Internal server error at checkUserSent" });
    }
}

// const updateNotification =  async(req:Request,res:Response)=>{
// try {
//     const { id } = req.params;
//     const { type, content } = req.body;
// console.log(id,type,content)
//     const updatedNotification = await userService.getUpdateNotification(id,type,content);

//     if (!updatedNotification) {
//         return res.status(404).json({ message: 'Notification not found' });
//     }

//     res.json({ notification: updatedNotification });
// } catch (error) {
//     res.status(500).json({ message: 'Server error' });
// }
// }

// const messageCreation = async (req: Request, res: Response) => {
//     try {
       
//         const message = await userService.getCreateMessage(data);
//         return res.status(200).json({ message });
//     } catch (error: any) {
//         console.log(error.message);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

// const allMessages = async (req: Request, res: Response) => {
//     try {
//         const { userId } = req.params;
//         if(!userId){
//             return res
//                 .status(400)
//                 .json({ message: "User ID not found in request" });
//         }
//         const message = await userService.getAllMessage(userId);
//         return res.status(200).json({ message });
//     } catch (error: any) {
//         console.log(error.message);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };
export {
    signUp,
    generateOtp,
    loginUser,
    loginByGoogle,
    verifyEmail,
    verifyOtp,
    updatePassword,
    rentBook,
    sellBook,
    logoutUser,
    genresOfBooks,
    updateUser,
    books,
    genres,
    bookDetail,
    sendNotification,
    notifications,
    updateProfileImage,
    deleteUserImage,
    getUser,
    // messageCreation,
    // allMessages,
    createChatRoom,
    checkUserSent,
    checkAccept,
    sendUnlinkEmail

};
