import { Module } from '@nestjs/common';
import {PostingsModule} from './postings/postings.module'

@Module({
  imports: [PostingsModule],
})
export class BoardsModule {}