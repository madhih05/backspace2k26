type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatMeta = (meta?: unknown): string => {
    if (meta === undefined) return '';
    if (meta instanceof Error) {
        return `\n${meta.stack || meta.message}`;
    }
    try {
        return ` ${JSON.stringify(meta)}`;
    } catch {
        return ` ${String(meta)}`;
    }
};

const log = (level: LogLevel, message: string, meta?: unknown) => {
    const timestamp = new Date().toISOString();
    const output = `[${timestamp}] [${level.toUpperCase()}] ${message}${formatMeta(meta)}`;

    if (level === 'error') {
        console.error(output);
        return;
    }

    if (level === 'warn') {
        console.warn(output);
        return;
    }

    if (level === 'debug' && process.env.NODE_ENV === 'production') {
        return;
    }

    console.log(output);
};

const logger = {
    info: (message: string, meta?: unknown) => log('info', message, meta),
    warn: (message: string, meta?: unknown) => log('warn', message, meta),
    error: (message: string, meta?: unknown) => log('error', message, meta),
    debug: (message: string, meta?: unknown) => log('debug', message, meta),
};

export default logger;