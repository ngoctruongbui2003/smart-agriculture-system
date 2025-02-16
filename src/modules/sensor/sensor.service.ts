import { WateringHistoryService } from './../watering-history/watering-history.service';
import { Injectable } from '@nestjs/common';
import { CreateSensorDto, PaginationDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sensor, SensorDocument } from 'src/schemas/sensor.schema';
import { Model } from 'mongoose';
import { convertObjectId, convertRainVolume, convertSoilMoisture, convertToVietNamDateOnly, formatDate, parseSortFields } from 'src/utils';

const validFields = ['humidity', 'temperature', 'light', 'soilMoisture', 'rainVolume', 'gasVolume'];

@Injectable()
export class SensorService {
    constructor(
        @InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,
        private readonly wateringHistoryService: WateringHistoryService
    ) {}

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
            const diff = (day === 0 ? -6 : 1) - day; // Adjust to Monday
            startDate.setDate(startDate.getDate() + diff);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7); // One week later
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
                date: range === 'week' ? convertToVietNamDateOnly(startDate, unit) : undefined
            };
        });
    
        return filledData;
    }
    
    // async getWeeklyStatisticsByFieldId(fieldId: string): Promise<any> {
    //     const today = new Date();
    //     const dayOfWeek = today.getDay(); // 0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy
    
    //     // ⏳ Tính ngày bắt đầu (Thứ Hai) và ngày kết thúc (Chủ Nhật)
    //     const startOfWeek = new Date(today);
    //     startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Nếu Chủ Nhật (0) -> lùi về Thứ Hai tuần trước
    //     startOfWeek.setHours(0, 0, 0, 0);
    
    //     const endOfWeek = new Date(startOfWeek);
    //     endOfWeek.setDate(startOfWeek.getDate() + 6);
    //     endOfWeek.setHours(23, 59, 59, 999);
    
    //     // 🔍 Lấy dữ liệu cảm biến theo `fieldId`
    //     const sensorData = await this.sensorModel.find({
    //         fieldId: fieldId,
    //         createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    //     }).exec();
    
    //     // 🔍 Lấy lịch sử tưới nước theo `fieldId`
    //     const wateringData = await this.wateringHistoryService.getWeeklyByFieldId(fieldId, startOfWeek, endOfWeek);
    
    //     if (sensorData.length === 0) {
    //         return {
    //             fieldId,
    //             days: [],
    //             avgTemperature: 0,
    //             avgHumidity: 0,
    //             avgSoilMoisture: 0,
    //             avgRainVolume: 0,
    //             totalWaterings: wateringData.length, // 🔥 Tổng số lần tưới nước
    //         };
    //     }
    
    //     // 🎯 Tạo object chứa dữ liệu theo từng ngày
    //     const daysMap: Record<string, any> = {
    //         'Thứ Hai': [],
    //         'Thứ Ba': [],
    //         'Thứ Tư': [],
    //         'Thứ Năm': [],
    //         'Thứ Sáu': [],
    //         'Thứ Bảy': [],
    //         'Chủ Nhật': [],
    //     };
    
    //     sensorData.forEach((data) => {
    //         const dayName = this.getDayName(data.createdAt);
    //         daysMap[dayName].push(data);
    //     });
    
    //     // 🎯 Nhóm số lần tưới nước theo ngày
    //     const wateringCountMap: Record<string, number> = {
    //         'Thứ Hai': 0,
    //         'Thứ Ba': 0,
    //         'Thứ Tư': 0,
    //         'Thứ Năm': 0,
    //         'Thứ Sáu': 0,
    //         'Thứ Bảy': 0,
    //         'Chủ Nhật': 0,
    //     };
    
    //     wateringData.forEach((watering) => {
    //         const dayName = this.getDayName(watering.startDate);
    //         wateringCountMap[dayName]++;
    //     });
    
    //     // 🔥 Tính toán trung bình theo từng ngày
    //     const days = Object.entries(daysMap).map(([day, records]) => {
    //         if (records.length === 0) return { date: day, temperature: 0, humidity: 0, soilMoisture: 0, rainVolume: 0, waterings: wateringCountMap[day] };
        
    //         const avg = (key: string) => records.reduce((sum, r) => sum + r[key], 0) / records.length;
        
    //         return {
    //             date: day,
    //             temperature: avg('temperature'),
    //             humidity: avg('humidity'),
    //             soilMoisture: avg('soilMoisture'),
    //             rainVolume: avg('rainVolume'),
    //             waterings: wateringCountMap[day],
    //         };
    //     });
    
    //     // 🔥 Tính toán trung bình tuần
    //     const avg = (key: string) => days.reduce((sum, d) => sum + d[key], 0) / days.length;
    //     const totalWaterings = wateringData.length;
    
    //     return {
    //         fieldId,
    //         startOfWeek,
    //         endOfWeek,
    //         days,
    //         avgTemperature: avg('temperature'),
    //         avgHumidity: avg('humidity'),
    //         avgSoilMoisture: avg('soilMoisture'),
    //         avgRainVolume: avg('rainVolume'),
    //         totalWaterings,
    //     };
    // }
    
    // // ✅ Hàm lấy tên thứ từ Date (bắt đầu từ Thứ Hai)
    // private getDayName(date: Date): string {
    //     const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    //     const dayIndex = new Date(date).getDay();
    //     return days[dayIndex];
    // }

    async getWeeklyStatisticsByFieldId(fieldId: string): Promise<any> {
        const today = new Date();
        const dayOfWeek = today.getDay();
    
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfWeek.setHours(0, 0, 0, 0);
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
    
        console.log(startOfWeek, endOfWeek);
    
        const sensorData = await this.sensorModel.aggregate([
            {
                $match: {
                    fieldId,
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
                },
            },
            {
                $addFields: {
                    temperature: { $toDouble: "$temperature" },
                    humidity: { $toDouble: "$humidity" },
                    soilMoisture: { $toDouble: "$soilMoisture" },
                    rainVolume: { $toDouble: "$rainVolume" }
                }
            },
            {
                $group: {
                    _id: {
                        $subtract: [{ $dayOfWeek: "$createdAt" }, 1]
                    },
                    avgTemperature: { $avg: "$temperature" },
                    avgHumidity: { $avg: "$humidity" },
                    avgSoilMoisture: { $avg: "$soilMoisture" },
                    avgRainVolume: { $avg: "$rainVolume" },
                },
            },
            { $sort: { "_id": 1 } }
        ]);
    
        console.log(`📊 Sensor data:`, sensorData);
    
        const wateringData = await this.wateringHistoryService.getWeeklyByFieldId(fieldId, startOfWeek, endOfWeek);
        const wateringCountMap: Record<number, number> = wateringData.reduce((acc, watering) => {
            const dayIndex = new Date(watering.startDate).getDay();
            const mappedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            acc[mappedDayIndex] = (acc[mappedDayIndex] || 0) + 1;
            return acc;
        }, {});
    
        const daysArray: { dayIndex: number; dateString: string }[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            daysArray.push({
                dayIndex: i,
                dateString: date.toLocaleDateString("vi-VN"),
            });
        }
    
        const daysMap = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
    
        
    
        const statistics = daysArray.map(({ dayIndex, dateString }) => {
            const sensorDay = sensorData.find(d => d._id === dayIndex) || {};
            return {
                day: daysMap[dayIndex],
                date: dateString,
                temperature: Math.round((sensorDay.avgTemperature || 0) * 100) / 100,
                humidity: Math.round((sensorDay.avgHumidity || 0) * 100) / 100,
                soilMoisture: convertSoilMoisture(sensorDay.avgSoilMoisture || 0),
                rainVolume: convertRainVolume(sensorDay.avgRainVolume || 0),
                waterings: wateringCountMap[dayIndex] || 0,
            };
        });
    
        const avg = (key: string) => Math.round(statistics.reduce((sum, d) => sum + (typeof d[key] === "number" ? d[key] : 0), 0) / statistics.length * 100) / 100;
        const totalWaterings = wateringData.length;
    
        return {
            fieldId,
            startOfWeek: formatDate(startOfWeek),
            endOfWeek: formatDate(endOfWeek),
            days: statistics,
            avgTemperature: avg("temperature"),
            avgHumidity: avg("humidity"),
            avgSoilMoisture: convertSoilMoisture(avg("soilMoisture")),
            avgRainVolume: convertRainVolume(avg("rainVolume")),
            totalWaterings,
        };
    }
}
