import { ApiProperty } from '@nestjs/swagger';

export class GeothermalCostCalculationsParamsDto {
  @ApiProperty({
    example: 37.7749,
    description: 'Latitude of the location.',
  })
  lat: number;

  @ApiProperty({
    example: -122.4194,
    description: 'Longitude of the location.',
  })
  lng: number;
}
