import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '~/globals/constants/http';
import { sendTokenCookie } from '~/globals/helpers/cookie';
import { BadRequestException } from '~/globals/middleware/error.middleware';

import { authService } from '~/services/db/auth.service';

export class AuthController {
  public async registerUser(req: Request, res: Response, next: NextFunction) {
    if (await authService.isEmailAlreadyExists(req.body.email)) {
      next(new BadRequestException('Email is already used!'));
      return;
    }
    const accessToken = await authService.addUser(req.body);

    sendTokenCookie(res, accessToken);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User registered successfully'
    });
  }

  public async loginUser(req: Request, res: Response, next: NextFunction) {
    const accessToken = await authService.login(req.body);

    sendTokenCookie(res, accessToken);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User login successfully'
    });
  }

  public async forgetFassword(req: Request, res: Response) {
    await authService.forgetPassword(req.body.email);

    res.status(HTTP_STATUS.OK).json({
      message: 'Reset password code was sent'
    });
  }

  public async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body);

    res.status(HTTP_STATUS.OK).json({
      message: 'Reset password successfully'
    });
  }
}

export const authController: AuthController = new AuthController();
