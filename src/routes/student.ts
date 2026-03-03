import  {Request, Response, Router} from 'express';
import Student from '../models/students.js';
import { isStaff } from '../middleware/studentmiddleware.js';

const router = Router();

// Inside student.ts
router.post('/createStudent', async (req: Request, res: Response) => {
    try {
        const { name, registrationNumber, department, yearOfStudy, fatherNumber, motherNumber } = req.body;
        
        console.log("Attempting to create student:", registrationNumber); // Added log

        const existingStudent = await Student.findOne({ registrationNumber });
        if (existingStudent) {
            console.log("Blocked: Student already exists");
            return res.status(400).json({ message: 'Student with this registration number already exists' });
        }

        const newStudent = new Student({
            name,
            registrationNumber,
            department,
            yearOfStudy,
            fatherNumber,
            motherNumber
        });

        const savedStudent = await newStudent.save();
        console.log("Successfully saved student with ID:", savedStudent._id);
        res.status(201).json(savedStudent);
    } catch (error) {
        console.error("Create Student Terminal Error:", error); // Crucial for debugging 500 errors
        res.status(500).json({ message: 'Error creating student', error });
    }
});



router.post('/markAttendance', isStaff, async (req: Request, res: Response) => {
    try {
        const { registrationNumber, date, status } = req.body;
        
        console.log("Searching for:", registrationNumber);
        console.log("Adding status:", status);

        const student = await Student.findOneAndUpdate(
            { registrationNumber },
            { $push: { attendance: { date, status } } },
            { new: true, runValidators: true } // Added runValidators
        );

        if (!student) {
            console.log("Student NOT found in DB");
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log("Updated Student Data:", student.attendance);
        res.status(200).json({message: 'Attendance marked successfully', student });
    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({ message: 'Error marking attendance', error });
    }
});
export default router;
    