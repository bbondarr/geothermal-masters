import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class FinancialModelRepository {
  private static readonly FINANCIAL_MODEL_FILE_NAME = 'FinancialModel.xlsx';

  constructor(private readonly storageService: StorageService) {}

  async getFinancialModelByVersion(version: number): Promise<Buffer> {
    return this.storageService.getFile(
      `${version}/${FinancialModelRepository.FINANCIAL_MODEL_FILE_NAME}`,
    );
  }
}
