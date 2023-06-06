import { Module } from '@nestjs/common';
import { MapboxController } from './mapbox.controller';
import { MapboxService } from './mapbox.service';

@Module({
  controllers: [MapboxController],
  providers: [MapboxService],
})
export class MapboxModule {}
