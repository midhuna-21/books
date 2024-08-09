import{ AdminRepository } from '../respository/adminRespository'
import {IGenre} from '../model/genresModel'
import {IUser} from '../model/userModel'
import {Genre} from '../interfaces/data'
import {IAdmin} from '../model/adminModel'

const adminRepository = new AdminRepository()

export class AdminService{

   async getAdminByEmail(email:string):Promise<IUser | null>{
      try{
          return await adminRepository.findAdminByEmail(email)
      }catch(error){
          console.log("Error getAdminByEmail:",error);
          throw error
      }
  }
   async getGenreName(genreName:string):Promise<IGenre | null>{
      try{
         return await adminRepository.findGenreByName(genreName)
      }catch(error){
         console.log("Error getGenreName:",error);
         throw error
   }
   }
   async getCreateGenre(data:Partial<Genre>):Promise<IGenre | null>{
      try{
         return await adminRepository.createGenre(data)
      }catch(error){
         console.log("Error getGenreName:",error);
         throw error
   }
   }
   // async getCreateCustomGenre(genreName:Partial<Genre>):Promise<IGenre | null>{
   //    try{
   //       return await adminRepository.createCustomGenre(genreName)
   //    }catch(error){
   //       console.log("Error getGenreName:",error);
   //       throw error
   // }
   // }
   async getAllUsers(){
      try{
         return await adminRepository.findAllUsers()
      }catch(error){
         console.log("Error getAllUsers:",error);
         throw error
   }
   }
   async getBlockUser(_id:string):Promise<IUser | null>{
      try{
         return await adminRepository.blockUser(_id)
      }catch(error){
         console.log("Error getBlockUser:",error);
         throw error
   }
   }
   async getUnblockUser(_id:string):Promise<IUser | null>{
      try{
         return await adminRepository.unBlockUser(_id)
      }catch(error){
         console.log("Error getAllUsers:",error);
         throw error
   }
   }
   async getAdminById(_id:string):Promise<IAdmin | null>{
      try{
          return await adminRepository.findAdminById(_id)
      }catch(error){
          console.log("Error getAdminById:",error);
          throw error
      }
  }
}

// const getUnBlockUser =async(_id:string)=>{
//    return await adminRepository.findUnBlockUser(_id)
// }


// const getBlockUser =async(_id:string)=>{
//    return await adminRepository.findBlockUser(_id)
// }

// const getAllUsers =async()=>{
//    return await adminRepository.findAllUsers()
// }

// const getAddGenre = async(genreName:string, image:string)=>{
//    return await adminRepository.addGenre(genreName,image)
// }

// const getGenreName = async(genreName:string)=>{
//    return await adminRepository.findGenreName(genreName)
// }



