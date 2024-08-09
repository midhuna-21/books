
import {ObjectId} from 'mongoose';

export interface User {
   userId?:string;
   name?:string;
   email?:string;
   image?:string;
   phone?:string;
   password?:string;
   isBlocked?:boolean;
   address?:string;
   isReported?:boolean;
   isGoogle?:boolean;
   city?:string;
   district?:string;
   state?:string;

}

export interface Books{
   bookTitle:string;
   description:string;
   images:string[];
   author:string;
   genre:string;
   publisher:string;
   publishedYear:string
   rentalFee?:number;
   price?:number;
   isRented?:boolean;
   isSell?:boolean;
   lenderId:string;
}

export interface Admin {
   email:string;
   password:string;
   isAdmin:boolean;
}

export interface Genre{
   genreName: string;
   image?: string
}

export type Notification = {
   userId?: string;
   receiverId?: string;
   bookId?:string;
   type:string;
   content?: string;
   isReject?:boolean;
   isAccepted?:boolean;
}

export type ChatRoom = {
   userId?:ObjectId
   receiverId?: string;

}