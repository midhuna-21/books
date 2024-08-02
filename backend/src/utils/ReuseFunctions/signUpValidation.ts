import { userData } from "./interface/data"
// import { findEmail } from "../../respository/userRepository"

export const verifySignUp=async(data:userData)=>{
   try{
      const {name,email,phone} = data
   // let existUser=await findEmail(email)
   // if(existUser){
   //    return 'User already exist'
   // }
   return "Signup scuccessful"
   }catch(error: any){
      console.log(error.message)
   }
}