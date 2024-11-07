import { ConfigParams } from 'hyperformula';

export const excelCompatibleConfig: Partial<ConfigParams> = {
  licenseKey: 'gpl-v3',
  evaluateNullToZero: true,
  leapYear1900: true,
  dateFormats: ['MM/DD/YYYY', 'MM/DD/YY', 'YYYY/MM/DD'],
  timeFormats: ['hh:mm', 'hh:mm:ss.sss'], // set by default
  currencySymbol: ['$', 'USD'],
  localeLang: 'en-US',
  functionArgSeparator: ',', // set by default
  decimalSeparator: '.', // set by default
  thousandSeparator: '', // set by default
  arrayColumnSeparator: ',', // set by default
  arrayRowSeparator: ';', // set by default
  nullYear: 30, // set by default
  caseSensitive: false, // set by default
  accentSensitive: true,
  ignorePunctuation: false, // set by default
  useWildcards: true, // set by default
  useRegularExpressions: false, // set by default
  matchWholeCell: true, // set by default
  useArrayArithmetic: true,
  ignoreWhiteSpace: 'any',
  nullDate: { year: 1899, month: 12, day: 31 },
  smartRounding: true, // set by default
};
