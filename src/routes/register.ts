import { Response, Router } from 'express';
import bcrypt from 'bcrypt';
import AuthorizedUser from '../models/authorizedUsers';
import jwt from 'jsonwebtoken';
import authOtp, { AuthenticatedRequest } from '../middleware/auth.otp';
import logger from '../helper/logger';
import Student from '../models/students';
import Staffs from '../models/staffs';
import Admin from '../models/admin';

const router = Router();

router.post('/students', authOtp, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const email = req.email;
        const { username, name, phoneNumber, password, registrationNumber, department, yearOfStudy, fatherNumber, motherNumber } = req.body;
        if (!username || !name || !email || !phoneNumber || !password || !registrationNumber || !department || !yearOfStudy) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingUser = await Student.findOne({$or: [{ email }, { username }, { phoneNumber }]});
        if (existingUser) {
            return res.status(400).json({ message: "User with this email, username, or phone number already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent: any = { username, name, email, phoneNumber, passwordHash: hashedPassword, role: 'student', registrationNumber, department, yearOfStudy };
        if (fatherNumber) newStudent.fatherNumber = fatherNumber;
        if (motherNumber) newStudent.motherNumber = motherNumber;
        const student = new Student(newStudent);

        await student.save();

        const token = jwt.sign({ email, role: 'student' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

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
        
        if (!email) {
            return res.status(400).json({ message: "Email and role are required" });
        }

        const authorizedUser = await AuthorizedUser.findOne({ email, role: 'admin' });
        if (!authorizedUser) {
            return res.status(403).json({ message: "You are not authorized to create an admin account" });
        }

        const { username, name, phoneNumber, password } = req.body;

        if (!username || !name || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await Admin.findOne({$or: [{ email }, { username }, { phoneNumber }]});
        if (existingUser) {
            return res.status(400).json({ message: "User with this email, username, or phone number already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({ username, name, email, phoneNumber, passwordHash: hashedPassword});

        const user = await newAdmin.save();

        const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET as string, { expiresIn: '4h' });

        res.json({ message: "Admin registration successful", token, user });
    }
catch (err: any) {
    logger.error('Failed to register admin', err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/staff', authOtp, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const email = req.email;
        
        if (!email) {
            return res.status(400).json({ message: "Email and role are required" });
        }

        const authorizedUser = await AuthorizedUser.findOne({ email, role: 'staff' });
        if (!authorizedUser) {
            return res.status(403).json({ message: "You are not authorized to create a staff account" });
        }

        const { username, name, phoneNumber, password, tutorOf, year, subjects } = req.body;

        if (!username || !name || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await Staffs.findOne({$or: [{ email }, { username }, { phoneNumber }]});
        if (existingUser) {
            return res.status(400).json({ message: "User with this email, username, or phone number already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = new Staffs({ username, name, email, phoneNumber, passwordHash: hashedPassword, tutorOf, year, subjects });

        const user = await newStaff.save();

        const token = jwt.sign({ email, role: 'staff' }, process.env.JWT_SECRET as string, { expiresIn: '4h' });

        res.json({ message: "Staff registration successful", token, user });
    }
catch (err: any) {
    logger.error('Failed to register staff', err);
        res.status(500).json({ message: err.message });
    }
});

export default router;