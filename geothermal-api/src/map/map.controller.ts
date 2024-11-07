import { Controller, Get, BadRequestException, Query } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { CalculationsService } from 'src/calculations/calculations.service';
import { GeothermalCostCalculationsParamsDto } from 'src/dto/calculations/geothermal-cost-calculations-params.dto';
import { GeothermalCostCalculationsDto } from 'src/dto/calculations/geothermal-cost-calculations.dto';
import { GeoJSON } from 'geojson';
import { MapService } from './map.service';
@Controller('map')
export class MapController {
  constructor(
    private readonly calculationsService: CalculationsService,
    private readonly mapService: MapService,
  ) {}

  @Public()
  @Get('costs')
  async findAll(
    @Query() params: GeothermalCostCalculationsParamsDto,
  ): Promise<GeothermalCostCalculationsDto> {
    const { lat, lng } = params;

    if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
      throw new BadRequestException({
        error: {
          message: 'Latitude and Longitude must be valid numbers.',
          data: {
            latitude: lat,
            longitude: lng,
          },
        },
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new BadRequestException({
        error: {
          message: 'Latitude and Longitude must be within valid range.',
          data: {
            latitude: lat,
            longitude: lng,
          },
        },
      });
    }

    const calcRes = await this.calculationsService.calculateGeothermalPoints(
      latitude,
      longitude,
    );

    return calcRes;
  }

  @Public()
  @Get('polygons')
  async getPolygons(): Promise<GeoJSON> {
    return await this.mapService.getGradientsPolygons();
  }
}
