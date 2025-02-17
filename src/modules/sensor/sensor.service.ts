import { WateringHistoryService } from './../watering-history/watering-history.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateSensorDto, PaginationDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sensor, SensorDocument } from 'src/schemas/sensor.schema';
import { Model } from 'mongoose';
import { convertObjectId, convertRainVolume, convertSoilMoisture, convertToVietNamDateOnly, formatDate, formatDateToVietnamese, parseSortFields } from 'src/utils';
import { MailService } from '../mail/mail.service';

const validFields = ['humidity', 'temperature', 'light', 'soilMoisture', 'rainVolume', 'gasVolume'];

@Injectable()
export class SensorService {
    private lastAlertSent: { [key: string]: boolean } = {};

    constructor(
        @InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,
        private readonly wateringHistoryService: WateringHistoryService,
        @Inject(forwardRef(() => MailService))
        private mailService: MailService,
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

    async getWeeklyStatisticsByFieldId(fieldId: string): Promise<any> {
        const today = new Date();
        const startOfWeek = new Date(formatDateToVietnamese(today));
        
        startOfWeek.setDate(today.getDate() - 6);
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
    
        console.log(startOfWeek, endOfWeek);
    
        const sensorData = await this.sensorModel.aggregate([
            {
                $match: {
                    fieldId,
                    addedAt: { $gte: startOfWeek, $lte: endOfWeek },
                },
            },
            {
                $project: {
                    addedAt: { $toDate: "$addedAt" },
                    temperature: { $toDouble: "$temperature" },
                    humidity: { $toDouble: "$humidity" },
                    soilMoisture: { $toDouble: "$soilMoisture" },
                    rainVolume: { $toDouble: "$rainVolume" }
                }
            },
            {
                $group: {
                    _id: { $isoDayOfWeek: "$addedAt" },
                    avgTemperature: { $avg: "$temperature" },
                    avgHumidity: { $avg: "$humidity" },
                    avgSoilMoisture: { $avg: "$soilMoisture" },
                    avgRainVolume: { $avg: "$rainVolume" },
                },
            },
            {
                $project: {
                    _id: 1,
                    avgTemperature: { $round: ["$avgTemperature", 2] },
                    avgHumidity: { $round: ["$avgHumidity", 2] },
                    avgSoilMoisture: { $round: ["$avgSoilMoisture", 2] },
                    avgRainVolume: { $round: ["$avgRainVolume", 2] },
                },
            },
            { $sort: { _id: 1 } }
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
            const sensorDay = sensorData.find(d => d._id - 1 === dayIndex) || {};
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

    async handleGasData(fieldId: string, gasVolume: number) {
        let alertType = '';
        let alertKey = '';
    
        if (gasVolume >= 2400) {
            alertType = '⚠️ Cảnh báo Mạnh';
            alertKey = 'strong';
        } else if (gasVolume >= 1200) {
            alertType = '⚠️ Cảnh báo Nhẹ';
            alertKey = 'mild';
        } else {
            // 🚨 Gas dưới 1200 -> Reset trạng thái cảnh báo
            this.lastAlertSent = {};
            return;
        }
    
        // Nếu cảnh báo giảm từ Mạnh -> Nhẹ thì không gửi
        if (this.lastAlertSent['strong'] && alertKey === 'mild') {
            return;
        }
    
        // Nếu đã gửi cảnh báo này rồi thì không gửi lại
        if (this.lastAlertSent[alertKey]) {
            return;
        }
    
        // 🚀 Gửi email cảnh báo
        await this.mailService.sendGasAlert(fieldId, gasVolume, alertType);
    
        // 🔄 Cập nhật trạng thái cảnh báo
        this.lastAlertSent = {}; // Reset trạng thái cũ
        this.lastAlertSent[alertKey] = true;
    }
}
