import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Достаёт текущего администратора из request.user (заполняется JwtStrategy). */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
