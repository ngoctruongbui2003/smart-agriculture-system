import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { WeatherModule } from './modules/weather/weather.module';

@Module({
  imports: [
    WeatherModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
