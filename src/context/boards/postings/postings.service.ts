import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Posting } from './dto/postings.dto';


@Injectable()
export class PostingsService {
  constructor(private prismaService: PrismaService) {}
  
  async createPosting (posting:Posting){
    const {title, content} = posting
    
    if(!title.length||!content.length) throw new InternalServerErrorException();

    const createdPosting = await this.prismaService.posting.create({
      data : { title, content, pharmacistId:1 } //FIXME: 작성자 아이디로 바꿀것!
    });
    
    return{result: createdPosting, message : '칼럼작성 완료!' }
  }
}

