import { Module } from '@nestjs/common';
import { MerchandisesModule } from './merchandises/merchandises.module';
import { CartModule } from './carts/carts.module';

@Module({
  imports: [MerchandisesModule, CartModule],
})
export class GoodsModule {}
