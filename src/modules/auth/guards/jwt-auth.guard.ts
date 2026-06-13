import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Защищает админские маршруты: требует валидный Bearer JWT. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
