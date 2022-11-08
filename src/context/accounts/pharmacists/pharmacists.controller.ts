import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SignInDto, PharmacistSignUpDto } from './dto/pharmacist.dto';
import { TransformPharmacistsCreatePharmacistSignUpDtoPipe } from './pharmacists.pipe';
import { PharmacistsService } from './pharmacists.service';
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

  @Get('hometown-pharmacists')
  // @Roles(ROLE.CUSTOMER)
  getHomeTownPharmacists() {
    return this.pharmacistsService.getHomeTownPharmacists();
  }
}
