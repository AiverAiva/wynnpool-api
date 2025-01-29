import { Controller, Post, Query, HttpException, HttpStatus } from '@nestjs/common';
import { GuildEventService } from './event.service';

@Controller('guild/event')
export class GuildEventController {
    constructor(private readonly guildEventService: GuildEventService) {}

    @Post()
    async getGuildEvents(
        @Query('query') query: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            const parsedQuery = query ? JSON.parse(query) : {};
            return await this.guildEventService.getEvents(parsedQuery, page, limit);
        } catch (error) {
            console.error('Error fetching guild events:', error);
            throw new HttpException('Failed to fetch guild events', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
