import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../../config/config';

export interface AuthenticatedRequest extends Request {
  userId?: string; 
  adminId?: string; 
  userRole?: string;  
}

const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'No token provided!' });
  }

  const accessToken = token.split(' ')[1];
  jwt.verify(accessToken, config.JWT_SECRET as string, (err, decoded: any) => {
    if (err) { 
      return res.status(401).json({ message: 'Unauthorized!' }); 
    }   
    if (decoded && decoded.userRole === "user") {
      req.userId = decoded.userId; 
    } else if (decoded && decoded.userRole === "admin") {   
      req.adminId = decoded.userId;
    } else {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    next();
  });
};

export { verifyToken };
