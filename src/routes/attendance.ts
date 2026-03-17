import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authorizeRoles, verifyToken, AuthRequest } from "../middleware/auth.middleware";
import Staff from "../models/staffs";
import Student from "../models/students";
const prisma = new PrismaClient();
const router = Router();
// Only staff can access this route
router.post('/markClass', verifyToken, authorizeRoles('staff'), async (req: AuthRequest, res: Response) => {
    try {
        const role = req.role;
        const userId = req.userId;
        // Expected payload from frontend:
        // date: "2026-03-06"
        // classAttendance: [ { registrationNumber: "REG01", userId: "...", status: "present" }, ... ]
        const { date, classAttendance } = req.body;

        if (!date || !classAttendance || !Array.isArray(classAttendance)) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        // Extract year, month, and the specific day (1-31) from the date string
        const parsedDate = new Date(date);
        const year = parsedDate.getFullYear();
        const month = parsedDate.getMonth() + 1; // JS months are 0-indexed
        const day = parsedDate.getDate();

        const dayColumn = `d${day}`; // e.g., creates the string "d6"

        // Loop through the array of students and update PostgreSQL
        // We use Prisma's 'upsert' -> Update if the row exists, Create if it's the 1st of the month
        const updatePromises = classAttendance.map(async (student) => {
            return prisma.monthlyAttendance.upsert({
                where: {
                    registrationNumber_month_year: {
                        registrationNumber: student.registrationNumber,
                        month: month,
                        year: year
                    }
                },
                update: {
                    [dayColumn]: student.status // Dynamically targets d1, d2, etc.
                },
                create: {
                    registrationNumber: student.registrationNumber,
                    userId: student.userId,
                    month: month,
                    year: year,
                    [dayColumn]: student.status
                }
            });
        });

        // Execute all database calls in parallel for speed
        await Promise.all(updatePromises);

        res.status(200).json({ message: "Class attendance saved to PostgreSQL successfully!" });

    } catch (error) {
        console.error("Postgres Error:", error);
        res.status(500).json({ message: 'Error saving daily attendance', error });
    }
});


export default router;
