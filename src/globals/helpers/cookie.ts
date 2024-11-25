import { Response } from 'express';

export function sendTokenCookie(res: Response, accessToken: string) {
  res.cookie('accessToken', accessToken, {
    maxAge: 1000 * 60 * 30,
    expires: new Date(Date.now() + 1000 * 60 * 30),
    httpOnly: true,
    secure: false
  });
}
