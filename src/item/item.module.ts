import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { Item, ItemSchema } from './item.schema';
import { ChangelogModule } from './changelog/changelog.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
        ChangelogModule
    ],
    controllers: [ItemController],
    providers: [ItemService],
})

export class ItemModule {}