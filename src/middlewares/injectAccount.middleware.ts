import { Injectable, NestMiddleware } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ROLE } from 'src/constant/account.constant';
import { PrismaService } from 'src/prisma/prisma.service';

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET;
const PHARMACIST_JWT_SECRET = process.env.PHARMACIST_JWT_SECRET;

@Injectable()
export class InjectAccountMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    if (req.baseUrl.includes('refresh-token')) return next();

    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return next();

    const { role } = jwt.decode(token) as {
      role: ROLE;
    };

    if (role !== ROLE.CUSTOMER && role !== ROLE.PHARMACIST)
      throw new Error('INVALID_TOKEN');

    try {
      if (role === ROLE.CUSTOMER) {
        const { sub } = jwt.verify(token, CUSTOMER_JWT_SECRET);
        const args: Prisma.CustomerFindUniqueArgs = {
          where: { email: sub as string },
        };
        const customer = await this.prismaService.customer.findUnique(args);
        delete customer.password;

        req.customer = customer;
      }

      if (role === ROLE.PHARMACIST) {
        const { sub } = jwt.verify(token, PHARMACIST_JWT_SECRET);
        const args = { where: { email: sub as string } };
        const pharmacist = await this.prismaService.pharmacist.findFirst(args);
        req.pharmacist = pharmacist;
      }

      next();
    } catch (e) {
      const errorName = (e as Error).name;
      console.log((e as Error).message, (e as Error).stack) //TODO: customer guard까지 구현되면 삭제 부탁드려요~
      throw new Error(errorName);
    }
  }
}
