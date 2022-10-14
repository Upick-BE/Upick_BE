import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from './jwt.exceptions';

@Injectable()
export class JwtMiddleWare implements NestMiddleware<Request, Response> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    if (!authorization) throw new UnauthorizedException();
    const [type, value] = authorization.split(' ');
    if (type !== 'Bearer' || !value) throw new UnauthorizedException();

    // FIXME: jwt 로직 전체를 gaurd로 변경하고 미들웨어를 삭제하거나, 현재로직을 변경할 예정
    // const userid = this.jwtService.verify(value, {
    //   secret: process.env.JWT_SECRET,
    // });
    // const user = await this.prisma.user.findUnique({ where: { id: userid } });
    // if (!user) throw new UnauthorizedException();
    // req['user'] = user.id;
    next();
  }
}
