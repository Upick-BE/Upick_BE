import { Module } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartController } from './carts.controller';

@Module({
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
