import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { LootrunPoolService } from './lootrun-pool.service';

@Controller('lootrun-pool')
export class LootrunPoolController {
    constructor(private readonly lootrunPoolService: LootrunPoolService) { }

    @Get()
    async fetchLootrunPool(
        @Query('showAll') showAll?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        try {
            const parsedPage = page ? Number(page) : undefined;
            const parsedLimit = limit ? Number(limit) : undefined;

            return this.lootrunPoolService.getLootrunPool(
                showAll === 'true',
                parsedPage,
                parsedLimit
            );
        } catch (error) {
            console.error('Error in /lootrun-pool endpoint:', error);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('lastseen')
    async getLastSeenMythics() {
        return this.lootrunPoolService.getLastSeenMythics();
    }
}
