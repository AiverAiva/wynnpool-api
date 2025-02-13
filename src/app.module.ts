import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GuildModule } from './guild/guild.module';
import { PlayerModule } from './player/player.module';
import { LootrunPoolModule } from './lootrun-pool/lootrun-pool.module';
import { ItemModule } from './item/item.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AspectPoolModule } from './aspect-pool/aspect-pool.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI as string, { dbName: 'wynnpool' }),
    GuildModule,
    PlayerModule,
    LootrunPoolModule,
    AspectPoolModule,
    ItemModule,
    LeaderboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
