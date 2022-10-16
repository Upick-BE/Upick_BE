import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartService } from './carts.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
}
