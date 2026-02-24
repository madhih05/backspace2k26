import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    email?: string;
}

const authOtp = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const jwtSecret = process.env.JWT_SECRET;
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, jwtSecret as string) as { email: string };
        req.email = decoded.email;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

export default authOtp;