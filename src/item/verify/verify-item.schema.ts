import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class VerifyItem extends Document {
  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  originalString: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const VerifyItemSchema = SchemaFactory.createForClass(VerifyItem);
