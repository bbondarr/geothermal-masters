export class FormDataFilesDto {
  TestData?: Partial<Express.Multer.File>[];
  Map?: Partial<Express.Multer.File>[];
  FinancialModel?: Partial<Express.Multer.File>[];
  PhysicalModel?: Partial<Express.Multer.File>[];
  Metadata?: Partial<Express.Multer.File>[];
}
