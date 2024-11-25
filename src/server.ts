import express, { Application, NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import appRoutes from './globals/routes/appRoutes';
import { CustomError, IError, NotFoundException } from './globals/middleware/error.middleware';
import { HTTP_STATUS } from './globals/constants/http';
import { MulterError } from 'multer';

class Server {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.setUpMiddleware();
    this.setUpRoutes();
    this.setUpGlobalError();
    this.startServer();
  }

  private setUpMiddleware(): void {
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use('/images', express.static('images'));
    this.app.use(
      cors({
        origin: 'http://localhost:5173',
        credentials: true
      })
    );
  }

  private setUpRoutes(): void {
    appRoutes(this.app);
  }

  private setUpGlobalError(): void {
    // Not Found
    this.app.all('*', (req: Request, res: Response, next: NextFunction) => {
      return next(new NotFoundException(`The URL ${req.originalUrl} not found`));
    });

    // Global Error
    this.app.use((error: IError | MulterError, req: Request, res: Response, next: NextFunction) => {
      console.log(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.getErrorResponse());
      }
      if (error instanceof MulterError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: 'error',
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.message
        });
      }

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    });
  }

  private startServer() {
    const port = parseInt(process.env.PORT!) || 5000;
    this.app.listen(port, () => {
      console.log(`Application listen to port ${port}`);
    });
  }
}

export default Server;
