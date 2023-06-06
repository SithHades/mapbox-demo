import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MapboxModule } from './mapbox/mapbox.module';

@Module({
  imports: [MapboxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
