import mongoose, {Document,Types} from "mongoose";

interface IUser extends Document {
    _id: Types.ObjectId;
    name:string;
    email:string;
    image?:string;
    phone?:string;
    password:string;
    isBlocked?:boolean;
    address?:string; 
    isReported?:boolean;
    isGoogle?:boolean;
    city?:string;
    district?:string;
    state?:string;
    resetToken?:string;
    resetTokenExpiration?:number;

}
const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    image: {
        type: String,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    address:{
        type:String,
    },
    isReported: { 
       type: Boolean,
       default: false 
   },
    isGoogle: {  
      type: Boolean,  
      default: false 
    },
    city:{
        type:String
    },
    district:{
        type:String,
    },
    state:{
        type:String
    },
    resetToken:{
        type:String
    },
    resetTokenExpiration:{
        type:Number
    },
    
},{timestamps:true});

const user = mongoose.model<IUser>("user", userSchema);
export { user,IUser };
