import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlayerController } from './player.controller';

@Module({
    imports: [HttpModule],
    controllers: [PlayerController],
})
export class PlayerModule {}
    