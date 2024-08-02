import mongoose from 'mongoose';
import config from './config';

const dbConnect = async (): Promise<void> => {
   try {
      const mongoURI: any = config.MONGODB_URI
      await mongoose.connect(mongoURI);
      console.log('DB Connected');
   } catch (error) {
      console.error('MongoDB Connection Error:', error);
   } 
};  

export default dbConnect; 
  