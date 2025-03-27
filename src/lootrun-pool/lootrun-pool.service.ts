import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LootrunPool } from './lootrun-pool.schema';

const TOKEN_API_URL = 'https://nori.fish/api/tokens';
const LOOTPOOL_API_URL = 'https://nori.fish/api/lootpool';

@Injectable()
export class LootrunPoolService {
    constructor(@InjectModel(LootrunPool.name) private readonly lootrunPoolModel: Model<LootrunPool>) { }

    async fetchTokens() {
        try {
            const response = await fetch(TOKEN_API_URL);
            if (!response.ok) throw new Error(`Token fetch error: ${response.status}`);

            const cookies = response.headers.get('set-cookie');
            if (!cookies) throw new Error('No cookies returned');

            const accessTokenMatch = cookies.match(/access_token=([^;]+);/);
            const csrfTokenMatch = cookies.match(/csrf_token=([^;]+);/);

            return {
                access_token: accessTokenMatch ? accessTokenMatch[1] : '',
                csrf_token: csrfTokenMatch ? csrfTokenMatch[1] : ''
            };
        } catch (error) {
            console.error('Error fetching tokens:', error);
            return null;
        }
    }

    async fetchLootpool(accessToken: string, csrfToken: string) {
        try {
            const response = await fetch(LOOTPOOL_API_URL, {
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json",
                    "Cookie": `access_token=${accessToken}; csrf_token=${csrfToken}`,
                    "X-CSRF-Token": csrfToken,
                    "User-Agent": "Mozilla/5.0",
                },
            });

            if (!response.ok) throw new Error(`Lootpool fetch error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching lootpool data:', error);
            return null;
        }
    }

    async getLootrunPool(showAll?: boolean, page?: number, limit?: number) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const sevenDaysAgo = currentTimestamp - 86400 * 7;

        let latestEntry = await this.lootrunPoolModel.findOne().sort({ 'data.Timestamp': -1 });
        if (!latestEntry || latestEntry?.data.Timestamp < sevenDaysAgo) {
            console.log('Fetching new data from external API');

            const tokens = await this.fetchTokens();
            if (!tokens) {
                throw new HttpException('Unable to fetch tokens', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const newData = await this.fetchLootpool(tokens.access_token, tokens.csrf_token);

            if (!newData || typeof newData !== 'object') {
                console.error('Invalid data received from API:', newData);
                throw new HttpException('Invalid API response format', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Check if newData is identical to the latest entry
            if (latestEntry && JSON.stringify(latestEntry.data) === JSON.stringify(newData)) {
                console.log('🛑 Skipping database insert: New data is identical to the latest entry.');
                return latestEntry; 
            }

            // If different, insert into database
            latestEntry = await this.lootrunPoolModel.create({ data: newData });
            console.log('✅ New lootrun pool data added to the database.');
        }

        if (!showAll && page === undefined && limit === undefined) {
            const latestEntry = await this.lootrunPoolModel
                .findOne()
                .sort({ 'data.Timestamp': -1 })
                .lean();
            if (!latestEntry) {
                throw new HttpException('No data found', HttpStatus.NOT_FOUND);
            }
            return latestEntry.data;
        }

        if (showAll) {
            const allEntries = await this.lootrunPoolModel
                .find()
                .sort({ 'data.Timestamp': -1 })
                .lean();
            return allEntries.map(entry => entry.data);
        }

        if (page !== undefined && limit !== undefined) {
            const skip = (page - 1) * limit;
            const [entries, totalCount] = await Promise.all([
                this.lootrunPoolModel
                    .find()
                    .sort({ 'data.Timestamp': -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.lootrunPoolModel.countDocuments(),
            ]);

            return {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                data: entries.map(entry => entry.data),
            };
        }
    }

    async getLastSeenMythics() {
        const mythicLastSeen: Record<string, { normal: number | null; shiny: number | null; icon?: string }> = {};
        const iconMap: Record<string, string | undefined> = {}; // ✅ Fixed TypeScript issue

        // ✅ Fetch all entries sorted by `data.Timestamp` descending (most recent first)
        const lootPools = await this.lootrunPoolModel.find().sort({ "data.Timestamp": -1 }).lean();

        for (const entry of lootPools) {
            const timestamp = entry.data.Timestamp;
            const regions = entry.data.Loot || {};
            const icons = entry.data.Icon || {}; // ✅ Extract `Icon` data for this entry

            // ✅ Update iconMap with the latest icons found
            for (const [itemName, iconUrl] of Object.entries(icons)) {
                if (!iconMap[itemName]) {
                    iconMap[itemName] = iconUrl as string; // ✅ Save the first-found icon (most recent)
                }
            }

            for (const region of Object.values(regions) as any) {
                if (region.Mythic) {
                    for (const mythic of region.Mythic) {
                        if (!mythicLastSeen[mythic]) {
                            mythicLastSeen[mythic] = { normal: null, shiny: null, icon: undefined }; // ✅ Fix: Use `undefined`
                        }
                        if (!mythicLastSeen[mythic].normal) {
                            mythicLastSeen[mythic].normal = timestamp;
                        }
                    }
                }
                if (region.Shiny?.Item) {
                    const shinyItem = region.Shiny.Item;
                    if (!mythicLastSeen[shinyItem]) {
                        mythicLastSeen[shinyItem] = { normal: null, shiny: null, icon: undefined }; // ✅ Fix: Use `undefined`
                    }
                    if (!mythicLastSeen[shinyItem].shiny) {
                        mythicLastSeen[shinyItem].shiny = timestamp;
                    }
                }
            }
        }

        // ✅ Assign icons from `iconMap` to `mythicLastSeen`
        for (const mythic in mythicLastSeen) {
            mythicLastSeen[mythic].icon = iconMap[mythic] ?? undefined; // ✅ Fix: Ensure `string | undefined`
        }

        return mythicLastSeen;
    }

}
