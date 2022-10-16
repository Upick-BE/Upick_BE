import { Module } from '@nestjs/common';
import { PostingsService } from './postings.service';
import { PostingsController } from './postings.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PostingsController],
  providers: [PostingsService, PrismaService]
})
export class PostingsModule {}
