import { createLogger, format, transports, Logger } from 'winston';

const level = process.env.LOG_LEVEL || 'info';

export const logger: Logger = createLogger({
    level,
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
    ),
    defaultMeta: {
        service: process.env.SERVICE_NAME || 'transnovasi',
        env: process.env.NODE_ENV || 'development',
    },
    transports: [new transports.Console()],
});

export const getLogger = (component?: string): Logger => {
    return component ? logger.child({ source:component }) : logger;
};
