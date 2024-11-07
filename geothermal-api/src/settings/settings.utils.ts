import { _Object } from '@aws-sdk/client-s3';

export function getFilesFromVersion(
  version: number,
  files: _Object[],
): _Object[] {
  return files.filter((file) => Number(file.Key.split('/')[0]) === version);
}
