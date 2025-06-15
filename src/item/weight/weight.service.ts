import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class WeightService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async updateWeight(weightId: string, data: any, user: any) {

        const collection = this.connection.collection('weight_data');
        const { _id, userId, ...rest } = data;
        const updateFields = {
            ...rest,
            description: data.description || '',
            timestamp: Date.now(),
        };

        const existing = await collection.findOne({ weight_id: weightId });
        if (!existing) throw new NotFoundException('Weight not found');

        const result = await collection.updateOne(
            { weight_id: weightId },
            { $set: updateFields }
        );

        // Optionally: send webhook or log changes here

        return { success: true };
    }

    async deleteWeight(weightId: string, user: any) {

        const collection = this.connection.collection('weight_data');
        const existing = await collection.findOne({ weight_id: weightId });
        if (!existing) throw new NotFoundException('Weight not found');

        const result = await collection.deleteOne({ weight_id: weightId });
        if (result.deletedCount === 0) throw new NotFoundException('Deletion failed');

        // Optionally: send webhook or log changes here

        return { success: true };
    }

    async findWeightByWeightId(weightId: string) {
        const collection = this.connection.collection('weight_data');
        return collection.findOne({ weight_id: weightId });
    }

    async insertWeight(weight: any) {
        const collection = this.connection.collection('weight_data');
        return collection.insertOne(weight);
    }

    async getAllWeights() {
        const collection = this.connection.collection('weight_data');
        return collection.find({}).toArray();
    }
}
