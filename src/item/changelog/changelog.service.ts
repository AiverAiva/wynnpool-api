import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChangelogService {
    constructor(@InjectModel('item_changelog') private readonly changelogModel: Model<any>) {}

    async getDistinctTimestamps(): Promise<number[]> {
        return this.changelogModel.distinct('timestamp').exec();
    }

    async getChangelogByTimestamp(timestamp: number) {
        const data = await this.changelogModel.find({ timestamp }).lean();

        if (!data || data.length === 0) {
            throw new HttpException('No changelog data found for this timestamp', HttpStatus.NOT_FOUND);
        }

        const categorizedData: Record<string, any[]> = {};
        for (const item of data) {
            const status = item.status || 'unknown'; // Default to 'unknown' if status is missing
            if (!categorizedData[status]) {
                categorizedData[status] = [];
            }
            categorizedData[status].push(item);
        }

        return categorizedData;
    }
}
