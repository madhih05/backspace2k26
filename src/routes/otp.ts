import User from '../models/users';
import jwt from 'jsonwebtoken';
import logger from '../helper/logger';
import mailSender from '../helper/mailer';
import Otp from '../models/otp';
import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
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

router.post('/verify', async (req, res) => {
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

export default router;