import { Controller, Post, Get, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
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
    async getItem(@Param('itemId') itemId: string) {
        return this.itemService.findItemById(itemId);
    }
}
