import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Customer = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.customer;
  },
);
