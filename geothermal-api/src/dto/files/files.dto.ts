import { FileDto } from './file.dto';
import { FormDataFilesDto } from './form-data-files.dto';

export class FilesDto {
  TestData?: FileDto;
  Map?: FileDto;
  FinancialModel?: FileDto;
  PhysicalModel?: FileDto;
  Metadata?: FileDto;

  constructor(files: FormDataFilesDto) {
    if (files.TestData) this.TestData = this.transformFiles(files.TestData);
    if (files.Map) this.Map = this.transformFiles(files.Map);
    if (files.FinancialModel)
      this.FinancialModel = this.transformFiles(files.FinancialModel);
    if (files.PhysicalModel)
      this.PhysicalModel = this.transformFiles(files.PhysicalModel);
    if (files.Metadata) this.Metadata = this.transformFiles(files.Metadata);
  }

  public clone(): FilesDto {
    const clonedFiles = new FilesDto({});
    Object.assign(clonedFiles, this);
    return clonedFiles;
  }

  private transformFiles(file: Partial<Express.Multer.File>[]): FileDto {
    const { fieldname, originalname, buffer } = file[0];
    const fileExtension = originalname ? originalname.split('.').pop() : '';
    const fileNameWithExtension = `${fieldname}.${fileExtension}`;

    return { name: fileNameWithExtension, buffer: buffer };
  }
}
