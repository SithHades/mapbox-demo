import { Controller, Get } from '@nestjs/common';
import { MapboxService } from './mapbox.service';

@Controller('mapbox')
export class MapboxController {
  constructor(private mapboxService: MapboxService) {}

  @Get()
  async demo() {
    return await this.mapboxService.makeRequest();
  }
}
