import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Put,
  Param,
  ParseIntPipe,
  Get
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ROLE } from 'src/constant/account.constant';
import { Customer } from 'src/decorators/customer.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { SignInDto, PharmacistSignUpDto } from './dto/pharmacist.dto';
import { TransformPharmacistsCreatePharmacistSignUpDtoPipe } from './pharmacists.pipe';
import { PharmacistsService } from './pharmacists.service';
import { Customer as TCustomer } from '@prisma/client';

@Controller('pharmacists')
export class PharmacistsController {
  constructor(private readonly pharmacistsService: PharmacistsService) {}

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('imageToUpload'))
  signUp(
    @UploadedFile() imageToUpload: Express.Multer.File,
    @Body(new TransformPharmacistsCreatePharmacistSignUpDtoPipe())
    pharmacistSignUpDto: PharmacistSignUpDto,
  ) {
    return this.pharmacistsService.signUp(pharmacistSignUpDto, imageToUpload);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.pharmacistsService.signIn(signInDto);
  }

  @Get('/')
  @Roles(ROLE.CUSTOMER)
  getAllPharmacists(){
    return this.pharmacistsService.getAllPharmacists()
  }

  @Put('/:pharmacistId/like')
  @Roles(ROLE.CUSTOMER)
  toggleLikePharmacist(
    @Param('pharmacistId', ParseIntPipe) pharmacistId: number,
    @Customer() customer: TCustomer,
  ) {
    return this.pharmacistsService.toggleLikePharmacist(pharmacistId, customer);
  }

}
