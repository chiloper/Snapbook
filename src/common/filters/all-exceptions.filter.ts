import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || this.getDefaultThaiMessage(statusCode);
        error = resObj.error || this.getDefaultErrorName(statusCode);
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${request.method}] ${request.url} - Unhandled Error: ${exception.message}`,
        exception.stack,
      );
      message = 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง';
      error = 'Internal Server Error';
    } else {
      this.logger.error(`[${request.method}] ${request.url} - Unknown Exception: ${String(exception)}`);
    }

    // Format array of validation messages nicely if applicable
    let finalMessage = message;
    if (Array.isArray(message)) {
      finalMessage = message.join(', ');
    }

    // Never log sensitive payload, token, or account details
    this.logger.warn(`[${request.method}] ${request.url} -> ${statusCode} - ${typeof finalMessage === 'string' ? finalMessage : JSON.stringify(finalMessage)}`);

    response.status(statusCode).json({
      statusCode,
      message: finalMessage,
      error,
    });
  }

  private getDefaultThaiMessage(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'คำขอไม่ถูกต้องหรือข้อมูลไม่ครบถ้วน';
      case HttpStatus.UNAUTHORIZED:
        return 'กรุณาเข้าสู่ระบบก่อนทำรายการ';
      case HttpStatus.FORBIDDEN:
        return 'คุณไม่มีสิทธิ์ในการเข้าถึงหรือแก้ไขข้อมูลนี้';
      case HttpStatus.NOT_FOUND:
        return 'ไม่พบข้อมูลที่ต้องการ';
      case HttpStatus.CONFLICT:
        return 'ข้อมูลนี้มีอยู่ในระบบแล้ว (พบรายการซ้ำ)';
      case HttpStatus.PAYLOAD_TOO_LARGE:
        return 'ขนาดไฟล์ใหญ่เกินกว่าที่กำหนด (สูงสุด 5MB ต่อไฟล์)';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'มีการส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง';
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง';
    }
  }

  private getDefaultErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.PAYLOAD_TOO_LARGE:
        return 'Payload Too Large';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return 'Internal Server Error';
    }
  }
}
