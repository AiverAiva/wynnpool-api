import { Controller, Post, Get, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
    constructor(private readonly itemService: ItemService) { }

    @Post('search')
    async searchItems(@Body() query: any) {
        if (!query || Object.keys(query).length === 0) {
            throw new HttpException('Query cannot be empty', HttpStatus.BAD_REQUEST);
        }

        return this.itemService.searchItems(query);
    }

    @Get(':itemName')
    async getItem(@Param('itemName') itemName: string) {
        if (!itemName) {
            throw new HttpException('Missing Item Name parameter', HttpStatus.BAD_REQUEST);
        }

        const EXTERNAL_API_URL = `https://api.wynncraft.com/v3/item/search/${encodeURIComponent(itemName)}`;

        try {
            const response = await fetch(EXTERNAL_API_URL);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
                } else {
                    throw new HttpException(`HTTP error! status: ${response.status}`, HttpStatus.BAD_GATEWAY);
                }
            }

            const data = await response.json();

            // Ensure the API response contains the expected structure
            if (!data || !data[itemName]) {
                throw new HttpException('Item not found in response', HttpStatus.NOT_FOUND);
            }

            return data[itemName]; // ✅ Return only the item data
        } catch (error) {
            console.error('Error fetching external data:', error);
            throw new HttpException('Unable to fetch data', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
