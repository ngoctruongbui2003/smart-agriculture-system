import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WateringHistoryService } from './watering-history.service';
import { CreateWateringHistoryDto, PaginationDto } from './dto';

@Controller('watering-history')
export class WateringHistoryController {
  constructor(private readonly wateringHistoryService: WateringHistoryService) {}

  @Post()
  async create(@Body() createWateringHistoryDto: CreateWateringHistoryDto) {
    return {
      message: 'Watering history created successfully',
      data: await this.wateringHistoryService.create(createWateringHistoryDto),
    };
  }

  @Post('field/:fieldId')
  async getWateringHistoryNotDeletedByField(
    @Param('fieldId') fieldId: string,
    @Body() paginationDto: PaginationDto
  ) {
    return {
      message: 'Get watering history successfully',
      data: await this.wateringHistoryService.getWateringHistoryNotDeletedByField(fieldId, paginationDto),
    };
  }

  @Patch('field/:fieldId')
  async deleteWateringHistoryByField(
    @Param('fieldId') fieldId: string
  ) {
    return {
      message: 'Delete watering history successfully',
      data: await this.wateringHistoryService.deleteWateringHistoryByField(fieldId),
    };
  }
}
