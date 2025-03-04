import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { FieldService } from '../field/field.service';
import { SensorService } from '../sensor/sensor.service';
import { log } from 'node:console';
import { adcToPpm } from 'src/utils';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly userService: UsersService,
        private readonly fieldService: FieldService,
        @Inject(forwardRef(() => SensorService))
        private readonly sensorService: SensorService,
    ) {}

    @Cron('30 21 * * *', { timeZone: 'Asia/Ho_Chi_Minh' }) 
    // @Cron('* * * * *') // Every minute
    async sendWeeklyReport() {
        this.logger.log('🔄 Bắt đầu gửi email báo cáo hàng tuần...');
    
        // Lấy danh sách user có bật nhận email
        const users = await this.userService.findUsersReceivingWeeklyEmail();
    
        if (users.length === 0) {
            this.logger.log('⚠️ Không có user nào bật nhận email.');
            return;
        }
    
        for (const user of users) {
            // 🔍 Lấy danh sách field của user
            const userFields = await this.fieldService.findByUserIdNoPagination(user._id.toString());
    
            if (userFields.length === 0) {
                this.logger.log(`⚠️ User ${user.email} không có field nào.`);
                continue;
            }
            this.logger.log(`🔍 Đã tìm thấy ${userFields.length} field của user ${user.email}`);
    
            // 🔄 Lặp qua từng field để lấy dữ liệu thống kê
            const reports: any[] = [];
    
            for (const field of userFields) {
                try {
                    const report = await this.sensorService.getWeeklyStatisticsByFieldId(field._id.toString());
                    reports.push({ fieldName: field.name, ...report });
                } catch (error) {
                    this.logger.error(`❌ Lỗi khi lấy report cho field ${field.name}: ${error.message}`);
                }
            }
    
            if (reports.length === 0) {
                this.logger.log(`⚠️ Không có báo cáo hợp lệ để gửi cho user ${user.email}.`);
                continue;
            }
    
            console.log(`📊 Báo cáo hàng tuần cho ${user.email}:`, reports);
    
            for (const report of reports) {
                await this.sendEmail(
                    user.email,
                    '📊 Báo cáo tuần từ GreenFairm',
                    'weekly-report',
                    report  // 👈 Gửi từng báo cáo riêng lẻ
                );
            }
    
            this.logger.log(`✅ Đã gửi báo cáo cho user ${user.email}`);
        }
    }

    async sendGasAlert(fieldId:string, gasVolume: number, alertType: string) {
        const field = await this.fieldService.findOne(fieldId);
        const userId = field.userId.toString();
        const { email } = await this.userService.findOne(userId);

        const isStrongAlert = alertType.includes('Mạnh');

        const gasPpm = adcToPpm(gasVolume);

        await this.sendEmail(
            email,
            `${alertType} - Mức gas: ${gasPpm} ppm`,
            'gas-alert',
            {
                alertType,
                gasPpm,
                bgColor: isStrongAlert ? '#ffebee' : '#fffde7',
                textColor: isStrongAlert ? '#d32f2f' : '#856404',
                btnColor: isStrongAlert ? '#d32f2f' : '#ff9800',
                borderColor: isStrongAlert ? '#b71c1c' : '#ff6f00',
            }
        );
    }

    private async sendEmail(
        email: string,
        subject: string,
        template: string,
        data: any
    ) {
        try {
            console.log(`📤 Đang gửi ${subject} tới email: ${email}`);
            console.log(`data:`, data);
            await this.mailerService.sendMail({
                to: email,
                subject: subject,
                template: template, // Sử dụng template
                context: { ...data }, // Truyền dữ liệu vào template
            });

            this.logger.log(`📩 Đã gửi ${subject} tới email: ${email}`);
        } catch (error) {
            this.logger.error(`❌ Lỗi khi gửi ${subject} tới email ${email}:`, error);
        }
    }
}
