import express from 'express';
import path from 'path';
//import { fileURLToPath } from 'url';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import studentRoutes from './routes/student.js';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = '0.0.0.0';
const MONGO_URL: string = process.env.MONGOOSE_URL || 'mongodb://localhost:27017/Student_Attendance'

mongoose.connect(MONGO_URL)
.then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(morgan('dev'));

// Middleware to parse JSON bodies
app.use(express.json());
// Use student routes
app.use('/api/students', studentRoutes);

// Serve index.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/backspace', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/backspace.html'));
});

app.listen(PORT, HOST,() => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
