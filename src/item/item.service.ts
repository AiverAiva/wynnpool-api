import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Item } from './item.schema';

@Injectable()
export class ItemService {
    constructor(@InjectModel(Item.name) private readonly itemModel: Model<Item>) { }

    async searchItems(query: FilterQuery<any>) {
        return await this.itemModel.find(query).lean();
    }

    async streamSearch(query: any) {
        return this.itemModel.find(query).lean().cursor();
    }
}
