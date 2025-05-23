import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VerifyItem, VerifyItemSchema } from './verify-item.schema';
import { VerifyItemService } from './verify-item.service';
import { VerifyItemController } from './verify-item.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: VerifyItem.name, schema: VerifyItemSchema, collection: 'verified_item_data' }])],
    providers: [VerifyItemService],
    controllers: [VerifyItemController],
    exports: [VerifyItemService],
})
export class VerifyItemModule { }
