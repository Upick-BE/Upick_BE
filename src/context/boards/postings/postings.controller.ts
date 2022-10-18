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

@Controller('posting')
export class PostingsController {
  constructor(private readonly postingsService: PostingsService) {}

  @Post('')
  createPosting(@Body() posting: Posting) {
    return this.postingsService.createPosting(posting);
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
  updatePosting(
    @Param('id', ParseIntPipe) id: number,
    @Body() posting: Posting,
  ) {
    return this.postingsService.updatePosting(id, posting);
  }

  @Put(':id/like') //FIXME: Body값을 customer로 수정
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Body('customerId') customerId: number,
  ) {
    return this.postingsService.toggleLike(id,customerId)
  }
}
