import { Injectable } from '@nestjs/common';
import { CreateWateringHistoryDto, PaginationDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { WateringHistory, WateringHistoryDocument } from 'src/schemas/watering-history.schema';
import { Model } from 'mongoose';
import { parseSortFields } from 'src/utils';

@Injectable()
export class WateringHistoryService {
  constructor(@InjectModel(WateringHistory.name) private wateringHistoryModel: Model<WateringHistoryDocument>) {}

  async create(createWateringHistoryDto: CreateWateringHistoryDto) {
    return await this.wateringHistoryModel.create(createWateringHistoryDto);
  }

  async getWateringHistoryNotDeletedByField(fieldId: string, paginationDto: PaginationDto) {
    const { page, limit, sort } = paginationDto;
    let sortCriteria;

    if (sort) {
      sortCriteria = parseSortFields(sort);
    }
    const sensors = await this.wateringHistoryModel
                .find({ fieldId, isDeleted: false })
                .skip((page - 1) * limit)
                .limit(limit)
                .sort(sort && sortCriteria)
                .lean();
    return {
        page: page && +page,
        limit: limit && +limit,
        total: await this.wateringHistoryModel.countDocuments({ fieldId, isDeleted: false }),
        data: sensors,
    };
  }

  async deleteWateringHistoryByField(fieldId: string) {
    return await this.wateringHistoryModel.updateMany({ fieldId }, { isDeleted: true });
  }
}
