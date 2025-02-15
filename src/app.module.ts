import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { WeatherModule } from './modules/weather/weather.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './core/transform.interceptor';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SensorModule } from './modules/sensor/sensor.module';
import { FieldModule } from './modules/field/field.module';
import { WateringHistoryModule } from './modules/watering-history/watering-history.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    WeatherModule,
    SensorModule,
    FieldModule,
    WateringHistoryModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigurableModuleBuilder],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => console.log('------Connected to MongoDB------'));
          connection.on('open', () => console.log('------Opened to MongoDB------'));
          connection.on('disconnected', () => console.log('------Disconnected from MongoDB------'));
          connection.on('reconnected', () => console.log('------Reconnected to MongoDB------'));
          connection.on('disconnecting', () => console.log('------Disconnecting from MongoDB------'));
        }
      }),
      inject: [ConfigService],
    }),
    WateringHistoryModule,
    // ClientsModule.register([
    //   {
    //     name: 'MQTT_SERVICE',
    //     transport: Transport.MQTT,
    //     options: {
    //       url: 'mqtt://broker.hivemq.com',
    //     },
    //   },
    // ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
