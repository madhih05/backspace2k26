import { verifyToken, authorizeRoles, AuthRequest } from "../middleware/auth.middleware";
import students from "../models/students";
import staffs from "../models/staffs";
import admin from "../models/admin";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        let role = 'student';

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        let user = await students.findOne({ email });
        if (!user) {
            user = await staffs.findOne({ email });
            role = 'staff';
        }
        if (!user) {
            user = await admin.findOne({ email });
            role = 'admin';
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/me', verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const role = req.role;

        if (!userId || !role) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let user;
        if (role === 'student') {
            user = await students.findById(userId).select('-passwordHash');
        } else if (role === 'staff') {
            user = await staffs.findById(userId).select('-passwordHash');
        } else if (role === 'admin') {
            user = await admin.findById(userId).select('-passwordHash');
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ id: user._id });
    } catch (error) {
        console.error("Fetch user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;