import { Response, Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/users';
import Student from '../models/students';
import Otp from '../models/otp';
import mailSender from '../helper/mailer';
import jwt from 'jsonwebtoken';
import authOtp, { AuthenticatedRequest } from '../middleware/auth.otp';

const router = Router();

router.post('/otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });

        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpEntry = new Otp({ email, otp: otpCode });

        await mailSender(email, "Your OTP for Registration", `<p>Your OTP for registration is: <b>${otpCode}</b>. It will expire in 5 minutes.</p>`);
        
        await otpEntry.save();
        res.json({ message: "OTP sent to email" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/student', authOtp, async (req: AuthenticatedRequest, res: Response) => {
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
        res.status(500).json({ message: err.message });
    }
});

export default router;