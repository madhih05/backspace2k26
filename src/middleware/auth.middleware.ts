import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


const getJwtSecret = () => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return jwtSecret;
};

export interface AuthRequest extends Request {
    userId?: string;
    role?: string;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const jwtSecret = getJwtSecret();
        const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string };
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    }
    catch (error) {
        if (error instanceof Error && error.message === "JWT_SECRET is not configured") {
            return res.status(500).json({ message: "Server configuration error" });
        }
        res.status(401).json({ message: "Invalid token" });
    }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.role || !allowedRoles.includes(req.role)) {
            return res.status(403).json({ message: "Forbidden: You don't have permission to access this resource" });
        }
        next();
    };
};