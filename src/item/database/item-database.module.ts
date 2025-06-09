import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseItem, DatabaseItemSchema } from './item-database.schema';
import { DatabaseItemService } from './item-database.service';
import { DatabaseItemController } from './item-database.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: DatabaseItem.name, schema: DatabaseItemSchema, collection: 'verified_item_data' }])],
    providers: [DatabaseItemService],
    controllers: [DatabaseItemController],
    exports: [DatabaseItemService],
})
export class DatabaseItemModule { }
