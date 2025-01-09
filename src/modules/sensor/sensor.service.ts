import { Injectable } from '@nestjs/common';
import { CreateSensorDto, PaginationDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sensor, SensorDocument } from 'src/schemas/sensor.schema';
import { Model } from 'mongoose';
import { parseSortFields } from 'src/utils';

const validFields = ['humidity', 'temperature', 'light', 'soilMoisture', 'rainVolume', 'gasVolume'];

@Injectable()
export class SensorService {
    constructor(@InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>) {}

    async create(createSensorDto: CreateSensorDto) {
        return await this.sensorModel.create(createSensorDto);
    }

    async findAll(paginationDto: PaginationDto) {
        const { page, limit, sort } = paginationDto;
        let sortCriteria;

        if (sort) {
        sortCriteria = parseSortFields(sort);
        }
        
        const sensors = await this.sensorModel
                    .find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort(sort && sortCriteria)
                    .lean();
        return {
            page: page && +page,
            limit: limit && +limit,
            total: await this.sensorModel.countDocuments(),
            data: sensors,
        };
    }

    async findOne(id: string) {
        return await this.sensorModel.findById(id);
    }

    async findByField(fieldId: string, paginationDto: PaginationDto) {
        const { page, limit, sort } = paginationDto;
        let sortCriteria;

        if (sort) {
        sortCriteria = parseSortFields(sort);
        }
        const sensors = await this.sensorModel
                    .find({ fieldId })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort(sort && sortCriteria)
                    .lean();
        return {
            page: page && +page,
            limit: limit && +limit,
            total: await this.sensorModel.countDocuments({ fieldId }),
            data: sensors,
        };
    }

    // async getDailyStatistics(type: string, date: string): Promise<any> {
    //     // 1. Check if the type is valid
    //     if (!validFields.includes(type)) {
    //         throw new Error('Invalid type');
    //     }

    //     const allHours = Array.from({ length: 24 }, (_, i) => i);
    //     const startOfDay = new Date(date);
    //     const endOfDay = new Date(startOfDay);
    //     endOfDay.setDate(endOfDay.getDate() + 1);
        
    //     // 2. Aggregate data
    //     // - Match data for the given date
    //     // - Switch the type field to a number
    //     // - Group by hour
    //     // - Calculate the average value for each hour
    //     const data = await this.sensorModel.aggregate([
    //         { 
    //             $match: { addedAt: { $gte: startOfDay, $lt: endOfDay } } 
    //         },
    //         {
    //             $project: {
    //                 addedAt: { $toDate: "$addedAt" },
    //                 typeValue: { $toDouble: `$${type}` },
    //             },
    //         },
    //         {
    //             $group: {
    //                 _id: { $hour: "$addedAt" },
    //                 avgValue: { $avg: "$typeValue" },
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 1,
    //                 avgValue: { $round: ["$avgValue", 2] },
    //             },
    //         },
    //         { $sort: { _id: 1 } },
    //     ]);

    //     // 3. Fill in missing hours with null values
    //     const filledData = allHours.map((hour) => {
    //         const entry = data.find(d => d._id === hour);
    //         return {
    //             hour,
    //             avgValue: entry ? entry.avgValue : null,
    //         };
    //     });

    //     return filledData;
    // }

    async getStatistics(fieldId:string, type: string, date: string, range: 'day' | 'week' | 'month'): Promise<any> {
        // 1. Check if the type is valid
        if (!validFields.includes(type)) {
            throw new Error('Invalid type');
        }
    
        const startDate = new Date(date);
        let endDate: Date;
    
        if (range === 'day') {
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
        } else if (range === 'week') {
            // For week range, calculate the start of the week (Monday) and the end (next Monday).
            const day = startDate.getDay();
            console.log(`Start Date: ${startDate}`);
            console.log(`Day: ${day}`);
            const diff = (day === 0 ? -6 : 1) - day; // Adjust to Monday
            console.log(`Diff: ${diff}`);
            startDate.setDate(startDate.getDate() + diff);
            console.log(`Start Date: ${startDate}`);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7); // One week later
            console.log(`End Date: ${endDate}`);
            
        } else if (range === 'month') {
            // For month range, calculate the start of the month and the end of the month.
            startDate.setDate(1);
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1); // Next month
        }
    
        // 2. Aggregate data
        const data = await this.sensorModel.aggregate([
            {
                $match: {
                    addedAt: { $gte: startDate, $lt: endDate },
                    fieldId: fieldId,
                }
            },
            {
                $project: {
                    addedAt: { $toDate: "$addedAt" },
                    typeValue: { $toDouble: `$${type}` },
                },
            },
            {
                $group: {
                    _id: range === 'day' ? { $hour: "$addedAt" } :
                          range === 'week' ? { $isoDayOfWeek: "$addedAt" } :  // Use $isoDayOfWeek for Monday-based weeks
                          { $dayOfMonth: "$addedAt" }, // Group by day of the month for monthly range
                    avgValue: { $avg: "$typeValue" },
                },
            },
            {
                $project: {
                    _id: 1,
                    avgValue: { $round: ["$avgValue", 2] },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    
        // 3. Fill in missing data (for day: missing hours, for week: missing days, for month: missing days of the month)
        const allUnits = range === 'day' ? Array.from({ length: 24 }, (_, i) => i) :
                          range === 'week' ? [1, 2, 3, 4, 5, 6, 7] : // Days of the week (1 = Monday, 7 = Sunday)
                          Array.from({ length: new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1); // Days of the month
    
        const filledData = allUnits.map((unit) => {
            const entry = data.find(d => d._id === unit);
            return {
                unit,
                avgValue: entry ? entry.avgValue : null,
            };
        });
    
        return filledData;
    }
    
}
