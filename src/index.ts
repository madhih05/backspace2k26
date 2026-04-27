import 'dotenv/config'; // Loads variables from .env
import mongoose from "mongoose";
import express, { Request, Response } from 'express';
import path from 'path';
import logger from './helper/logger';
import requestLogger from './middleware/request.logger';
import apiRoutes from './routes/api';

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = '0.0.0.0';

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
    logger.error('MONGODB_URI is not defined in .env file');
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongodbUri)
    .then(() => logger.info('Connected to MongoDB'))
    .catch((err) => logger.error('MongoDB connection error', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use((req: Request, res: Response, next) => {
    const origin = req.headers.origin;
    if (origin === 'http://localhost:5173') {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRoutes);

app.listen(PORT, HOST, () => {
    logger.info(`Server running at http://${HOST}:${PORT}`);
});