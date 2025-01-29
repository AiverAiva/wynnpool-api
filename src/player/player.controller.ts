import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('player')
export class PlayerController {
    constructor(private readonly httpService: HttpService) {}

    @Get(':playerName')
    async getPlayer(@Param('playerName') playerName: string) {
        if (!playerName) {
            throw new HttpException('Missing Player Name parameter', HttpStatus.BAD_REQUEST);
        }

        const EXTERNAL_API_URL = `https://api.wynncraft.com/v3/player/${playerName}?fullResult`;

        try {
            const response = await firstValueFrom(this.httpService.get(EXTERNAL_API_URL));
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
            }
            console.error('Error fetching external data:', error);
            throw new HttpException('Unable to fetch data', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
