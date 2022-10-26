import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ImagesService {
  constructor(
    private prismaService: PrismaService, // private s3Service: S3Service
  ) {}
}
