import { Request, Response } from "express";
import {
    comparePassword,
    hashPassword,
} from "../utils/ReuseFunctions/passwordValidation";
import * as userService from "../services/userService";
import { AdminService } from "../services/adminService";
import { IGenre } from "../model/genresModel";
// import generateToken from "../utils/generateToken";
import crypto from "crypto";
import sharp, { block } from "sharp";
import {IUser} from '../model/userModel'
import {Types} from 'mongoose'
import { generateTokens } from "../utils/jwt/generateToken";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import config from '../config/config'
import {s3Client} from '../utils/imageFunctions/store'

const adminService = new AdminService();

const randomImageName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString("hex");

const addGenre = async (req: Request, res: Response) => {
    try {
        const { genreName } = req.body;
        const  existGenre = await adminService.getGenreName(genreName)
        if(existGenre){
            return res.status(400).json({ message: "Genre is already exist" });
        }
        const buffer = await sharp(req.file?.buffer)
            .resize({ height: 1920, width: 1080, fit: "contain" })
            .toBuffer();
        if (!genreName) {
            return res
                .status(400)
                .json({ message: "Please provide a genre name" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "Please provide image" });
        }
        const image = randomImageName();
        const params = {
            Bucket: config.BUCKET_NAME,
            Key: image,
            Body: buffer,
            ContentType: req.file.mimetype,
        };
        const command = new PutObjectCommand(params);

        try {
            await s3Client.send(command);
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: "Failed to upload image" });
        }
        const data: Partial<IGenre> = { genreName, image };
        const genre:IGenre | null= await adminService.getCreateGenre(data);
        return res.status(200).json({ genre });
    } catch (error: any) {
        console.error("Error adding genre:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        let admin = await adminService.getAdminByEmail(email);
        if (!admin || !admin.password) {
            return res
                .status(400)
                .json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await comparePassword(password, admin.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }
        const adminId:string = (admin._id as Types.ObjectId).toString()
        const { accessToken, refreshToken } = generateTokens(res, {
            userId:adminId,
            userRole: "admin",
        });
        return res.status(200).json({ admin, accessToken, refreshToken })
   
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getUsersList = async (req: Request, res: Response) => {
    try {
        const users = await adminService.getAllUsers();
        return res.status(200).json(users);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const blockUser = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body;
        const user:IUser | null = await adminService.getBlockUser(_id);
        return res.status(200).json({ user });
    } catch (error: any) {
        console.log(error.message); 
        return res.status(400).json({ message: "Internal server error" });
    }
};

const unBlockUser = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body;
        const user:IUser | null = await adminService.getUnblockUser(_id);
        return res.status(200).json({ user });
    } catch (error: any) {
        console.log(error.message);
        return res.status(400).json({ message: "Internal server error" });
    }
};

export { adminLogin, addGenre, getUsersList, blockUser, unBlockUser};
