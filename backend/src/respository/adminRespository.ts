import { genres ,IGenre} from '../model/genresModel';
import {user,IUser} from '../model/userModel';
import {Genre} from '../interfaces/data';
import {admin,IAdmin} from '../model/adminModel';


export class AdminRepository{

   async findAdminByEmail(email:string):Promise<IUser | null>{
      try{
          return await admin.findOne({email,isAdmin:true})
      }catch(error){
          console.log("Error findAdminByEmail:",error);
          throw error
      }
  }
   async findGenreByName(genreName:string):Promise<IGenre | null>{
      try{
         return await genres.findOne({genreName:genreName})
      }catch(error){
            console.log("Error findGenreByName:",error);
            throw error
      }
   }
   async createGenre(data:Partial<Genre>):Promise<IGenre | null>{
      try{
         return await new genres({genreName:data.genreName,image:data.image}).save()
      }catch(error){
         console.log("Error createGenre:",error);
         throw error
     }
   }
   // async createCustomGenre(genreName:Partial<Genre>):Promise<IGenre | null>{
   //    try{
   //       return await new genres({genreName:genreName}).save()
   //    }catch(error){
   //       console.log("Error createGenre:",error);
   //       throw error
   //   }
   // }
   async findAllUsers(){
      try{
         return await user.find()
      }catch(error){
         console.log("Error findAllUsers:",error);
         throw error
     }
   }
   async blockUser(_id:string):Promise<IUser | null>{
      try{
         return await user.findByIdAndUpdate(_id,{isBlocked: true},{new:true})
      }catch(error){
         console.log("Error blockUser:",error);
         throw error
     }
   }
   async unBlockUser(_id:string):Promise<IUser | null>{
      try{
         return await user.findByIdAndUpdate(_id,{isBlocked:false},{new:true})
      }catch(error){
         console.log("Error unBlockUser:",error);
         throw error
     }
   }
   async findAdminById(_id:string):Promise<IAdmin | null>{
      try{
          return await admin.findById(_id)
      }catch(error){
          console.log("Error findUserById:",error);
          throw error
      }
  }
}

// const findUnBlockUser = async(_id:string)=>{
//    try{
//       const userToUnBlock = await user.findByIdAndUpdate(_id,{isBlocked:false},{new:true})
//       return userToUnBlock
//    }catch(error:any){ 
//       console.log(error.message);
//         throw new Error("Internal server error" );
//    }
// }

// const findBlockUser = async(_id:string)=>{
//    try{
//       const userToBlock = await user.findByIdAndUpdate(_id, { isBlocked: true }, { new: true });
//       return userToBlock
//    }catch(error:any){
//       console.log(error.message);
//         throw new Error("Internal server error" );
//    }
// }

// const findAllUsers = async()=>{
//    try{
//       const users = await user.find()
//       return users
//    }catch(error:any){
//       console.log(error.message);
//         throw new Error("Internal server error" );
//    }
// }

// const addGenre = async( genreName:string,image:string)=>{
//    const newGenre = new genres ({
//       genreName,
//       image
//    })
//    return await newGenre.save()
// }
// const findGenreName = async (genreName: string) => {
//   console.log('find genrename');
//   const genre = await genres.findOne({ genreName:genreName }); 
//   console.log(genre, 'genre kitti');
//   return genre;
// };


