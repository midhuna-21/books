import nodemailer from 'nodemailer'
import config from '../../config/config';

export const otpGenerate = async(email:string)=>{
   const transporter = nodemailer.createTransport({
      service:'gmail',
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user:config.EMAIL,
        pass:config.APP_PASSWORD,
      },
    });

    let otp = Math.floor(1000 + Math.random() * 9000)
  
    const info = await transporter.sendMail( {
      from: '"Book.D" <krishnamidhuna850@gmail.com>', 
      to: email, 
      subject: "Your OTP for login", 
      text: `Your OTP for login is ${otp}`, 
      html: `<h2> OTP for login </h2>
      <p>Your OTP for login in Book.D <strong>${otp}</strong></p>`, 
    })
    
    return otp

}