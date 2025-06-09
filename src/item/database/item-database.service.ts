import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseItem } from './item-database.schema';

@Injectable()
export class DatabaseItemService {
  constructor(
    @InjectModel(DatabaseItem.name) private readonly databaseItemModel: Model<DatabaseItem>,
  ) {}

  async getVerifyItems(itemName?: string) {
    const query = itemName ? { itemName } : {};
    return this.databaseItemModel.find(query).sort({ timestamp: -1 }).lean();
  }

  async addVerifyItem(data: { itemName: string; originalString: string; owner: string }) {
    if (!data.itemName || !data.originalString || !data.owner) {
      throw new Error('Missing required fields.');
    }
    await this.databaseItemModel.create(data);
    return { success: true };
  }
}
