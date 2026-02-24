import { Router } from 'express';
import Student from '../models/students';
const router = Router();


router.get('/', async (req, res) => {
    try {
        const query = req.query.q as string | undefined;
        const year = req.query.year as string | undefined;
        const dept = req.query.dept as string | undefined;
        let filter: any = {};
        
        if (query) {
            filter.name = { $regex: query, $options: 'i' };
        }
        if (year) {
            filter.age = { $gte: Number(year) };
        }
        if (dept) {
            filter.grade = dept;
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