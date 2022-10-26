import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
import { ROLE } from 'src/constant/account.constant';
import { Roles } from 'src/decorators/roles.decorator';
import { TransformMerchandisesCreateMerchandiseRequestDtoPipe } from './merchandises.pipe';
import { MerchandisesService } from './merchandises.service';

@Controller('merchandises')
export class MerchandisesController {
  constructor(private readonly merchandisesService: MerchandisesService) {}

  @Post('create')
  @Roles(ROLE.PHARMACIST)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageToUpload' }]))
  createMerchandise(
    @Body(new TransformMerchandisesCreateMerchandiseRequestDtoPipe())
    merchandiseCreateInput: Prisma.MerchandiseCreateInput,
    @UploadedFile()
    imageToUpload: Express.Multer.File,
  ) {
    // return this.merchandisesService.createMerchandise(
    //   merchandiseCreateInput,
    //   image,
    // );
  }
}
