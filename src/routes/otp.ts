import jwt from 'jsonwebtoken';
import logger from '../helper/logger';
import mailSender from '../helper/mailer';
import Otp from '../models/otp';
import { Request, Router } from 'express';
import Student from '../models/students';
import AuthorizedUser from '../models/authorizedUsers';

const router = Router();

type OtpRole = 'student' | 'admin' | 'staff';

const OTP_REQUEST_WINDOW_MS = 5 * 60 * 1000;
const OTP_VERIFY_WINDOW_MS = 5 * 60 * 1000;
const MAX_OTP_REQUESTS_PER_WINDOW = 3;
const MAX_OTP_VERIFY_ATTEMPTS_PER_WINDOW = 5;

type AttemptState = {
    count: number;
    windowStart: number;
};

const otpRequestAttempts = new Map<string, AttemptState>();
const otpVerifyAttempts = new Map<string, AttemptState>();

const isValidRole = (role: unknown): role is OtpRole => {
    return role === 'student' || role === 'admin' || role === 'staff';
};

const consumeAttempt = (
    store: Map<string, AttemptState>,
    key: string,
    windowMs: number,
    maxAttempts: number
): boolean => {
    const now = Date.now();
    const state = store.get(key);

    if (!state || now - state.windowStart > windowMs) {
        store.set(key, { count: 1, windowStart: now });
        return false;
    }

    state.count += 1;
    store.set(key, state);
    return state.count > maxAttempts;
};

const normalizeEmail = (email: unknown): string => {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
};

const normalizeRole = (role: unknown): OtpRole | null => {
    if (role === undefined || role === null) return 'student';
    if (typeof role !== 'string') return null;
    const normalized = role.trim().toLowerCase();
    return isValidRole(normalized) ? normalized : null;
};

const getClientIp = (req: Request): string => {
    return req.ip || req.socket?.remoteAddress || 'unknown';
};

router.post('/', async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                message: 'Request body is missing or invalid. Send JSON with Content-Type: application/json'
            });
        }
        const email = normalizeEmail(req.body.email);
        const role = normalizeRole(req.body.role);

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!role) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const requestAttemptKey = `${getClientIp(req)}:${email}`;
        const tooManyRequests = consumeAttempt(
            otpRequestAttempts,
            requestAttemptKey,
            OTP_REQUEST_WINDOW_MS,
            MAX_OTP_REQUESTS_PER_WINDOW
        );
        if (tooManyRequests) {
            return res.status(429).json({ message: 'Too many OTP requests. Try again later.' });
        }

        let eligibleForOtp = true;

        if (role === 'student') {
            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                eligibleForOtp = false;
            }
        }

        if (role === 'staff' || role === 'admin') {
            const existingAuthorizedUser = await AuthorizedUser.findOne({ email, role });
            if (!existingAuthorizedUser) {
                eligibleForOtp = false;
            }
        }

        if (!eligibleForOtp) {
            return res.status(200).json({ message: 'If eligible, OTP will be sent to this email' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.deleteMany({ email });
        const otpEntry = new Otp({ email, role, otp: otpCode });
        await otpEntry.save();

        try {
            await mailSender(email, "Your OTP for Registration", `<p>Your OTP for registration is: <b>${otpCode}</b>. It will expire in 5 minutes.</p>`);
        } catch (mailErr) {
            await Otp.deleteOne({ _id: otpEntry._id });
            throw mailErr;
        }

        res.json({ message: "OTP sent to email" });
    } catch (err: any) {
        logger.error('Failed to generate or send OTP', err);
        res.status(500).json({ message: 'Failed to process OTP request' });
    }
});

router.post('/verify', async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                message: 'Request body is missing or invalid. Send JSON with Content-Type: application/json'
            });
        }

        const email = normalizeEmail(req.body.email);
        const otp = typeof req.body.otp === 'string' ? req.body.otp.trim() : '';
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ message: 'OTP must be a 6-digit code' });
        }

        const verifyAttemptKey = `${getClientIp(req)}:${email}`;
        const tooManyVerifyAttempts = consumeAttempt(
            otpVerifyAttempts,
            verifyAttemptKey,
            OTP_VERIFY_WINDOW_MS,
            MAX_OTP_VERIFY_ATTEMPTS_PER_WINDOW
        );
        if (tooManyVerifyAttempts) {
            return res.status(429).json({ message: 'Too many OTP verification attempts. Try again later.' });
        }

        const otpEntry = await Otp.findOne({ email, otp });
        if (!otpEntry) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            logger.error('JWT_SECRET is not defined');
            return res.status(500).json({ message: 'Server misconfiguration' });
        }

        otpVerifyAttempts.delete(verifyAttemptKey);

        const token = jwt.sign({ email: otpEntry.email, role: otpEntry.role }, jwtSecret, { expiresIn: '1h' });
        await Otp.deleteOne({ _id: otpEntry._id });
        res.json({ message: "OTP verified", token });
    } catch (err: any) {
        logger.error('Failed to verify OTP', err);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
});

export default router;