import { Response, Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/users';
import Student from '../models/students';
import AuthorizedUser from '../models/authorizedUsers';
import Staffs from '../models/staffs';
import jwt from 'jsonwebtoken';
import authOtp, { AuthenticatedRequest } from '../middleware/auth.otp';
import logger from '../helper/logger';

const router = Router();

router.post('/students', authOtp, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const email = req.email;
        const { username, name, phoneNumber, password, registrationNumber, department, yearOfStudy, fatherNumber, motherNumber } = req.body;
        if (!username || !name || !email || !phoneNumber || !password || !registrationNumber || !department || !yearOfStudy) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingUser = await User.findOne({$or: [{ email }, { username }, { phoneNumber }]});
        if (existingUser) {
            return res.status(400).json({ message: "User with this email, username, or phone number already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, name, email, phoneNumber, passwordHash: hashedPassword, role: 'student' });
        const savedUser = await user.save();

        const student = new Student({
            userId: savedUser._id,
            registrationNumber,
            department,
            yearOfStudy,
            fatherNumber,
            motherNumber
        });
        await student.save();

        const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.json({ message: "Registration successful", token });

    }
catch (err: any) {
    logger.error('Failed to register student', err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/admin', authOtp, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const email = req.email;
        const role = req.role;        
        
        if (!email || !role) {
            return res.status(400).json({ message: "Email and role are required" });
        }

        const authorizedUser = await AuthorizedUser.findOne({ email, role });
        if (!authorizedUser) {
            return res.status(403).json({ message: "You are not authorized to create an admin account" });
        }
 
        const { username, name, phoneNumber, password } = req.body;

        if (!username || !name || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({$or: [{ email }, { username }, { phoneNumber }]});

        if (existingUser) {
            return res.status(400).json({ message: "User with this email, username, or phone number already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, name, email, phoneNumber, passwordHash: hashedPassword, role });

        const savedUser = await user.save();

        if (role === 'staff') {
            const { tutorOf, year, subjects } = req.body;
            if (!tutorOf || !year || !subjects) {
                User.deleteOne({ _id: savedUser._id }).catch(err => logger.error('Failed to clean up user after staff registration failure', err));
                return res.status(400).json({ message: "TutorOf, year, and subjects are required for staff role" });
            }

            const staff = new Staffs({
                userId: savedUser._id,
                tutorOf,
                year,
                subjects
            });
            await staff.save();
        }

        const token = jwt.sign({ email, role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({ message: "Admin registration successful", token, user });
    }
catch (err: any) {
    logger.error('Failed to register admin', err);
        res.status(500).json({ message: err.message });
    }
});

export default router;