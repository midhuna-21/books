import bcrypt from 'bcryptjs';

export const hashPassword = async(password: string)=>{
   let securePassword=await bcrypt.hash(password,10)
   return securePassword
}

export const comparePassword = async(password: string,hashPassword: string):Promise<Boolean>=>{
   return await bcrypt.compare(password,hashPassword)
}