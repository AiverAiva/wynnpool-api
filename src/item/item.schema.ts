import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'item_data' })
export class Item extends Document {
    @Prop({ required: true }) id: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
