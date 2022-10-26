import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MerchandisesService {
  constructor(private prismaService: PrismaService) {}

  async createMerchandise(
    merchandiseCreateWithoutImageInput: Prisma.MerchandiseCreateWithoutImageInput,
    imageToUpload: Express.Multer.File,
  ) {
    //FIXME: 이미지 생성 로직
    const merchandise = await this.prismaService.merchandise.create({
      data: { ...merchandiseCreateWithoutImageInput },
    });

    return { result: merchandise, message: '상품 생성 완료' };
  }
}
