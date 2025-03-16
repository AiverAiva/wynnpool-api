import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChangelogService {
    constructor(@InjectModel('item_changelog') private readonly changelogModel: Model<any>) { }

    async getDistinctTimestamps(): Promise<number[]> {
        const timestamps = await this.changelogModel.aggregate([
            { $group: { _id: '$timestamp' } },
            { $sort: { _id: -1 } },  // Sort in descending order (most recent first)
            { $project: { _id: 0, timestamp: '$_id' } }
        ]).exec();

        return timestamps.map(entry => entry.timestamp);
    }


    async getChangelogByTimestamp(timestamp: number) {
        const pipeline = [
            { $match: { timestamp } },
            {
                $group: {
                    _id: "$status",
                    items: { $push: "$$ROOT" }
                }
            },
            { $project: { _id: 0, status: "$_id", items: 1 } }
        ];

        const categorizedData = await this.changelogModel.aggregate(pipeline).exec();

        if (!categorizedData || categorizedData.length === 0) {
            throw new HttpException('No changelog data found for this timestamp', HttpStatus.NOT_FOUND);
        }

        return categorizedData.reduce((acc, entry) => {
            acc[entry.status] = entry.items;
            return acc;
        }, {} as Record<string, any[]>);
    }

}
