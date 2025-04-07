import chalk from "chalk";
import winston from "winston";

const levelColors = {
  error: "red",
  warn: "blue",
  info: "yellow",
  debug: "green",
  verbose: "magenta",
  silly: "cyan",
};

const levelsNames = {
  error: "ERROR",
  warn: "WARN",
  info: "INFO",
  debug: "DEBUG",
  verbose: "MESSAGE",
  silly: "MISC",
};

const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: "DD-MM-YYYY HH:mm:ss",
  }),
  winston.format.printf(({ level, message, timestamp }) => {
    const color = levelColors[level] || "white";
    const coloredTimestamp = chalk[color](`[${timestamp}]`);
    const coloredLevel = chalk[color](`[${levelsNames[level]}]`);
    return `${coloredTimestamp} ${coloredLevel}: ${message}`;
  })
);

export const logger = winston.createLogger({
  level: "silly",
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.Console({ format: consoleFormat }),
  ],
});
