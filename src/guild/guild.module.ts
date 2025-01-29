import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GuildController } from './guild.controller';
import { EventModule } from './event/event.module';

@Module({
    imports: [HttpModule, EventModule],
    controllers: [GuildController],
})
export class GuildModule {}
    