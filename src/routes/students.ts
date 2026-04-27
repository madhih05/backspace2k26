import { Router } from 'express';
import Student from '../models/students';
const router = Router();
import bcrypt from 'bcrypt';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';
import Staff from '../models/staffs';


router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const role = req.role;
        const userId = req.userId;

        if (!role || !userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (role === "student") {
            const student = await Student.findOne({ userId })
                .select('userId registrationNumber department yearOfStudy')
                .populate({
                path: 'userId',
                select: 'name'
            });

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            return res.json(student);
        }

        if (role === "admin") {
            const students = await Student.find({})
                .select('userId registrationNumber department yearOfStudy')
                .populate({
                    path: 'userId',
                    select: 'name'
                });

            return res.json(students);
        }

        if (role === "staff") {
            const staff = await Staff.findOne({ userId }).select('tutorOf year');
            if (!staff) {
                return res.status(404).json({ message: 'Staff not found' });
            }

            const andConditions: Record<string, unknown>[] = [];
            if (staff.tutorOf) {
                andConditions.push({ department: staff.tutorOf });
            }
            if (staff.year) {
                andConditions.push({ yearOfStudy: staff.year });
            }

            const filter = andConditions.length ? { $and: andConditions } : {};

            const students = await Student.find(filter)
                .select('userId registrationNumber department yearOfStudy')
                .populate({
                    path: 'userId',
                    select: 'name'
                });

            if (students.length === 0) {
                return res.status(404).json({ message: 'No students found for your department/year' });
            }

            return res.json(students);
        }

        return res.status(403).json({ message: 'Forbidden' });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        res.status(500).json({ message });
    }
});

router.post('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const role = req.role;
        const userId = req.userId;

        const { username, name, email, phoneNumber, password, registrationNumber, department, yearOfStudy, fatherNumber, motherNumber } = req.body;
        if (!role || !userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (role !== 'admin' && role !== 'staff') {
            return res.status(403).json({ message: 'Forbidden' });
        }


        if (!username || !name || !email || !phoneNumber || !password || !registrationNumber || !department || !yearOfStudy) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (role === 'staff') {
            const staff = await Staff.findOne({ userId });
            if (!staff) {
                return res.status(403).json({ message: 'only registered staffs can create new students' });
            }

            if (!staff.tutorOf || !staff.year || (staff.tutorOf !== department || staff.year !== yearOfStudy)) {
                return res.status(403).json({ message: 'you can only add students to your own class' });
            }
        }

        const existingUser = await Student.findOne({ $or: [{ email }, { phoneNumber }, { registrationNumber }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Email, phone number, or registration number already in use' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            userId,
            username,
            name,
            email,
            phoneNumber,
            passwordHash,
            registrationNumber,
            department,
            yearOfStudy,
            fatherNumber,
            motherNumber
        });

        await newStudent.save();

        res.status(201).json({ message: 'Student created successfully' });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        res.status(500).json({ message });
    }
});

export default router;