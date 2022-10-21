import { Module } from '@nestjs/common';
import { PharmacistsService } from './pharmacists.service';
import { PharmacistsController } from './pharmacists.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [PharmacistsController],
  providers: [PharmacistsService, PrismaService],
  imports: [JwtModule.register({
    secret: process.env.SECRET, //시크릿텍스트
    signOptions: {
      expiresIn: 60 * 60,//토큰유지시간
    }
  }),
  ]
})
export class PharmacistsModule {}
