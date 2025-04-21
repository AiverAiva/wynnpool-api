import { Injectable, HttpException, HttpStatus, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model } from 'mongoose';
import { Item } from './item.schema';
import { parseIdString } from 'src/lib/wynntils-decode';

@Injectable()
export class ItemService implements OnModuleInit {
    constructor(
        @InjectModel(Item.name) private readonly itemModel: Model<Item>,
        @InjectConnection() private readonly connection: Connection
    ) { }
    private readonly ID_KEYS_URL = 'https://raw.githubusercontent.com/Wynntils/Static-Storage/refs/heads/main/Reference/id_keys.json';
    private readonly SHINY_STATS_URL = 'https://raw.githubusercontent.com/Wynntils/Static-Storage/main/Data-Storage/shiny_stats.json';

    private idMap = new Map<number, string>();
    private shinyStatsMap = new Map<number, { key: string; displayName: string }>();

    private readonly logger = new Logger(ItemService.name);

    async onModuleInit() {
        try {
            // Load ID map
            const idMapRes = await fetch(this.ID_KEYS_URL);
            const idRaw = await idMapRes.json();
            for (const [name, id] of Object.entries(idRaw)) {
                if (typeof id === 'number') {
                    this.idMap.set(id, name);
                }
            }

            // Load shiny stat map
            const shinyRes = await fetch(this.SHINY_STATS_URL);
            const shinyRaw = await shinyRes.json();
            for (const entry of shinyRaw) {
                this.shinyStatsMap.set(entry.id, {
                    key: entry.key,
                    displayName: entry.displayName,
                });
            }

            this.logger.log(`Preloaded ${this.idMap.size} ID keys and ${this.shinyStatsMap.size} shiny stats.`);
        } catch (err) {
            this.logger.error('Failed to preload id_keys.json', err);
        }
    }

    async searchItems(query: FilterQuery<any>) {
        return await this.itemModel.find(query).lean();
    }

    async streamSearch(query: any) {
        return this.itemModel.find(query).lean().cursor();
    }

    async findItemById(itemId: string) {
        const item = await this.itemModel.findOne({ id: itemId }).select('-_id').lean();

        if (!item) {
            throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
        }

        return item;
    }

    decode(id: string) {
        return parseIdString(id);
    }

    summarize(id: string) {
        const blocks = parseIdString(id);
        const summary: {
            itemName: string;
            powderSlots?: number;
            powders?: any[];
            identifications?: Record<string, number>;
            shinyStat?: { key: string; displayName: string; value: number };
        } = { itemName: '' };

        for (const block of blocks) {
            if (block.name === 'NameData') {
                summary.itemName = block.nameStr;
            }

            if (block.name === 'PowderData') {
                summary.powderSlots = block.powderSlots;
                summary.powders = block.powders;
            }

            if (block.name === 'IdentificationData') {
                summary.identifications = {}
                for (const id of block.identifications) {
                    const name = this.idMap.get(id.kind);
                    if (name && typeof id.roll === 'number') {
                        summary.identifications[name] = id.roll;
                    }
                }
            }

            if (block.name === 'ShinyData') {
                const shiny = this.shinyStatsMap.get(block.statId);
                if (shiny && typeof block.val === 'number') {
                    summary.shinyStat = {
                        key: shiny.key,
                        displayName: shiny.displayName,
                        value: block.val,
                    };
                }
            }
        }

        return summary;
    }

    async findWeightsByItemName(itemName: string): Promise<any[]> {
        const collection = this.connection.collection('weight_data')
        return collection.find({ item_name: itemName }).toArray();
    }

}
