import { Test, TestingModule } from '@nestjs/testing';
import { MapboxController } from './mapbox.controller';

describe('MapboxController', () => {
  let controller: MapboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapboxController],
    }).compile();

    controller = module.get<MapboxController>(MapboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
