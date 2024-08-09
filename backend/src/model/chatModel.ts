import { ObjectId } from "mongodb";
import mongoose,{Document,Types} from "mongoose";

interface IChat extends Document{
   userId?:ObjectId;
   receiver?: ObjectId;
   content?: string;
   isBlock?:boolean;
   createdAt?:Date;
   updatedAt?:Date;
}
const chatSchema = new mongoose.Schema({
   userId:{
      type:String,
      ref:"user"
   },
   receiver:{
      type:String,
      ref:"user"
   },
   content:{
      type:String,
      required:true
   },
   isBlock:{
      type:Boolean,
      default:false
   },
   
},{timestamps: true})

const chat = mongoose.model<IChat>("chat",chatSchema)
export {chat,IChat}