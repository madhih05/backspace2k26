import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: 'user' | 'staff' | 'admin';
    };  
}

export const isStaff = (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (userRole === 'staff' || userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Staff only' });
    }
};