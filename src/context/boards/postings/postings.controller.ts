import { Controller, Post, Body } from '@nestjs/common';
import { PostingsService } from './postings.service';
import { Posting } from './dto/postings.dto';

@Controller('posting')
export class PostingsController {
  constructor(private readonly postingsService: PostingsService) {}

  @Post('create')
  createPosting(@Body() posting: Posting) {
    return this.postingsService.createPosting(posting);
  }

}
