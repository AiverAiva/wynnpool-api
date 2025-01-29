import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { Guild } from './guild.schema';

@Controller('player')
export class PlayerController {
    constructor(
        private readonly httpService: HttpService,
        @InjectModel('Guild') private readonly guildModel: Model<Guild>, // Inject the Guild model
    ) { }

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

    @Get('guild/:uuid')
    async getGuildByUuid(@Param('uuid') uuid: string) {
        if (!uuid) {
            throw new HttpException('Missing UUID parameter', HttpStatus.BAD_REQUEST);
        }

        try {
            // Fetch the guild data from the database using the player's UUID
            const guild = await this.guildModel.findOne({
                $or: [
                    { [`members.owner.${uuid}`]: { $exists: true } },
                    { [`members.chief.${uuid}`]: { $exists: true } },
                    { [`members.strategist.${uuid}`]: { $exists: true } },
                    { [`members.captain.${uuid}`]: { $exists: true } },
                    { [`members.recruiter.${uuid}`]: { $exists: true } },
                    { [`members.recruit.${uuid}`]: { $exists: true } },
                ],
            });

            if (!guild) {
                throw new HttpException('Player not found in any guild', HttpStatus.NOT_FOUND);
            }

            // Determine the player's rank in the guild
            let playerRank = '';
            for (const rank of ['owner', 'chief', 'strategist', 'captain', 'recruiter', 'recruit']) {
                if (guild.members[rank] && guild.members[rank][uuid]) {
                    playerRank = rank;
                    break;
                }
            }

            return {
                guild_uuid: guild.uuid,
                guild_name: guild.name,
                guild_prefix: guild.prefix,
                player_uuid: uuid,
                player_rank: playerRank,
            };
        } catch (error) {
            console.error('Error fetching guild data:', error);
            throw new HttpException('Unable to fetch guild data', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
