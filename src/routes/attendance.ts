import { Request, Response, Router } from "express";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { authorizeRoles, verifyToken, AuthRequest } from "../middleware/auth.middleware";
import Staff from "../models/staffs";
import Student from "../models/students";

const prisma = new PrismaClient();
const router = Router();

//Get Method is to retraive the student details and the post method is to mark the attendance of the students in the class. Only staff can access this route

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (req.role !== 'staff' && req.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Only staff and admin can access this route." });
        }

        if (req.role === 'staff') { 
            // 1. You fetch the staff details correctly
            const staff = await Staff.findOne({ userId: req.userId });

            // 2. Add a quick safety check in case the staff record doesn't exist 
            // or doesn't have an assigned year yet.
            const staffManagedYear = (staff as any)?.managedYear;
            if (!staff || !staffManagedYear) { 
                return res.status(403).json({ message: "Staff member not found or has no assigned year." });
            }

            // 3. THE FILTER: Replace {} with your filter logic.
            // Match the student's 'yearOfStudy' to the staff's 'managedYear'.
            const students = await Student.find(
                { yearOfStudy: staffManagedYear }, 
                'registrationNumber name'
            );
            
            res.status(200).json({ students });

        } else if (req.role === 'admin') {
            // Admin still gets the empty {} filter to see everyone
            const students = await Student.find({}, 'registrationNumber name yearOfStudy department');
            res.status(200).json({ students });
        }

    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const role = req.role;
        const studentId = req.params.id;
        
        // Extract query parameters for the attendance filter
        const dateQuery = req.query.date as string;   // e.g., "2026-03-06"
        const monthQuery = req.query.month as string; // e.g., "3"
        const yearQuery = req.query.year as string;   // e.g., "2026"

        // ==========================================
        // STEP 1: SECURELY FETCH THE STUDENT PROFILE
        // ==========================================
        
        let studentQuery: any = { _id: studentId };
        
        if (role === "student") {
            // Students can ONLY view their own profile
            studentQuery.userId = userId; 
            
        } else if (role === "staff") {
            // Staff can ONLY view students in their assigned year
            const staff = await Staff.findOne({ userId: userId });
            const staffManagedYear = (staff as any)?.managedYear;
            
            if (!staff || !staffManagedYear) { 
                return res.status(403).json({ message: "Staff member not found or has no assigned year." });
            }
            
            // Inject the staff's year into the query filter
            studentQuery.yearOfStudy = staffManagedYear;
            
        } else if (role !== "admin") {
            // If they aren't a student, staff, or admin, boot them out
            return res.status(403).json({ message: 'Forbidden' });
        }

        
        // Execute the secure query
        const student = await Student.findOne(studentQuery)
            .select('userId registrationNumber department yearOfStudy')
            .populate({
                path: 'userId',
                select: 'name' ,
                strictPopulate:false,
                model:'User'// Assumes you added the `ref: 'User'` to your schema!
            });

        if (!student) {
            return res.status(404).json({ 
                message: 'Student not found, or you do not have permission to view this student.' 
            });
        }

        // ==========================================
        // STEP 2: FETCH ATTENDANCE (POSTGRESQL via Prisma)
        // ==========================================
        
        const regNumber = student.registrationNumber;
        let attendanceRecords;

        if (monthQuery && yearQuery) {
            attendanceRecords = await prisma.monthlyAttendance.findMany({
                where: {
                    registrationNumber: regNumber,
                    month: parseInt(monthQuery),
                    year: parseInt(yearQuery)
                }
            });
        } 
        else if (dateQuery) {
            const searchDate = new Date(dateQuery);
            const day = searchDate.getDate(); // Extracts the day (1-31)
            const month = searchDate.getMonth() + 1;
            const year = searchDate.getFullYear();

            // We use findFirst since a student only has one row per month
            const monthRecord = await prisma.monthlyAttendance.findFirst({
                where: {
                    registrationNumber: regNumber,
                    month: month,
                    year: year
                }
            });

            if (monthRecord) {
                // Dynamically target the exact day's column (e.g., 'd6')
                const dayColumn = `d${day}` as keyof typeof monthRecord;
                const dayStatus = monthRecord[dayColumn];

                // Return a clean object with just the requested date's status
                attendanceRecords = {
                    requestedDate: dateQuery,
                    status: dayStatus || "not marked", // Returns the status, or "not marked" if null
                    monthRow: monthRecord // We can also pass the whole row just in case the frontend needs it
                };
            } else {
                // If no record exists for that month at all
                attendanceRecords = {
                    requestedDate: dateQuery,
                    status: "not marked",
                    monthRow: null
                };
            }
        }
        else {
            attendanceRecords = await prisma.monthlyAttendance.findMany({
                where: { registrationNumber: regNumber },
                orderBy: [
                    { year: 'desc' },
                    { month: 'desc' }
                ]
            });
        }

        // ==========================================
        // STEP 3: RETURN COMBINED DATA
        // ==========================================
        
        return res.json({
            student: student,
            attendance: attendanceRecords
        });

    } catch (err: unknown) {
        console.error("Error fetching student profile and attendance:", err);
        const message = err instanceof Error ? err.message : 'Internal server error';
        res.status(500).json({ message });
    }
});

// Only staff can access this route
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

        // 1. Map the array to create an array of Prisma operations
        // Notice we removed 'async' here so it just builds an array of query instructions
        const operations = classAttendance.map((student) => {
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

        // 2. Execute all database calls safely using a single Prisma transaction
        await prisma.$transaction(operations);

        res.status(200).json({ message: "Class attendance saved to PostgreSQL successfully!" });

    } catch (error) {
        console.error("Postgres Error:", error);
        res.status(500).json({ message: 'Error saving daily attendance', error });
    }
});


// ==========================================
// 2. BASIC ATTENDANCE REPORT (Staff & Admin)
// ==========================================
router.get('/report', verifyToken, authorizeRoles('staff', 'admin'), async (req: AuthRequest, res: Response) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Please provide both month and year (e.g., ?month=3&year=2026)" });
        }

        const report = await prisma.monthlyAttendance.findMany({
            where: {
                month: Number(month),
                year: Number(year)
            },
            orderBy: {
                registrationNumber: 'asc'
            }
        });

        if (report.length === 0) {
            return res.status(404).json({ message: "No attendance records found for this month." });
        }

        res.status(200).json({
            message: `Attendance report for ${month}/${year}`,
            totalStudents: report.length,
            data: report
        });

    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ message: "Internal server error while fetching report" });
    }
});


// ==========================================
// 3. CALCULATED MANAGER REPORT (Admin & Staff)
// ==========================================
router.get('/manager-report', verifyToken, authorizeRoles('admin', 'staff'), async (req: AuthRequest, res: Response) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Please provide both month and year (e.g., ?month=3&year=2026)" });
        }

        const rawData = await prisma.monthlyAttendance.findMany({
            where: {
                month: Number(month),
                year: Number(year)
            },
            orderBy: {
                registrationNumber: 'asc'
            }
        });

        if (rawData.length === 0) {
            return res.status(404).json({ message: "No attendance records found for this month." });
        }

        const calculatedReport = rawData.map((studentRecord) => {
            let presentCount = 0;
            let absentCount = 0;
            let lateCount = 0;

            for (let i = 1; i <= 31; i++) {
                const dayKey = `d${i}` as keyof typeof studentRecord;
                const status = studentRecord[dayKey];

                if (status === 'present') presentCount++;
                if (status === 'absent') absentCount++;
                if (status === 'late') lateCount++;
            }

            const totalDaysMarked = presentCount + absentCount + lateCount;
            const attendancePercentage = totalDaysMarked > 0 
                ? ((presentCount / totalDaysMarked) * 100).toFixed(1) + '%' 
                : '0%';

            return {
                registrationNumber: studentRecord.registrationNumber,
                summary: {
                    totalPresent: presentCount,
                    totalAbsent: absentCount,
                    totalLate: lateCount,
                    percentage: attendancePercentage
                }
            };
        });

        res.status(200).json({
            message: `Manager Summary for ${month}/${year}`,
            totalStudents: calculatedReport.length,
            report: calculatedReport
        });

    } catch (error) {
        console.error("Error generating manager report:", error);
        res.status(500).json({ message: "Internal server error while generating report" });
    }
});



export default router;
