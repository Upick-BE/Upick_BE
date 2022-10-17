import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
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
  getPosting(@Param('id',ParseIntPipe)id: number){
    return this.postingsService.getPosting(id)
  }

  @Get('')
  getPostings(){
    return this.postingsService.getPostings()
  }
  
  @Patch(':id')
  updatePosting(@Param('id',ParseIntPipe)id: number,@Body() posting:Posting){
    return this.postingsService.updatePosting(id,posting)
  }
}
