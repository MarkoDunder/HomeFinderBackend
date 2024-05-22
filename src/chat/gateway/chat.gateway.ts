import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(): string {
    //handleMessage(client: any, payload: any)
    return 'Hello world!';
  }
}
