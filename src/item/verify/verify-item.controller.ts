import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { VerifyItemService } from './verify-item.service';
import { AuthenticatedGuard } from '../../auth/authenticated.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('item/verify')
export class VerifyItemController {
  constructor(private readonly verifyItemService: VerifyItemService) {}

  @Get(':itemName')
  async getVerifyItems(@Param('itemName') itemName: string) {
    return this.verifyItemService.getVerifyItems(itemName);
  }

  @UseGuards(AuthenticatedGuard)
  @Post()
  @Roles('ITEM_VERIFY')
  async addVerifyItem(@Body() body: { itemName: string; originalString: string; owner: string }, @Req() req) {
    // Optionally, you can use req.user to set owner automatically
    return this.verifyItemService.addVerifyItem(body);
  }
}
