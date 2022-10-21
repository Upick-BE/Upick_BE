import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLE } from 'src/constant/account.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest() as Request;

    if (roles.includes(ROLE.CUSTOMER) && roles.includes(ROLE.PHARMACIST)) {
      return !!request.customer || !!request.pharmacist;
    }

    if (roles.includes(ROLE.CUSTOMER)) {
      return !!request.customer;
    }

    if (roles.includes(ROLE.PHARMACIST)) {
      return !!request.pharmacist;
    }
  }
}
