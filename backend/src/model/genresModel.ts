import mongoose,{Document,Types} from "mongoose";

interface IGenre extends Document{
   genreName: string;
   image?: string
}
const genreSchema = new mongoose.Schema({
   genreName: {
      type:String
   },
   image:{
      type:String
   },
   customGenre:{
      type:String
   }
},{timestamps:true})

const genres = mongoose.model<IGenre>("genres",genreSchema)
export {genres,IGenre}