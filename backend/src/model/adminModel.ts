import mongoose,{Document,Types} from "mongoose";

interface IAdmin extends Document{
   email:string;
   password:string;
   isAdmin:boolean;
}
const adminSchema = new mongoose.Schema({
   email:{
      type:String,
      unique:true
   },
   password:{
      type:String
   },
   isAdmin: {
      type:Boolean,
      default:false
   }
})

const admin = mongoose.model<IAdmin>("admin",adminSchema)
export {admin,IAdmin}