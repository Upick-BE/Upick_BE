import { Body, Controller, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer as TCustomer, SignInDto } from './dto/customer.dto';


@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('sign-up')
  signUp(@Body() customer: TCustomer, customerSignUpSecret:string) {
    return this.customersService.customerSignup(customer, customerSignUpSecret);
  }

  @Post('sign-in')
  signIn(@Body() signInDto : SignInDto) {
    return this.customersService.signIn(signInDto)
  }
}

