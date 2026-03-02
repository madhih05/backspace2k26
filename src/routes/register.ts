import { Response, Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/users';
import Student from '../models/students';
import AuthorizedUser from '../models/authorizedUsers';
import Otp from '../models/otp';
import Staffs from '../models/staffs';
import mailSender from '../helper/mailer';
import jwt from 'jsonwebtoken';
import authOtp, { AuthenticatedRequest } from '../middleware/auth.otp';
import logger from '../helper/logger';

const router = Router();

router.post('/otp', async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                message: 'Request body is missing or invalid. Send JSON with Content-Type: application/json'
            });
        }
        const email = req.body.email;
        const role = req.body.role || 'student';
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser && role === 'student') {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpEntry = new Otp({ email, role, otp: otpCode });

        await mailSender(email, "Your OTP for Registration", `<p>Your OTP for registration is: <b>${otpCode}</b>. It will expire in 5 minutes.</p>`);
        
        await Otp.deleteMany({ email });
        await otpEntry.save();
        res.json({ message: "OTP sent to email" });
    } catch (err: any) {
        logger.error('Failed to generate or send OTP', err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/verifyOtp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        const otpEntry = await Otp.findOne({ email, otp });
        if (!otpEntry) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        const token = jwt.sign({ email: otpEntry.email, role: otpEntry.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        await Otp.deleteOne({ _id: otpEntry._id });
        res.json({ message: "OTP verified", token });
    } catch (err: any) {
        logger.error('Failed to verify OTP', err);
        res.status(500).json({ message: err.message });
    }
});

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