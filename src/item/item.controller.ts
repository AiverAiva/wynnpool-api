import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ItemService } from './item.service';
import { SearchItemDto } from './item.schema';

@Controller('item')
export class ItemController {
    constructor(private readonly itemService: ItemService) { }

    @Post("search")
    async searchItems(@Body() query: SearchItemDto) {
        return this.itemService.searchItems(query);
    }


    @Get(':itemId')
    async getItem(
        @Param('itemId') itemId: string,
        @Query('changelog') changelog?: string
    ) {
        const containChangelog = changelog === 'true';
        return this.itemService.findItemById(itemId, containChangelog);
    }

    @Get(':itemName/weight')
    async getItemWeights(@Param('itemName') itemName: string) {
        if (!itemName) {
            throw new HttpException('Missing itemName parameter', HttpStatus.BAD_REQUEST);
        }
        const weights = await this.itemService.findWeightsByItemName(itemName);
        // Remove _id and userId from each object
        const result = weights.map(({ _id, userId, ...rest }) => rest);
        return result;
    }

    @Post('decode')
    decodeId(@Body('item') item: string) {
        if (!item) {
            throw new HttpException('Missing id string', HttpStatus.BAD_REQUEST);
        }

        try {
            return this.itemService.decode(item);
        } catch (err) {
            throw new HttpException('Invalid ID string', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('decode/summary')
    decodeSummary(@Body('item') item: string) {
        if (!item) {
            throw new HttpException('Missing id string', HttpStatus.BAD_REQUEST);
        }

        try {
            return this.itemService.summarize(item);
        } catch (err) {
            throw new HttpException('Unable to summarize ID string', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('full-decode')
    async getFullDecodedInfo(@Body('item') item: string) {
        if (!item) {
            throw new HttpException('Missing item', HttpStatus.BAD_REQUEST);
        }

        const summary = this.itemService.summarize(item);
        const original = await this.itemService.findItemById(summary.itemName);
        const weights = await this.itemService.findWeightsByItemName(summary.itemName);

        return {
            original,
            input: summary,
            weights,
        };
    }



}
