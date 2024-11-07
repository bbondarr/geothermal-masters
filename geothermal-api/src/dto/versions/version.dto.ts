import { VersionValidationStatus } from 'src/types/enums';

export class VersionDto {
  constructor(value: Partial<VersionDto>) {
    Object.assign(this, value);
  }

  version: number;
  testStatus: VersionValidationStatus;
  isPublished: boolean;
  publishDate: string;
  lastUploadDate: string;
}
