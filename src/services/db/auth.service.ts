import { User } from '@prisma/client';
import { prisma } from '~/prisma';
import jwt from 'jsonwebtoken';
import { IAuthLogin, IAuthRegister } from '~/features/user/interface/auth.interface';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { BadRequestException, ForbiddenException, NotFoundException } from '~/globals/middleware/error.middleware';
import { email as emailSender } from '~/globals/helpers/email';

class AuthService {
  public async addUser(requestBody: IAuthRegister) {
    const { email, password, firstName, lastName, avatar } = requestBody;

    if (await authService.isEmailAlreadyExists(email)) {
      throw new BadRequestException('Email is already in used');
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const newUser: User = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        avatar
      }
    });

    // create JWT
    const payload = {
      id: newUser.id,
      email,
      firstName,
      lastName,
      avatar,
      role: newUser.role
    };

    const accessToken: string = this.generateJWT(payload);

    return accessToken;
  }

  public async login(requestBody: IAuthLogin) {
    const user: User | null = await this.getUserByEmail(requestBody.email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('This account was banned');
    }

    const isMatchPassword: boolean = await bcrypt.compare(requestBody.password, user.password);
    if (!isMatchPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role
    };

    const accessToken: string = this.generateJWT(payload);
    return accessToken;
  }

  public async forgetPassword(email: string) {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException(`The user with email ${email} not found.`);
    }

    // 1) Create the code for reset password
    const resetCode = crypto.randomBytes(10).toString('hex');

    // 2) Save reset password to user's db
    const expiresDate = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: resetCode,
        passwordResetDate: expiresDate
      }
    });

    await emailSender.send(
      'admin@gmail.com',
      user.email,
      'Forgot Password',
      'Your reset password token',
      `<h1>${resetCode}</h1>`
    );
    // 3) Send Email
  }

  public async resetPassword(requestBody: any) {
    const { passwordResetCode, newPassword, confirmNewPassword } = requestBody;

    const user = await prisma.user.findFirst({ where: { passwordResetCode } });

    if (!user) throw new NotFoundException('Password reset code not found');

    if (user.passwordResetDate! < new Date(Date.now())) {
      throw new BadRequestException('Password Reset Code already expired');
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword: string = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetDate: null
      }
    });
  }

  public async isEmailAlreadyExists(email: string) {
    const userByEmail = await prisma.user.findFirst({
      where: { email }
    });

    return userByEmail != null;
  }

  private async getUserByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
  }

  private generateJWT(payload: any) {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });
  }
}

export const authService: AuthService = new AuthService();
