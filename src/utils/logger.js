import chalk from 'chalk';
import winston from 'winston';

const levelColors = {
    error: 'red',
    warn: 'blue',
    info: 'yellow',
    debug: 'green',
    verbose: 'magenta',
};


const consoleFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'DD-MM-YYYY HH:mm:ss'
    }),
    winston.format.printf(({ level, message, timestamp }) => {
        const color = levelColors[level] || 'white';
        const coloredTimestamp = chalk[color](`[${timestamp}]`);
        const coloredLevel = chalk[color](`[${level.toUpperCase()}]`);
        return `${coloredTimestamp} ${coloredLevel}: ${message}`;
    })
);

export const logger = winston.createLogger({
    level: 'verbose',
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({ format: consoleFormat })
    ]
});