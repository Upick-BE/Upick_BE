import { COOKIE_DOMAIN } from './../../../constant/config.constant';
import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  Get,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  SignInDto,
  //SignInKakaoRequestDto,
  UpdateCustomerDto,
  SignUpDto,
} from './dto/customer.dto';
import { Customer } from 'src/decorators/customer.decorator';
import {
  Customer as TCustomer,
  Pharmacist as TPharmacist,
} from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from 'src/constant/account.constant';
import { Pharmacist } from 'src/decorators/pharmacist.decorator';
import { Response } from 'express';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('sign-up')
  customerSignup(@Body() signUpDto: SignUpDto) {
    return this.customersService.customerSignup(signUpDto);
  }

  @Post('sign-in')
  async customerSignIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    const { result } = await this.customersService.customerSignIn(signInDto);
    response.cookie('accessToken', result, { domain: COOKIE_DOMAIN });

    return { result };
  }

  @Post('sign-in/kakao')
  async signInKakao(
    @Res({ passthrough: true }) response: Response,
    @Body() code: string,
  ) {
    const _code = Object.keys(code)[0];
    // console.log(_code);
    // console.log(typeof _code);

    const { result } = await this.customersService.signInKakao(_code);

    response.cookie('accessToken', result, { domain: COOKIE_DOMAIN });

    return { result };
  }

  @Get('my-pick/taking-medicine')
  @Roles(ROLE.CUSTOMER)
  getMerchandisesByKeyword(@Query('keyword') keyword?: string) {
    return this.customersService.getMerchandisesByKeyword(keyword);
  }
  @Post('my-pick/taking-medicine/:merchandiseId')
  @Roles(ROLE.CUSTOMER)
  addTakingMedicine(
    @Param('merchandiseId', ParseIntPipe) merchandiseId: number,
    @Customer() customer: TCustomer,
  ) {
    return this.customersService.addTakingMedicine(merchandiseId, customer);
  }

  @Delete('my-pick/taking-medicine/:merchandiseId')
  @Roles(ROLE.CUSTOMER)
  deleteTakingMedicine(
    @Param('merchandiseId', ParseIntPipe) merchandiseId: number,
    @Customer() customer: TCustomer,
  ) {
    return this.customersService.deleteTakingMedicine(merchandiseId, customer);
  }

  @Get('my-pick/details')
  @Roles(ROLE.CUSTOMER)
  getCustomer(@Customer() customer: TCustomer) {
    return this.customersService.getCustomer(customer);
  }

  @Patch('my-pick/details')
  @Roles(ROLE.CUSTOMER)
  updateCustomer(
    @Customer() customer: TCustomer,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(customer, updateCustomerDto);
  }

  @Get('/:customerId/my-pick/pick-up-list/to-pick')
  @Roles(ROLE.CUSTOMER, ROLE.PHARMACIST)
  getMerchandisesToPick(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Customer() customer?: TCustomer,
  ) {
    return this.customersService.getMerchandisesToPick(customerId, customer);
  }

  @Get('/:customerId/my-pick/pick-up-list/picked')
  @Roles(ROLE.CUSTOMER, ROLE.PHARMACIST)
  getMerchandisesIPicked(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Customer() customer?: TCustomer,
  ) {
    return this.customersService.getMerchandisesIPicked(customerId, customer);
  }

  @Patch('/:customerId/my-pick/pick-up-list/:merchandiseId')
  @Roles(ROLE.CUSTOMER, ROLE.PHARMACIST)
  completePickUp(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('merchandiseId', ParseIntPipe) merchandiseId: number,
    @Customer() customer?: TCustomer,
    @Pharmacist() pharmacist?: TPharmacist,
  ) {
    return this.customersService.completePickUp(
      customerId,
      merchandiseId,
      customer,
      pharmacist,
    );
  }

  @Delete('/:customerId/my-pick/pick-up-list/:merchandiseId')
  @Roles(ROLE.PHARMACIST)
  cancelPickUp(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('merchandiseId', ParseIntPipe) merchandiseId: number,
    @Pharmacist() pharmacist: TPharmacist,
  ) {
    return this.customersService.cancelPickUp(
      customerId,
      merchandiseId,
      pharmacist,
    );
  }

  @Get('my-pick/like/merchandises')
  @Roles(ROLE.CUSTOMER)
  getMerchandisesILike(@Customer() customer: TCustomer) {
    return this.customersService.getMerchandisesILike(customer);
  }

  @Get('my-pick/like/postings')
  @Roles(ROLE.CUSTOMER)
  getPostingsILike(@Customer() customer: TCustomer) {
    return this.customersService.getPostingsILike(customer);
  }

  @Get('my-pick/like/pharmacists')
  @Roles(ROLE.CUSTOMER)
  getPharmacistsILike(@Customer() customer: TCustomer) {
    return this.customersService.getPharmacistsILike(customer);
  }

  @Get('me')
  @Roles(ROLE.CUSTOMER)
  getMe(@Customer() customer: TCustomer) {
    return this.customersService.getMe(customer);
  }
}
