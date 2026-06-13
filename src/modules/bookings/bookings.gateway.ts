import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

function corsOrigins(): string[] | boolean {
  const raw = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return raw.length ? raw : true;
}

/**
 * Realtime-уведомления админки о новых заявках.
 * Клиент (админка) подключается, передавая JWT в `auth.token`; событие
 * `booking:new` рассылается всем авторизованным админам.
 */
@WebSocketGateway({
  cors: { origin: corsOrigins(), credentials: true },
})
export class BookingsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(BookingsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      (client.handshake.headers.authorization || '').replace('Bearer ', '');
    try {
      this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_SECRET', 'dev-secret'),
      });
    } catch {
      this.logger.warn('Socket отклонён: невалидный токен');
      client.disconnect();
    }
  }

  /** Рассылает новую заявку всем подключённым админам. */
  emitNewBooking(booking: unknown) {
    this.server?.emit('booking:new', booking);
  }
}
