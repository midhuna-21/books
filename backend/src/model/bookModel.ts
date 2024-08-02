import mongoose,{Document,Types} from "mongoose";

interface IBooks extends Document {
   // _id:Types.ObjectId;
   bookTitle:string;
   description:string;
   images:string[];
   author:string;
   genre:string;
   publisher:string;
   publishedYear:string;
   rentalFee?:number;
   price?:number;
   isRented?:boolean;
   isSell?:boolean;
   lenderId: string;   
   
}

const bookSchema = new mongoose.Schema({
   bookTitle: {
      type:String
   },
   description:{
      type:String,
   },
   images: [{ type: String }],
   author:{
      type:String
   },
   genre:{
      type:String
   },
   publisher:{
      type:String 
   },
   publishedYear:{
      type:String
   },
   rentalFee:{
      type:Number,
   },
   price:{ 
      types:Number,
   },
   isRented:{
      type:Boolean
   },
   isSell: {
      type:Boolean
   },
   lenderId: {
      type: String,
      ref: "user"
  }
},{timestamps: true})

const books = mongoose.model<IBooks>("books",bookSchema)
export {books,IBooks}