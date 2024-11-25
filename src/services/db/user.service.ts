import { User } from '@prisma/client';
import { prisma } from '~/prisma';
import bcrypt from 'bcrypt';
import { authService } from './auth.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '~/globals/middleware/error.middleware';
import { IUserCreateBody, IUserUpdateBody, IUserUpdatePasswordBody } from '~/features/user/interface/user.interface';

class UserService {
  public async add(requestBody: IUserCreateBody) {
    const { email, password, firstName, lastName, avatar } = requestBody;
    // Insert to DB

    if (await authService.isEmailAlreadyExists(email)) {
      throw new BadRequestException('Email is already in used');
    }
    const hashPassword: string = await bcrypt.hash(password, 10);
    const newUser: User = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        firstName,
        lastName,
        avatar
      }
    });
    return this.returnUser(newUser);
  }

  public async edit(id: number, requestBody: IUserUpdateBody, currentUser: UserPayload) {
    const { firstName, lastName, avatar } = requestBody;

    if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot perform this action');
    }

    const user: User = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        avatar
      }
    });
    return this.returnUser(user);
  }

  public async remove(id: number, currentUser: UserPayload) {
    if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot perform this action');
    }
    // User cannot be delete
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }

  public async editPassword(requestBody: IUserUpdatePasswordBody, currentUser: UserPayload) {
    const { currentPassword, newPassword, confirmNewPassword } = requestBody;

    const user = await this.get(currentUser.id);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const isMatchPassword: boolean = await bcrypt.compare(currentPassword, user.password);

    if (!isMatchPassword) {
      throw new NotFoundException('Password wrong!');
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Passwords are not same!');
    }

    const hashedNewPassword: string = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        password: hashedNewPassword
      }
    });
  }

  public async editAvatar(file: Express.Multer.File | undefined, currentUser: UserPayload) {
    if (!file) {
      throw new BadRequestException('Please provide image');
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        avatar: file.filename
      }
    });
  }

  public async get(id: number, include = {}) {
    const user = await prisma.user.findFirst({
      where: { id },
      include
    });

    return user;
  }

  private returnUser(user: User) {
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar
    };
  }
}

export const userService: UserService = new UserService();
