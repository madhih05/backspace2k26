import { Router } from "express";
import registrationRouter from './register';
import studentRouter from './students';
import otpRouter from './otp';
import loginRouter from './login';
import attendanceRouter from './attendance';

const router = Router();

router.use('/register', registrationRouter);
router.use('/students', studentRouter);
router.use('/otp', otpRouter);
router.use('/login', loginRouter);
router.use('/attendance', attendanceRouter);

export default router;
