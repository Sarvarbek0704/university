import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errorCode = "INTERNAL_ERROR";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        message = (exceptionResponse as any).message || message;
        errorCode = (exceptionResponse as any).errorCode || errorCode;
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      if (
        exception.name?.includes("Sequelize") ||
        exception.name?.includes("Database")
      ) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = "DATABASE_ERROR";
      }
    }

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception instanceof Error ? exception.stack : ""
    );

    const isProduction = process.env.NODE_ENV === "production";
    const finalMessage =
      status === HttpStatus.INTERNAL_SERVER_ERROR && isProduction
        ? "Internal server error"
        : message;

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: finalMessage,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(status === HttpStatus.BAD_REQUEST &&
          !isProduction && { details: this.getErrorDetails(exception) }),
      },
    });
  }

  private getErrorDetails(exception: unknown): any {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        ...(process.env.NODE_ENV !== "production" && {
          stack: exception.stack,
        }),
      };
    }
    return null;
  }
}
