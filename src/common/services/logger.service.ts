import { Injectable, LoggerService } from "@nestjs/common";
import * as winston from "winston";
import * as path from "path";

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDir = process.env.LOG_DIR || "logs";

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: process.env.SERVICE_NAME || "nestjs-app" },
      transports: [
        new winston.transports.File({
          filename: path.join(logDir, "error.log"),
          level: "error",
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logDir, "combined.log"),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(
              ({ timestamp, level, message, context, trace }) => {
                return `${timestamp} [${context || "App"}] ${level}: ${message}${trace ? ` - ${trace}` : ""}`;
              }
            )
          ),
        }),
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, "exceptions.log"),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, "rejections.log"),
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
