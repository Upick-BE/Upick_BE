import { Module } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { PharmacistsModule } from './pharmacists/pharmacists.module';

@Module({
  imports: [PharmacistsModule, CustomersModule,],
})
export class AccountsModule {}
