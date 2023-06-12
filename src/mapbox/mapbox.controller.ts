import { Controller, Get, Param } from '@nestjs/common';
import { MapboxService } from './mapbox.service';

@Controller('mapbox')
export class MapboxController {
  constructor(private mapboxService: MapboxService) {}

  @Get()
  async demo() {
    return await this.mapboxService.makeNavigationRequest();
  }

  @Get('geocoding/:location')
  async geocoding(@Param('location') location: any): Promise<any> {
    return await this.mapboxService.geocoding(location);
  }
}
