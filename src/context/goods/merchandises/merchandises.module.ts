import { Module } from '@nestjs/common';
import { MerchandisesService } from './merchandises.service';
import { MerchandisesController } from './merchandises.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/context/common/images/images.service';

@Module({
  controllers: [MerchandisesController],
  providers: [MerchandisesService, PrismaService, ImagesService],
})
export class MerchandisesModule {}
