import { Module } from '@nestjs/common';
import { PharmacistsService } from './pharmacists.service';
import { PharmacistsController } from './pharmacists.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PharmacistsController],
  providers: [PharmacistsService, PrismaService],
})
export class PharmacistsModule {}
