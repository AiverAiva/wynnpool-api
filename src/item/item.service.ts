import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './item.schema';

@Injectable()
export class ItemService {
    constructor(@InjectModel(Item.name) private readonly itemModel: Model<Item>) { }

    async searchItems(query: any) {
        try {
            const results = await this.itemModel.find(query).lean(); // ✅ Convert to plain objects
            return results;
        } catch (error) {
            console.error('Error querying item_data:', error);
            throw new HttpException('Database query failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
