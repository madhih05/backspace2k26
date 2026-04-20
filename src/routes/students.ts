import { Router } from 'express';
import Student from '../models/students';
const router = Router();
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

            const filter: any = {};
            if (staff.tutorOf) {
                filter.department = staff.tutorOf;
            }
            if (staff.year) {
                filter.yearOfStudy = staff.year;
            }

            const students = await Student.find(filter)
                .select('userId registrationNumber department yearOfStudy')
                .populate({
                    path: 'userId',
                    select: 'name'
                });

            return res.json(students);
        }

        return res.status(403).json({ message: 'Forbidden' });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        res.status(500).json({ message });
    }
});

export default router;