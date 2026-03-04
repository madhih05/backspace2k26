import { NextFunction, Request, Response } from 'express';
import logger from '../helper/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const durationNs = process.hrtime.bigint() - start;
        const durationMs = Number(durationNs) / 1_000_000;

        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(2)}ms`, {
            ip: req.ip,
        });
    });

    next();
};

export default requestLogger;