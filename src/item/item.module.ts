import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';

@Module({
    controllers: [ItemController],
})
export class ItemModule {}
