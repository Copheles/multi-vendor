import { Address } from '@prisma/client';
import { IAddressBody } from '~/features/address/interface/address.interface';
import { Helper } from '~/globals/helpers/helper';
import { NotFoundException } from '~/globals/middleware/error.middleware';
import { prisma } from '~/prisma';

class AddressService {
  public async add(requestBody: IAddressBody, currentUser: UserPayload) {
    const { street, province, country, postalCode } = requestBody;
    const address: Address = await prisma.address.create({
      data: {
        street,
        province,
        country,
        postalCode,
        userId: currentUser.id
      }
    });

    return address;
  }

  public async update(id: number, requestBody: IAddressBody, currentUser: UserPayload): Promise<Address> {
    const { street, province, country, postalCode } = requestBody;

    const address = await this.getOne(id);
    if (!address) {
      throw new NotFoundException(`Not found address with ID:${id}`);
    }

    Helper.checkPermit(address, 'userId', currentUser);

    const updatedAddress = await prisma.address.update({
      where: {
        id
      },
      data: {
        street,
        province,
        country,
        postalCode
      }
    });

    return updatedAddress;
  }

  public async remove(id: number, currentUser: UserPayload) {
    const address = await this.getOne(id);
    if (!address) {
      throw new NotFoundException(`Not found address with ID:${id}`);
    }

    Helper.checkPermit(address, 'userId', currentUser);

    await prisma.address.delete({
      where: {
        id
      }
    });
  }

  public async getAll(currentUser: UserPayload) {
    const addresses = await prisma.address.findMany({
      where: {
        userId: currentUser.id
      }
    });

    return addresses;
  }

  private async getOne(id: number): Promise<Address | null> {
    const address = await prisma.address.findFirst({
      where: { id }
    });

    return address;
  }
}

export const addressService: AddressService = new AddressService();
