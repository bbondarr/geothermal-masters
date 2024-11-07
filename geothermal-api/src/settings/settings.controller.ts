import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { SpreadsheetMetadataDto } from 'src/dto/metadata/spreadsheet-metadata.dto';
import { VersionDto } from 'src/dto/versions/version.dto';
import { FilesDto } from 'src/dto/files/files.dto';
import { FormDataFilesDto } from 'src/dto/files/form-data-files.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('files/upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'TestData', maxCount: 1 },
      { name: 'Map', maxCount: 1 },
      { name: 'FinancialModel', maxCount: 1 },
      { name: 'Metadata', maxCount: 1 },
    ]),
  )
  uploadNewFiles(@UploadedFiles() files: FormDataFilesDto) {
    if (!files) {
      throw new BadRequestException({
        error: {
          message: 'At least one file is required.',
          data: {
            files,
          },
        },
      });
    }
    const uploadFiles = new FilesDto(files);
    return this.settingsService.uploadFiles(uploadFiles);
  }

  @Post('files/update')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'TestData', maxCount: 1 },
      { name: 'Map', maxCount: 1 },
      { name: 'FinancialModel', maxCount: 1 },
      { name: 'Metadata', maxCount: 1 },
    ]),
  )
  updateFiles(
    @UploadedFiles() files: FormDataFilesDto,
    @Query('version') version: number,
  ) {
    if (!files) {
      throw new BadRequestException({
        error: {
          message: 'At least one file is required.',
          data: {
            files,
          },
        },
      });
    }

    if (!version) {
      throw new BadRequestException({
        error: {
          message: 'Missing version in query params.',
        },
      });
    }
    const uploadFiles = new FilesDto(files);
    return this.settingsService.updateFiles(uploadFiles, Number(version));
  }

  @Get('metadata')
  async getMetadata(): Promise<SpreadsheetMetadataDto> {
    return await this.settingsService.getSpreadsheetMetadata();
  }

  @Get('versions')
  async getVersionsList(): Promise<VersionDto[]> {
    return await this.settingsService.getAllVersions();
  }

  @Post('versions/publish')
  async publishVersion(@Query('version') version: number): Promise<void> {
    return await this.settingsService.publishVersion(Number(version));
  }
}
