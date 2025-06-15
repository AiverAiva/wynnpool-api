import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeightController } from './weight.controller';
import { WeightService } from './weight.service';
import { Weight, WeightSchema } from './weight.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Weight.name, schema: WeightSchema }])],
  controllers: [WeightController],
  providers: [WeightService],
})
export class WeightModule {}
