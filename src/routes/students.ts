import { Router } from 'express';
import Student from '../models/students';
const router = Router();
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';
import Staff from '../models/staffs';


router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const role = req.role;
        const userId = req.userId;
        if (role === "student") {
            const student = await Student.findOne({userId}).select('userId registrationNumber department yearOfStudy').populate({
                path: 'userId',
                select: 'name'
            })
            return res.json(student);
        }
        const query = req.query.q as string | undefined;
        const year = req.query.year as string | undefined;
        const dept = req.query.dept as string | undefined;
        let filter: any = {};
        
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { registrationNumber: { $regex: query, $options: 'i' } }
            ];
        }
        if (year) {
            filter.age = { $gte: Number(year) };
        }
        if (dept) {
            filter.grade = dept;
        }
        if (role === "staff") {
            const staff = await Staff.findOne({userId}).select('userId department year');
            filter.department = 
            const students = await 
        }
        const students = await Student.find(filter).select('userId registrationNumber department yearOfStudy').populate({
        path: 'userId',
        select: 'name'
    });
        res.json(students);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;