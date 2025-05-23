import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VerifyItem } from './verify-item.schema';

@Injectable()
export class VerifyItemService {
  constructor(
    @InjectModel(VerifyItem.name) private readonly verifyItemModel: Model<VerifyItem>,
  ) {}

  async getVerifyItems(itemName?: string) {
    const query = itemName ? { itemName } : {};
    return this.verifyItemModel.find(query).sort({ timestamp: -1 }).lean();
  }

  async addVerifyItem(data: { itemName: string; originalString: string; owner: string }) {
    if (!data.itemName || !data.originalString || !data.owner) {
      throw new Error('Missing required fields.');
    }
    await this.verifyItemModel.create(data);
    return { success: true };
  }
}
