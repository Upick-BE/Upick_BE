import { SetMetadata } from '@nestjs/common';
import { ROLE } from 'src/constant/account.constant';

export const Roles = (...roles: ROLE[]) => SetMetadata('roles', roles)