import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
} from '@nestjs/common';
import { PostingsService } from './postings.service';
import { Posting } from './dto/postings.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from 'src/constant/account.constant';
import { Pharmacist } from 'src/decorators/pharmacist.decorator';
import { Pharmacist as TPharmacist } from '@prisma/client';

@Controller('posting')
export class PostingsController {
  constructor(private readonly postingsService: PostingsService) {}

  @Post('')
  @Roles(ROLE.PHARMACIST) // 가드의 역할: 토큰을 해독해 pharmacist인지 customer인지 확인
  createPosting(
    @Body() posting: Posting,
    @Pharmacist() pharmacist: TPharmacist, // 데코레이터의 역할: 토큰을 해독해 토큰값에 해당하는 pharmacist (혹은 customer)를 가져옴
  ) {
    return this.postingsService.createPosting(posting, pharmacist);
  }

  @Get(':id')
  getPosting(@Param('id', ParseIntPipe) id: number) {
    return this.postingsService.getPosting(id);
  }

  @Get('')
  getPostings() {
    return this.postingsService.getPostings();
  }

  @Patch(':id')
  @Roles(ROLE.PHARMACIST)
  updatePosting(
    @Param('id', ParseIntPipe) id: number,
    @Body() posting: Posting,
    @Pharmacist() pharmacist: TPharmacist,
  ) {
    return this.postingsService.updatePosting(id, posting, pharmacist);
  }

  @Put(':id/like') //FIXME: Body값을 customer로 수정
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Body('customerId') customerId: number,
  ) {
    return this.postingsService.toggleLike(id, customerId);
  }
}
