import { ObjectId } from "mongodb";
import mongoose,{Document,Types} from "mongoose";

interface INotification extends Document{
   userId?: ObjectId;
   receiverId?: ObjectId;
   bookId?:ObjectId;
   type?:string;
   content?: string;
   isReject?:boolean;
   isAccepted?:boolean;
   createdAt?:Date;
   updatedAt?:Date;
}
const notificationSchema = new mongoose.Schema({
   userId:{
      type:String,
      ref:"user"
   },
   receiverId:{
      type:String,
      ref:"user"
   },
   bookId:{
      type:String,
      ref:"books"
   },
   type:{
      type:String,
      required:true,
   },
   content:{
      type:String,
      required:true
   },
   isReject:{
      type:Boolean,
      default:false
   },
   isAccepted:{
      type:Boolean,
      default:false
   },
   
},{timestamps: true})

const notification = mongoose.model<INotification>("notification",notificationSchema)
export {notification,INotification}