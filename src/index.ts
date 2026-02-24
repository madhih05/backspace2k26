import 'dotenv/config'; // Loads variables from .env
import mongoose from "mongoose";
import express, { Request, Response } from 'express';
import path from 'path';
import registrationRouter from './routes/register';
import studentRouter from './routes/students';

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = '0.0.0.0';

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
    console.error('MONGODB_URI is not defined in .env file');
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongodbUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/backspace', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/backspace.html'));
});

app.use('/register', registrationRouter);
app.use('/students', studentRouter);

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});