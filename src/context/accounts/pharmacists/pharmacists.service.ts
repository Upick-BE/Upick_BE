import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pharmacist } from './dto/pharmacist.dto';

@Injectable()
export class PharmacistsService {
  constructor(private prismaService: PrismaService) {}

  async signUpPharmacist(pharmacist: Pharmacist) {
    const { email, password, nickName, pharmacyName, pharmacyAddress } =
      pharmacist;

    //TODO: bcrypt 적용해서 비밀번호 암호화 시켜주세요~! 약사는 소금 12번
    const isExist = await this.prismaService.pharmacist.findFirst({
      where: { email },
    });
    if (isExist) throw new InternalServerErrorException();

    if (!email.includes('@')) throw new BadRequestException();

    const _pharmacist = await this.prismaService.pharmacist.create({
      data: { email, password, nickName, pharmacyName, pharmacyAddress },
    });

    return { result: _pharmacist.email, message: '회원가입 완료' };
  }
}
