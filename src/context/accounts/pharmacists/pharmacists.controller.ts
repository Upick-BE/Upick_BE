import { Body, Controller, Post } from '@nestjs/common';
import { Pharmacist } from './dto/pharmacist.dto';
import { PharmacistsService } from './pharmacists.service';

@Controller('pharmacists')
export class PharmacistsController {
  constructor(private readonly pharmacistsService: PharmacistsService) {}

  @Post('sign-up')
  signUpPharmacist(@Body() pharmacist: Pharmacist) {
    return this.pharmacistsService.signUpPharmacist(pharmacist);
  }
}
