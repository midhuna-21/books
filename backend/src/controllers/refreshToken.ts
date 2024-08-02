import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserService } from "../services/userService";
import { generateTokens } from "../utils/jwt/generateToken";
import config from "../config/config";
import { AdminService } from "../services/adminService";

const userService = new UserService();
const adminService = new AdminService();

const refreshTokenController = async (req: Request, res: Response) => {
    try {
        // const refreshToken = req.body.token;
        const userRole = req.body.userRole;
        const cookieName = userRole === "admin" ? "adminRefreshToken" : "userRefreshToken";
        const cookieToken = req.cookies[cookieName];
       
        if (!cookieToken ) {
            return res.status(401).json({ message: "No token, authorization denied or token mismatch" });
        }

        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(cookieToken, config.JWT_SECRET || "") as JwtPayload;
        } catch (err) {
            console.error("Token verification error", err);
            return res.status(401).json({ message: "Invalid token" });
        }

        if (!decoded || typeof decoded === "string") {
            return res.status(401).json({ message: "Invalid token" });
        }

        let user;
        if (userRole === "user") {
            user = await userService.getUserById(decoded.userId);
        } else if (userRole === "admin") {
            user = await adminService.getAdminById(decoded.userId);
        } else {
            return res.status(401).json({ message: "Invalid user role" });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userId = (user._id as unknown as string).toString();
        const tokens = generateTokens(res, { userId, userRole });
        return res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch (error) {
        console.error("Error in refreshTokenController", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { refreshTokenController };
