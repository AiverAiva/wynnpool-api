import { Controller, Patch, Delete, Param, Body, Req, ForbiddenException, NotFoundException, UseGuards, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { Request } from 'express';
import { WeightService } from './weight.service';
import { RolesGuard } from '../../auth/roles.guard';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('item/weight')
export class WeightController {
    constructor(private readonly weightService: WeightService) { }

    // @Patch(':weightId')
    // @UseGuards(AuthenticatedGuard)
    // @Roles('ITEM_WEIGHT')
    // async updateWeight(
    //     @Param('weightId') weightId: string,
    //     @Body() data: any,
    //     @Req() req: Request
    // ) {
    //     return this.weightService.updateWeight(weightId, data, req.user);
    // }

    // @Delete(':weightId')
    // @UseGuards(AuthenticatedGuard)
    // @Roles('ITEM_WEIGHT')
    // async deleteWeight(
    //     @Param('weightId') weightId: string,
    //     @Req() req: Request
    // ) {
    //     return this.weightService.deleteWeight(weightId, req.user);
    // }

    // @Post('create')
    // @UseGuards(AuthenticatedGuard)
    // @Roles('ITEM_WEIGHT')
    // async createWeight(@Body() data: any, @Req() req: Request) {
    //     const required = ["item_name", "item_id", "weight_name", "weight_id", "identifications"];
    //     if (!required.every((key) => key in data)) {
    //         throw new HttpException({ error: "Missing fields" }, HttpStatus.BAD_REQUEST);
    //     }
    //     // Check for existing weight
    //     const existing = await this.weightService.findWeightByWeightId(data.weight_id);
    //     if (existing) {
    //         throw new HttpException({ error: "Weight already exists" }, HttpStatus.CONFLICT);
    //     }
    //     // Prepare new weight
    //     const newWeight = {
    //         ...data,
    //         description: data.description || "",
    //         type: "Wynnpool",
    //         author: req.user?.discordProfile?.username || req.user?.discordId || "Wynnpool Weight Team",
    //         timestamp: Date.now(),
    //     };
    //     await this.weightService.insertWeight(newWeight);
    //     // Optionally: send webhook here if needed
    //     return { success: true };
    // }

    @Get('all')
    async getAllWeights() {
        const weights = await this.weightService.getAllWeights();
        // Remove _id from each document
        return weights.map(({ _id, ...rest }) => rest);
    }
}
