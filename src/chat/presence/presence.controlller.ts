import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PresenceService } from './presence.service';

@Controller('presence')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get('active-user/:id')
  async getActiveUser(@Param('id', ParseIntPipe) id: number) {
    // Directly call the service method
    return await this.presenceService.getActiveUser(id);
  }
}
