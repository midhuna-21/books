import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import config from '../../config/config'

const storage = multer.memoryStorage()

const upload = multer({ storage: storage });

export default upload;


const s3Client = new S3Client({
   credentials: {
       accessKeyId: config.ACCESS_KEY || "",
       secretAccessKey: config.SECRET_ACCESS_KEY || "",
   },
   region: config.BUCKET_REGION || "",
});

export {s3Client}