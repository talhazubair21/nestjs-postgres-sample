import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
@Injectable()
export class LoggerService extends Logger {
  private readonly logger: winston.Logger;

  constructor() {
    super();
    this.logger = winston.createLogger({
      level: 'info', // Set the desired log level
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  log(message: string) {
    super.log(message);
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    super.error(message, trace);
    this.logger.error(message, trace);
  }

  warn(message: string) {
    super.warn(message);
    this.logger.warn(message);
  }

  debug(message: string) {
    super.debug(message);
    this.logger.debug(message);
  }
}
