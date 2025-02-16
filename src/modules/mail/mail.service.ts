import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { FieldService } from '../field/field.service';
import { SensorService } from '../sensor/sensor.service';
import { log } from 'node:console';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly userService: UsersService,
        private readonly fieldService: FieldService,
        private readonly sensorService: SensorService,
    ) {}

    async testMail(name: string) {
        await this.mailerService
        .sendMail({
            to: 'ngoctruongbuii2003@gmail.com', // list of receivers
            subject: 'TEST', // Subject line
            text: 'TEST', // plaintext body
            html: '<b>Hello {{name}}</b>', // HTML body content
            context: { name: name },
        })
        .then(() => {})
        .catch(() => {});
    }

    @Cron('0 0 * * 1') // Every Monday at 00:00
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
